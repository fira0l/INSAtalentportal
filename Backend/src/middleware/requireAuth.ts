import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing token' });
    return;
  }

  const token = auth.substring('Bearer '.length);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ message: 'Server misconfiguration' });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as { sub?: string };
    (req as any).user = { id: payload.sub as string };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authUser = (req as any).user as { id: string } | undefined;
  if (!authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  const user = await User.findById(authUser.id).lean();
  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  if ((user as any).role !== 'admin') {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  next();
}


