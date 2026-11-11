import { z } from 'zod';
import { eventIdSchema } from './events.js';

export const taskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);
export const taskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export const taskListQuerySchema = z
  .strictObject({
    page: z.coerce.number().int().min(1).max(10000).default(1),
    eventId: eventIdSchema.optional(),
    assigneeUserId: eventIdSchema.optional(),
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    dueFrom: z.iso.datetime().optional(),
    dueTo: z.iso.datetime().optional(),
    search: z.string().trim().min(1).max(120).optional(),
  })
  .refine(
    ({ dueFrom, dueTo }) => !dueFrom || !dueTo || Date.parse(dueFrom) < Date.parse(dueTo),
    'Choose a valid due date range.',
  );
export type TaskListQuery = z.infer<typeof taskListQuerySchema>;
const checklistItem = z.strictObject({
  id: eventIdSchema.optional(),
  text: z.string().trim().min(1).max(200),
  completed: z.boolean(),
});
export const createTaskSchema = z.strictObject({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  eventId: eventIdSchema.nullish(),
  dueAt: z.iso.datetime().nullish(),
  priority: taskPrioritySchema,
  status: taskStatusSchema,
  assigneeUserIds: z.array(eventIdSchema).max(50),
  checklist: z.array(checklistItem).max(30),
});
export const updateTaskSchema = createTaskSchema
  .partial()
  .extend({
    expectedUpdatedAt: z.iso.datetime().optional(),
  })
  .refine(
    (input) => Object.keys(input).some((key) => key !== 'expectedUpdatedAt'),
    'Enter at least one change.',
  );
export const weddingTaskSchema = createTaskSchema.extend({
  id: eventIdSchema,
  createdBy: eventIdSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  completedAt: z.iso.datetime().optional(),
  checklist: z.array(checklistItem.required({ id: true })).max(30),
});
const taskSummarySchema = z.object({
  total: z.number(),
  pending: z.number(),
  inProgress: z.number(),
  completed: z.number(),
  overdue: z.number(),
  attention: z.array(weddingTaskSchema),
});
export const tasksResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    tasks: z.array(weddingTaskSchema),
    summary: taskSummarySchema,
    matchingTotal: z.number().optional(),
  }),
});
export const taskResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ task: weddingTaskSchema }),
});
export const taskEventsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ events: z.array(z.object({ id: eventIdSchema, name: z.string() })) }),
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type WeddingTask = z.infer<typeof weddingTaskSchema>;
export type TaskSummary = z.infer<typeof taskSummarySchema>;
