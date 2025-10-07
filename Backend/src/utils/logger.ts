/* Simple console-based logger with level methods */
export const logger = {
  info: (message: string, meta?: unknown) => {
    // eslint-disable-next-line no-console
    console.log(`[INFO] ${message}`, meta ?? '');
  },
  warn: (message: string, meta?: unknown) => {
    // eslint-disable-next-line no-console
    console.warn(`[WARN] ${message}`, meta ?? '');
  },
  error: (message: string, meta?: unknown) => {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${message}`, meta ?? '');
  },
};


