import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getCurrentUser, signOut } from '../src/lib/api/auth';
import { ApiError } from '../src/lib/api/client';
import { notifySessionChanged, subscribeToSessionChanges } from '../src/lib/auth/session-events';
import { watchCurrentUser } from '../src/lib/auth/watch-current-user';

vi.mock('../src/lib/api/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/lib/api/auth')>()),
  getCurrentUser: vi.fn(),
}));

class TestChannel extends EventTarget {
  static instances: TestChannel[] = [];
  postMessage = vi.fn();
  close = vi.fn();
  constructor(public readonly name: string) {
    super();
    TestChannel.instances.push(this);
  }
}

let tab: EventTarget;
let documentState: EventTarget & { visibilityState: string };
let dispose: (() => void) | undefined;
const user = { id: 'test-user', displayName: 'Test User', email: 'test@example.com' };

beforeEach(() => {
  vi.resetAllMocks();
  TestChannel.instances = [];
  tab = new EventTarget();
  documentState = Object.assign(new EventTarget(), { visibilityState: 'visible' });
  vi.stubGlobal('window', tab);
  vi.stubGlobal('document', documentState);
  vi.stubGlobal('BroadcastChannel', TestChannel);
});
afterEach(() => {
  dispose?.();
  dispose = undefined;
  vi.unstubAllGlobals();
});

describe('session change signals', () => {
  it('sends only a revalidation hint and closes the publishing channel', () => {
    notifySessionChanged();
    const channel = TestChannel.instances[0];
    expect(channel?.postMessage).toHaveBeenCalledWith('session-changed');
    expect(channel?.close).toHaveBeenCalledOnce();
  });
  it('rechecks on cross-tab messages, focus, history restoration and visibility', () => {
    const revalidate = vi.fn();
    dispose = subscribeToSessionChanges(revalidate);
    TestChannel.instances[0]?.dispatchEvent(new MessageEvent('message', { data: 'unrelated' }));
    expect(revalidate).not.toHaveBeenCalled();
    TestChannel.instances[0]?.dispatchEvent(
      new MessageEvent('message', { data: 'session-changed' }),
    );
    tab.dispatchEvent(new Event('focus'));
    tab.dispatchEvent(new Event('pageshow'));
    documentState.dispatchEvent(new Event('visibilitychange'));
    expect(revalidate).toHaveBeenCalledTimes(4);
    documentState.visibilityState = 'hidden';
    documentState.dispatchEvent(new Event('visibilitychange'));
    expect(revalidate).toHaveBeenCalledTimes(4);
    dispose();
    revalidate.mockClear();
    tab.dispatchEvent(new Event('focus'));
    documentState.visibilityState = 'visible';
    documentState.dispatchEvent(new Event('visibilitychange'));
    TestChannel.instances[0]?.dispatchEvent(
      new MessageEvent('message', { data: 'session-changed' }),
    );
    expect(revalidate).not.toHaveBeenCalled();
    dispose = undefined;
  });
  it('falls back to focus events when BroadcastChannel is unavailable', () => {
    vi.stubGlobal('BroadcastChannel', undefined);
    const revalidate = vi.fn();
    expect(() => notifySessionChanged()).not.toThrow();
    dispose = subscribeToSessionChanges(revalidate);
    tab.dispatchEvent(new Event('focus'));
    expect(revalidate).toHaveBeenCalledOnce();
  });
  it('announces logout only after the account API succeeds', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ success: true, data: { csrfToken: 'test-csrf' } }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    await signOut();
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringMatching(/\/auth\/logout$/),
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    );
    expect(TestChannel.instances[0]?.postMessage).toHaveBeenCalledWith('session-changed');
  });
  it('does not announce a failed logout', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    await expect(signOut()).rejects.toBeInstanceOf(ApiError);
    expect(TestChannel.instances).toHaveLength(0);
  });
});

describe('live account session', () => {
  it('revalidates through the API after logout in another tab and reports 401', async () => {
    const unauthorized = new ApiError(new Response(null, { status: 401 }));
    vi.mocked(getCurrentUser).mockResolvedValueOnce(user).mockRejectedValueOnce(unauthorized);
    const onUser = vi.fn();
    const onError = vi.fn();
    dispose = watchCurrentUser({ onUser, onError });
    await vi.waitFor(() => expect(onUser).toHaveBeenCalledWith(user));
    TestChannel.instances[0]?.dispatchEvent(
      new MessageEvent('message', { data: 'session-changed' }),
    );
    await vi.waitFor(() => expect(onError).toHaveBeenCalledWith(unauthorized));
    expect(getCurrentUser).toHaveBeenCalledTimes(2);
  });
  it('ignores late responses from superseded requests and after unmount', async () => {
    let resolveFirst: ((value: typeof user) => void) | undefined;
    let resolveSecond: ((value: typeof user) => void) | undefined;
    vi.mocked(getCurrentUser)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecond = resolve;
          }),
      );
    const onUser = vi.fn();
    const onError = vi.fn();
    dispose = watchCurrentUser({ onUser, onError });
    const firstSignal = vi.mocked(getCurrentUser).mock.calls[0]?.[0];
    tab.dispatchEvent(new Event('focus'));
    expect(firstSignal?.aborted).toBe(true);
    resolveFirst?.(user);
    await Promise.resolve();
    expect(onUser).not.toHaveBeenCalled();
    dispose();
    dispose = undefined;
    resolveSecond?.(user);
    await Promise.resolve();
    expect(onUser).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });
});
