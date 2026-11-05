import { Router } from 'express';
import { validate } from '../../common/middleware/validate.js';
import { signup, login, me, logout } from './auth.controller.js';
import {
  issueCsrf,
  protectAuthWrite,
  requireAuthInfrastructure,
  throttleAuthentication,
} from './auth.security.js';
import { signupRequestSchema, loginRequestSchema } from './auth.validation.js';

export const authRouter = Router();
authRouter.use((_request, response, next) => {
  response.setHeader('Cache-Control', 'no-store');
  next();
});
authRouter.use(requireAuthInfrastructure);
authRouter.get('/csrf', issueCsrf);
authRouter.post(
  '/signup',
  protectAuthWrite,
  validate(signupRequestSchema),
  throttleAuthentication,
  signup,
);
authRouter.post(
  '/login',
  protectAuthWrite,
  validate(loginRequestSchema),
  throttleAuthentication,
  login,
);
authRouter.get('/me', me);
authRouter.post('/logout', protectAuthWrite, logout);
