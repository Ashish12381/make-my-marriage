import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { app } from '../src/app.js';
import { errorHandler } from '../src/common/errors/error-handler.js';

describe('JSON request encoding errors', () => {
  it('returns 415 for an unsupported JSON charset', async () => {
    const response = await request(app)
      .post('/api/v1/health')
      .set('Content-Type', 'application/json; charset=iso-8859-1')
      .send('{}');

    expect(response.status).toBe(415);
    expect(response.body).toEqual({
      error: {
        code: 'UNSUPPORTED_MEDIA_TYPE',
        message: 'Request body encoding is not supported.',
      },
    });
  });

  it('returns 415 for an unsupported content encoding', async () => {
    const response = await request(app)
      .post('/api/v1/health')
      .set('Content-Type', 'application/json')
      .set('Content-Encoding', 'unsupported')
      .send('{}');

    expect(response.status).toBe(415);
    expect(response.body).toEqual({
      error: {
        code: 'UNSUPPORTED_MEDIA_TYPE',
        message: 'Request body encoding is not supported.',
      },
    });
  });
});

describe('Unexpected errors', () => {
  it.each([undefined, 415])(
    'keeps an unexpected error with status %s as a sanitized 500 response',
    async (status) => {
      const testApp = express();
      const error = Object.assign(new Error('Internal implementation details.'), { status });
      testApp.use((_request, _response, next) => next(error));
      testApp.use(errorHandler);
      const errorLog = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      try {
        const response = await request(testApp).get('/');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred.',
          },
        });
      } finally {
        errorLog.mockRestore();
      }
    },
  );
});
