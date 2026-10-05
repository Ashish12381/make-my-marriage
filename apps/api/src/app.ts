import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { errorHandler } from './common/errors/error-handler.js';
import { notFound } from './common/middleware/not-found.js';
import { env } from './config/env.js';

export const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: new URL(env.WEB_ORIGIN).origin, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.get('/api/v1/health', (_request, response) => {
  response.status(200).json({ status: 'ok' });
});

// Business routers stay unmounted until their validation and authorization exist.
app.use(notFound);
app.use(errorHandler);

export default app;
