'use client';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { TaskSummary, Wedding, WeddingEvent } from '@make-my-marriage/contracts';
import { eventSchedule, isUpcomingEvent } from '@/lib/events';
import { formatWeddingDate, weddingCountdown } from '@/lib/weddings';
import { isOverdueTask, taskDueDate, taskPriorityLabels } from '@/lib/tasks';
import {
  DashboardIcon,
  WorkspaceSidebar,
  type IconName,
  type WorkspaceNavGroup,
} from './workspace-sidebar';
import { sampleEvents, sampleExpenses, sampleTasks } from './dashboard-samples';

function DashboardPanel({
  id,
  title,
  description,
  icon,
  action,
  children,
}: {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="wedding-card wedding-dashboard-panel">
      <div className="wedding-dashboard-panel-heading">
        <span className="wedding-dashboard-panel-icon">
          <DashboardIcon name={icon} />
        </span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function WeddingDashboard({
  wedding,
  editDetails,
  team,
  preview = false,
  events = null,
  tasks = null,
}: {
  wedding: Wedding;
  editDetails?: () => void;
  team: ReactNode;
  preview?: boolean;
  events?: WeddingEvent[] | 'restricted' | 'unavailable' | null;
  tasks?: TaskSummary | 'restricted' | 'unavailable' | null;
}) {
  const sample = preview || process.env.NODE_ENV === 'development';
  const admin = wedding.role === 'WEDDING_ADMIN';
  const canEdit = admin && editDetails;
  const overview = '/weddings/' + wedding.id;
  const eventsHref = preview ? '#dashboard-events' : overview + '/events';
  const tasksHref = preview ? '#dashboard-tasks' : overview + '/tasks';
  const taskSummary = typeof tasks === 'object' ? tasks : null;
  const taskCount = preview ? '12' : taskSummary ? String(taskSummary.pending) : '—';
  const upcoming = Array.isArray(events) ? events.filter((event) => isUpcomingEvent(event)) : [];
  const nextEvent = upcoming[0];
  const initials = [wedding.groomName, wedding.brideName]
    .map((name) => Array.from(name.trim())[0])
    .filter(Boolean)
    .join('&')
    .toUpperCase();
  const countdown = weddingCountdown(wedding.weddingDate, wedding.timezone);
  const groups: WorkspaceNavGroup[] = [
    {
      label: 'Main',
      items: [
        { label: 'Overview', icon: 'home', href: '#dashboard-overview' },
        {
          label: 'Events',
          icon: 'calendar',
          href: events === 'restricted' ? undefined : eventsHref,
          badge: preview
            ? String(sampleEvents.length)
            : Array.isArray(events)
              ? String(events.length)
              : undefined,
        },
        {
          label: 'Tasks',
          icon: 'tasks',
          href: tasks === 'restricted' ? undefined : tasksHref,
          badge: taskCount === '—' ? undefined : taskCount,
        },
      ],
    },
    {
      label: 'Management',
      items: [
        ...(admin
          ? [
              {
                label: 'Expenses',
                icon: 'money' as const,
                href: '#dashboard-expenses',
                badge: sample ? '₹18.5L' : undefined,
              },
            ]
          : []),
        { label: 'Vendors', icon: 'vendors' },
        {
          label: 'Guests',
          icon: 'people',
          href: '#dashboard-rsvp',
          badge: sample ? '142' : undefined,
        },
        { label: 'Invitations', icon: 'mail', href: '#dashboard-rsvp' },
      ],
    },
    {
      label: 'Experience',
      items: [
        { label: 'Photo Gallery', icon: 'photo' },
        { label: 'Wedding Website', icon: 'globe', href: '#dashboard-website' },
      ],
    },
    {
      label: 'Collaboration',
      items: [
        {
          label: 'Family & Organizers',
          icon: 'people',
          href: preview ? '#dashboard-team' : overview + '/family',
        },
        ...(canEdit ? [{ label: 'Wedding Settings', icon: 'settings' as const }] : []),
      ],
    },
  ];
  const metrics: { label: string; value: string; detail: string; icon: IconName }[] = [
    {
      label: 'Total events',
      value: preview
        ? String(sampleEvents.length)
        : Array.isArray(events)
          ? String(events.length)
          : '—',
      detail: preview
        ? 'Next: Haldi Ceremony'
        : nextEvent
          ? 'Next: ' + nextEvent.name
          : Array.isArray(events)
            ? 'No upcoming events'
            : events === 'restricted'
              ? 'Access restricted'
              : events === 'unavailable'
                ? 'Unavailable'
                : 'Loading…',
      icon: 'calendar',
    },
    { label: 'Invited families', value: '142', detail: 'Family invitations', icon: 'people' },
    {
      label: 'Pending tasks',
      value: taskCount,
      detail: preview
        ? '3 due this week'
        : taskSummary
          ? `${taskSummary.overdue} overdue`
          : tasks === 'restricted'
            ? 'Access restricted'
            : tasks === 'unavailable'
              ? 'Unavailable'
              : 'Loading…',
      icon: 'tasks',
    },
    ...(admin
      ? [
          {
            label: 'Amount paid',
            value: '₹12,30,000',
            detail: 'Across 28 vendor records',
            icon: 'money' as const,
          },
          {
            label: 'Outstanding',
            value: '₹6,20,000',
            detail: 'Across 8 upcoming payments',
            icon: 'money' as const,
          },
        ]
      : []),
  ];

  return (
    <div className="wedding-dashboard" id="dashboard-overview">
      <WorkspaceSidebar groups={groups} active="Overview" editDetails={editDetails} />
      <div className="wedding-dashboard-main">
        <div className="wedding-dashboard-toolbar">
          <strong>Dashboard Overview</strong>
          {sample && (
            <span className="wedding-badge">
              {preview ? 'Design preview' : 'Sample planning data'}
            </span>
          )}
          {canEdit && (
            <button type="button" className="wedding-button" onClick={editDetails}>
              Edit Wedding Details
            </button>
          )}
        </div>
        <div className="wedding-dashboard-body">
          {sample && (
            <p className="wedding-dashboard-note">
              {preview
                ? 'All wedding data on this page is fictional.'
                : 'Wedding details, events, tasks and your planning team are live. Guest, expense and activity figures are examples.'}
            </p>
          )}
          <section className="wedding-card wedding-dashboard-hero">
            <span className="wedding-dashboard-monogram" aria-hidden="true">
              {initials}
            </span>
            <div className="wedding-dashboard-identity">
              <h1>{wedding.title}</h1>
              <span className="wedding-dashboard-countdown">{countdown}</span>
              <p>
                {wedding.groomName} &amp; {wedding.brideName}
              </p>
              <p>
                {formatWeddingDate(wedding.weddingDate)} · {wedding.timezone}
              </p>
              {wedding.defaultVenue?.name && <p>{wedding.defaultVenue.name}</p>}
              {wedding.defaultVenue?.address && <p>{wedding.defaultVenue.address}</p>}
              {preview && (
                <p>
                  <strong>Sample next event</strong> · Haldi Ceremony · Nov 12, 10:00 AM · Courtyard
                  Poolside
                </p>
              )}
              {nextEvent && (
                <p>
                  <strong>Next event</strong> · {nextEvent.name} · {eventSchedule(nextEvent)}
                </p>
              )}
            </div>
            <div className="wedding-dashboard-actions">
              {events !== 'restricted' && (
                <Link className="wedding-button wedding-button-secondary" href={eventsHref}>
                  <DashboardIcon name="calendar" /> Events
                </Link>
              )}
              {tasks !== 'restricted' && (
                <Link className="wedding-button wedding-button-secondary" href={tasksHref}>
                  <DashboardIcon name="tasks" /> Tasks
                </Link>
              )}
              <Link className="wedding-button wedding-button-secondary" href="#dashboard-rsvp">
                <DashboardIcon name="mail" /> Guest Invitations
              </Link>
              {!preview && (
                <Link className="wedding-button" href={overview + '/family'}>
                  <DashboardIcon name="people" /> Family &amp; Team
                </Link>
              )}
            </div>
          </section>
          <dl className="wedding-dashboard-metrics">
            {metrics.map(({ label, value, detail, icon }) => (
              <div
                className="wedding-card"
                data-attention={sample && label === 'Outstanding'}
                key={label}
              >
                <dt>
                  <span className="wedding-dashboard-metric-icon">
                    <DashboardIcon name={icon} />
                  </span>
                  {label}
                </dt>
                <dd>
                  {sample || label === 'Total events' ? value : '—'}
                  <small>{sample || label === 'Total events' ? detail : 'Coming soon'}</small>
                </dd>
              </div>
            ))}
          </dl>
          <div className="wedding-dashboard-columns">
            <DashboardPanel
              id="dashboard-events"
              title="Upcoming Events"
              icon="calendar"
              description={preview ? '5 sample wedding events' : 'Your wedding schedule'}
              action={
                !preview && Array.isArray(events) ? (
                  <Link className="wedding-text-button" href={eventsHref + '?add=1'}>
                    Add event
                  </Link>
                ) : undefined
              }
            >
              {preview ? (
                <ul className="wedding-dashboard-list">
                  {sampleEvents.map((event) => (
                    <li className="wedding-dashboard-event" key={event.name}>
                      <span className="wedding-dashboard-date">
                        <small>Nov</small>
                        <strong>{event.day}</strong>
                      </span>
                      <div>
                        <strong>{event.name}</strong>{' '}
                        <span className="wedding-dashboard-event-status">Scheduled</span>
                        <p>
                          {event.time} · {event.venue}
                        </p>
                        <p>
                          Family RSVP: <b>{event.yes} Yes</b>, {event.no} No, {event.pending}{' '}
                          Pending
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : upcoming.length ? (
                <ul className="wedding-dashboard-list">
                  {upcoming.slice(0, 5).map((event) => (
                    <li className="wedding-dashboard-event" key={event.id}>
                      <div>
                        <Link className="wedding-text-button" href={eventsHref + '/' + event.id}>
                          {event.name}
                        </Link>
                        <p>
                          {eventSchedule(event)}
                          {event.venue?.name ? ' · ' + event.venue.name : ''}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  {events === 'restricted'
                    ? 'Events access is restricted.'
                    : events === 'unavailable'
                      ? 'The schedule is temporarily unavailable.'
                      : events === null
                        ? 'Loading your schedule…'
                        : 'No upcoming events yet.'}
                </p>
              )}
            </DashboardPanel>
            <DashboardPanel
              id="dashboard-tasks"
              title="Tasks Requiring Attention"
              icon="tasks"
              description="Open tasks ordered by due date"
              action={
                tasks !== 'restricted' ? (
                  <Link className="wedding-text-button" href={tasksHref}>
                    View tasks
                  </Link>
                ) : undefined
              }
            >
              {preview ? (
                <ul className="wedding-dashboard-list wedding-dashboard-rows">
                  {sampleTasks.map((task) => (
                    <li key={task.name}>
                      <div>
                        <strong>{task.name}</strong>
                        <p>{task.detail}</p>
                      </div>
                      <span className="wedding-badge">
                        Due {task.due} · {task.priority}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : taskSummary?.attention.length ? (
                <ul className="wedding-dashboard-list wedding-dashboard-rows">
                  {taskSummary.attention.map((task) => (
                    <li key={task.id}>
                      <Link href={tasksHref + '/' + task.id}>{task.title}</Link>
                      <span className="wedding-badge">
                        {isOverdueTask(task) ? 'Overdue · ' : 'Due '}
                        {taskDueDate(task.dueAt, wedding.timezone)} ·{' '}
                        {taskPriorityLabels[task.priority]}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  {taskSummary
                    ? 'No open tasks with deadlines.'
                    : tasks === 'restricted'
                      ? 'Ask a Wedding Admin for Tasks access.'
                      : tasks === 'unavailable'
                        ? 'Task summary unavailable.'
                        : 'Loading tasks…'}
                </p>
              )}
            </DashboardPanel>
            <DashboardPanel
              id="dashboard-rsvp"
              title="Guest Invitations & RSVP"
              icon="mail"
              description="Family invitations and event responses"
            >
              {sample ? (
                <>
                  <dl className="wedding-dashboard-totals">
                    <div>
                      <dt>Invited families</dt>
                      <dd>142</dd>
                    </div>
                    <div>
                      <dt>Invitations sent</dt>
                      <dd>142</dd>
                    </div>
                    <div>
                      <dt>Pending families</dt>
                      <dd>24</dd>
                    </div>
                  </dl>
                  <p className="wedding-dashboard-subheading">Family RSVP by event</p>
                  <ul className="wedding-dashboard-list">
                    {sampleEvents.map((event) => (
                      <li className="wedding-dashboard-rsvp" key={event.name}>
                        <strong>{event.name}</strong>
                        <span>
                          {event.yes} Yes · {event.no} No · {event.pending} Pending
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p>Coming soon</p>
              )}
            </DashboardPanel>
            <DashboardPanel
              id="dashboard-team"
              title="Family & Organizers"
              icon="people"
              description="Your planning team and workspace access"
              action={
                !preview && (
                  <Link className="wedding-text-button" href={overview + '/family'}>
                    View team →
                  </Link>
                )
              }
            >
              {team}
            </DashboardPanel>
            {admin && (
              <DashboardPanel
                id="dashboard-expenses"
                title="Expense Snapshot"
                icon="money"
                description="Recorded costs, payments, and balances"
              >
                {sample ? (
                  <>
                    <dl className="wedding-dashboard-totals">
                      <div>
                        <dt>Recorded costs</dt>
                        <dd>₹18,50,000</dd>
                      </div>
                      <div>
                        <dt>Amount paid</dt>
                        <dd>₹12,30,000</dd>
                      </div>
                      <div>
                        <dt>Outstanding</dt>
                        <dd>₹6,20,000</dd>
                      </div>
                    </dl>
                    <p className="wedding-dashboard-subheading">Sample vendor contracts</p>
                    <ul className="wedding-dashboard-list wedding-dashboard-rows">
                      {sampleExpenses.map((expense) => (
                        <li key={expense.name}>
                          <div>
                            <strong>{expense.name}</strong>
                            <p>{expense.detail}</p>
                          </div>
                          <div>
                            <b>{expense.paid} paid</b>
                            <p>{expense.due} due</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p>Coming soon</p>
                )}
              </DashboardPanel>
            )}
            <DashboardPanel
              id="dashboard-activity"
              title="Recent Activity"
              icon="activity"
              description="Updates across the wedding workspace"
            >
              {sample ? (
                <ul className="wedding-dashboard-list wedding-dashboard-activity">
                  <li>
                    <strong>The Sharma family responded to the Haldi invitation.</strong>
                    <p>12 min ago</p>
                  </li>
                  <li>
                    <strong>Vikram completed the airport transfer task.</strong>
                    <p>1 hour ago</p>
                  </li>
                  {admin && (
                    <li>
                      <strong>Rahul recorded a payment to Aura Floral.</strong>
                      <p>3 hours ago</p>
                    </li>
                  )}
                  <li>
                    <strong>Pooja updated the Mehendi schedule.</strong>
                    <p>5 hours ago</p>
                  </li>
                </ul>
              ) : (
                <p>Coming soon</p>
              )}
            </DashboardPanel>
            <DashboardPanel
              id="dashboard-website"
              title="Wedding Website"
              icon="globe"
              description="Reserved website address"
              action={<span className="wedding-badge">Not published</span>}
            >
              <p className="wedding-url">/w/{wedding.slug}</p>
            </DashboardPanel>
          </div>
        </div>
      </div>
    </div>
  );
}
