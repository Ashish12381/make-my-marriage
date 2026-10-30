import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth/server-session';
import { WeddingShell } from '@/components/weddings/wedding-shell';
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  if (!(await getServerUser())) redirect('/login');
  return <WeddingShell>{children}</WeddingShell>;
}
