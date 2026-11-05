import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { organizerPermissionsSchema, type TeamMember } from '@make-my-marriage/contracts';
import { TeamAccessDialog } from '../src/components/memberships/team-access-dialog';
import { InvitationAccountStep } from '../src/components/memberships/invitation-account-step';
import { invitationReturnPath } from '../src/lib/auth/return-path';
import { accessSummary, invitationEmailLabel } from '../src/components/memberships/permissions';
const props = {
  weddingId: 'a'.repeat(24),
  onClose: vi.fn(),
  onSaved: vi.fn(),
  onAccessLost: vi.fn(),
  onRetryRefresh: vi.fn(),
};
describe('Family and Team interface', () => {
  const invitationProps = {
    preview: {
      invitedEmail: 'parent@example.com',
      accountExists: false,
      weddingId: 'a'.repeat(24),
      title: 'A & B',
      role: 'WEDDING_ADMIN' as const,
      permissions: organizerPermissionsSchema.parse({}),
      expiresAt: '2027-01-01T00:00:00.000Z',
    },
    user: null,
    next: encodeURIComponent(`/invite/member/${'x'.repeat(43)}`),
    busy: false,
    switching: false,
    onAccept: vi.fn(),
    onSwitch: vi.fn(),
  };
  it('directs a new invited recipient to signup with invitation continuation', () => {
    const html = renderToStaticMarkup(<InvitationAccountStep {...invitationProps} />);
    expect(html).toContain('Create your account first');
    expect(html).toContain(`/signup?next=${invitationProps.next}`);
    expect(html).not.toContain('/login?');
  });
  it('directs an existing invited recipient to login', () => {
    const html = renderToStaticMarkup(
      <InvitationAccountStep
        {...invitationProps}
        preview={{ ...invitationProps.preview, accountExists: true }}
      />,
    );
    expect(html).toContain('Sign in to your account');
    expect(html).toContain(`/login?next=${invitationProps.next}`);
    expect(html).not.toContain('/signup?');
  });
  it.each([false, true])(
    'blocks accepting under a different browser account, registered=%s',
    (accountExists) => {
      const html = renderToStaticMarkup(
        <InvitationAccountStep
          {...invitationProps}
          preview={{ ...invitationProps.preview, accountExists }}
          user={{ id: 'qa', displayName: 'QA', email: 'qa@example.com' }}
        />,
      );
      expect(html).toContain('A different account is open');
      expect(html).toContain(accountExists ? 'Continue to sign in' : 'Continue to create account');
      expect(html).not.toContain('Accept invitation');
      expect(html).not.toContain('qa@example.com');
    },
  );
  it('offers acceptance only when signed in with the invited email, ignoring email case', () => {
    const html = renderToStaticMarkup(
      <InvitationAccountStep
        {...invitationProps}
        user={{ id: 'parent', displayName: 'Parent', email: 'Parent@Example.com' }}
      />,
    );
    expect(html).toContain('Accept invitation');
    expect(html).not.toContain('Create your account first');
  });
  it('distinguishes invitation state from provider send acceptance and failure', () => {
    expect(invitationEmailLabel('FAILED')).toBe('Email could not be sent');
    expect(invitationEmailLabel('SENT')).toBe('Email accepted for sending');
    expect(invitationEmailLabel('UNKNOWN')).toBe('Email sending could not be confirmed');
    expect(invitationEmailLabel('PENDING')).toBe('Email submission pending');
  });
  it('renders the approved email field and nine explicitly unchecked permissions', () => {
    const html = renderToStaticMarkup(<TeamAccessDialog {...props} />);
    expect(html).toContain('id="team-email"');
    expect(html.match(/type="checkbox"/g)).toHaveLength(9);
    expect(html.match(/checked=""/g)).toHaveLength(1); // Organizer radio only.
    expect(html).toContain('Expenses &amp; Payments');
    expect(html).not.toContain('Budget');
    expect(html).not.toContain('Simulation');
  });
  it('protects the last Admin in management UI and shows full access', () => {
    const member: TeamMember = {
      id: 'b'.repeat(24),
      userId: 'c'.repeat(24),
      displayName: 'Parent',
      role: 'WEDDING_ADMIN',
    };
    const html = renderToStaticMarkup(<TeamAccessDialog {...props} member={member} lastAdmin />);
    expect(html).toContain('last active Wedding Admin');
    expect(html).not.toContain('Remove member');
    expect(html).not.toContain('type="checkbox"');
    expect(html).toContain('Full wedding access');
  });
  it('keeps an inline retry warning with the existing invite form after a background error', () => {
    const html = renderToStaticMarkup(
      <TeamAccessDialog {...props} refreshError="Network unavailable" />,
    );
    expect(html).toContain('Your unsaved entries are still here');
    expect(html).toContain('Retry refresh');
    expect(html).toContain('id="team-email"');
  });
  it('offers removal for a member when another Admin can retain wedding access', () => {
    const member: TeamMember = {
      id: 'b'.repeat(24),
      userId: 'c'.repeat(24),
      displayName: 'Parent',
      role: 'WEDDING_ADMIN',
    };
    const html = renderToStaticMarkup(<TeamAccessDialog {...props} member={member} />);
    expect(html).toContain('Remove member');
  });
  it('summarizes Organizer permissions without suggesting guest headcounts or budgets', () => {
    expect(
      accessSummary('ORGANIZER', organizerPermissionsSchema.parse({ events: true, tasks: true })),
    ).toBe('Events, Tasks');
    expect(accessSummary('WEDDING_ADMIN')).toBe('Full wedding access');
  });
  it('preserves only validated invitation continuation paths through authentication', () => {
    const path = `/invite/member/${'x'.repeat(43)}`;
    expect(invitationReturnPath(path)).toBe(path);
    for (const invalid of [
      'https://evil.example',
      '//evil.example',
      '/weddings',
      `${path}?redirect=evil`,
      '/invite/member/short',
    ])
      expect(invitationReturnPath(invalid)).toBe('/');
  });
});
