import type { Metadata } from 'next';
import { FamilyTeam } from '@/components/memberships/family-team';
export const metadata: Metadata = { title: 'Family & Team | Make My Marriage' };
export default async function FamilyPage({ params }: { params: Promise<{ weddingId: string }> }) {
  return <FamilyTeam weddingId={(await params).weddingId} />;
}
