import 'dotenv/config';
import { PrismaClient } from '../src/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash('123456', 10);

  const deptFanni = await prisma.department.upsert({
    where: { name: 'فنی' },
    update: {},
    create: { name: 'فنی', description: 'دپارتمان فنی و توسعه' },
  });

  const deptHR = await prisma.department.upsert({
    where: { name: 'منابع انسانی' },
    update: {},
    create: { name: 'منابع انسانی', description: 'دپارتمان منابع انسانی' },
  });

  const deptFrosh = await prisma.department.upsert({
    where: { name: 'فروش' },
    update: {},
    create: { name: 'فروش', description: 'دپارتمان فروش و بازاریابی' },
  });

  const empDept = await prisma.user.upsert({
    where: { email: 'dept@ontask.com' },
    update: {},
    create: { email: 'dept@ontask.com', password, firstName: 'مدیر', lastName: 'دپارتمان', displayName: 'مدیر دپارتمان', role: 'DEPARTMENT_MANAGER' as const, departmentId: deptFrosh.id, phone: '09120000004', nationalId: '0010000004', position: 'مدیر فروش', birthDate: new Date('1372-11-05'), startDate: new Date('1402-03-01') },
  });

  await prisma.department.update({ where: { id: deptFrosh.id }, data: { managerId: empDept.id } });

  const users = [
    { email: 'ceo@ontask.com', password, firstName: 'مدیر', lastName: 'عامل', displayName: 'مدیر عامل', role: 'CEO' as const, departmentId: null, phone: '09120000001', nationalId: '0010000001', position: 'مدیر عامل', birthDate: new Date('1365-01-01'), startDate: new Date('1400-01-01') },
    { email: 'hr@ontask.com', password, firstName: 'مدیر', lastName: 'منابع انسانی', displayName: 'مدیر منابع انسانی', role: 'HR_MANAGER' as const, departmentId: deptHR.id, phone: '09120000002', nationalId: '0010000002', position: 'مدیر منابع انسانی', birthDate: new Date('1370-03-15'), startDate: new Date('1401-06-01') },
    { email: 'tech@ontask.com', password, firstName: 'مدیر', lastName: 'فنی', displayName: 'مدیر فنی', role: 'TECHNICAL_MANAGER' as const, departmentId: deptFanni.id, phone: '09120000003', nationalId: '0010000003', position: 'مدیر فنی', birthDate: new Date('1368-07-20'), startDate: new Date('1400-09-01') },
    { email: 'emp@ontask.com', password, firstName: 'کارمند', lastName: 'نمونه', displayName: 'کارمند نمونه', role: 'EMPLOYEE' as const, departmentId: deptFanni.id, phone: '09120000005', nationalId: '0010000005', position: 'توسعه‌دهنده', birthDate: new Date('1375-05-10'), startDate: new Date('1403-01-15') },
    { email: 'customer@ontask.com', password, firstName: 'مشتری', lastName: 'نمونه', displayName: 'مشتری نمونه', role: 'CUSTOMER' as const, departmentId: null, phone: '09120000006', nationalId: '0010000006', position: null, birthDate: new Date('1380-02-20'), startDate: null },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  // Find users by email
  const techManager = await prisma.user.findUnique({ where: { email: 'tech@ontask.com' } });
  const deptManager = await prisma.user.findUnique({ where: { email: 'dept@ontask.com' } });
  const emp = await prisma.user.findUnique({ where: { email: 'emp@ontask.com' } });

  // Projects
  const project1 = await prisma.project.create({
    data: {
      name: 'سایت فروشگاهی',
      description: 'طراحی و توسعه سایت فروشگاهی با NEXT.js',
      client: 'شرکت تجارت الکترونیک',
      departmentId: deptFanni.id,
      createdById: techManager!.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'اپلیکیشن موبایل',
      description: 'اپلیکیشن موبایل فروشگاه',
      client: 'همان شرکت',
      departmentId: deptFanni.id,
      createdById: techManager!.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'کمپین فروش تابستان',
      description: 'برنامه بازاریابی و فروش تابستان ۱۴۰۴',
      client: 'داخلی',
      departmentId: deptFrosh.id,
      createdById: deptManager!.id,
    },
  });

  // Members
  for (const project of [project1, project2]) {
    await prisma.projectMember.create({
      data: { projectId: project.id, userId: emp!.id },
    });
    await prisma.projectMember.create({
      data: { projectId: project.id, userId: techManager!.id },
    });
  }
  await prisma.projectMember.create({
    data: { projectId: project3.id, userId: deptManager!.id },
  });

  // Tasks (now with multiple assignees)
  const task1 = await prisma.task.create({
    data: {
      title: 'طراحی هدر سایت',
      description: 'هدر ریسپانسیو با منوی کشویی',
      projectId: project1.id,
      createdById: techManager!.id,
      status: 'TODO',
      deadline: new Date('2026-08-15'),
      estimatedHours: 8,
    },
  });

  await prisma.taskAssignee.create({
    data: { taskId: task1.id, userId: emp!.id },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'صفحه محصول',
      description: 'صفحه نمایش محصول با گالری تصاویر',
      projectId: project1.id,
      createdById: techManager!.id,
      status: 'IN_PROGRESS',
      deadline: new Date('2026-08-20'),
      estimatedHours: 16,
    },
  });

  await prisma.taskAssignee.create({
    data: { taskId: task2.id, userId: emp!.id },
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'صفحه اصلی اپ',
      description: 'طراحی صفحه اصلی اپلیکیشن',
      projectId: project2.id,
      createdById: techManager!.id,
      status: 'TODO',
    },
  });

  await prisma.taskAssignee.create({
    data: { taskId: task3.id, userId: emp!.id },
  });

  const task4 = await prisma.task.create({
    data: {
      title: 'تنظیمات فروش ویژه',
      description: 'تنظیم تخفیف‌های تابستانه در سیستم',
      projectId: project3.id,
      createdById: deptManager!.id,
      status: 'TODO',
    },
  });

  await prisma.taskAssignee.create({
    data: { taskId: task4.id, userId: deptManager!.id },
  });

  // Task 5: PENDING_APPROVAL (employee submitted for approval)
  const task5 = await prisma.task.create({
    data: {
      title: 'گزارش عملکرد ماهانه',
      description: 'تهیه گزارش عملکرد تیم فنی برای ماه جاری',
      projectId: project2.id,
      createdById: emp!.id,
      status: 'PENDING_APPROVAL',
      deadline: new Date('2026-07-30'),
      estimatedHours: 4,
    },
  });

  await prisma.taskAssignee.create({
    data: { taskId: task5.id, userId: emp!.id },
  });

  // Task 6: DONE (approved by manager)
  const task6 = await prisma.task.create({
    data: {
      title: 'رفع باگ ورود کاربران',
      description: 'رفع مشکل لاگین در نسخه موبایل',
      projectId: project2.id,
      createdById: techManager!.id,
      status: 'DONE',
      deadline: new Date('2026-07-15'),
      estimatedHours: 6,
      approvedById: deptManager!.id,
      approvedAt: new Date('2026-07-14'),
    },
  });

  await prisma.taskAssignee.create({
    data: { taskId: task6.id, userId: emp!.id },
  });

  // Subtasks for task1
  await prisma.taskSubtask.create({
    data: { title: 'طراحی لوگو', taskId: task1.id, isDone: true },
  });
  await prisma.taskSubtask.create({
    data: { title: 'پیاده‌سازی منو', taskId: task1.id },
  });
  await prisma.taskSubtask.create({
    data: { title: 'طراحی ریسپانسیو', taskId: task1.id },
  });

  // Report
  await prisma.taskReport.create({
    data: {
      content: 'شروع کردم روی هدر، تا فردا تموم میشه',
      taskId: task1.id,
      userId: emp!.id,
    },
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
