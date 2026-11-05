import type { Metadata } from 'next';
import { AccountPanel } from '@/components/auth/account-panel';
import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth/server-session';
export const metadata: Metadata = {
  title: 'Your Account | Make My Marriage',
  robots: { index: false, follow: false },
};
export default async function AccountPage() {
  if (!(await getServerUser())) redirect('/login');
  return <AccountPanel />;
}
