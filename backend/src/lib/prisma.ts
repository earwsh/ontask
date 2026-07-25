import { PrismaClient } from '../generated/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://earwsh@localhost:5432/ontask';
const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

export default prisma;
