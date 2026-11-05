// Only the approved membership-invitation continuation is supported; never redirect to arbitrary URLs.
export function invitationReturnPath(value?: string): string {
  return value && /^\/invite\/member\/[A-Za-z0-9_-]{43}$/.test(value) ? value : '/';
}
