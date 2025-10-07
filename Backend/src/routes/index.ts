import type { Application, Request, Response } from 'express';
import { Router } from 'express';

import authRoutes from './v1/auth.routes';

export function registerRoutes(app: Application): void {
  const api = Router();

  api.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  api.use('/auth', authRoutes);

  app.use('/api/v1', api);
}


