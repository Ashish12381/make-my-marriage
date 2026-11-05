import type { RequestHandler } from 'express';
import type { LoginInput, SignupInput } from '@make-my-marriage/contracts';
import { authService } from './auth.service.js';
import { cookieOptions, readCookie, SESSION_COOKIE } from './auth.security.js';

export const signup: RequestHandler = async (request, response) => {
  const { body } = response.locals.validated as { body: SignupInput };
  const result = await authService.signup(body);
  // Registration does not authenticate. An existing browser session must not skip the login step.
  const existingSession = readCookie(request, SESSION_COOKIE);
  if (typeof existingSession === 'string') {
    await authService.logout(existingSession);
    response.clearCookie(SESSION_COOKIE, cookieOptions);
  }
  response.status(201).json({
    success: true,
    data: { user: result.user, weddings: [] },
    meta: { requestId: response.locals.requestId },
  });
};
export const login: RequestHandler = async (request, response) => {
  const { body } = response.locals.validated as { body: LoginInput };
  const result = await authService.login(body);
  await authService.logout(readCookie(request, SESSION_COOKIE));
  response.cookie(SESSION_COOKIE, result.token, {
    ...cookieOptions,
    ...(body.rememberMe ? { expires: result.expiresAt } : {}),
  });
  response.json({
    success: true,
    data: { user: result.user },
    meta: { requestId: response.locals.requestId },
  });
};
export const me: RequestHandler = async (request, response) => {
  const user = await authService.authenticate(readCookie(request, SESSION_COOKIE));
  response.json({ success: true, data: { user }, meta: { requestId: response.locals.requestId } });
};
export const logout: RequestHandler = async (request, response) => {
  await authService.logout(readCookie(request, SESSION_COOKIE));
  response.clearCookie(SESSION_COOKIE, cookieOptions);
  response.status(204).end();
};
