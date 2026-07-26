import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'EMPLOYEE') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const userId = req.user!.id;
    const assignedTasks = await prisma.task.findMany({
      where: { assignees: { some: { userId } } },
      include: { project: { select: { id: true, name: true } } },
    });

    const total = assignedTasks.length;
    const todoCount = assignedTasks.filter((t) => t.status === 'TODO').length;
    const inProgressCount = assignedTasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const pendingCount = assignedTasks.filter((t) => t.status === 'PENDING_APPROVAL').length;
    const doneCount = assignedTasks.filter((t) => t.status === 'DONE').length;
    const completionRate = total > 0 ? Math.round((doneCount / total) * 100) : 0;

    const projectMap = new Map<number, { name: string; total: number; done: number }>();
    for (const task of assignedTasks) {
      const pid = task.projectId;
      const existing = projectMap.get(pid);
      if (existing) {
        existing.total++;
        if (task.status === 'DONE') existing.done++;
      } else {
        projectMap.set(pid, { name: task.project?.name || 'Unknown', total: 1, done: task.status === 'DONE' ? 1 : 0 });
      }
    }
    const projectBreakdown = Array.from(projectMap.entries()).map(([projectId, data]) => ({
      projectId,
      projectName: data.name,
      total: data.total,
      done: data.done,
      completionRate: data.total > 0 ? Math.round((data.done / data.total) * 100) : 0,
    }));

    res.json({ total, todo: todoCount, inProgress: inProgressCount, pendingApproval: pendingCount, done: doneCount, completionRate, projectBreakdown });
  } catch (err) {
    console.error('analytics/me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/department/:deptId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const deptId = parseInt(Array.isArray(req.params.deptId) ? req.params.deptId[0] : req.params.deptId, 10);
    const userRole = req.user!.role;

    if (!['DEPARTMENT_MANAGER', 'TECHNICAL_MANAGER', 'CEO', 'HR_MANAGER'].includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (userRole === 'DEPARTMENT_MANAGER') {
      const managed = await prisma.department.findFirst({ where: { managerId: req.user!.id } });
      if (!managed || managed.id !== deptId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const dept = await prisma.department.findUnique({ where: { id: deptId } });
    if (!dept) return res.status(404).json({ error: 'Department not found' });

    const projects = await prisma.project.findMany({
      where: { departmentId: deptId },
      include: { tasks: { select: { id: true, status: true, assignees: { select: { userId: true } } } } },
    });

    const allTasks = projects.flatMap((p) => p.tasks);
    const total = allTasks.length;
    const todoCount = allTasks.filter((t) => t.status === 'TODO').length;
    const inProgressCount = allTasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const pendingCount = allTasks.filter((t) => t.status === 'PENDING_APPROVAL').length;
    const doneCount = allTasks.filter((t) => t.status === 'DONE').length;
    const completionRate = total > 0 ? Math.round((doneCount / total) * 100) : 0;
    const pendingApprovals = pendingCount;

    const projectBreakdown = projects.map((p) => {
      const pDone = p.tasks.filter((t) => t.status === 'DONE').length;
      return { projectId: p.id, projectName: p.name, total: p.tasks.length, done: pDone, completionRate: p.tasks.length > 0 ? Math.round((pDone / p.tasks.length) * 100) : 0 };
    });

    const memberStats = new Map<number, string>();
    for (const proj of projects) {
      const members = await prisma.projectMember.findMany({ where: { projectId: proj.id }, include: { user: { select: { id: true, firstName: true, lastName: true } } } });
      for (const m of members) {
        if (!memberStats.has(m.userId)) {
          memberStats.set(m.userId, `${m.user.firstName} ${m.user.lastName}`);
        }
      }
    }

    const memberPerformance: { name: string; total: number; done: number; completionRate: number }[] = [];
    for (const [userId, name] of memberStats) {
      let userTotal = 0;
      let userDone = 0;
      for (const proj of projects) {
        const userTasks = proj.tasks.filter((t) => t.assignees.some((a) => a.userId === userId));
        userTotal += userTasks.length;
        userDone += userTasks.filter((t) => t.status === 'DONE').length;
      }
      memberPerformance.push({ name, total: userTotal, done: userDone, completionRate: userTotal > 0 ? Math.round((userDone / userTotal) * 100) : 0 });
    }
    memberPerformance.sort((a, b) => b.completionRate - a.completionRate);

    res.json({ total, todo: todoCount, inProgress: inProgressCount, pendingApproval: pendingCount, done: doneCount, completionRate, pendingApprovals, projectBreakdown, memberPerformance });
  } catch (err) {
    console.error('analytics/department error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/technical', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user!.role;
    if (!['TECHNICAL_MANAGER', 'CEO', 'HR_MANAGER'].includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const departments = await prisma.department.findMany({
      include: { projects: { include: { tasks: { select: { id: true, status: true, assignees: true } } } } },
    });

    const allProjects = departments.flatMap((d) => d.projects);
    const allTasks = allProjects.flatMap((p) => p.tasks);
    const total = allTasks.length;
    const todoCount = allTasks.filter((t) => t.status === 'TODO').length;
    const inProgressCount = allTasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const pendingCount = allTasks.filter((t) => t.status === 'PENDING_APPROVAL').length;
    const doneCount = allTasks.filter((t) => t.status === 'DONE').length;
    const completionRate = total > 0 ? Math.round((doneCount / total) * 100) : 0;
    const pendingApprovals = pendingCount;

    const deptBreakdown = departments.map((dept) => {
      const deptTasks = dept.projects.flatMap((p) => p.tasks);
      return { deptId: dept.id, deptName: dept.name, total: deptTasks.length, projectCount: dept.projects.length };
    });

    const projectBreakdown = allProjects.map((p) => {
      const pDone = p.tasks.filter((t) => t.status === 'DONE').length;
      return { projectId: p.id, projectName: p.name, total: p.tasks.length, done: pDone, completionRate: p.tasks.length > 0 ? Math.round((pDone / p.tasks.length) * 100) : 0 };
    });

    res.json({ total, todo: todoCount, inProgress: inProgressCount, pendingApproval: pendingCount, done: doneCount, completionRate, pendingApprovals, deptBreakdown, projectBreakdown });
  } catch (err) {
    console.error('analytics/technical error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/overview', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user!.role;
    if (!['CEO', 'HR_MANAGER'].includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const departments = await prisma.department.findMany({
      include: { projects: { include: { tasks: { select: { id: true, status: true, assignees: true } } } }, manager: { select: { firstName: true, lastName: true } } },
    });

    const allProjects = departments.flatMap((d) => d.projects);
    const allTasks = allProjects.flatMap((p) => p.tasks);
    const total = allTasks.length;
    const todoCount = allTasks.filter((t) => t.status === 'TODO').length;
    const inProgressCount = allTasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const pendingCount = allTasks.filter((t) => t.status === 'PENDING_APPROVAL').length;
    const doneCount = allTasks.filter((t) => t.status === 'DONE').length;
    const completionRate = total > 0 ? Math.round((doneCount / total) * 100) : 0;
    const pendingApprovals = pendingCount;

    const userTaskMap = new Map<number, { name: string; total: number; done: number }>();
    for (const proj of allProjects) {
      const members = await prisma.projectMember.findMany({ where: { projectId: proj.id }, include: { user: { select: { id: true, firstName: true, lastName: true } } } });
      for (const m of members) {
        const key = m.userId;
        if (!userTaskMap.has(key)) {
          userTaskMap.set(key, { name: `${m.user.firstName} ${m.user.lastName}`, total: 0, done: 0 });
        }
        const userTasks = proj.tasks.filter((t) => t.assignees.some((a) => a.userId === m.userId));
        const stats = userTaskMap.get(key)!;
        stats.total += userTasks.length;
        stats.done += userTasks.filter((t) => t.status === 'DONE').length;
      }
    }
    const memberPerformance = Array.from(userTaskMap.entries()).map(([userId, stats]) => ({
      userId,
      name: stats.name,
      total: stats.total,
      done: stats.done,
      completionRate: stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0,
    })).sort((a, b) => b.completionRate - a.completionRate);

    const deptBreakdown = departments.map((dept) => ({
      deptId: dept.id,
      deptName: dept.name,
      manager: dept.manager ? `${dept.manager.firstName} ${dept.manager.lastName}` : null,
      projectCount: dept.projects.length,
    }));

    const projectBreakdown = allProjects.map((p) => {
      const pDone = p.tasks.filter((t) => t.status === 'DONE').length;
      return { projectId: p.id, projectName: p.name, total: p.tasks.length, done: pDone, completionRate: p.tasks.length > 0 ? Math.round((pDone / p.tasks.length) * 100) : 0, departmentId: p.departmentId };
    });

    res.json({ total, todo: todoCount, inProgress: inProgressCount, pendingApproval: pendingCount, done: doneCount, completionRate, pendingApprovals, memberPerformance, deptBreakdown, projectBreakdown });
  } catch (err) {
    console.error('analytics/overview error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;