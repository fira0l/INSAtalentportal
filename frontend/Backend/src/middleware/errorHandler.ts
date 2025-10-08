import type { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

// Centralized error handler
// Non-production returns stack for easier dev; production hides it
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const status = 500;
  const isProd = process.env.NODE_ENV === 'production';

  logger.error('Unhandled error', { err });

  res.status(status).json({
    message: 'Internal Server Error',
    ...(isProd ? {} : { error: String(err) }),
  });
}
