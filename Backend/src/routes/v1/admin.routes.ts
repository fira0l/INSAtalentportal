import { Router, type Request, type Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/requireAuth';
import { User } from '../../models/User';

const router = Router();

// List pending students
router.get('/students/pending', requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  const users = await User.find({ role: 'student', approvalStatus: 'pending' }).lean();
  res.json(users.map(u => ({ id: u._id, name: u.name, email: u.email, createdAt: u.createdAt })));
});

// Approve a student
router.post('/students/:id/approve', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  if (user.role !== 'student') {
    res.status(400).json({ message: 'Only students can be approved' });
    return;
  }
  user.approvalStatus = 'approved' as any;
  user.rejectionReason = null as any;
  user.approvedAt = new Date() as any;
  await user.save();
  res.json({ id: user.id, approvalStatus: user.approvalStatus, approvedAt: user.approvedAt });
});

// Reject a student
router.post('/students/:id/reject', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body ?? {};
  const user = await User.findById(id);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  if (user.role !== 'student') {
    res.status(400).json({ message: 'Only students can be rejected' });
    return;
  }
  user.approvalStatus = 'rejected' as any;
  user.rejectionReason = typeof reason === 'string' && reason.trim().length > 0 ? reason.trim() : '';
  user.approvedAt = null as any;
  await user.save();
  res.json({ id: user.id, approvalStatus: user.approvalStatus, rejectionReason: user.rejectionReason });
});

export default router;
