import type { RequestHandler } from 'express';
import { authService } from '../../modules/auth/auth.service.js';
import { readCookie, SESSION_COOKIE } from '../../modules/auth/auth.security.js';

// Wedding membership and feature permissions remain a separate authorization step.
export const authSession: RequestHandler = async (request, response, next) => {
  response.locals.user = await authService.authenticate(readCookie(request, SESSION_COOKIE));
  next();
};
