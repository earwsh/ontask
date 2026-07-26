import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, displayName, role, departmentId, phone, nationalId, position, birthDate, startDate } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
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
      include: { department: true },
    });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );
    res.status(201).json({
      token,
      user: {
        id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName,
        displayName: user.displayName, role: user.role,
        department: user.department,
        departmentId: user.departmentId,
        phone: user.phone, nationalId: user.nationalId,
        position: user.position, birthDate: user.birthDate, startDate: user.startDate,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { department: true },
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );
    res.json({
      token,
      user: {
        id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName,
        displayName: user.displayName, role: user.role,
        department: user.department,
        departmentId: user.departmentId,
        phone: user.phone, nationalId: user.nationalId,
        position: user.position, birthDate: user.birthDate, startDate: user.startDate,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
