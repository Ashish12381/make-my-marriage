import type { AuthUser } from '@make-my-marriage/contracts';
import { getCurrentUser } from '../api/auth';
import { subscribeToSessionChanges } from './session-events';

export function watchCurrentUser(callbacks: {
  onUser: (user: AuthUser) => void;
  onError: (error: unknown) => void;
}) {
  let controller: AbortController;
  function revalidate() {
    controller?.abort();
    const current = new AbortController();
    controller = current;
    void getCurrentUser(current.signal).then(
      (user) => {
        if (!current.signal.aborted) callbacks.onUser(user);
      },
      (error: unknown) => {
        if (!current.signal.aborted) callbacks.onError(error);
      },
    );
  }
  const unsubscribe = subscribeToSessionChanges(revalidate);
  revalidate();
  return () => {
    controller.abort();
    unsubscribe();
  };
}
