import type { RequestHandler } from 'express';
import type { AuthUser, CreateEventInput, UpdateEventInput } from '@make-my-marriage/contracts';
import { eventsService } from './events.service.js';

type EventParams = { weddingId: string; eventId: string };
export const listEvents: RequestHandler = async (_req, res) => {
  const { params } = res.locals.validated as { params: EventParams };
  const user = res.locals.user as AuthUser;
  res.json({
    success: true,
    data: { events: await eventsService.list(params.weddingId, user.id) },
  });
};
export const getEvent: RequestHandler = async (_req, res) => {
  const { params } = res.locals.validated as { params: EventParams };
  const user = res.locals.user as AuthUser;
  res.json({
    success: true,
    data: await eventsService.get(params.weddingId, user.id, params.eventId),
  });
};
export const createEvent: RequestHandler = async (_req, res) => {
  const { params, body } = res.locals.validated as { params: EventParams; body: CreateEventInput };
  const user = res.locals.user as AuthUser;
  res
    .status(201)
    .json({ success: true, data: await eventsService.create(params.weddingId, user.id, body) });
};
export const updateEvent: RequestHandler = async (_req, res) => {
  const { params, body } = res.locals.validated as { params: EventParams; body: UpdateEventInput };
  const user = res.locals.user as AuthUser;
  res.json({
    success: true,
    data: await eventsService.update(params.weddingId, user.id, params.eventId, body),
  });
};
export const archiveEvent: RequestHandler = async (_req, res) => {
  const { params } = res.locals.validated as { params: EventParams };
  const user = res.locals.user as AuthUser;
  await eventsService.archive(params.weddingId, user.id, params.eventId);
  res.status(204).end();
};
