'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  createTaskSchema,
  taskPrioritySchema,
  taskStatusSchema,
  type CreateTaskInput,
  type TeamMember,
  type WeddingTask,
} from '@make-my-marriage/contracts';
import { authErrorMessage } from '@/lib/api/auth';
import { saveTask } from '@/lib/api/tasks';
import { eventInstant } from '@/lib/events';
import { taskDateInput, taskPriorityLabels, taskStatusLabels } from '@/lib/tasks';

type ChecklistDraft = CreateTaskInput['checklist'][number] & { key: number };

export function TaskForm({
  weddingId,
  timezone,
  task: currentTask,
  events,
  members,
  onClose,
  onSaved,
  onAccessError,
}: {
  weddingId: string;
  timezone: string;
  task?: WeddingTask | undefined;
  events: { id: string; name: string }[] | null;
  members: TeamMember[] | null;
  onClose: () => void;
  onSaved: (task: WeddingTask) => void;
  onAccessError: (error: unknown) => boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [task] = useState(currentTask);
  const [assignees, setAssignees] = useState(task?.assigneeUserIds ?? []);
  const [checklist, setChecklist] = useState<ChecklistDraft[]>(
    task?.checklist.map((item, key) => ({ ...item, key })) ?? [],
  );
  const nextKey = useRef(checklist.length);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const [error, setError] = useState('');
  useEffect(() => dialog.current?.showModal(), []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const fields = new FormData(event.currentTarget);
    const field = (key: string) => String(fields.get(key) ?? '');
    submitting.current = true;
    setBusy(true);
    setError('');
    try {
      const date = field('dueAt');
      const unchangedDate = date === taskDateInput(task?.dueAt, timezone);
      const dueAt = unchangedDate
        ? (task?.dueAt ?? null)
        : date
          ? new Date(Date.parse(eventInstant(date + 'T23:59', timezone)) + 59_999).toISOString()
          : null;
      const input = createTaskSchema.safeParse({
        title: field('title'),
        description: field('description'),
        eventId: field('eventId') || null,
        dueAt,
        priority: field('priority'),
        status: field('status'),
        assigneeUserIds: assignees,
        checklist: checklist.map(({ id, text, completed }) => ({ id, text, completed })),
      });
      if (!input.success)
        throw new Error(input.error.issues[0]?.message ?? 'Review the task details.');
      const payload = task
        ? {
            ...input.data,
            ...(input.data.eventId === task.eventId ? { eventId: undefined } : {}),
            ...(JSON.stringify(assignees) === JSON.stringify(task.assigneeUserIds)
              ? { assigneeUserIds: undefined }
              : {}),
            expectedUpdatedAt: task.updatedAt,
          }
        : input.data;
      const saved = await saveTask(weddingId, payload, task?.id);
      if (dialog.current?.open) onSaved(saved);
    } catch (err) {
      if (dialog.current?.open && !onAccessError(err))
        setError(
          (
            await authErrorMessage(
              err,
              err instanceof Error && err.name !== 'ApiError'
                ? err.message
                : 'Could not save the task. Try again.',
            )
          ).message,
        );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="wedding-dialog task-dialog"
      aria-labelledby="task-form-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <form onSubmit={submit}>
        <header>
          <h2 id="task-form-title">{task ? 'Edit task' : 'Add task'}</h2>
        </header>
        <div className="task-form-scroll">
          <fieldset disabled={busy} className="task-form-grid">
            <div>
              <label>
                Task title
                <input name="title" defaultValue={task?.title} maxLength={120} required />
              </label>
              <label>
                Description <small>Optional</small>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue={task?.description}
                  maxLength={2000}
                />
              </label>
              <fieldset className="task-checklist">
                <legend>Checklist</legend>
                {checklist.map((item, index) => (
                  <div className="task-checklist-row" key={item.key}>
                    <input
                      type="checkbox"
                      checked={item.completed}
                      aria-label={`Complete checklist item ${index + 1}`}
                      onChange={(e) =>
                        setChecklist(
                          checklist.map((entry) =>
                            entry.key === item.key
                              ? { ...entry, completed: e.target.checked }
                              : entry,
                          ),
                        )
                      }
                    />
                    <input
                      required
                      maxLength={200}
                      aria-label={`Checklist item ${index + 1}`}
                      value={item.text}
                      onChange={(e) =>
                        setChecklist(
                          checklist.map((entry) =>
                            entry.key === item.key ? { ...entry, text: e.target.value } : entry,
                          ),
                        )
                      }
                    />
                    <button
                      type="button"
                      className="wedding-text-button"
                      onClick={() =>
                        setChecklist(checklist.filter((entry) => entry.key !== item.key))
                      }
                      aria-label={`Remove checklist item ${index + 1}`}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="wedding-text-button"
                  disabled={checklist.length >= 30}
                  onClick={() =>
                    setChecklist([
                      ...checklist,
                      { key: nextKey.current++, text: '', completed: false },
                    ])
                  }
                >
                  Add checklist item
                </button>
              </fieldset>
            </div>
            <div>
              <label>
                Linked event
                <select name="eventId" defaultValue={task?.eventId ?? ''}>
                  <option value="">Wedding-wide</option>
                  {task?.eventId && !events?.some(({ id }) => id === task.eventId) && (
                    <option value={task.eventId}>Current linked event</option>
                  )}
                  {events?.map(({ id, name }) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              {!events && <p>Event options are unavailable.</p>}
              <fieldset className="task-assignees">
                <legend>Assigned team members</legend>
                {members?.map((member) => (
                  <label key={member.userId}>
                    <input
                      type="checkbox"
                      checked={assignees.includes(member.userId)}
                      onChange={(e) =>
                        setAssignees(
                          e.target.checked
                            ? [...assignees, member.userId]
                            : assignees.filter((id) => id !== member.userId),
                        )
                      }
                    />
                    {member.displayName}
                  </label>
                ))}
                {!members && <p>Team members are unavailable.</p>}
                {members &&
                  assignees
                    .filter((id) => !members.some((member) => member.userId === id))
                    .map((id) => (
                      <label key={id}>
                        <input
                          type="checkbox"
                          checked
                          onChange={() => setAssignees(assignees.filter((value) => value !== id))}
                        />
                        Unavailable member
                      </label>
                    ))}
              </fieldset>
              <label>
                Due date <small>{timezone}</small>
                <input
                  name="dueAt"
                  type="date"
                  defaultValue={taskDateInput(task?.dueAt, timezone)}
                />
              </label>
              <label>
                Priority
                <select name="priority" defaultValue={task?.priority ?? 'MEDIUM'}>
                  {taskPrioritySchema.options.map((value) => (
                    <option key={value} value={value}>
                      {taskPriorityLabels[value]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Status
                <select name="status" defaultValue={task?.status ?? 'TODO'}>
                  {taskStatusSchema.options.map((value) => (
                    <option key={value} value={value}>
                      {taskStatusLabels[value]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </fieldset>
        </div>
        {error && (
          <p className="wedding-alert" role="alert">
            {error}
          </p>
        )}
        <footer className="task-actions">
          <button
            type="button"
            className="wedding-button wedding-button-secondary"
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="wedding-button" disabled={busy}>
            {busy ? 'Saving…' : task ? 'Save changes' : 'Create task'}
          </button>
        </footer>
      </form>
    </dialog>
  );
}
