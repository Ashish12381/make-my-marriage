'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  createMembershipInviteSchema,
  memberAccessSchema,
  organizerPermissionKeys,
  organizerPermissionsSchema,
  type TeamMember,
  type WeddingRole,
} from '@make-my-marriage/contracts';
import { changeMemberAccess, inviteMember, removeTeamMember } from '@/lib/api/team';
import { authErrorMessage } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { redirectAfterSessionLoss } from '@/lib/auth/logout';
import { permissionLabels } from './permissions';

export function TeamAccessDialog({
  weddingId,
  member,
  lastAdmin = false,
  onClose,
  onSaved,
  onAccessLost,
  refreshError = '',
  onRetryRefresh,
}: {
  weddingId: string;
  member?: TeamMember;
  lastAdmin?: boolean;
  onClose: () => void;
  onSaved: (message: string) => void;
  onAccessLost: () => void;
  refreshError?: string;
  onRetryRefresh: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<WeddingRole>(member?.role ?? 'ORGANIZER');
  const [permissions, setPermissions] = useState(
    () => member?.permissions ?? organizerPermissionsSchema.parse({}),
  );
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState(false);
  const alert = useRef<HTMLDivElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  async function failure(error: unknown) {
    if (error instanceof ApiError && error.response.status === 401) {
      onAccessLost();
      redirectAfterSessionLoss();
      return;
    }
    if (error instanceof ApiError && [403, 404].includes(error.response.status)) {
      onAccessLost();
      return;
    }
    const detail = await authErrorMessage(
      error,
      'We could not confirm this change. Your entries are still here. Check Invitations before submitting another invitation.',
    );
    setMessage(detail.message);
    setBusy(false);
    requestAnimationFrame(() => alert.current?.focus());
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const access = { role, permissions };
    const parsed = member
      ? memberAccessSchema.safeParse(access)
      : createMembershipInviteSchema.safeParse({ ...access, email });
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? 'Check your entries.');
      requestAnimationFrame(() => alert.current?.focus());
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      if (member) {
        await changeMemberAccess(weddingId, member.id, memberAccessSchema.parse(access));
        onSaved('Member access updated.');
      } else {
        const result = await inviteMember(
          weddingId,
          createMembershipInviteSchema.parse({ ...access, email }),
        );
        onSaved(
          result.emailStatus === 'SENT'
            ? 'Invitation created. The email was accepted for sending; inbox delivery is not guaranteed.'
            : result.emailStatus === 'FAILED'
              ? 'The invitation was created, but we couldn’t send the email. You can find it in Invitations.'
              : 'The invitation was created, but email delivery could not be confirmed. Check Invitations before taking further action.',
        );
      }
    } catch (error) {
      await failure(error);
    }
  }
  async function remove() {
    if (!member || busy) return;
    setBusy(true);
    setMessage('');
    try {
      await removeTeamMember(weddingId, member.id);
      onSaved('Member access removed.');
    } catch (error) {
      await failure(error);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="team-dialog"
      aria-labelledby="team-dialog-title"
      onClose={onClose}
      onCancel={(event) => {
        if (busy) event.preventDefault();
      }}
    >
      <form onSubmit={submit} noValidate aria-busy={busy}>
        <header className="team-dialog-header">
          <div>
            <p className="wedding-eyebrow">Team member access</p>
            <h2 id="team-dialog-title">{member ? 'Manage access' : 'Invite someone to help'}</h2>
            <p>
              {member
                ? member.displayName
                : 'Give your partner or family member access to this wedding.'}
            </p>
          </div>
          <button
            type="button"
            className="team-close"
            aria-label="Close dialog"
            disabled={busy}
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
        </header>
        <div className="team-dialog-body">
          {refreshError && (
            <div className="wedding-alert" role="alert">
              <p>We couldn’t refresh the team. Your unsaved entries are still here.</p>
              <button type="button" className="wedding-text-button" onClick={onRetryRefresh}>
                Retry refresh
              </button>
            </div>
          )}
          {message && (
            <div className="wedding-alert" role="alert" ref={alert} tabIndex={-1}>
              {message}
            </div>
          )}
          {lastAdmin && (
            <p className="team-note">
              This is the last active Wedding Admin. Add another Admin before removing or demoting
              this member.
            </p>
          )}
          {!member && (
            <div className="wedding-field">
              <label htmlFor="team-email">Email address *</label>
              <input
                id="team-email"
                name="email"
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                required
                autoFocus
                maxLength={254}
                disabled={busy}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>
          )}
          <fieldset disabled={busy} className="team-role-field">
            <legend>Select role</legend>
            <div className="team-role-options">
              <label className={role === 'ORGANIZER' ? 'selected' : ''}>
                <input
                  type="radio"
                  name="team-role"
                  checked={role === 'ORGANIZER'}
                  disabled={lastAdmin}
                  onChange={() => setRole('ORGANIZER')}
                />
                <strong>Organizer</strong>
                <span>Access only to the planning areas you select.</span>
              </label>
              <label className={role === 'WEDDING_ADMIN' ? 'selected' : ''}>
                <input
                  type="radio"
                  name="team-role"
                  checked={role === 'WEDDING_ADMIN'}
                  onChange={() => setRole('WEDDING_ADMIN')}
                />
                <strong>Wedding Admin</strong>
                <span>Full access to this wedding and its team.</span>
              </label>
            </div>
          </fieldset>
          {!member && (
            <p className="wedding-help">
              They’ll need to sign in or create an account before accepting. Invitations expire in
              seven days.
            </p>
          )}
          {role === 'ORGANIZER' ? (
            <fieldset disabled={busy} className="team-permission-field">
              <legend>Select the areas this person can access</legend>
              <p className="wedding-help">
                Select at least one area. Wedding Admins can adjust access later.
              </p>
              <div className="team-permission-tools">
                <button
                  type="button"
                  className="wedding-text-button"
                  onClick={() =>
                    setPermissions(
                      organizerPermissionsSchema.parse(
                        Object.fromEntries(organizerPermissionKeys.map((key) => [key, true])),
                      ),
                    )
                  }
                >
                  Select All
                </button>
                <button
                  type="button"
                  className="wedding-text-button"
                  onClick={() => setPermissions(organizerPermissionsSchema.parse({}))}
                >
                  Clear
                </button>
              </div>
              <div className="team-permissions">
                {organizerPermissionKeys.map((key) => (
                  <label key={key}>
                    <input
                      type="checkbox"
                      checked={permissions[key]}
                      onChange={(e) =>
                        setPermissions((previous) => ({ ...previous, [key]: e.target.checked }))
                      }
                    />
                    {permissionLabels[key]}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : (
            <p className="team-note">
              <strong>Full wedding access.</strong> Wedding Admins can manage this wedding, its
              team, and all planning areas.
            </p>
          )}
          {member && !lastAdmin && (
            <div className="team-remove">
              {removing ? (
                <>
                  <p>
                    Remove {member.displayName} from this wedding? They will lose access. A new
                    invitation is required to rejoin.
                  </p>
                  <button
                    type="button"
                    className="team-danger"
                    disabled={busy}
                    onClick={() => void remove()}
                  >
                    Confirm removal
                  </button>
                  <button
                    type="button"
                    className="wedding-text-button"
                    disabled={busy}
                    onClick={() => setRemoving(false)}
                  >
                    Keep member
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="team-danger"
                  disabled={busy}
                  onClick={() => setRemoving(true)}
                >
                  Remove member
                </button>
              )}
            </div>
          )}
        </div>
        <footer className="team-dialog-actions">
          <button
            type="button"
            className="wedding-button wedding-button-secondary"
            disabled={busy}
            onClick={() => dialog.current?.close()}
          >
            Cancel
          </button>
          <button type="submit" className="wedding-button" disabled={busy || removing}>
            {busy ? 'Saving…' : member ? 'Save access' : 'Send Invitation'}
          </button>
        </footer>
      </form>
    </dialog>
  );
}
