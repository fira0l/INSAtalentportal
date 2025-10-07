import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

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


