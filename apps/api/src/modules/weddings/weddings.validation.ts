import { z } from 'zod';
import {
  createWeddingSchema,
  updateWeddingSchema,
  weddingSlugSchema,
} from '@make-my-marriage/contracts';
const empty = z.strictObject({});
const params = z.strictObject({
  weddingId: z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/)
    .transform((v) => v.toLowerCase()),
});
export const createRequest = z.object({ body: createWeddingSchema, params: empty, query: empty });
export const updateRequest = z.object({ body: updateWeddingSchema, params, query: empty });
export const readRequest = z.object({ params, query: empty });
export const listRequest = z.object({ query: empty });
export const availabilityRequest = z.object({ query: z.strictObject({ slug: weddingSlugSchema }) });
