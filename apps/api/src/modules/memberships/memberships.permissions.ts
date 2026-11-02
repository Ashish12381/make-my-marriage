import { organizerPermissionKeys, type OrganizerPermissions } from '@make-my-marriage/contracts';
export function publicPermissions(value: unknown): OrganizerPermissions {
  const flags =
    typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
  return Object.fromEntries(
    organizerPermissionKeys.map((key) => [key, flags[key] === true]),
  ) as OrganizerPermissions;
}
