import { describe, expect, it } from 'vitest';
import type { Wedding } from '@make-my-marriage/contracts';
import { initialWeddingOverview, weddingOverviewReducer } from '../src/lib/wedding-overview-state';

const wedding: Wedding = {
  id: 'a'.repeat(24),
  title: 'Our Wedding',
  brideName: 'Priya',
  groomName: 'Rahul',
  weddingDate: '2027-02-14',
  timezone: 'Asia/Kolkata',
  slug: 'priya-rahul',
  role: 'WEDDING_ADMIN',
  status: 'ACTIVE',
};
const loaded = weddingOverviewReducer(initialWeddingOverview, { type: 'loaded', wedding });
const editing = weddingOverviewReducer(loaded, { type: 'edit' });

describe('wedding overview refresh recovery', () => {
  it('retains the loaded wedding and mounted editor on a temporary refresh failure', () => {
    const failed = weddingOverviewReducer(editing, {
      type: 'failed',
      message: 'Service unavailable',
      accessRejected: false,
    });
    expect(failed.wedding).toBe(wedding);
    expect(failed.editing).toBe(true);
    expect(failed.error).toBe('Service unavailable');
    expect(failed.unavailable).toBe(false);
  });
  it('keeps the editor throughout retry, repeated failure and successful refresh', () => {
    const failed = weddingOverviewReducer(editing, {
      type: 'failed',
      message: 'Network error',
      accessRejected: false,
    });
    const retry = weddingOverviewReducer(failed, { type: 'retry' });
    expect(retry).toEqual(editing);
    const repeated = weddingOverviewReducer(retry, {
      type: 'failed',
      message: 'Try later',
      accessRejected: false,
    });
    const refreshed = weddingOverviewReducer(repeated, {
      type: 'loaded',
      wedding: { ...wedding, title: 'Server title' },
    });
    expect(refreshed.editing).toBe(true);
    expect(refreshed.error).toBe('');
    expect(refreshed.wedding?.title).toBe('Server title');
  });
  it('clears private wedding data and unmounts the editor when access is rejected', () => {
    const failed = weddingOverviewReducer(editing, {
      type: 'failed',
      message: 'Access rejected',
      accessRejected: true,
    });
    expect(failed).toEqual({
      wedding: null,
      editing: false,
      unavailable: true,
      error: 'Access rejected',
    });
  });
  it('closes the editor if a refresh returns reduced Organizer permissions', () => {
    const state = weddingOverviewReducer(editing, {
      type: 'loaded',
      wedding: { ...wedding, role: 'ORGANIZER' },
    });
    expect(state.editing).toBe(false);
    expect(state.wedding?.role).toBe('ORGANIZER');
    expect(weddingOverviewReducer(state, { type: 'edit' }).editing).toBe(false);
  });
  it('shows a retryable initial-load error without inventing cached wedding data', () => {
    const failed = weddingOverviewReducer(initialWeddingOverview, {
      type: 'failed',
      message: 'Network error',
      accessRejected: false,
    });
    expect(failed.wedding).toBeNull();
    expect(failed.editing).toBe(false);
    expect(failed.unavailable).toBe(false);
    expect(weddingOverviewReducer(failed, { type: 'retry' })).toEqual(initialWeddingOverview);
  });
  it('still allows Cancel and a successful save after a refresh warning', () => {
    const failed = weddingOverviewReducer(editing, {
      type: 'failed',
      message: 'Try later',
      accessRejected: false,
    });
    expect(weddingOverviewReducer(failed, { type: 'close' }).editing).toBe(false);
    const saved = weddingOverviewReducer(failed, {
      type: 'saved',
      wedding: { ...wedding, title: 'Saved draft' },
    });
    expect(saved.editing).toBe(false);
    expect(saved.error).toBe('');
    expect(saved.wedding?.title).toBe('Saved draft');
  });
});
