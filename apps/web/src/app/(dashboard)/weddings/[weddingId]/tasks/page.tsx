import type { Metadata } from 'next';
import { WeddingTasks } from '@/components/weddings/wedding-tasks';

export const metadata: Metadata = { title: 'Tasks | Make My Marriage' };

export default async function TasksPage({ params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  return <WeddingTasks key={weddingId} weddingId={weddingId} />;
}
