import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { notifyTaskAssignees, notifyPendingApproval, notifyTaskApproved, notifyReportAdded } from '../lib/notifications';

const router = Router();

const taskInclude = {
  project: { select: { id: true, name: true, departmentId: true } },
  assignees: {
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
  },
  subtasks: { orderBy: { createdAt: 'asc' as const } },
  createdBy: { select: { id: true, firstName: true, lastName: true } },
  approvedBy: { select: { id: true, firstName: true, lastName: true } },
  _count: { select: { reports: true } },
};

function canManageTask(userRole: string) {
  return ['TECHNICAL_MANAGER', 'DEPARTMENT_MANAGER', 'CEO', 'HR_MANAGER'].includes(userRole);
}

async function isAssignee(taskId: number, userId: number): Promise<boolean> {
  const a = await prisma.taskAssignee.findUnique({
    where: { taskId_userId: { taskId, userId } },
  });
  return !!a;
}

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    let where: any = {};

    if (user.role === 'EMPLOYEE') {
      const assignedTaskIds = await prisma.taskAssignee.findMany({
        where: { userId: user.id },
        select: { taskId: true },
      });
      where = { id: { in: assignedTaskIds.map((a) => a.taskId) } };
    } else if (user.role === 'DEPARTMENT_MANAGER') {
      const managedDept = await prisma.department.findFirst({
        where: { managerId: user.id },
      });
      if (managedDept) {
        const projectIds = await prisma.project.findMany({
          where: { departmentId: managedDept.id },
          select: { id: true },
        });
        where = { projectId: { in: projectIds.map((p) => p.id) } };
      }
    }

    const tasks = await prisma.task.findMany({
      where,
      include: taskInclude,
      orderBy: { createdAt: 'desc' },
    });
    res.json(tasks);
  } catch (err) {
    console.error('get tasks error:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const user = req.user!;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        ...taskInclude,
        reports: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (user.role === 'EMPLOYEE') {
      const assigned = await isAssignee(id, user.id);
      if (!assigned) return res.status(403).json({ error: 'Access denied' });
    }

    res.json(task);
  } catch (err) {
    console.error('get task error:', err);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { title, description, projectId, assigneeIds, deadline, estimatedHours, subtasks, status } = req.body;

    if (!title || !projectId || !assigneeIds?.length) {
      return res.status(400).json({ error: 'Title, project, and at least one assignee are required' });
    }

    if (!canManageTask(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (user.role === 'DEPARTMENT_MANAGER') {
      const managedDept = await prisma.department.findFirst({ where: { managerId: user.id } });
      if (!managedDept || managedDept.id !== project.departmentId) {
        return res.status(403).json({ error: 'You can only create tasks in your department' });
      }
    }

    for (const aid of assigneeIds) {
      const assignee = await prisma.user.findUnique({ where: { id: aid } });
      if (!assignee) return res.status(404).json({ error: `Assignee ${aid} not found` });
      if (assignee.departmentId !== project.departmentId) {
        return res.status(400).json({ error: `User ${assignee.firstName} ${assignee.lastName} is not in the same department` });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        createdById: user.id,
        status: status || 'TODO',
        deadline: deadline ? new Date(deadline) : undefined,
        estimatedHours: estimatedHours || undefined,
        assignees: {
          create: assigneeIds.map((aid: number) => ({ userId: aid })),
        },
        subtasks: subtasks?.length
          ? { create: subtasks.map((s: { title: string }) => ({ title: s.title })) }
          : undefined,
      },
      include: taskInclude,
    });

    notifyTaskAssignees(task.id, task.title, assigneeIds).catch(console.error);

    res.status(201).json(task);
  } catch (err) {
    console.error('create task error:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const user = req.user!;
    const { title, description, assigneeIds, status, deadline, estimatedHours } = req.body;

    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: { select: { departmentId: true } } },
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (user.role === 'DEPARTMENT_MANAGER') {
      const managedDept = await prisma.department.findFirst({ where: { managerId: user.id } });
      if (!managedDept || managedDept.id !== task.project.departmentId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (!canManageTask(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const data: any = {};
    if (title) data.title = title;
    if (description !== undefined) data.description = description;
    if (status) data.status = status;
    if (deadline !== undefined) data.deadline = deadline ? new Date(deadline) : null;
    if (estimatedHours !== undefined) data.estimatedHours = estimatedHours;

    if (assigneeIds) {
      await prisma.taskAssignee.deleteMany({ where: { taskId: id } });
      for (const aid of assigneeIds) {
        await prisma.taskAssignee.create({ data: { taskId: id, userId: aid } });
      }
      notifyTaskAssignees(id, task.title, assigneeIds).catch(console.error);
    }

    const updated = await prisma.task.update({
      where: { id },
      data,
      include: taskInclude,
    });
    res.json(updated);
  } catch (err) {
    console.error('update task error:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.patch('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const user = req.user!;
    const { status } = req.body;

    if (!status) return res.status(400).json({ error: 'Status is required' });

    const validStatuses = ['TODO', 'IN_PROGRESS', 'PENDING_APPROVAL', 'DONE'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (user.role === 'EMPLOYEE') {
      const assigned = await isAssignee(id, user.id);
      if (!assigned) return res.status(403).json({ error: 'You can only change your own tasks' });
      if (task.status !== 'TODO' && task.status !== 'IN_PROGRESS') {
        return res.status(403).json({ error: 'You can only submit a task that is TODO or IN_PROGRESS' });
      }
      if (status !== 'PENDING_APPROVAL') {
        return res.status(403).json({ error: 'Employees can only submit tasks for approval' });
      }
    } else if (user.role === 'DEPARTMENT_MANAGER') {
      const managedDept = await prisma.department.findFirst({ where: { managerId: user.id } });
      if (!managedDept) return res.status(403).json({ error: 'Access denied' });
      if (task.status !== 'PENDING_APPROVAL' && status === 'DONE') {
        return res.status(403).json({ error: 'Task must be in PENDING_APPROVAL before approving' });
      }
    } else if (!canManageTask(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const data: any = { status };
    if (status === 'DONE' && task.status === 'PENDING_APPROVAL') {
      data.approvedById = user.id;
      data.approvedAt = new Date();
    }
    if (task.status === 'PENDING_APPROVAL' && status !== 'DONE') {
      data.approvedById = null;
      data.approvedAt = null;
    }

    const updated = await prisma.task.update({
      where: { id },
      data,
      include: taskInclude,
    });

    if (status === 'PENDING_APPROVAL') {
      notifyPendingApproval(id, task.title, task.projectId).catch(console.error);
    } else if (status === 'DONE' && task.status === 'PENDING_APPROVAL') {
      notifyTaskApproved(id, task.title, task.createdById).catch(console.error);
    }

    res.json(updated);
  } catch (err) {
    console.error('update task status error:', err);
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

router.post('/:id/reports', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const user = req.user!;
    const { content } = req.body;

    if (!content) return res.status(400).json({ error: 'Content is required' });

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (user.role === 'EMPLOYEE') {
      const assigned = await isAssignee(id, user.id);
      if (!assigned) return res.status(403).json({ error: 'You can only report on your own tasks' });
    }

    const report = await prisma.taskReport.create({
      data: { content, taskId: id, userId: user.id },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });

    notifyReportAdded(id, task.title, task.projectId, `${user.firstName} ${user.lastName}`).catch(console.error);

    res.status(201).json(report);
  } catch (err) {
    console.error('create report error:', err);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

router.get('/:id/reports', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const user = req.user!;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (user.role === 'EMPLOYEE') {
      const assigned = await isAssignee(id, user.id);
      if (!assigned) return res.status(403).json({ error: 'Access denied' });
    }

    const reports = await prisma.taskReport.findMany({
      where: { taskId: id },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

router.patch('/:id/subtasks/:subtaskId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const subtaskId = parseInt(req.params.subtaskId as string);
    const { isDone } = req.body;

    if (typeof isDone !== 'boolean') return res.status(400).json({ error: 'isDone is required' });

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const subtask = await prisma.taskSubtask.findUnique({ where: { id: subtaskId } });
    if (!subtask || subtask.taskId !== id) return res.status(404).json({ error: 'Subtask not found' });

    const updated = await prisma.taskSubtask.update({
      where: { id: subtaskId },
      data: { isDone },
    });
    res.json(updated);
  } catch (err) {
    console.error('update subtask error:', err);
    res.status(500).json({ error: 'Failed to update subtask' });
  }
});

router.post('/:id/subtasks', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const user = req.user!;
    const { title } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required' });
    if (!canManageTask(user.role)) return res.status(403).json({ error: 'Access denied' });

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const subtask = await prisma.taskSubtask.create({
      data: { title, taskId: id },
    });
    res.status(201).json(subtask);
  } catch (err) {
    console.error('create subtask error:', err);
    res.status(500).json({ error: 'Failed to create subtask' });
  }
});

router.delete('/:id/subtasks/:subtaskId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const subtaskId = parseInt(req.params.subtaskId as string);
    const user = req.user!;
    if (!canManageTask(user.role)) return res.status(403).json({ error: 'Access denied' });

    const subtask = await prisma.taskSubtask.findUnique({ where: { id: subtaskId } });
    if (!subtask || subtask.taskId !== id) return res.status(404).json({ error: 'Subtask not found' });

    await prisma.taskSubtask.delete({ where: { id: subtaskId } });
    res.json({ message: 'Subtask deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete subtask' });
  }
});

export default router;
