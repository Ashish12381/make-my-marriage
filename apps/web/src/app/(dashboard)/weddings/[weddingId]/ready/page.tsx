import type { Metadata } from 'next';
import { WeddingOverview } from '@/components/weddings/wedding-overview';
export const metadata: Metadata = { title: 'Your Wedding Is Ready | Make My Marriage' };
export default async function WeddingReadyPage({
  params,
}: {
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = await params;
  return <WeddingOverview key={weddingId} weddingId={weddingId} ready />;
}
