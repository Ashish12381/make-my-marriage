import { Router } from 'express';
import { authSession } from '../../common/middleware/auth-session.js';
import { validate } from '../../common/middleware/validate.js';
import { protectAuthWrite, requireAuthInfrastructure } from '../auth/auth.security.js';
import * as controller from './tasks.controller.js';
import * as schema from './tasks.validation.js';

export const tasksRouter = Router();
const collection = '/weddings/:weddingId/tasks';
const item = collection + '/:taskId';
tasksRouter.use(
  collection,
  (_req, res, next) => {
    res.setHeader('Cache-Control', 'private, no-store');
    next();
  },
  requireAuthInfrastructure,
  authSession,
);
tasksRouter.get(collection, validate(schema.listRequest), controller.listTasks);
tasksRouter.get(
  collection + '/event-options',
  validate(schema.eventsRequest),
  controller.listTaskEvents,
);
tasksRouter.post(
  collection,
  protectAuthWrite,
  validate(schema.createRequest),
  controller.createTask,
);
tasksRouter.get(item, validate(schema.readRequest), controller.getTask);
tasksRouter.patch(item, protectAuthWrite, validate(schema.updateRequest), controller.updateTask);
tasksRouter.delete(item, protectAuthWrite, validate(schema.readRequest), controller.removeTask);
