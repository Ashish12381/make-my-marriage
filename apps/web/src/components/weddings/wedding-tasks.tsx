'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import {
  taskListQuerySchema,
  type TaskListQuery,
  type TeamMember,
  type Wedding,
  type WeddingTask,
} from '@make-my-marriage/contracts';
import { eventInstant } from '@/lib/events';
import { authErrorMessage } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { getTask, listTaskEvents, listTasks, removeTask, saveTask } from '@/lib/api/tasks';
import { getTeam } from '@/lib/api/team';
import { getWedding } from '@/lib/api/weddings';
import { redirectAfterSessionLoss } from '@/lib/auth/logout';
import { subscribeToSessionChanges } from '@/lib/auth/session-events';
import {
  isOverdueTask,
  isPendingTask,
  taskDueDate,
  taskPriorityLabels,
  taskStatusLabels,
} from '@/lib/tasks';
import { TaskForm } from './task-form';
import { WorkspaceSidebar, type WorkspaceNavGroup } from './workspace-sidebar';

type TaskData = {
  wedding: Wedding;
  members: TeamMember[] | null;
  events: Awaited<ReturnType<typeof listTaskEvents>> | null;
} & Awaited<ReturnType<typeof listTasks>>;

function TaskStatus({ task }: { task: WeddingTask }) {
  return (
    <span className="wedding-badge task-status" data-status={task.status}>
      {taskStatusLabels[task.status]}
    </span>
  );
}

