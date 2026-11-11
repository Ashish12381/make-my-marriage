import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { randomUUID } from 'node:crypto';
import { authRouter } from './modules/auth/index.js';
import { weddingsRouter } from './modules/weddings/index.js';
import { membershipsRouter } from './modules/memberships/memberships.routes.js';
import { eventsRouter } from './modules/events/index.js';
import { tasksRouter } from './modules/tasks/index.js';
import { errorHandler } from './common/errors/error-handler.js';
import { notFound } from './common/middleware/not-found.js';
import { env } from './config/env.js';

export const app = express();

app.disable('x-powered-by');
app.set('trust proxy', env.AUTH_TRUST_PROXY_HOPS);
app.use((_request, response, next) => {
  response.locals.requestId = randomUUID();
  response.setHeader('X-Request-Id', response.locals.requestId as string);
  next();
});
app.use(helmet());
app.use(cors({ origin: new URL(env.WEB_ORIGIN).origin, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.get('/api/v1/health', (_request, response) => {
  response.status(200).json({ status: 'ok' });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1', membershipsRouter);
app.use('/api/v1', eventsRouter);
app.use('/api/v1', tasksRouter);
app.use('/api/v1/weddings', weddingsRouter);
// Other business routers stay unmounted until their validation and authorization exist.
app.use(notFound);
app.use(errorHandler);

export default app;
