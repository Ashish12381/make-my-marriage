'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { subscribeToSessionChanges } from '@/lib/auth/session-events';

// Refresh the server-resolved session props for every homepage call to action.
export function LandingSessionSync() {
  const router = useRouter();
  useEffect(() => subscribeToSessionChanges(() => router.refresh()), [router]);
  return null;
}
