import type { ClientSession } from 'mongoose';
import { eventsRepository } from './events.repository.js';

export { finalScheduledEvent } from './events.repository.js';

export async function findTaskEvent(weddingId: string, eventId: string, session: ClientSession) {
  return Boolean(await eventsRepository.find(weddingId, eventId, session));
}

export async function listTaskEvents(weddingId: string) {
  return (await eventsRepository.list(weddingId)).map(({ id, name }) => ({ id: String(id), name }));
}
