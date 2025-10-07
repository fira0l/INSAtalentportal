import 'dotenv/config';
import { createServer } from 'http';

import { createApp } from './app';
import { connectToDatabase } from './utils/database';
import { logger } from './utils/logger';

const PORT = Number(process.env.PORT) || 5000;

async function bootstrap(): Promise<void> {
  await connectToDatabase();

  const app = createApp();
  const httpServer = createServer(app);

  httpServer.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal startup error', err);
  process.exit(1);
});


