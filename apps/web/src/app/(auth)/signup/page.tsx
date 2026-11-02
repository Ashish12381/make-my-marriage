import type { Metadata } from 'next';
import { AuthForm } from '@/components/auth/auth-form';
import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth/server-session';
import { invitationReturnPath } from '@/lib/auth/return-path';
import { getInvitationEmail } from '@/lib/auth/invitation-email';
export const metadata: Metadata = {
  title: 'Create Account | Make My Marriage',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};
export default async function SignupPage({
  searchParams,
}: { searchParams?: Promise<{ next?: string }> } = {}) {
  const returnTo = invitationReturnPath((await searchParams)?.next);
  if (await getServerUser()) redirect(returnTo);
  return (
    <AuthForm mode="signup" returnTo={returnTo} initialEmail={await getInvitationEmail(returnTo)} />
  );
}
