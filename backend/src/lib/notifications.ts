import prisma from './prisma';

type NotificationType = 'TASK_ASSIGNED' | 'PENDING_APPROVAL' | 'TASK_APPROVED' | 'REPORT_ADDED';

export async function createNotification(params: {
  type: NotificationType;
  title: string;
  message?: string;
  userId: number;
  taskId?: number;
}) {
  return prisma.notification.create({ data: params });
}

export async function notifyTaskAssignees(taskId: number, taskTitle: string, assigneeIds: number[]) {
  for (const userId of assigneeIds) {
    await createNotification({
      type: 'TASK_ASSIGNED',
      title: 'تسک جدید',
      message: `تسک "${taskTitle}" به شما اختصاص داده شد`,
      userId,
      taskId,
    });
  }
}

export async function notifyPendingApproval(taskId: number, taskTitle: string, projectId: number) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { departmentId: true, department: { select: { managerId: true } } },
  });
  if (!project) return;

  const managers = await prisma.user.findMany({
    where: {
      OR: [
        { role: 'TECHNICAL_MANAGER' },
        { role: 'CEO' },
        { role: 'DEPARTMENT_MANAGER', departmentId: project.departmentId },
      ],
    },
  });

  for (const manager of managers) {
    await createNotification({
      type: 'PENDING_APPROVAL',
      title: 'تسک منتظر تایید',
      message: `تسک "${taskTitle}" منتظر تایید شماست`,
      userId: manager.id,
      taskId,
    });
  }
}

export async function notifyTaskApproved(taskId: number, taskTitle: string, createdById: number) {
  await createNotification({
    type: 'TASK_APPROVED',
    title: 'تسک تایید شد',
    message: `تسک "${taskTitle}" تایید شد`,
    userId: createdById,
    taskId,
  });
}

export async function notifyReportAdded(taskId: number, taskTitle: string, projectId: number, reporterName: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { departmentId: true },
  });
  if (!project) return;

  const managers = await prisma.user.findMany({
    where: {
      OR: [
        { role: 'TECHNICAL_MANAGER' },
        { role: 'CEO' },
        { role: 'DEPARTMENT_MANAGER', departmentId: project.departmentId },
      ],
    },
  });

  for (const manager of managers) {
    await createNotification({
      type: 'REPORT_ADDED',
      title: 'گزارش جدید',
      message: `${reporterName} گزارش جدیدی به تسک "${taskTitle}" اضافه کرد`,
      userId: manager.id,
      taskId,
    });
  }
}
