import type { RequestHandler } from 'express';
import { AppError } from '../errors/app-error.js';

// Structural placeholder: a client-supplied weddingId must never grant access.
// Verify an active membership, requested permissions, and same-wedding references first.
export const requireWeddingAccess: RequestHandler = (_request, _response, next) => {
  next(new AppError(501, 'ACCESS_NOT_IMPLEMENTED', 'Wedding authorization is not implemented.'));
};
