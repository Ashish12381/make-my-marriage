import { Router } from 'express';
import { authSession } from '../../common/middleware/auth-session.js';
import { validate } from '../../common/middleware/validate.js';
import { protectAuthWrite, requireAuthInfrastructure } from '../auth/auth.security.js';
import * as controller from './events.controller.js';
import * as schema from './events.validation.js';

export const eventsRouter = Router();
const collection = '/weddings/:weddingId/events';
const item = collection + '/:eventId';
eventsRouter.use(
  collection,
  (_req, res, next) => {
    res.setHeader('Cache-Control', 'private, no-store');
    next();
  },
  requireAuthInfrastructure,
  authSession,
);
eventsRouter.get(collection, validate(schema.listRequest), controller.listEvents);
eventsRouter.post(
  collection,
  protectAuthWrite,
  validate(schema.createRequest),
  controller.createEvent,
);
eventsRouter.get(item, validate(schema.readRequest), controller.getEvent);
eventsRouter.patch(item, protectAuthWrite, validate(schema.updateRequest), controller.updateEvent);
eventsRouter.delete(item, protectAuthWrite, validate(schema.readRequest), controller.archiveEvent);
