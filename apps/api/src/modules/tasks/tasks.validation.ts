import { z } from 'zod';
import {
  createTaskSchema,
  eventIdSchema,
  taskListQuerySchema,
  updateTaskSchema,
} from '@make-my-marriage/contracts';

const wedding = z.object({ params: z.object({ weddingId: eventIdSchema }) });
export const eventsRequest = wedding;
export const listRequest = wedding.extend({
  query: taskListQuerySchema,
});
export const readRequest = wedding.extend({
  params: wedding.shape.params.extend({ taskId: eventIdSchema }),
});
export const createRequest = wedding.extend({ body: createTaskSchema });
export const updateRequest = readRequest.extend({ body: updateTaskSchema });
