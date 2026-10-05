import type { RequestHandler } from 'express';
import { AppError } from '../errors/app-error.js';

// Structural placeholder: never accept a cookie as proof of an authenticated user.
// Implement opaque token hashing, database expiry/revocation, and CSRF before mounting.
export const authSession: RequestHandler = (_request, _response, next) => {
  next(new AppError(501, 'AUTH_NOT_IMPLEMENTED', 'Session authentication is not implemented.'));
};
