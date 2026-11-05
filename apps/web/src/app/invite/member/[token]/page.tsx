import type { Metadata } from 'next';
import { MemberInvitation } from '@/components/memberships/member-invitation';
export const metadata: Metadata = {
  title: 'Team Invitation | Make My Marriage',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};
export default async function MemberInvitePage({ params }: { params: Promise<{ token: string }> }) {
  return <MemberInvitation token={(await params).token} />;
}
