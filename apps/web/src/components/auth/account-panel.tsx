'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { AuthUser } from '@make-my-marriage/contracts';
import { signOut, authErrorMessage } from '@/lib/api/auth';
import { watchCurrentUser } from '@/lib/auth/watch-current-user';
import { ApiError } from '@/lib/api/client';
import { AuthHeart } from './auth-shell';
export function AccountPanel() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    return watchCurrentUser({
      onUser: (currentUser) => {
        setUser(currentUser);
        setMessage('');
      },
      onError: async (error) => {
        setUser(null);
        if (error instanceof ApiError && error.response.status === 401) {
          window.location.replace('/login');
        } else setMessage((await authErrorMessage(error)).message);
      },
    });
  }, [attempt]);
  async function logout() {
    setBusy(true);
    setMessage('');
    try {
      await signOut();
      window.location.replace('/');
    } catch (error) {
      setMessage((await authErrorMessage(error)).message);
      setBusy(false);
    }
  }
  return (
    <section className="auth-card auth-account" aria-labelledby="account-title">
      <div className="auth-card-heading">
        <AuthHeart />
        <h1 id="account-title">{user ? `Welcome, ${user.displayName}` : 'Your account'}</h1>
      </div>
      {!user && !message && <p role="status">Checking your session…</p>}
      {message && (
        <div role="alert" className="auth-alert">
          {message}
        </div>
      )}
      {user && (
        <>
          <p className="auth-account-email">{user.email}</p>
          <div className="auth-checklist">
            <strong>You’re signed in.</strong>
            <p>
              Your account is ready. Wedding workspace setup is the next feature being developed.
            </p>
            <p>
              You’ll be able to add your wedding details, invite your family, and start planning
              here.
            </p>
          </div>
          <button className="auth-primary" onClick={logout} disabled={busy}>
            {busy ? 'Signing out…' : 'Sign Out'}
          </button>
        </>
      )}
      {!user && message && (
        <button
          className="auth-primary"
          onClick={() => {
            setMessage('');
            setAttempt(attempt + 1);
          }}
        >
          Try Again
        </button>
      )}
      <Link href="/" className="auth-bottom-back">
        Back to Home
      </Link>
    </section>
  );
}
