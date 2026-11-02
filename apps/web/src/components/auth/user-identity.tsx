'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { AuthUser } from '@make-my-marriage/contracts';
import { watchCurrentUser } from '@/lib/auth/watch-current-user';
import { ApiError } from '@/lib/api/client';

export function UserIdentity({ initialUser = null }: { initialUser?: AuthUser | null }) {
  const [user, setUser] = useState(initialUser);
  useEffect(
    () =>
      watchCurrentUser({
        onUser: setUser,
        onError: (error) => {
          if (error instanceof ApiError && error.response.status === 401) setUser(null);
        },
      }),
    [],
  );
  if (!user) return null;
  return (
    <Link
      href="/account"
      aria-label={`Signed in as ${user.displayName}, ${user.email}. My Account`}
      title={`${user.displayName} · ${user.email}`}
      className="flex min-w-0 items-center gap-2 rounded-lg px-1 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <span
        aria-hidden="true"
        className="hidden size-9 shrink-0 items-center justify-center rounded-full bg-sand font-bold text-primary sm:flex"
      >
        {user.displayName.trim().slice(0, 1).toUpperCase() || '?'}
      </span>
      <span className="min-w-0 text-left leading-tight">
        <span className="block max-w-[72px] truncate text-xs font-semibold text-espresso sm:max-w-[150px] sm:text-sm">
          {user.displayName}
        </span>
        <span className="hidden max-w-[180px] truncate text-xs text-muted sm:block">
          {user.email}
        </span>
      </span>
    </Link>
  );
}
