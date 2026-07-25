import { PrismaClient } from '../src/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash('123456', 10);

  const users = [
    { email: 'ceo@ontask.com', password, name: 'مدیر عامل', role: 'CEO', department: null, phone: '09120000001' },
    { email: 'hr@ontask.com', password, name: 'مدیر منابع انسانی', role: 'HR_MANAGER', department: 'منابع انسانی', phone: '09120000002' },
    { email: 'tech@ontask.com', password, name: 'مدیر فنی', role: 'TECHNICAL_MANAGER', department: 'فنی', phone: '09120000003' },
    { email: 'dept@ontask.com', password, name: 'مدیر دپارتمان', role: 'DEPARTMENT_MANAGER', department: 'فروش', phone: '09120000004' },
    { email: 'emp@ontask.com', password, name: 'کارمند', role: 'EMPLOYEE', department: 'فنی', phone: '09120000005' },
    { email: 'customer@ontask.com', password, name: 'مشتری', role: 'CUSTOMER', department: null, phone: '09120000006' },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user as any,
    });
  }

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
