'use client';
import Link from 'next/link';
import { useEffect, useReducer, useRef, useState } from 'react';
import { getWedding } from '@/lib/api/weddings';
import { authErrorMessage } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { subscribeToSessionChanges } from '@/lib/auth/session-events';
import { redirectAfterSessionLoss } from '@/lib/auth/logout';
import { weddingCountdown } from '@/lib/weddings';
import { initialWeddingOverview, weddingOverviewReducer } from '@/lib/wedding-overview-state';
import { WeddingSummary } from './wedding-summary';
import { WeddingForm } from './wedding-form';

export function WeddingOverview({
  weddingId,
  ready = false,
}: {
  weddingId: string;
  ready?: boolean;
}) {
  return <WeddingOverviewContent key={weddingId} weddingId={weddingId} ready={ready} />;
}

function WeddingOverviewContent({ weddingId, ready }: { weddingId: string; ready: boolean }) {
  const [{ wedding, error, unavailable, editing }, dispatch] = useReducer(
    weddingOverviewReducer,
    initialWeddingOverview,
  );
  const [attempt, setAttempt] = useState(0);
  const modal = useRef<HTMLDialogElement>(null);
  function retry() {
    dispatch({ type: 'retry' });
    setAttempt((n) => n + 1);
  }
  useEffect(() => subscribeToSessionChanges(() => setAttempt((n) => n + 1)), []);
  useEffect(() => {
    const controller = new AbortController();
    if (!/^[a-fA-F0-9]{24}$/.test(weddingId)) {
      queueMicrotask(() => {
        if (!controller.signal.aborted) {
          dispatch({
            type: 'failed',
            message: 'This wedding is unavailable or you do not have access.',
            accessRejected: true,
          });
        }
      });
      return () => controller.abort();
    }
    void getWedding(weddingId, controller.signal)
      .then((w) => {
        if (!controller.signal.aborted) {
          dispatch({ type: 'loaded', wedding: w });
        }
      })
      .catch(async (err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof ApiError && err.response.status === 401) {
          dispatch({
            type: 'failed',
            message: 'Your session has ended. Please sign in again.',
            accessRejected: true,
          });
          redirectAfterSessionLoss();
          return;
        }
        const missing =
          err instanceof ApiError && (err.response.status === 403 || err.response.status === 404);
        const detail = await authErrorMessage(
          err,
          'We could not load this wedding. Please try again.',
        );
        if (!controller.signal.aborted) {
          dispatch({ type: 'failed', message: detail.message, accessRejected: missing });
        }
      });
    return () => controller.abort();
  }, [weddingId, attempt]);
  useEffect(() => {
    if (editing) modal.current?.showModal();
  }, [editing]);
  const refreshWarning =
    error && wedding ? (
      <div className="wedding-alert" role="alert">
        <p>
          {editing
            ? 'We couldn’t refresh your wedding. Your unsaved changes are still here.'
            : 'We couldn’t refresh your wedding. Showing the previously loaded details.'}
        </p>
        <button type="button" className="wedding-text-button" onClick={retry}>
          Retry refresh
        </button>
      </div>
    ) : null;
  if (error && !wedding)
    return (
      <div className="wedding-container">
        <section className="wedding-card wedding-empty" role="alert">
          <h1>{unavailable ? 'Wedding unavailable' : 'Unable to load wedding'}</h1>
          <p>{error}</p>
          {!unavailable && (
            <button className="wedding-button" onClick={retry}>
              Retry
            </button>
          )}
          <Link href="/weddings" className="wedding-text-button">
            Back to My Weddings
          </Link>
        </section>
      </div>
    );
  if (!wedding)
    return (
      <div className="wedding-container">
        <p role="status" className="wedding-loading">
          Loading your wedding…
        </p>
      </div>
    );
  if (ready)
    return (
      <div className="wedding-container wedding-form-container">
        {refreshWarning}
        <section className="wedding-card wedding-ready">
          <span aria-hidden="true" className="wedding-heart">
            ♡
          </span>
          <h1>Your wedding space is ready</h1>
          <p>
            {wedding.role === 'WEDDING_ADMIN'
              ? 'You’re a Wedding Admin for this wedding.'
              : 'Your wedding details are saved.'}
          </p>
          <div className="wedding-review">
            <WeddingSummary wedding={wedding} />
            <p className="wedding-url">Reserved address: /w/{wedding.slug}</p>
            <span className="wedding-badge">Website not published</span>
          </div>
          <Link className="wedding-button" href={`/weddings/${wedding.id}`}>
            Open Wedding Workspace →
          </Link>
          <Link href="/weddings" className="wedding-text-button">
            Back to My Weddings
          </Link>
        </section>
      </div>
    );
  return (
    <div className="wedding-container">
      {!editing && refreshWarning}
      <div className="wedding-breadcrumb">
        <Link href="/weddings">← My Weddings / Switch wedding</Link>
        <span className="wedding-badge">
          {wedding.role === 'WEDDING_ADMIN' ? 'Wedding Admin' : 'Organizer'}
        </span>
      </div>
      <section className="wedding-card wedding-overview-heading">
        <div>
          <p className="wedding-eyebrow">One wedding. Both families.</p>
          <h1>{wedding.title}</h1>
          <p>
            {wedding.brideName} &amp; {wedding.groomName}
          </p>
        </div>
        <div className="wedding-countdown">
          <span aria-hidden="true">♡</span>
          <strong>{weddingCountdown(wedding.weddingDate, wedding.timezone)}</strong>
          {wedding.role === 'WEDDING_ADMIN' && (
            <button className="wedding-button" onClick={() => dispatch({ type: 'edit' })}>
              Edit Wedding Details
            </button>
          )}
        </div>
      </section>
      <section className="wedding-card wedding-details">
        <h2>Your wedding details</h2>
        <WeddingSummary wedding={wedding} />
        <div className="wedding-reserved">
          <div>
            <h3>Reserved website address</h3>
            <p className="wedding-url">/w/{wedding.slug}</p>
            <p className="wedding-help">Your website has not been published.</p>
          </div>
          <span className="wedding-badge">Not published</span>
        </div>
      </section>
      {editing && (
        <dialog
          ref={modal}
          className="wedding-dialog"
          aria-label="Edit Wedding Details"
          onCancel={() => dispatch({ type: 'close' })}
          onClose={() => dispatch({ type: 'close' })}
        >
          {refreshWarning}
          <WeddingForm
            initial={wedding}
            onCancel={() => {
              modal.current?.close();
              dispatch({ type: 'close' });
            }}
            onSaved={(updated) => {
              modal.current?.close();
              dispatch({ type: 'saved', wedding: updated });
            }}
          />
        </dialog>
      )}
    </div>
  );
}
