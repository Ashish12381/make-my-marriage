import type { Metadata } from 'next';
import { WeddingTasks } from '@/components/weddings/wedding-tasks';

export const metadata: Metadata = { title: 'Task Details | Make My Marriage' };

export default async function TaskPage({
  params,
}: {
  params: Promise<{ weddingId: string; taskId: string }>;
}) {
  const { weddingId, taskId } = await params;
  return <WeddingTasks key={weddingId + '/' + taskId} weddingId={weddingId} taskId={taskId} />;
}
