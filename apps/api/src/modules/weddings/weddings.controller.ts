import type { RequestHandler } from 'express';
import type { AuthUser, CreateWeddingInput, UpdateWeddingInput } from '@make-my-marriage/contracts';
import { weddingsService } from './weddings.service.js';
export const listWeddings: RequestHandler = async (_req, res) => {
  const user = res.locals.user as AuthUser;
  res.json({
    success: true,
    data: { weddings: await weddingsService.list(user.id) },
    meta: { requestId: res.locals.requestId },
  });
};
export const createWedding: RequestHandler = async (_req, res) => {
  const user = res.locals.user as AuthUser;
  const { body } = res.locals.validated as { body: CreateWeddingInput };
  res.status(201).json({
    success: true,
    data: { wedding: await weddingsService.create(user.id, body) },
    meta: { requestId: res.locals.requestId },
  });
};
export const getWedding: RequestHandler = async (_req, res) => {
  const user = res.locals.user as AuthUser;
  const { params } = res.locals.validated as { params: { weddingId: string } };
  res.json({
    success: true,
    data: { wedding: await weddingsService.get(user.id, params.weddingId) },
    meta: { requestId: res.locals.requestId },
  });
};
export const updateWedding: RequestHandler = async (_req, res) => {
  const user = res.locals.user as AuthUser;
  const { params, body } = res.locals.validated as {
    params: { weddingId: string };
    body: UpdateWeddingInput;
  };
  res.json({
    success: true,
    data: { wedding: await weddingsService.update(user.id, params.weddingId, body) },
    meta: { requestId: res.locals.requestId },
  });
};
export const slugAvailability: RequestHandler = async (_req, res) => {
  const { query } = res.locals.validated as { query: { slug: string } };
  res.json({
    success: true,
    data: { available: await weddingsService.available(query.slug) },
    meta: { requestId: res.locals.requestId },
  });
};
