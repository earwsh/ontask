import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

const userSelect: any = {
  id: true, email: true, firstName: true, lastName: true, displayName: true,
  role: true, departmentId: true, phone: true, nationalId: true, position: true,
  birthDate: true, startDate: true, createdAt: true, updatedAt: true,
  department: true,
};

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: userSelect,
  });
  res.json(user);
});

router.get('/', authenticate, authorize('CEO', 'HR_MANAGER'), async (_req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({ select: userSelect });
  res.json(users);
});

router.post('/', authenticate, authorize('CEO', 'HR_MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName, displayName, role, departmentId, phone, nationalId, position, birthDate, startDate } = req.body;
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'Required fields: email, password, firstName, lastName, role' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    if (nationalId) {
      const existingNationalId = await prisma.user.findUnique({ where: { nationalId } });
      if (existingNationalId) {
        return res.status(400).json({ error: 'National ID already exists' });
      }
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email, password: hashedPassword, firstName, lastName, displayName, role,
        departmentId: departmentId ? parseInt(departmentId) : null,
        phone, nationalId, position,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
      },
      select: userSelect,
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.put('/:id', authenticate, authorize('CEO', 'HR_MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { email, password, firstName, lastName, displayName, role, departmentId, phone, nationalId, position, birthDate, startDate } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) return res.status(400).json({ error: 'Email already exists' });
    }
    if (nationalId && nationalId !== existingUser.nationalId) {
      const nationalIdExists = await prisma.user.findUnique({ where: { nationalId } });
      if (nationalIdExists) return res.status(400).json({ error: 'National ID already exists' });
    }
    const data: any = {};
    if (email) data.email = email;
    if (firstName) data.firstName = firstName;
    if (lastName) data.lastName = lastName;
    if (displayName !== undefined) data.displayName = displayName;
    if (role) data.role = role;
    if (departmentId !== undefined) data.departmentId = departmentId ? parseInt(departmentId) : null;
    if (phone !== undefined) data.phone = phone;
    if (nationalId !== undefined) data.nationalId = nationalId;
    if (position !== undefined) data.position = position;
    if (birthDate !== undefined) data.birthDate = birthDate ? new Date(birthDate) : null;
    if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
    if (password) data.password = await bcrypt.hash(password, 10);
    const user = await prisma.user.update({ where: { id }, data, select: userSelect });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/:id', authenticate, authorize('CEO', 'HR_MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
