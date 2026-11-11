import { Types, type ClientSession } from 'mongoose';
import {
  weddingTaskSchema,
  type CreateTaskInput,
  type TaskListQuery,
  type UpdateTaskInput,
} from '@make-my-marriage/contracts';
import { AppError } from '../../common/errors/app-error.js';
import { initializeAudit, recordTaskChange } from '../audit/audit.service.js';
import { findTaskEvent, listTaskEvents } from '../events/events.queries.js';
import { requireWeddingFeature, validateTaskAssignees } from '../memberships/index.js';
import { lockWeddingMembershipChanges } from '../weddings/weddings.queries.js';
import { tasksRepository } from './tasks.repository.js';

type StoredTask = NonNullable<Awaited<ReturnType<typeof tasksRepository.find>>>;
let initialized: Promise<void> | undefined;

function publicTask(task: StoredTask) {
  return weddingTaskSchema.parse({
    id: task.id,
    title: task.title,
    description: task.description,
    eventId: task.eventId?.toString() ?? null,
    dueAt: task.dueAt?.toISOString() ?? null,
    status: task.status,
    priority: task.priority,
    assigneeUserIds: task.assigneeUserIds.map(String),
    checklist: task.checklist.map((item) => ({
      id: item._id.toString(),
      text: item.text,
      completed: item.completed,
    })),
    createdBy: task.createdBy.toString(),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    completedAt: task.completedAt?.toISOString(),
  });
}

async function requireTask(weddingId: string, id: string, session?: ClientSession) {
  const task = await tasksRepository.find(weddingId, id, session);
  if (!task) throw new AppError(404, 'TASK_NOT_FOUND', 'This task is unavailable.');
  return task;
}

async function writeTask<T>(
  weddingId: string,
  userId: string,
  operation: (session: ClientSession, role: 'WEDDING_ADMIN' | 'ORGANIZER') => Promise<T>,
) {
  await requireWeddingFeature(weddingId, userId, 'tasks');
  initialized ??= Promise.all([tasksRepository.initialize(), initializeAudit()])
    .then(() => undefined)
    .catch((error: unknown) => {
      initialized = undefined;
      throw error;
    });
  await initialized;
  return tasksRepository.transaction(async (session) => {
    await lockWeddingMembershipChanges(weddingId, session);
    const { role } = await requireWeddingFeature(weddingId, userId, 'tasks', session);
    return operation(session, role);
  });
}

async function applyChanges(
  task: StoredTask,
  changes: CreateTaskInput | UpdateTaskInput,
  session: ClientSession,
) {
  const weddingId = task.weddingId.toString();
  const { eventId, assigneeUserIds, checklist, ...fields } = changes;
  if (eventId && !(await findTaskEvent(weddingId, eventId, session))) {
    throw new AppError(422, 'INVALID_TASK_EVENT', 'Choose an event from this wedding.');
  }
  if (assigneeUserIds) {
    await validateTaskAssignees(weddingId, assigneeUserIds, session);
    task.set('assigneeUserIds', [...new Set(assigneeUserIds)]);
  }
  if (eventId !== undefined) task.set('eventId', eventId);
  if (checklist) {
    const existing = new Set(task.checklist.map((item) => item._id.toString()));
    const ids = checklist.flatMap(({ id }) => (id ? [id] : []));
    if (ids.some((id) => !existing.has(id)) || new Set(ids).size !== ids.length) {
      throw new AppError(422, 'INVALID_TASK_CHECKLIST', 'Review the task checklist and try again.');
    }
    task.set(
      'checklist',
      checklist.map(({ id, text, completed }) => ({
        _id: id ? new Types.ObjectId(id) : new Types.ObjectId(),
        text,
        completed,
      })),
    );
  }
  if (fields.status !== undefined) {
    task.completedAt = fields.status === 'COMPLETED' ? (task.completedAt ?? new Date()) : null;
  }
  task.set(fields);
  await task.save({ session });
  return publicTask(task);
}

export const tasksService = {
  async list(weddingId: string, userId: string, query: TaskListQuery) {
    await requireWeddingFeature(weddingId, userId, 'tasks');
    const { tasks, summary, matchingTotal } = await tasksRepository.list(
      weddingId,
      query,
      new Date(),
    );
    return {
      tasks: tasks.map(publicTask),
      matchingTotal,
      summary: { ...summary, attention: summary.attention.map(publicTask) },
    };
  },
  async events(weddingId: string, userId: string) {
    await requireWeddingFeature(weddingId, userId, 'tasks');
    return listTaskEvents(weddingId);
  },
  async get(weddingId: string, userId: string, taskId: string) {
    await requireWeddingFeature(weddingId, userId, 'tasks');
    return publicTask(await requireTask(weddingId, taskId));
  },
  create(weddingId: string, userId: string, input: CreateTaskInput) {
    return writeTask(weddingId, userId, async (session, role) => {
      const task = await applyChanges(tasksRepository.newTask(weddingId, userId), input, session);
      await recordTaskChange(weddingId, userId, role, task.id, 'TASK_CREATED', session);
      return task;
    });
  },
  update(weddingId: string, userId: string, taskId: string, input: UpdateTaskInput) {
    return writeTask(weddingId, userId, async (session, role) => {
      const task = await requireTask(weddingId, taskId, session);
      const { expectedUpdatedAt, ...changes } = input;
      if (expectedUpdatedAt !== undefined && expectedUpdatedAt !== task.updatedAt.toISOString()) {
        throw new AppError(
          409,
          'TASK_CHANGED',
          'This task changed while you were editing. Reopen it and review the latest details.',
        );
      }
      const updated = await applyChanges(task, changes, session);
      await recordTaskChange(weddingId, userId, role, taskId, 'TASK_UPDATED', session);
      return updated;
    });
  },
  remove(weddingId: string, userId: string, taskId: string) {
    return writeTask(weddingId, userId, async (session, role) => {
      const task = await requireTask(weddingId, taskId, session);
      task.deletedAt = new Date();
      await task.save({ session });
      await recordTaskChange(weddingId, userId, role, taskId, 'TASK_REMOVED', session);
    });
  },
};
