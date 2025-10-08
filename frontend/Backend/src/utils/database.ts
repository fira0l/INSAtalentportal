import mongoose from 'mongoose';
import { logger } from './logger';

export async function connectToDatabase(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI not set');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);
  logger.info('Connected to MongoDB');
}
