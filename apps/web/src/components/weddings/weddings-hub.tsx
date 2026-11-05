'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Wedding } from '@make-my-marriage/contracts';
import { listWeddings } from '@/lib/api/weddings';
import { authErrorMessage } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { subscribeToSessionChanges } from '@/lib/auth/session-events';
import { redirectAfterSessionLoss } from '@/lib/auth/logout';
import { formatWeddingDate, weddingCountdown } from '@/lib/weddings';
export function WeddingsHub() {
  const [weddings, setWeddings] = useState<Wedding[] | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  function retry() {
    setWeddings(null);
    setError('');
    setAttempt((n) => n + 1);
  }
  useEffect(() => subscribeToSessionChanges(retry), []);
  useEffect(() => {
    const controller = new AbortController();
    void listWeddings(controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setWeddings(value);
      })
      .catch(async (err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof ApiError && err.response.status === 401) {
          redirectAfterSessionLoss();
          return;
        }
        const details = await authErrorMessage(
          err,
          'We could not load your weddings. Please try again.',
        );
        if (!controller.signal.aborted) setError(details.message);
      });
    return () => controller.abort();
  }, [attempt]);
  return (
    <div className="wedding-container">
      <section className="wedding-hub-heading">
        <div>
          <p className="wedding-eyebrow">One wedding. Both families.</p>
          <h1>My Weddings</h1>
          <p>Your celebrations, together in one place.</p>
        </div>
        <Link href="/weddings/new" className="wedding-button">
          ＋ Create Wedding
        </Link>
      </section>
      {error ? (
        <section className="wedding-card wedding-empty" role="alert">
          <h2>Unable to load weddings</h2>
          <p>{error}</p>
          <button className="wedding-button" onClick={retry}>
            Retry
          </button>
        </section>
      ) : !weddings ? (
        <p role="status" className="wedding-loading">
          Loading your weddings…
        </p>
      ) : weddings.length === 0 ? (
        <section className="wedding-card wedding-empty">
          <span aria-hidden="true" className="wedding-heart">
            ♡
          </span>
          <h2>No weddings yet</h2>
          <p>Create your first wedding space and bring your plans together.</p>
          <Link href="/weddings/new" className="wedding-button">
            Create Your First Wedding
          </Link>
        </section>
      ) : (
        <div className="wedding-grid">
          {weddings.map((w) => (
            <article className="wedding-card wedding-list-card" key={w.id}>
              <div className="wedding-card-cover" aria-hidden="true">
                ♡
              </div>
              <div className="wedding-list-content">
                <span className="wedding-badge">
                  {w.role === 'WEDDING_ADMIN' ? 'Wedding Admin' : 'Organizer'}
                </span>
                <p className="wedding-muted">
                  {formatWeddingDate(w.weddingDate)} · {weddingCountdown(w.weddingDate, w.timezone)}
                </p>
                <h2>{w.title}</h2>
                <p>
                  {w.brideName} &amp; {w.groomName}
                </p>
                <p className="wedding-muted">
                  {w.defaultVenue?.name || w.defaultVenue?.address || 'Venue not added yet'}
                </p>
                <Link className="wedding-button" href={`/weddings/${w.id}`}>
                  Open Wedding →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
