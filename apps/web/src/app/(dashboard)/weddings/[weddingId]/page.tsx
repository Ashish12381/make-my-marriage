import type { Metadata } from 'next';
import { WeddingOverview } from '@/components/weddings/wedding-overview';
export const metadata: Metadata = { title: 'Wedding Overview | Make My Marriage' };
export default async function WeddingPage({ params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  return <WeddingOverview key={weddingId} weddingId={weddingId} />;
}
