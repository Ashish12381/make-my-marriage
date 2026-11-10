'use client';
import Link from 'next/link';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { TeamMember } from '@make-my-marriage/contracts';
import { getWedding } from '@/lib/api/weddings';
import { getTeam } from '@/lib/api/team';
import { authErrorMessage } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { subscribeToSessionChanges } from '@/lib/auth/session-events';
import { redirectAfterSessionLoss } from '@/lib/auth/logout';
import { initialWeddingOverview, weddingOverviewReducer } from '@/lib/wedding-overview-state';
import { WeddingSummary } from './wedding-summary';
import { WeddingForm } from './wedding-form';
import { WeddingDashboard } from './wedding-dashboard';

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
  const weddingRequest = useRef<AbortController>(null);
  const handleAccessRejection = useCallback((error: unknown) => {
    if (!(error instanceof ApiError)) return false;
    const { status } = error.response;
    if (status !== 401 && status !== 403 && status !== 404) return false;

    weddingRequest.current?.abort();
    dispatch({
      type: 'failed',
      message:
        status === 401
          ? 'Your session has ended. Please sign in again.'
          : 'This wedding is unavailable or you do not have access.',
      accessRejected: true,
    });
    if (status === 401) redirectAfterSessionLoss();
    return true;
  }, []);
  function retry() {
    dispatch({ type: 'retry' });
    setAttempt((n) => n + 1);
  }
  useEffect(() => subscribeToSessionChanges(() => setAttempt((n) => n + 1)), []);
  useEffect(() => {
    const controller = new AbortController();
    weddingRequest.current = controller;
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
        if (controller.signal.aborted || handleAccessRejection(err)) return;
        const detail = await authErrorMessage(
          err,
          'We could not load this wedding. Please try again.',
        );
        if (!controller.signal.aborted) {
          dispatch({ type: 'failed', message: detail.message, accessRejected: false });
        }
      });
    return () => controller.abort();
  }, [weddingId, attempt, handleAccessRejection]);
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
    <div className="wedding-dashboard-page">
      {!editing && refreshWarning}
      <WeddingDashboard
        wedding={wedding}
        editDetails={() => dispatch({ type: 'edit' })}
        team={
          <TeamSummary
            weddingId={wedding.id}
            attempt={attempt}
            retry={retry}
            handleAccessRejection={handleAccessRejection}
          />
        }
      />
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

function TeamSummary({
  weddingId,
  attempt,
  retry,
  handleAccessRejection,
}: {
  weddingId: string;
  attempt: number;
  retry: () => void;
  handleAccessRejection: (error: unknown) => boolean;
}) {
  const [members, setMembers] = useState<TeamMember[] | 'unavailable' | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    void getTeam(weddingId, controller.signal)
      .then(({ members }) => {
        if (!controller.signal.aborted) setMembers(members);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || handleAccessRejection(error)) return;
        setMembers('unavailable');
      });
    return () => controller.abort();
  }, [weddingId, attempt, handleAccessRejection]);

  if (members === 'unavailable') {
    return (
      <div role="status">
        <p>Team summary unavailable.</p>
        <button type="button" className="wedding-text-button" onClick={retry}>
          Retry team summary
        </button>
      </div>
    );
  }
  if (members === null) return <p role="status">Loading your team…</p>;
  return (
    <>
      <p>
        <strong>{members.length}</strong> {members.length === 1 ? 'member' : 'members'} on your
        planning team
      </p>
      <ul className="wedding-dashboard-list wedding-dashboard-roster">
        {members.slice(0, 4).map((member) => (
          <li key={member.id}>
            <span className="wedding-dashboard-avatar" aria-hidden="true">
              {Array.from(member.displayName.trim())[0]?.toUpperCase() || '?'}
            </span>
            <div>
              <strong>{member.displayName}</strong>
              <p>{member.role === 'WEDDING_ADMIN' ? 'Wedding Admin' : 'Organizer'}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
