import type { Metadata } from 'next';
import { AuthForm } from '@/components/auth/auth-form';
import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth/server-session';
export const metadata: Metadata = {
  title: 'Sign In | Make My Marriage',
  robots: { index: false, follow: false },
};
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  if (await getServerUser()) redirect('/');
  const { registered } = await searchParams;
  return <AuthForm mode="login" accountCreated={registered === '1'} />;
}
