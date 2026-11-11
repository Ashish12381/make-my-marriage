import type { WeddingTask } from '@make-my-marriage/contracts';
import { localEventTime } from './events';

export const taskStatusLabels = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};
export const taskPriorityLabels = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' };

export function isPendingTask(task: WeddingTask) {
  return task.status === 'TODO' || task.status === 'IN_PROGRESS';
}
export function isOverdueTask(task: WeddingTask) {
  return isPendingTask(task) && Boolean(task.dueAt && Date.parse(task.dueAt) < Date.now());
}
export function taskDueDate(dueAt: string | null | undefined, timezone: string) {
  if (!dueAt) return 'No due date';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: timezone,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dueAt));
}
export function taskDateInput(dueAt: string | null | undefined, timezone: string) {
  return dueAt ? localEventTime(dueAt, timezone).slice(0, 10) : '';
}
