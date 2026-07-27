import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId: user.id } }),
    ]);

    res.json({ notifications, total, page, limit });
  } catch (err) {
    console.error('get notifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.get('/unread-count', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const count = await prisma.notification.count({
      where: { userId: user.id, read: false },
    });
    res.json({ count });
  } catch (err) {
    console.error('unread count error:', err);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

router.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const user = req.user!;

    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== user.id) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await prisma.notification.update({ where: { id }, data: { read: true } });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    console.error('mark read error:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

router.patch('/read-all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    console.error('mark all read error:', err);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

export default router;