export function WeddingTasks({ weddingId, taskId }: { weddingId: string; taskId?: string }) {
  const router = useRouter();
  const base = '/weddings/' + weddingId;
  const href = base + '/tasks';
  const [data, setData] = useState<TaskData | null>(null);
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Omit<TaskListQuery, 'page'>>({});
  const [filterError, setFilterError] = useState('');
  const [form, setForm] = useState(false);
  const [confirmation, setConfirmation] = useState<'cancel' | 'remove' | null>(null);
  const confirmDialog = useRef<HTMLDialogElement>(null);
  const request = useRef<AbortController>(null);
  const revision = useRef(0);
  const writing = useRef(false);
  const [busy, setBusy] = useState(false);
  const reload = useCallback(() => setAttempt((value) => value + 1), []);
  const rejectAccess = useCallback((err: unknown) => {
    if (!(err instanceof ApiError) || ![401, 403, 404].includes(err.response.status)) return false;
    const { status } = err.response;
    request.current?.abort();
    revision.current++;
    setData(null);
    setForm(false);
    setConfirmation(null);
    setBlocked(true);
    setError(
      status === 403
        ? 'Ask a Wedding Admin for Tasks access.'
        : 'This wedding or task is unavailable.',
    );
    if (status === 401) redirectAfterSessionLoss();
    return true;
  }, []);
  useEffect(() => subscribeToSessionChanges(reload), [reload]);
  useEffect(() => {
    const controller = new AbortController();
    request.current = controller;
    const { signal } = controller;
    const optional = (err: unknown) => {
      if (err instanceof ApiError && [401, 403, 404].includes(err.response.status)) throw err;
      return null;
    };
    void (async () => {
      try {
        const [wedding, result, task, events, team] = await Promise.all([
          getWedding(weddingId, signal),
          listTasks(weddingId, page, signal, filters),
          taskId ? getTask(weddingId, taskId, signal) : undefined,
          listTaskEvents(weddingId, signal).catch(optional),
          getTeam(weddingId, signal).catch(optional),
        ]);
        if (signal.aborted) return;
        setData({
          wedding,
          ...result,
          tasks: task ? [task] : result.tasks,
          events,
          members: team?.members ?? null,
        });
        setError('');
        setBlocked(false);
      } catch (err) {
        if (signal.aborted || rejectAccess(err)) return;
        setError('Could not load tasks. Try again.');
      }
    })();
    return () => controller.abort();
  }, [attempt, filters, page, rejectAccess, taskId, weddingId]);

  useEffect(() => {
    if (confirmation) confirmDialog.current?.showModal();
  }, [confirmation]);

  const task = taskId ? data?.tasks[0] : undefined;
  async function changeTask(input: Parameters<typeof saveTask>[1] | 'remove') {
    if (!task || writing.current) return;
    const sessionRevision = revision.current;
    writing.current = true;
    setBusy(true);
    setError('');
    try {
      if (input === 'remove') {
        await removeTask(weddingId, task.id);
        if (sessionRevision === revision.current) router.replace(href);
      } else {
        const updated = await saveTask(
          weddingId,
          { ...input, expectedUpdatedAt: task.updatedAt },
          task.id,
        );
        if (sessionRevision !== revision.current) return;
        setData((current) => current && { ...current, tasks: [updated] });
        reload();
      }
      setConfirmation(null);
    } catch (err) {
      if (sessionRevision === revision.current && !rejectAccess(err)) {
        setConfirmation(null);
        setError((await authErrorMessage(err, 'Could not update the task. Try again.')).message);
      }
    } finally {
      writing.current = false;
      setBusy(false);
    }
  }

  if (!data)
    return (
      <div className="wedding-container">
        <section className="wedding-card wedding-empty">
          <h1>Tasks</h1>
          <p role={error ? 'alert' : 'status'}>{error || 'Loading tasks…'}</p>
          {error && !blocked && (
            <button className="wedding-button" onClick={reload}>
              Retry
            </button>
          )}
          <Link className="wedding-text-button" href="/weddings">
            Back to My Weddings
          </Link>
        </section>
      </div>
    );

  const { wedding, events, members, tasks, summary } = data;
  const matchingTotal = data.matchingTotal ?? summary.total;
  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const query = Object.fromEntries([...fields].filter(([, value]) => String(value).trim()));
    const day = String(query.dueDay ?? '');
    delete query.dueDay;
    try {
      const range = day
        ? {
            dueFrom: eventInstant(day + 'T00:00', wedding.timezone),
            dueTo: new Date(
              Date.parse(eventInstant(day + 'T23:59', wedding.timezone)) + 60_000,
            ).toISOString(),
          }
        : {};
      const result = taskListQuerySchema.safeParse({ ...query, ...range });
      if (!result.success) throw new Error('Check your task filters.');
      const { page: firstPage, ...nextFilters } = result.data;
      setPage(firstPage);
      setFilters(nextFilters);
      setFilterError('');
    } catch (err) {
      setFilterError(err instanceof Error ? err.message : 'Check your task filters.');
    }
  }
  const eventName = (entry: WeddingTask) =>
    entry.eventId
      ? (events?.find(({ id }) => id === entry.eventId)?.name ?? 'Linked event unavailable')
      : 'Wedding-wide';
  const assigneeNames = (entry: WeddingTask) =>
    entry.assigneeUserIds.length
      ? entry.assigneeUserIds
          .map(
            (id) =>
              members?.find((member) => member.userId === id)?.displayName ?? 'Unavailable member',
          )
          .join(', ')
      : 'Unassigned';
  const groups: WorkspaceNavGroup[] = [
    {
      label: 'Main',
      items: [
        { label: 'Overview', icon: 'home', href: base },
        { label: 'Events', icon: 'calendar', href: base + '/events' },
        { label: 'Tasks', icon: 'tasks', href },
      ],
    },
    {
      label: 'Management',
      items: [
        ...(wedding.role === 'WEDDING_ADMIN'
          ? [{ label: 'Expenses', icon: 'money' as const, href: base + '#dashboard-expenses' }]
          : []),
        { label: 'Vendors', icon: 'vendors' },
        { label: 'Guests', icon: 'people', href: base + '#dashboard-rsvp' },
        { label: 'Invitations', icon: 'mail', href: base + '#dashboard-rsvp' },
      ],
    },
    {
      label: 'Experience',
      items: [
        { label: 'Photo Gallery', icon: 'photo' },
        { label: 'Wedding Website', icon: 'globe', href: base + '#dashboard-website' },
      ],
    },
    {
      label: 'Collaboration',
      items: [{ label: 'Family & Organizers', icon: 'people', href: base + '/family' }],
    },
  ];
  const taskGroups = [
    { label: 'Overdue', tasks: tasks.filter(isOverdueTask) },
    {
      label: 'Open tasks',
      tasks: tasks.filter((entry) => isPendingTask(entry) && !isOverdueTask(entry)),
    },
    { label: 'Completed', tasks: tasks.filter((entry) => entry.status === 'COMPLETED') },
    { label: 'Cancelled', tasks: tasks.filter((entry) => entry.status === 'CANCELLED') },
  ];
  return (
    <div className="wedding-dashboard tasks-workspace">
      <WorkspaceSidebar groups={groups} active="Tasks" />
      <main className="wedding-dashboard-main task-main">
        <p className="task-breadcrumb">
          <Link href={base}>{wedding.title}</Link> / <Link href={href}>Tasks</Link>
        </p>
        {error && (
          <div className="wedding-alert" role="alert">
            {error}{' '}
            <button className="wedding-text-button" onClick={reload}>
              Refresh tasks
            </button>
          </div>
        )}
        {task ? (
          <>
            <header className="wedding-card task-header">
              <div>
                <p>{eventName(task)}</p>
                <h1>{task.title}</h1>
              </div>
              <div className="task-actions">
                {isPendingTask(task) && (
                  <button
                    className="wedding-button"
                    disabled={busy}
                    onClick={() => void changeTask({ status: 'COMPLETED' })}
                  >
                    Mark as complete
                  </button>
                )}
                <button
                  className="wedding-button wedding-button-secondary"
                  disabled={busy}
                  onClick={() => setForm(true)}
                >
                  Edit task
                </button>
                <details className="task-more">
                  <summary>More actions</summary>
                  {isPendingTask(task) && (
                    <button
                      className="wedding-text-button"
                      disabled={busy}
                      onClick={() => setConfirmation('cancel')}
                    >
                      Cancel task
                    </button>
                  )}
                  <button
                    className="wedding-text-button"
                    disabled={busy}
                    onClick={() => setConfirmation('remove')}
                  >
                    Remove task
                  </button>
                </details>
              </div>
            </header>
            <div className="task-detail-grid">
              <div>
                {task.description && (
                  <section className="wedding-card task-panel">
                    <h2>Description</h2>
                    <p className="task-description">{task.description}</p>
                  </section>
                )}
                <section className="wedding-card task-panel">
                  <h2>Checklist</h2>
                  {task.checklist.length ? (
                    <>
                      <p>
                        {task.checklist.filter(({ completed }) => completed).length} of{' '}
                        {task.checklist.length} complete
                      </p>
                      {task.checklist.map((item) => (
                        <label className="task-check" key={item.id}>
                          <input
                            type="checkbox"
                            checked={item.completed}
                            disabled={busy}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              void changeTask({
                                checklist: task.checklist.map((entry) =>
                                  entry.id === item.id ? { ...entry, completed: checked } : entry,
                                ),
                              });
                            }}
                          />
                          {item.text}
                        </label>
                      ))}
                    </>
                  ) : (
                    <p>No checklist items.</p>
                  )}
                </section>
              </div>
              <aside className="wedding-card task-panel">
                <h2>Task details</h2>
                <dl className="task-logistics">
                  <dt>Status</dt>
                  <dd>
                    <TaskStatus task={task} />
                  </dd>
                  <dt>Priority</dt>
                  <dd>{taskPriorityLabels[task.priority]}</dd>
                  <dt>Due date</dt>
                  <dd>
                    {taskDueDate(task.dueAt, wedding.timezone)}
                    {isOverdueTask(task) && <span className="task-overdue"> · Overdue</span>}
                  </dd>
                  <dt>Linked event</dt>
                  <dd>{eventName(task)}</dd>
                  <dt>Assignees</dt>
                  <dd>{assigneeNames(task)}</dd>
                </dl>
              </aside>
            </div>
          </>
        ) : (
          <>
            <header className="task-header">
              <div>
                <h1>Tasks</h1>
                <p>Manage assignments, checklists, and wedding deadlines.</p>
              </div>
              <button className="wedding-button" onClick={() => setForm(true)}>
                + Add task
              </button>
            </header>
            <dl className="task-metrics">
              {(
                [
                  ['Total tasks', summary.total],
                  ['In progress', summary.inProgress],
                  ['Overdue', summary.overdue],
                  ['Completed', summary.completed],
                ] as const
              ).map(([label, value]) => (
                <div className="wedding-card" key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <form
              className="wedding-card task-filters"
              onSubmit={applyFilters}
              onReset={() => {
                setFilters({});
                setPage(1);
                setFilterError('');
              }}
            >
              <label>
                Search tasks
                <input name="search" type="search" maxLength={120} />
              </label>
              <label>
                Event
                <select name="eventId">
                  <option value="">All events</option>
                  {events?.map(({ id, name }) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Assignee
                <select name="assigneeUserId">
                  <option value="">All assignees</option>
                  {members?.map(({ userId, displayName }) => (
                    <option key={userId} value={userId}>
                      {displayName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Status
                <select name="status">
                  <option value="">All statuses</option>
                  {Object.entries(taskStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Priority
                <select name="priority">
                  <option value="">All priorities</option>
                  {Object.entries(taskPriorityLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Due date
                <input type="date" name="dueDay" />
              </label>
              <div className="task-actions">
                <button className="wedding-button">Apply filters</button>
                <button type="reset" className="wedding-text-button">
                  Clear filters
                </button>
              </div>
              {filterError && <p role="alert">{filterError}</p>}
            </form>
            {tasks.length ? (
              <section className="wedding-card task-list" aria-label="Wedding tasks">
                <div className="task-list-head" aria-hidden="true">
                  <span>Task & linked event</span>
                  <span>Assignees</span>
                  <span>Due date</span>
                  <span>Priority</span>
                  <span>Checklist</span>
                  <span>Status</span>
                </div>
                {taskGroups
                  .filter((group) => group.tasks.length)
                  .map((group) => (
                    <section key={group.label}>
                      <h2>{group.label}</h2>
                      <ul>
                        {group.tasks.map((entry) => (
                          <li key={entry.id} className="task-list-row">
                            <div>
                              <Link href={href + '/' + entry.id}>{entry.title}</Link>
                              <p>{eventName(entry)}</p>
                            </div>
                            <span>
                              <small>Assignees </small>
                              {assigneeNames(entry)}
                            </span>
                            <span>
                              <small>Due date </small>
                              {taskDueDate(entry.dueAt, wedding.timezone)}
                              {isOverdueTask(entry) && (
                                <span className="task-overdue"> · Overdue</span>
                              )}
                            </span>
                            <span>
                              <small>Priority </small>
                              {taskPriorityLabels[entry.priority]}
                            </span>
                            <span>
                              <small>Checklist </small>
                              {entry.checklist.length
                                ? `${entry.checklist.filter(({ completed }) => completed).length}/${entry.checklist.length}`
                                : '—'}
                            </span>
                            <TaskStatus task={entry} />
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
              </section>
            ) : (
              <section className="wedding-card wedding-empty">
                <h2>
                  {summary.total
                    ? matchingTotal
                      ? 'No tasks on this page'
                      : 'No tasks match these filters'
                    : 'No tasks yet'}
                </h2>
                {!summary.total && (
                  <button className="wedding-button" onClick={() => setForm(true)}>
                    Add your first task
                  </button>
                )}
              </section>
            )}
            {matchingTotal > 25 || page > 1 ? (
              <nav className="task-pagination" aria-label="Task pages">
                <button
                  className="wedding-text-button"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <span>Page {page}</span>
                <button
                  className="wedding-text-button"
                  disabled={page * 25 >= matchingTotal}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </nav>
            ) : null}
          </>
        )}
        {form && (
          <TaskForm
            weddingId={weddingId}
            timezone={wedding.timezone}
            task={task}
            events={events}
            members={members}
            onAccessError={rejectAccess}
            onClose={() => {
              setForm(false);
              reload();
            }}
            onSaved={(saved) => {
              setForm(false);
              if (!taskId) router.push(href + '/' + saved.id);
              else {
                setData((current) => current && { ...current, tasks: [saved] });
                reload();
              }
            }}
          />
        )}
        {confirmation && (
          <dialog
            ref={confirmDialog}
            className="wedding-dialog task-confirm"
            aria-labelledby="task-confirm-title"
            onCancel={(event) => {
              event.preventDefault();
              if (!busy) setConfirmation(null);
            }}
          >
            <h2 id="task-confirm-title">
              {confirmation === 'remove' ? 'Remove this task?' : 'Cancel this task?'}
            </h2>
            <p>
              {confirmation === 'remove'
                ? 'The task will be removed from the wedding workspace.'
                : 'The task will stay visible with a Cancelled status.'}
            </p>
            <div className="task-actions">
              <button
                className="wedding-button wedding-button-secondary"
                disabled={busy}
                onClick={() => setConfirmation(null)}
              >
                Go back
              </button>
              <button
                className="wedding-button"
                disabled={busy}
                onClick={() =>
                  void changeTask(confirmation === 'remove' ? 'remove' : { status: 'CANCELLED' })
                }
              >
                {confirmation === 'remove' ? 'Remove task' : 'Cancel task'}
              </button>
            </div>
          </dialog>
        )}
      </main>
    </div>
  );
}
