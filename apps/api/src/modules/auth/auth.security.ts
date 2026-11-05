import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { CookieOptions, Request, RequestHandler } from 'express';
import { AppError } from '../../common/errors/app-error.js';
import { connectDatabase } from '../../config/database.js';
import { env } from '../../config/env.js';
import { allowAuthenticationAttempt, initializeAudit } from '../audit/index.js';
import { authRepository } from './auth.repository.js';

export const SESSION_COOKIE = 'mmm_session';
const CSRF_COOKIE = 'mmm_csrf';
const webOrigin = new URL(env.WEB_ORIGIN).origin;
export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
};
export function readCookie(request: Request, name: string): unknown {
  const cookies: unknown = request.cookies;
  return typeof cookies === 'object' && cookies !== null && name in cookies
    ? (cookies as Record<string, unknown>)[name]
    : undefined;
}
let ready: Promise<void> | undefined;
export const requireAuthInfrastructure: RequestHandler = async (_request, _response, next) => {
  const uri = env.MONGODB_URI;
  if (!env.AUTH_SECRET || !uri) {
    throw new AppError(
      503,
      'AUTH_UNAVAILABLE',
      'Account services are not configured. Please try again later.',
    );
  }
  ready ??= (async () => {
    await connectDatabase(uri);
    await Promise.all([authRepository.initialize(), initializeAudit()]);
  })().catch((error: unknown) => {
    ready = undefined;
    throw error;
  });
  try {
    await ready;
  } catch {
    throw new AppError(
      503,
      'AUTH_UNAVAILABLE',
      'Account services are temporarily unavailable. Please try again.',
    );
  }
  next();
};
const signature = (value: string): string =>
  createHmac('sha256', env.AUTH_SECRET ?? '')
    .update(value)
    .digest('base64url');
function equal(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
function validCsrf(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 200) return false;
  const parts = value.split('.');
  const [nonce, expires, mac] = parts;
  return (
    parts.length === 3 &&
    !!nonce &&
    /^[A-Za-z0-9_-]{32}$/.test(nonce) &&
    !!expires &&
    /^\d+$/.test(expires) &&
    Number(expires) > Date.now() &&
    Number(expires) <= Date.now() + 3600000 &&
    !!mac &&
    equal(mac, signature(`${nonce}.${expires}`))
  );
}
export const issueCsrf: RequestHandler = (request, response) => {
  if (request.get('origin') && request.get('origin') !== webOrigin) {
    throw new AppError(403, 'ORIGIN_REJECTED', 'Request origin is not allowed.');
  }
  const existing = readCookie(request, CSRF_COOKIE);
  const payload = `${randomBytes(24).toString('base64url')}.${Date.now() + 3600000}`;
  const token = validCsrf(existing) ? existing : `${payload}.${signature(payload)}`;
  response.cookie(CSRF_COOKIE, token, { ...cookieOptions, maxAge: 3600000 });
  response.json({
    success: true,
    data: { csrfToken: token },
    meta: { requestId: response.locals.requestId },
  });
};
export const protectAuthWrite: RequestHandler = (request, _response, next) => {
  if (request.get('origin') !== webOrigin) {
    throw new AppError(403, 'ORIGIN_REJECTED', 'Request origin is not allowed.');
  }
  const token = request.get('x-csrf-token');
  const cookie = readCookie(request, CSRF_COOKIE);
  if (!validCsrf(token) || typeof cookie !== 'string' || !equal(token, cookie)) {
    throw new AppError(403, 'CSRF_REJECTED', 'Your form has expired. Please submit it again.');
  }
  next();
};
export const throttleAuthentication: RequestHandler = async (request, response, next) => {
  const input: unknown = request.body;
  const email =
    typeof input === 'object' &&
    input !== null &&
    'email' in input &&
    typeof input.email === 'string'
      ? input.email
      : '';
  const limit = await allowAuthenticationAttempt(request.ip ?? 'unknown', email);
  if (!limit.allowed) {
    response.setHeader('Retry-After', limit.retryAfter);
    throw new AppError(429, 'RATE_LIMITED', 'Too many attempts. Please wait before trying again.');
  }
  next();
};
