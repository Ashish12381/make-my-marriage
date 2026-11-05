import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { signOut } from '../src/lib/api/auth';

vi.mock('../src/lib/api/auth', () => ({ signOut: vi.fn() }));
const replace = vi.fn();

beforeEach(() => {
  vi.resetModules();
  vi.mocked(signOut).mockReset();
  replace.mockReset();
  vi.stubGlobal('window', { location: { replace } });
});
afterEach(() => vi.unstubAllGlobals());

describe('logout navigation', () => {
  it('waits for logout and prevents an in-flight 401 from winning the navigation race', async () => {
    let finish: (() => void) | undefined;
    vi.mocked(signOut).mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const { logoutAndGoHome, redirectAfterSessionLoss } = await import('../src/lib/auth/logout');
    const pending = logoutAndGoHome();
    redirectAfterSessionLoss();
    expect(replace).not.toHaveBeenCalled();
    finish?.();
    await pending;
    redirectAfterSessionLoss();
    expect(replace.mock.calls).toEqual([['/']]);
  });
  it('redirects ordinary session loss, including logout elsewhere, to login', async () => {
    const { redirectAfterSessionLoss } = await import('../src/lib/auth/logout');
    redirectAfterSessionLoss();
    expect(replace).toHaveBeenCalledWith('/login');
  });
  it('restores session-loss handling and permits retry after failed logout', async () => {
    const failure = new Error('Network unavailable');
    vi.mocked(signOut).mockRejectedValueOnce(failure).mockResolvedValueOnce();
    const { logoutAndGoHome, redirectAfterSessionLoss } = await import('../src/lib/auth/logout');
    await expect(logoutAndGoHome()).rejects.toBe(failure);
    expect(replace).not.toHaveBeenCalled();
    redirectAfterSessionLoss();
    expect(replace).toHaveBeenCalledWith('/login');
    await logoutAndGoHome();
    expect(replace).toHaveBeenLastCalledWith('/');
  });
  it('coalesces repeated logout clicks into one request and one home navigation', async () => {
    vi.mocked(signOut).mockResolvedValue();
    const { logoutAndGoHome } = await import('../src/lib/auth/logout');
    await Promise.all([logoutAndGoHome(), logoutAndGoHome()]);
    expect(signOut).toHaveBeenCalledOnce();
    expect(replace.mock.calls).toEqual([['/']]);
  });
});
