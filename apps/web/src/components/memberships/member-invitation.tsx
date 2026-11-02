'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { AuthUser, MembershipInvitePreview } from '@make-my-marriage/contracts';
import { membershipInviteTokenSchema, apiErrorSchema } from '@make-my-marriage/contracts';
import { acceptTeamInvite, declineTeamInvite, previewTeamInvite } from '@/lib/api/team';
import { authErrorMessage, signOut } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { watchCurrentUser } from '@/lib/auth/watch-current-user';
import { accessSummary } from './permissions';
import { InvitationAccountStep } from './invitation-account-step';

export function MemberInvitation({ token }: { token: string }) {
  const [preview, setPreview] = useState<MembershipInvitePreview | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [sessionError, setSessionError] = useState('');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [result, setResult] = useState<'ACCEPTED' | 'DECLINED' | null>(null);
  useEffect(
    () =>
      watchCurrentUser({
        onUser: (value) => {
          setUser(value);
          setChecking(false);
          setSessionError('');
        },
        onError: (err) => {
          setUser(null);
          setChecking(false);
          setSessionError(
            err instanceof ApiError && err.response.status === 401
              ? ''
              : 'We could not check your account. Retry before accepting.',
          );
        },
      }),
    [attempt],
  );
  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      if (!membershipInviteTokenSchema.safeParse(token).success) {
        if (!controller.signal.aborted)
          setError('This invitation link is invalid. Ask a Wedding Admin for a new invitation.');
        return;
      }
      try {
        const value = await previewTeamInvite(token, controller.signal);
        if (!controller.signal.aborted) {
          setPreview(value);
          setError('');
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        const detail = await authErrorMessage(
          err,
          'We could not load this invitation. Please try again.',
        );
        if (!controller.signal.aborted) {
          setPreview(null);
          setError(detail.message);
        }
      }
    })();
    return () => controller.abort();
  }, [token, attempt]);
  async function respond(accept: boolean) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      if (accept) await acceptTeamInvite(token);
      else await declineTeamInvite(token);
      setResult(accept ? 'ACCEPTED' : 'DECLINED');
    } catch (err) {
      if (err instanceof ApiError && err.response.status === 401) {
        setUser(null);
        setError('Please sign in before accepting.');
      } else {
        const failure =
          err instanceof ApiError
            ? apiErrorSchema.safeParse(
                await err.response
                  .clone()
                  .json()
                  .catch(() => null),
              )
            : null;
        const alreadyMember = failure?.success && failure.data.error.code === 'ALREADY_A_MEMBER';
        const detail = await authErrorMessage(
          err,
          'We could not confirm your response. Check My Weddings before trying again.',
        );
        setError(detail.message);
        if (err instanceof ApiError && [409, 410].includes(err.response.status) && !alreadyMember)
          setPreview(null);
      }
    } finally {
      setBusy(false);
    }
  }
  const next = encodeURIComponent(`/invite/member/${token}`);
  async function switchAccount() {
    if (busy) return;
    setBusy(true);
    setSwitching(true);
    setError('');
    try {
      await signOut();
      window.location.replace(`/${preview?.accountExists ? 'login' : 'signup'}?next=${next}`);
    } catch (err) {
      setError(
        (await authErrorMessage(err, 'We could not switch accounts. Please try again.')).message,
      );
    } finally {
      setBusy(false);
      setSwitching(false);
    }
  }
  return (
    <div className="wedding-app">
      <main className="wedding-content">
        <section className="wedding-card team-invitation">
          <Link href="/" className="wedding-brand">
            ♡ Make My Marriage
          </Link>
          <h1>
            {result === 'ACCEPTED'
              ? 'You’ve joined the wedding team'
              : result === 'DECLINED'
                ? 'Invitation declined'
                : 'You’re invited to help'}
          </h1>
          {error && (
            <div className="wedding-alert" role="alert">
              {error}
            </div>
          )}
          {sessionError && (
            <div className="wedding-alert" role="alert">
              {sessionError}
            </div>
          )}
          {result ? (
            <>
              <p>
                {result === 'ACCEPTED'
                  ? 'The wedding is now available in My Weddings.'
                  : 'Your response has been saved.'}
              </p>
              {result === 'ACCEPTED' && preview && (
                <Link href={`/weddings/${preview.weddingId}`} className="wedding-button">
                  Open Wedding Workspace
                </Link>
              )}
              <Link href={user ? '/weddings' : '/'} className="wedding-text-button">
                {user ? 'My Weddings' : 'Back to Home'}
              </Link>
            </>
          ) : preview ? (
            <>
              <h2>{preview.title}</h2>
              <p>
                You’ve been invited as{' '}
                {preview.role === 'WEDDING_ADMIN' ? 'a Wedding Admin' : 'an Organizer'}.
              </p>
              <p className="team-note">{accessSummary(preview.role, preview.permissions)}</p>
              <p className="wedding-help">
                Expires{' '}
                {new Intl.DateTimeFormat('en-GB', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(preview.expiresAt))}
                . This private link grants access; do not forward it.
              </p>
              {checking ? (
                <p role="status">Checking the invitation account…</p>
              ) : !sessionError ? (
                <InvitationAccountStep
                  preview={preview}
                  user={user}
                  next={next}
                  busy={busy}
                  switching={switching}
                  onAccept={() => void respond(true)}
                  onSwitch={() => void switchAccount()}
                />
              ) : null}
              {declining ? (
                <div className="team-note">
                  <p>Decline this invitation? This link cannot be used afterward.</p>
                  <button
                    type="button"
                    className="team-danger"
                    disabled={busy}
                    onClick={() => void respond(false)}
                  >
                    Confirm decline
                  </button>
                  <button
                    type="button"
                    className="wedding-text-button"
                    disabled={busy}
                    onClick={() => setDeclining(false)}
                  >
                    Keep invitation
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="wedding-text-button"
                  disabled={busy}
                  onClick={() => setDeclining(true)}
                >
                  Decline invitation
                </button>
              )}
            </>
          ) : (
            !error && <p role="status">Loading invitation…</p>
          )}
          {!result && (error || sessionError) && (
            <>
              <button
                type="button"
                className="wedding-button wedding-button-secondary"
                disabled={busy}
                onClick={() => setAttempt((n) => n + 1)}
              >
                Retry
              </button>
              <Link href="/weddings" className="wedding-text-button">
                Check My Weddings
              </Link>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
