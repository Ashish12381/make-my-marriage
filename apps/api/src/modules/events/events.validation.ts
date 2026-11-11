import { z } from 'zod';
import { createEventSchema, eventIdSchema, updateEventSchema } from '@make-my-marriage/contracts';

const weddingParams = z.object({ weddingId: eventIdSchema });
const eventParams = weddingParams.extend({ eventId: eventIdSchema });
export const listRequest = z.object({ params: weddingParams });
export const readRequest = z.object({ params: eventParams });
export const createRequest = listRequest.extend({ body: createEventSchema });
export const updateRequest = readRequest.extend({ body: updateEventSchema });
