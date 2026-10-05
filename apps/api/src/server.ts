import { app } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';

async function startServer(): Promise<void> {
  if (env.MONGODB_URI) {
    await connectDatabase(env.MONGODB_URI);
    console.info('MongoDB connected.');
  } else {
    console.info('MongoDB is disabled locally: MONGODB_URI is not configured.');
  }

  const server = app.listen(env.PORT, () => {
    console.info(`API listening at http://localhost:${env.PORT}`);
  });

  server.on('error', () => {
    console.error('Unable to start the HTTP server. Check PORT and local permissions.');
    void disconnectDatabase()
      .catch(() => {
        console.error('Unable to close the MongoDB connection.');
      })
      .finally(() => {
        process.exitCode = 1;
      });
  });

  const shutdown = (): void => {
    const timeout = setTimeout(() => {
      console.error('API shutdown timed out.');
      process.exit(1);
    }, 10_000);
    timeout.unref();

    server.close(() => {
      void disconnectDatabase()
        .catch(() => {
          console.error('Unable to close the MongoDB connection.');
          process.exitCode = 1;
        })
        .finally(() => {
          clearTimeout(timeout);
        });
    });
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

void startServer().catch(() => {
  console.error('API startup failed. Check environment configuration and MongoDB connectivity.');
  process.exitCode = 1;
});
