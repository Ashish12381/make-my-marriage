import type { RequestHandler } from 'express';
import type {
  AuthUser,
  CreateTaskInput,
  TaskListQuery,
  UpdateTaskInput,
} from '@make-my-marriage/contracts';
import { tasksService } from './tasks.service.js';

type TaskParams = { weddingId: string; taskId: string };

export const listTasks: RequestHandler = async (_req, res) => {
  const { params, query } = res.locals.validated as { params: TaskParams; query: TaskListQuery };
  const user = res.locals.user as AuthUser;
  res.json({ success: true, data: await tasksService.list(params.weddingId, user.id, query) });
};
export const listTaskEvents: RequestHandler = async (_req, res) => {
  const { params } = res.locals.validated as { params: TaskParams };
  const user = res.locals.user as AuthUser;
  res.json({
    success: true,
    data: { events: await tasksService.events(params.weddingId, user.id) },
  });
};
export const getTask: RequestHandler = async (_req, res) => {
  const { params } = res.locals.validated as { params: TaskParams };
  const user = res.locals.user as AuthUser;
  res.json({
    success: true,
    data: { task: await tasksService.get(params.weddingId, user.id, params.taskId) },
  });
};
export const createTask: RequestHandler = async (_req, res) => {
  const { params, body } = res.locals.validated as { params: TaskParams; body: CreateTaskInput };
  const user = res.locals.user as AuthUser;
  res.status(201).json({
    success: true,
    data: { task: await tasksService.create(params.weddingId, user.id, body) },
  });
};
export const updateTask: RequestHandler = async (_req, res) => {
  const { params, body } = res.locals.validated as { params: TaskParams; body: UpdateTaskInput };
  const user = res.locals.user as AuthUser;
  res.json({
    success: true,
    data: { task: await tasksService.update(params.weddingId, user.id, params.taskId, body) },
  });
};
export const removeTask: RequestHandler = async (_req, res) => {
  const { params } = res.locals.validated as { params: TaskParams };
  const user = res.locals.user as AuthUser;
  await tasksService.remove(params.weddingId, user.id, params.taskId);
  res.status(204).end();
};
