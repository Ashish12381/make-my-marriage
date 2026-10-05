import type { RequestHandler } from 'express';
import type { z } from 'zod';
import { AppError } from '../errors/app-error.js';

/** Validates { body, params, query }; parsed data lives in response.locals.validated.
 * Do not assign request.query: Express 5 exposes it as a getter.
 */
export function validate(schema: z.ZodType): RequestHandler {
  return async (request, response, next) => {
    const result = await schema.safeParseAsync({
      body: request.body as unknown,
      params: request.params,
      query: request.query,
    });

    if (!result.success) {
      next(
        new AppError(
          422,
          'VALIDATION_ERROR',
          'Please review the request fields.',
          result.error.issues.map((issue) => ({
            path: issue.path.map(String).join('.'),
            message: issue.message,
          })),
        ),
      );
      return;
    }

    response.locals.validated = result.data;
    next();
  };
}
