import Link from 'next/link';
import type { AuthUser, MembershipInvitePreview } from '@make-my-marriage/contracts';

export function InvitationAccountStep({
  preview,
  user,
  next,
  busy,
  switching,
  onAccept,
  onSwitch,
}: {
  preview: MembershipInvitePreview;
  user: AuthUser | null;
  next: string;
  busy: boolean;
  switching: boolean;
  onAccept: () => void;
  onSwitch: () => void;
}) {
  const matches = user?.email.trim().toLowerCase() === preview.invitedEmail;
  const destination = preview.accountExists ? 'login' : 'signup';
  const action = preview.accountExists
    ? 'Sign in to accept invitation'
    : 'Create account to accept invitation';
  return (
    <div className="team-note">
      <p>
        Invitation for <strong>{preview.invitedEmail}</strong>
      </p>
      {matches ? (
        <>
          <p>You’re signed in with the invited email. Accept to join this wedding team.</p>
          <button type="button" className="wedding-button" disabled={busy} onClick={onAccept}>
            {busy ? 'Saving response…' : 'Accept invitation'}
          </button>
        </>
      ) : (
        <>
          <h3>{preview.accountExists ? 'Sign in to your account' : 'Create your account first'}</h3>
          <p>
            {preview.accountExists
              ? 'An account already exists for this email. Sign in with it, then return here to accept the invitation.'
              : 'There is no Make My Marriage account for this email yet. Create one using this email, then sign in and return here to accept the invitation.'}
          </p>
          {user ? (
            <>
              <p>
                A different account is open in this browser. Continue below to sign out of it and{' '}
                {preview.accountExists
                  ? 'sign in with the invited email'
                  : 'create the invited account'}
                . Your invitation will stay available.
              </p>
              <button type="button" className="wedding-button" disabled={busy} onClick={onSwitch}>
                {switching
                  ? 'Switching account…'
                  : preview.accountExists
                    ? 'Continue to sign in'
                    : 'Continue to create account'}
              </button>
            </>
          ) : (
            <Link href={`/${destination}?next=${next}`} className="wedding-button">
              {action}
            </Link>
          )}
        </>
      )}
    </div>
  );
}
