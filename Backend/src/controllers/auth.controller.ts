import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { User } from '../models/User';
import { logger } from '../utils/logger';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

const registerAdminSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  inviteCode: z.string().min(1),
});

export async function registerHandler(req: Request, res: Response): Promise<void> {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ errors: parse.error.flatten() });
    return;
  }
  const { name, email, password } = parse.data;

  const existing = await User.findOne({ email }).lean();
  if (existing) {
    res.status(409).json({ message: 'Email already in use' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });

  res.status(201).json({ id: user.id, name: user.name, email: user.email });
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ errors: parse.error.flatten() });
    return;
  }
  const { email, password } = parse.data;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  if (user.approvalStatus === 'pending') {
    res.status(403).json({ message: 'Account pending approval' });
    return;
  }
  if (user.approvalStatus === 'rejected') {
    res.status(403).json({ message: 'Account rejected', reason: user.rejectionReason ?? undefined });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    logger.error('JWT_SECRET not set');
    res.status(500).json({ message: 'Server misconfiguration' });
    return;
  }

  const token = jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: '7d' });
  res.json({ token });
}

export async function meHandler(req: Request, res: Response): Promise<void> {
  const user = (req as any).user as { id: string } | undefined;
  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  const dbUser = await User.findById(user.id).lean();
  if (!dbUser) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  res.json({ id: dbUser._id, name: dbUser.name, email: dbUser.email, role: (dbUser as any).role, approvalStatus: (dbUser as any).approvalStatus, rejectionReason: (dbUser as any).rejectionReason, approvedAt: (dbUser as any).approvedAt });
}

export async function registerAdminHandler(req: Request, res: Response): Promise<void> {
  const parse = registerAdminSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ errors: parse.error.flatten() });
    return;
  }
  const { name, email, password, inviteCode } = parse.data;

  const expectedCode = process.env.ADMIN_INVITE_CODE;
  if (!expectedCode) {
    res.status(500).json({ message: 'Server misconfiguration' });
    return;
  }
  if (inviteCode !== expectedCode) {
    res.status(403).json({ message: 'Invalid invite code' });
    return;
  }

  const existing = await User.findOne({ email }).lean();
  if (existing) {
    res.status(409).json({ message: 'Email already in use' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: 'admin',
    approvalStatus: 'approved',
    approvedAt: new Date(),
    rejectionReason: null,
  } as any);

  res.status(201).json({ id: user.id, name: user.name, email: user.email, role: 'admin' });
}


