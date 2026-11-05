import type { ErrorRequestHandler } from 'express';
import { randomUUID } from 'node:crypto';
import { AppError } from './app-error.js';

function isBodyParserError(error: unknown, type: string): boolean {
  return typeof error === 'object' && error !== null && 'type' in error && error.type === type;
}

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  const meta = { requestId: (response.locals.requestId as string | undefined) ?? randomUUID() };
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      meta,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details && { details: error.details }),
      },
    });
    return;
  }

  if (isBodyParserError(error, 'entity.parse.failed')) {
    response.status(400).json({
      success: false,
      meta,
      error: { code: 'INVALID_JSON', message: 'Invalid JSON request body.' },
    });
    return;
  }

  if (isBodyParserError(error, 'entity.too.large')) {
    response.status(413).json({
      success: false,
      meta,
      error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large.' },
    });
    return;
  }

  if (
    isBodyParserError(error, 'charset.unsupported') ||
    isBodyParserError(error, 'encoding.unsupported')
  ) {
    response.status(415).json({
      success: false,
      meta,
      error: {
        code: 'UNSUPPORTED_MEDIA_TYPE',
        message: 'Request body encoding is not supported.',
      },
    });
    return;
  }

  console.error('Unexpected API error.');
  response.status(500).json({
    success: false,
    meta,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
  });
};
