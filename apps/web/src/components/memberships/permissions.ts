import { organizerPermissionKeys, type OrganizerPermissions } from '@make-my-marriage/contracts';
import type { MembershipInvite } from '@make-my-marriage/contracts';
export function invitationEmailLabel(status: MembershipInvite['emailStatus']) {
  switch (status) {
    case 'SENT':
      return 'Email accepted for sending';
    case 'FAILED':
      return 'Email could not be sent';
    case 'PENDING':
    case 'SENDING':
      return 'Email submission pending';
    default:
      return 'Email sending could not be confirmed';
  }
}
export const permissionLabels: Record<(typeof organizerPermissionKeys)[number], string> = {
  events: 'Events',
  tasks: 'Tasks',
  expenses: 'Expenses & Payments',
  vendors: 'Vendors',
  guests: 'Guests & RSVP',
  invitations: 'Invitations & Email',
  gallery: 'Gallery',
  website: 'Wedding Website',
  livestream: 'Livestream Links',
};
export function accessSummary(role: string, permissions?: OrganizerPermissions) {
  if (role === 'WEDDING_ADMIN') return 'Full wedding access';
  return permissions
    ? organizerPermissionKeys
        .filter((key) => permissions[key])
        .map((key) => permissionLabels[key])
        .join(', ') || 'No planning areas enabled'
    : 'Organizer';
}
