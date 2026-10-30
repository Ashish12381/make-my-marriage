import { websiteRepository } from './website.repository.js';
import type { ClientSession } from 'mongoose';
export const initializeWebsiteSettings = () => websiteRepository.initialize();
export const createUnpublishedWebsite = (weddingId: string, session: ClientSession) =>
  websiteRepository.createUnpublished(weddingId, session);
