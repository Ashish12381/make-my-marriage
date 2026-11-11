import mongoose, { type ClientSession } from 'mongoose';
import type { TaskListQuery } from '@make-my-marriage/contracts';
import { TaskModel } from './tasks.model.js';

const pageSize = 25;

export const tasksRepository = {
  async initialize() {
    await TaskModel.createCollection();
    await TaskModel.createIndexes();
  },
  transaction<T>(operation: (session: ClientSession) => Promise<T>) {
    return mongoose.connection.transaction(operation);
  },
  newTask: (weddingId: string, createdBy: string) => new TaskModel({ weddingId, createdBy }),
  find(weddingId: string, taskId: string, session?: ClientSession) {
    return TaskModel.findOne({ weddingId, _id: taskId, deletedAt: null })
      .session(session ?? null)
      .exec();
  },
  async list(weddingId: string, query: TaskListQuery, now: Date) {
    const scope = { weddingId, deletedAt: null };
    const { page, eventId, assigneeUserId, status, priority, dueFrom, dueTo, search } = query;
    const term = search
      ? new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      : undefined;
    const filters = {
      ...(eventId && { eventId }),
      ...(assigneeUserId && { assigneeUserIds: assigneeUserId }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...((dueFrom || dueTo) && {
        dueAt: {
          ...(dueFrom && { $gte: new Date(dueFrom) }),
          ...(dueTo && { $lt: new Date(dueTo) }),
        },
      }),
      ...(term && { $or: [{ title: term }, { description: term }, { 'checklist.text': term }] }),
    };
    const matching = { ...scope, ...filters };
    const pending = { $in: ['TODO', 'IN_PROGRESS'] } as const;
    const [tasks, total, pendingCount, inProgress, completed, overdue, attention, matchingTotal] =
      await Promise.all([
        TaskModel.find(matching)
          .sort({ createdAt: -1, _id: -1 })
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .exec(),
        TaskModel.countDocuments(scope).exec(),
        TaskModel.countDocuments({ ...scope, status: pending }).exec(),
        TaskModel.countDocuments({ ...scope, status: 'IN_PROGRESS' }).exec(),
        TaskModel.countDocuments({ ...scope, status: 'COMPLETED' }).exec(),
        TaskModel.countDocuments({ ...scope, status: pending, dueAt: { $lt: now } }).exec(),
        TaskModel.find({ ...scope, status: pending, dueAt: { $type: 'date' } })
          .sort({ dueAt: 1, _id: 1 })
          .limit(5)
          .exec(),
        Object.keys(filters).length ? TaskModel.countDocuments(matching).exec() : undefined,
      ]);
    return {
      tasks,
      matchingTotal: matchingTotal ?? total,
      summary: { total, pending: pendingCount, inProgress, completed, overdue, attention },
    };
  },
};
