import { Schema, model } from 'mongoose';
import { taskPrioritySchema, taskStatusSchema } from '@make-my-marriage/contracts';

const schema = new Schema(
  {
    weddingId: { type: Schema.Types.ObjectId, required: true },
    eventId: { type: Schema.Types.ObjectId, default: null },
    title: { type: String, required: true },
    description: String,
    priority: { type: String, enum: taskPrioritySchema.options, required: true },
    status: { type: String, enum: taskStatusSchema.options, required: true },
    dueAt: Date,
    assigneeUserIds: [Schema.Types.ObjectId],
    checklist: [
      { text: { type: String, required: true }, completed: { type: Boolean, required: true } },
    ],
    comments: [{ authorId: Schema.Types.ObjectId, text: String, createdAt: Date }],
    createdBy: { type: Schema.Types.ObjectId, required: true },
    completedAt: Date,
    deletedAt: Date,
  },
  { collection: 'tasks', timestamps: true, strict: 'throw', autoCreate: false, autoIndex: false },
);
schema.index({ weddingId: 1, status: 1, dueAt: 1 });
schema.index({ weddingId: 1, eventId: 1 });
schema.index({ weddingId: 1, assigneeUserIds: 1, status: 1 });
export const TaskModel = model('WeddingTask', schema);
