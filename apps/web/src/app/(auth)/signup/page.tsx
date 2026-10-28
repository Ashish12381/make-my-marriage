import type { Metadata } from 'next';
import { AuthForm } from '@/components/auth/auth-form';
import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth/server-session';
export const metadata: Metadata = {
  title: 'Create Account | Make My Marriage',
  robots: { index: false, follow: false },
};
export default async function SignupPage() {
  if (await getServerUser()) redirect('/');
  return <AuthForm mode="signup" />;
}
