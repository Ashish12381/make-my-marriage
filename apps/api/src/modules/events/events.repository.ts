import mongoose, { type ClientSession } from 'mongoose';
import { EventModel } from './models/event.model.js';

export const eventsRepository = {
  async initialize() {
    await EventModel.createCollection();
    await EventModel.createIndexes();
  },
  transaction<T>(operation: (session: ClientSession) => Promise<T>) {
    return mongoose.connection.transaction(operation);
  },
  list(weddingId: string) {
    return EventModel.find({ weddingId, deletedAt: null })
      .sort({ startAt: 1, createdAt: 1, _id: 1 })
      .exec();
  },
  find(weddingId: string, eventId: string, session?: ClientSession) {
    return EventModel.findOne({ weddingId, _id: eventId, deletedAt: null })
      .session(session ?? null)
      .exec();
  },
  newEvent: (weddingId: string, createdBy: string) => new EventModel({ weddingId, createdBy }),
};

export async function finalScheduledEvent(weddingId: string, session: ClientSession) {
  // A deployment may have weddings before the Events collection has any records.
  const [last] = await EventModel.aggregate<{ finish: Date }>([
    {
      $match: {
        weddingId: new mongoose.Types.ObjectId(weddingId),
        deletedAt: null,
        status: { $in: ['SCHEDULED', 'COMPLETED'] },
        startAt: { $type: 'date' },
      },
    },
    { $project: { finish: { $ifNull: ['$endAt', '$startAt'] } } },
    { $sort: { finish: -1 } },
    { $limit: 1 },
  ]).session(session);
  return last?.finish;
}
