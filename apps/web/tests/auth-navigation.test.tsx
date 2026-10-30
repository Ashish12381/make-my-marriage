import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { cookies } from 'next/headers';
import { getServerUser } from '../src/lib/auth/server-session';
import { LandingHeader, LandingFooter } from '../src/components/landing/landing-shell';
import { ClosingSection } from '../src/components/landing/closing-section';
import LoginPage from '../src/app/(auth)/login/page';
import SignupPage from '../src/app/(auth)/signup/page';
import AccountPage from '../src/app/(auth)/account/page';
import { HeroSection } from '../src/components/landing/hero-section';

vi.mock('next/headers', () => ({ cookies: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: (path: string) => {
    throw new Error(`redirect:${path}`);
  },
}));

const user = { id: 'test-user', displayName: 'Test User', email: 'test@example.com' };
const fetchMock = vi.fn<typeof fetch>();
function sessionCookie(value?: string) {
  vi.mocked(cookies).mockResolvedValue({
    get: (name: string) => (name === 'mmm_session' && value ? { name, value } : undefined),
  } as Awaited<ReturnType<typeof cookies>>);
}
function validSession() {
  sessionCookie('test-session');
  fetchMock.mockImplementation(async () => Response.json({ success: true, data: { user } }));
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', fetchMock);
  sessionCookie();
});
afterEach(() => vi.unstubAllGlobals());

describe('server session resolution', () => {
  it('does not call the account API without a session cookie', async () => {
    expect(await getServerUser()).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('validates the session through the API without forwarding unrelated cookies or caching', async () => {
    validSession();
    expect(await getServerUser()).toEqual(user);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/auth\/me$/),
      expect.objectContaining({
        headers: { Cookie: 'mmm_session=test-session' },
        cache: 'no-store',
        redirect: 'error',
      }),
    );
  });
  it.each([401, 503])('does not treat an HTTP %s response as signed in', async (status) => {
    sessionCookie('expired-or-invalid');
    fetchMock.mockResolvedValue(new Response(null, { status }));
    expect(await getServerUser()).toBeNull();
  });
  it('keeps public pages available during an account API outage', async () => {
    sessionCookie('test-session');
    fetchMock.mockRejectedValue(new Error('network unavailable'));
    expect(await getServerUser()).toBeNull();
  });
  it('rejects malformed successful responses', async () => {
    sessionCookie('test-session');
    fetchMock.mockResolvedValue(Response.json({ success: true, data: {} }));
    expect(await getServerUser()).toBeNull();
  });
});

describe('authentication navigation', () => {
  it('links signed-in visitors directly to their weddings instead of signup', () => {
    const html = renderToStaticMarkup(<HeroSection signedIn />);
    expect(html).toContain('href="/weddings"');
    expect(html).toContain('My Weddings');
    expect(html).not.toContain('href="/signup"');
  });
  it('keeps Start Planning linked to signup for signed-out visitors', () => {
    const html = renderToStaticMarkup(<HeroSection signedIn={false} />);
    expect(html).toContain('href="/signup"');
    expect(html).toContain('Start Planning');
  });
  it('redirects signed-out account visits to login before returning the profile panel', async () => {
    await expect(AccountPage()).rejects.toThrow('redirect:/login');
  });
  it('allows validated account visits', async () => {
    validSession();
    await expect(AccountPage()).resolves.toBeDefined();
  });
  it.each([LandingHeader, LandingFooter, ClosingSection])(
    'renders sign-out instead of sign-in for signed-in visitors (%#)',
    (Component) => {
      const html = renderToStaticMarkup(<Component signedIn />);
      expect(html).toContain('Sign Out');
      expect(html).not.toContain('href="/login"');
    },
  );
  it.each([LandingHeader, LandingFooter, ClosingSection])(
    'renders sign-in for signed-out visitors (%#)',
    (Component) => {
      const html = renderToStaticMarkup(<Component signedIn={false} />);
      expect(html).toContain('href="/login"');
      expect(html).not.toContain('Sign Out');
    },
  );
  it('redirects authenticated login visits before returning the form', async () => {
    validSession();
    await expect(LoginPage({ searchParams: Promise.resolve({}) })).rejects.toThrow('redirect:/');
  });
  it('redirects authenticated signup visits before returning the form', async () => {
    validSession();
    await expect(SignupPage()).rejects.toThrow('redirect:/');
  });
  it('allows signed-out visitors to open login and signup', async () => {
    await expect(
      LoginPage({ searchParams: Promise.resolve({ registered: '1' }) }),
    ).resolves.toMatchObject({ props: { mode: 'login', accountCreated: true } });
    await expect(SignupPage()).resolves.toMatchObject({ props: { mode: 'signup' } });
  });
});
