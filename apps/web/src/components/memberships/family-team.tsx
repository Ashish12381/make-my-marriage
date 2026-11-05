'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { MembershipInvite, Team, TeamMember, Wedding } from '@make-my-marriage/contracts';
import { getTeam, getTeamInvites, revokeTeamInvite } from '@/lib/api/team';
import { getWedding } from '@/lib/api/weddings';
import { authErrorMessage } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { subscribeToSessionChanges } from '@/lib/auth/session-events';
import { redirectAfterSessionLoss } from '@/lib/auth/logout';
import { TeamAccessDialog } from './team-access-dialog';
import { accessSummary, invitationEmailLabel } from './permissions';

export function FamilyTeam({ weddingId }: { weddingId: string }) {
  return <TeamContent key={weddingId} weddingId={weddingId} />;
}
function TeamContent({ weddingId }: { weddingId: string }) {
  const [data, setData] = useState<{
    wedding: Wedding;
    team: Team;
    invites: MembershipInvite[];
  } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [tab, setTab] = useState<'members' | 'invites'>('members');
  const [dialog, setDialog] = useState<TeamMember | 'invite' | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [revoking, setRevoking] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inviteButton = useRef<HTMLButtonElement>(null);
  function retry() {
    setAttempt((n) => n + 1);
  }
  function accessLost() {
    setDialog(null);
    setData(null);
    setError('Your access has changed. Reloading the team…');
    retry();
  }
  useEffect(() => subscribeToSessionChanges(() => setAttempt((n) => n + 1)), []);
  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const [wedding, team] = await Promise.all([
          getWedding(weddingId, controller.signal),
          getTeam(weddingId, controller.signal),
        ]);
        const invites =
          team.role === 'WEDDING_ADMIN' ? await getTeamInvites(weddingId, controller.signal) : [];
        if (controller.signal.aborted) return;
        setData({ wedding, team, invites });
        setError('');
        if (team.role !== 'WEDDING_ADMIN') {
          setDialog(null);
          setTab('members');
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        if (err instanceof ApiError && [401, 403, 404].includes(err.response.status)) {
          setData(null);
          setDialog(null);
          if (err.response.status === 401) {
            redirectAfterSessionLoss();
            return;
          }
        }
        const detail = await authErrorMessage(
          err,
          'We could not refresh the team. Previously loaded details and unsaved entries are still here.',
        );
        if (!controller.signal.aborted) setError(detail.message);
      }
    })();
    return () => controller.abort();
  }, [weddingId, attempt]);
  async function revoke(id: string) {
    if (busy) return;
    setBusy(true);
    try {
      await revokeTeamInvite(weddingId, id);
      setRevoking(null);
      setNotice('Invitation revoked.');
      retry();
    } catch (err) {
      if (err instanceof ApiError && [401, 403, 404].includes(err.response.status)) {
        accessLost();
        if (err.response.status === 401) redirectAfterSessionLoss();
      } else
        setError(
          (
            await authErrorMessage(
              err,
              'We could not revoke this invitation. Please check its current status.',
            )
          ).message,
        );
    } finally {
      setBusy(false);
    }
  }
  const warning = error ? (
    <div className="wedding-alert" role="alert">
      <p>{error}</p>
      <button className="wedding-text-button" type="button" onClick={retry}>
        Retry
      </button>
    </div>
  ) : null;
  if (!data)
    return (
      <div className="wedding-container">
        {warning ?? <p role="status">Loading your team…</p>}
        <Link href={`/weddings/${weddingId}`} className="wedding-text-button">
          Back to Wedding Overview
        </Link>
      </div>
    );
  const isAdmin = data.team.role === 'WEDDING_ADMIN';
  const admins = data.team.members.filter((member) => member.role === 'WEDDING_ADMIN').length;
  return (
    <div className="wedding-container team-page">
      <div className="wedding-breadcrumb">
        <Link href={`/weddings/${weddingId}`}>← Back to Wedding Overview</Link>
        <span>{data.wedding.title}</span>
      </div>
      <header className="team-heading">
        <div>
          <h1>Family &amp; Team</h1>
          <p>Bring your partner and trusted family members together to plan your wedding.</p>
        </div>
        {isAdmin && (
          <button ref={inviteButton} className="wedding-button" onClick={() => setDialog('invite')}>
            ＋ Invite Member
          </button>
        )}
      </header>
      <p className="team-note">
        Every wedding must have at least one Wedding Admin. Wedding Admins have equal management
        rights.
      </p>
      {!dialog && warning}
      {notice && (
        <div className="team-notice" role="status">
          {notice}
        </div>
      )}
      <div className="team-tabs" role="tablist" aria-label="Family and team">
        <button
          type="button"
          id="team-members-tab"
          role="tab"
          aria-selected={tab === 'members'}
          aria-controls="team-members"
          tabIndex={tab === 'members' ? 0 : -1}
          onKeyDown={(e) => {
            if (isAdmin && ['ArrowLeft', 'ArrowRight'].includes(e.key)) {
              setTab('invites');
              document.getElementById('team-invites-tab')?.focus();
            }
          }}
          onClick={() => setTab('members')}
        >
          Members <span>{data.team.members.length}</span>
        </button>
        {isAdmin && (
          <button
            type="button"
            id="team-invites-tab"
            role="tab"
            aria-selected={tab === 'invites'}
            aria-controls="team-invites"
            tabIndex={tab === 'invites' ? 0 : -1}
            onKeyDown={(e) => {
              if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
                setTab('members');
                document.getElementById('team-members-tab')?.focus();
              }
            }}
            onClick={() => setTab('invites')}
          >
            Invitations <span>{data.invites.length}</span>
          </button>
        )}
      </div>
      {tab === 'members' ? (
        <section
          id="team-members"
          role="tabpanel"
          aria-labelledby="team-members-tab"
          className="wedding-card team-list"
        >
          <div className="team-list-heading">
            <h2>Members</h2>
            <p>People helping plan your wedding.</p>
          </div>
          {data.team.members.map((member) => (
            <article key={member.id} className="team-row">
              <span className="team-avatar" aria-hidden="true">
                {member.displayName
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((name) => name[0])
                  .join('')}
              </span>
              <div className="team-person">
                <h3>
                  {member.displayName}{' '}
                  {member.userId === data.team.currentUserId && (
                    <span className="wedding-badge">You</span>
                  )}
                </h3>
                {member.email && <p>{member.email}</p>}
                <span className="wedding-badge">
                  {member.role === 'WEDDING_ADMIN' ? 'Wedding Admin' : 'Organizer'}
                </span>
              </div>
              <p className="team-access">{accessSummary(member.role, member.permissions)}</p>
              {isAdmin && (
                <button
                  className="wedding-button wedding-button-secondary"
                  onClick={() => setDialog(member)}
                >
                  Manage access<span className="sr-only"> for {member.displayName}</span>
                </button>
              )}
            </article>
          ))}
          {data.team.members.length === 1 && isAdmin && (
            <p className="team-note">
              You’re the first member. Invite your partner or trusted family members to start
              planning together.
            </p>
          )}
        </section>
      ) : (
        <section
          id="team-invites"
          role="tabpanel"
          aria-labelledby="team-invites-tab"
          className="wedding-card team-list"
        >
          <div className="team-list-heading">
            <h2>Invitations</h2>
            <p>Pending and past invitations to your planning team.</p>
            <p>
              Revoke a pending invitation here. To remove someone who has joined, open Members,
              choose Manage access, then Remove member. Past invitations stay in this history.
            </p>
          </div>
          {data.invites.length === 0 ? (
            <div className="wedding-empty">
              <h3>No invitations yet.</h3>
              <p>Invite someone you trust to help plan your wedding.</p>
              <button className="wedding-button" onClick={() => setDialog('invite')}>
                Invite Member
              </button>
            </div>
          ) : (
            data.invites.map((invite) => {
              const status = invite.status;
              return (
                <article className="team-row" key={invite.id}>
                  <div className="team-person">
                    <h3>{invite.email}</h3>
                    <p>{accessSummary(invite.role, invite.permissions)}</p>
                    <p>{invitationEmailLabel(invite.emailStatus)}</p>
                    <p>
                      Expires{' '}
                      {new Intl.DateTimeFormat('en-GB', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(new Date(invite.expiresAt))}
                    </p>
                  </div>
                  <span className="wedding-badge">
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </span>
                  {status === 'PENDING' &&
                    (revoking === invite.id ? (
                      <div>
                        <p>Revoke this invitation? Its link will stop working.</p>
                        <button
                          type="button"
                          className="team-danger"
                          disabled={busy}
                          onClick={() => void revoke(invite.id)}
                        >
                          Confirm revoke
                        </button>
                        <button
                          type="button"
                          className="wedding-text-button"
                          disabled={busy}
                          onClick={() => setRevoking(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="wedding-text-button"
                        onClick={() => setRevoking(invite.id)}
                      >
                        Revoke invitation<span className="sr-only"> for {invite.email}</span>
                      </button>
                    ))}
                </article>
              );
            })
          )}
        </section>
      )}
      {dialog && isAdmin && (
        <>
          {warning && (
            <div className="sr-only" role="status">
              Team refresh failed. Your current dialog entries are preserved.
            </div>
          )}
          <TeamAccessDialog
            weddingId={weddingId}
            refreshError={error}
            onRetryRefresh={retry}
            {...(dialog !== 'invite'
              ? { member: dialog, lastAdmin: dialog.role === 'WEDDING_ADMIN' && admins === 1 }
              : {})}
            onClose={() => {
              setDialog(null);
              inviteButton.current?.focus();
            }}
            onAccessLost={accessLost}
            onSaved={(message) => {
              setDialog(null);
              setNotice(message);
              setTab(dialog === 'invite' ? 'invites' : 'members');
              retry();
              inviteButton.current?.focus();
            }}
          />
        </>
      )}
    </div>
  );
}
