import 'dotenv/config';
import { PrismaClient } from '../src/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash('arash1383@', 10);

  await prisma.user.upsert({
    where: { email: 'arashebrahimi9329@gmail.com' },
    update: {},
    create: {
      email: 'arashebrahimi9329@gmail.com',
      password,
      firstName: 'Arash',
      lastName: 'Ebrahimi',
      displayName: 'Arash Ebrahimi',
      role: 'CEO',
      phone: '09120000001',
      nationalId: '0010000001',
      position: 'مدیر عامل',
      birthDate: new Date('1383-01-01'),
      startDate: new Date('1403-01-01'),
    },
  });

  console.log('Seed completed: CEO user created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
