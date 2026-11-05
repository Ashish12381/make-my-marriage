'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { AuthUser } from '@make-my-marriage/contracts';
import { authErrorMessage } from '@/lib/api/auth';
import { logoutAndGoHome, redirectAfterSessionLoss } from '@/lib/auth/logout';
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
          redirectAfterSessionLoss();
        } else setMessage((await authErrorMessage(error)).message);
      },
    });
  }, [attempt]);
  async function logout() {
    setBusy(true);
    setMessage('');
    try {
      await logoutAndGoHome();
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
            <p>Your account is ready. Open My Weddings to create or manage your wedding space.</p>
            <p>Save wedding details and switch between the weddings you belong to.</p>
          </div>
          <Link href="/weddings" className="auth-primary">
            My Weddings →
          </Link>
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
