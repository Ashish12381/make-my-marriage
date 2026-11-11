import type { Metadata } from 'next';
import { WeddingEvents } from '@/components/weddings/wedding-events';
export const metadata: Metadata = { title: 'Wedding Events | Make My Marriage' };
export default async function EventsPage({
  params,
  searchParams,
}: {
  params: Promise<{ weddingId: string }>;
  searchParams: Promise<{ add?: string }>;
}) {
  const [{ weddingId }, { add }] = await Promise.all([params, searchParams]);
  const openCreate = add === '1';
  return (
    <WeddingEvents
      key={weddingId + (openCreate ? '/add' : '')}
      weddingId={weddingId}
      openCreate={openCreate}
    />
  );
}
