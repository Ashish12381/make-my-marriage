import { galleryRepository } from './gallery.repository.js';

export const initializeEventAlbums = galleryRepository.initialize;
export const ensureDefaultEventAlbum: typeof galleryRepository.ensureEventAlbum = (...args) =>
  galleryRepository.ensureEventAlbum(...args);
