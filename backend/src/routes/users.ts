import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, email: true, name: true, role: true, department: true, phone: true, createdAt: true },
  });
  res.json(user);
});

router.get('/', authenticate, authorize('CEO', 'HR_MANAGER'), async (_req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, department: true, phone: true, createdAt: true },
  });
  res.json(users);
});

export default router;
