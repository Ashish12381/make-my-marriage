import type { Metadata } from 'next';
import { AuthForm } from '@/components/auth/auth-form';
import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth/server-session';
import { invitationReturnPath } from '@/lib/auth/return-path';
import { getInvitationEmail } from '@/lib/auth/invitation-email';
export const metadata: Metadata = {
  title: 'Sign In | Make My Marriage',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; next?: string }>;
}) {
  const { registered, next } = await searchParams;
  const returnTo = invitationReturnPath(next);
  if (await getServerUser()) redirect(returnTo);
  return (
    <AuthForm
      mode="login"
      accountCreated={registered === '1'}
      returnTo={returnTo}
      initialEmail={await getInvitationEmail(returnTo)}
    />
  );
}
