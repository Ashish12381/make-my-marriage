import {
  csrfResponseSchema,
  taskEventsResponseSchema,
  taskResponseSchema,
  tasksResponseSchema,
  type CreateTaskInput,
  type TaskListQuery,
  type UpdateTaskInput,
} from '@make-my-marriage/contracts';
import { apiFetch } from './client';

const tasksPath = (weddingId: string) => '/weddings/' + encodeURIComponent(weddingId) + '/tasks';
const taskPath = (weddingId: string, id: string) =>
  tasksPath(weddingId) + '/' + encodeURIComponent(id);

export async function listTasks(
  weddingId: string,
  page = 1,
  signal?: AbortSignal,
  filters: Omit<TaskListQuery, 'page'> = {},
) {
  const query = new URLSearchParams({ page: String(page) });
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined) query.set(key, value);
  }
  const response = await apiFetch(tasksPath(weddingId) + '?' + query, {
    cache: 'no-store',
    signal: signal ?? null,
  });
  return tasksResponseSchema.parse(await response.json()).data;
}
export async function getTask(weddingId: string, id: string, signal?: AbortSignal) {
  const response = await apiFetch(taskPath(weddingId, id), {
    cache: 'no-store',
    signal: signal ?? null,
  });
  return taskResponseSchema.parse(await response.json()).data.task;
}
export async function listTaskEvents(weddingId: string, signal?: AbortSignal) {
  const response = await apiFetch(tasksPath(weddingId) + '/event-options', {
    cache: 'no-store',
    signal: signal ?? null,
  });
  return taskEventsResponseSchema.parse(await response.json()).data.events;
}
async function write(
  path: string,
  method: 'POST' | 'PATCH' | 'DELETE',
  input?: CreateTaskInput | UpdateTaskInput,
) {
  const csrf = csrfResponseSchema.parse(
    await (await apiFetch('/auth/csrf', { cache: 'no-store' })).json(),
  ).data.csrfToken;
  return apiFetch(path, {
    method,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
    body: input ? JSON.stringify(input) : null,
  });
}
export async function saveTask(
  weddingId: string,
  input: CreateTaskInput | UpdateTaskInput,
  id?: string,
) {
  const response = id
    ? await write(taskPath(weddingId, id), 'PATCH', input)
    : await write(tasksPath(weddingId), 'POST', input);
  return taskResponseSchema.parse(await response.json()).data.task;
}
export async function removeTask(weddingId: string, id: string) {
  await write(taskPath(weddingId, id), 'DELETE');
}
