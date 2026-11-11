import type { Metadata } from 'next';
import { WeddingEvents } from '@/components/weddings/wedding-events';
export const metadata: Metadata = { title: 'Event Details | Make My Marriage' };
export default async function EventPage({
  params,
}: {
  params: Promise<{ weddingId: string; eventId: string }>;
}) {
  const { weddingId, eventId } = await params;
  return <WeddingEvents key={weddingId + '/' + eventId} weddingId={weddingId} eventId={eventId} />;
}
