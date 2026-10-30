import { Router } from 'express';
import { authSession } from '../../common/middleware/auth-session.js';
import { validate } from '../../common/middleware/validate.js';
import { requireAuthInfrastructure, protectAuthWrite } from '../auth/auth.security.js';
import { initializeWeddings } from './weddings.service.js';
import {
  createWedding,
  getWedding,
  listWeddings,
  slugAvailability,
  updateWedding,
} from './weddings.controller.js';
import {
  availabilityRequest,
  createRequest,
  listRequest,
  readRequest,
  updateRequest,
} from './weddings.validation.js';
export const weddingsRouter = Router();
weddingsRouter.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'private, no-store');
  next();
});
weddingsRouter.use(requireAuthInfrastructure, authSession);
weddingsRouter.use(async (_req, _res, next) => {
  await initializeWeddings();
  next();
});
weddingsRouter.get('/', validate(listRequest), listWeddings);
weddingsRouter.get('/slug-availability', validate(availabilityRequest), slugAvailability);
weddingsRouter.post('/', protectAuthWrite, validate(createRequest), createWedding);
weddingsRouter.get('/:weddingId', validate(readRequest), getWedding);
weddingsRouter.patch('/:weddingId', protectAuthWrite, validate(updateRequest), updateWedding);
