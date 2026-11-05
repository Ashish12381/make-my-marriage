'use client';

import { useState } from 'react';
import { authErrorMessage } from '@/lib/api/auth';
import { logoutAndGoHome } from '@/lib/auth/logout';

export function SignOutButton({ className }: { className?: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function logout() {
    if (busy) return;
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
    <div>
      <button
        type="button"
        onClick={logout}
        disabled={busy}
        className={`cursor-pointer disabled:cursor-wait disabled:opacity-60 ${className ?? ''}`}
      >
        {busy ? 'Signing out…' : 'Sign Out'}
      </button>
      {message && (
        <p role="alert" className="mt-2 max-w-64 text-sm">
          {message}
        </p>
      )}
    </div>
  );
}
