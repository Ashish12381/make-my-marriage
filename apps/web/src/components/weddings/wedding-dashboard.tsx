'use client';
import Link from 'next/link';
import { useId, useRef, useState, type ReactNode } from 'react';
import type { Wedding } from '@make-my-marriage/contracts';
import { formatWeddingDate, weddingCountdown } from '@/lib/weddings';
import { SignOutButton } from '../auth/sign-out-button';
import { UserIdentity } from '../auth/user-identity';
import { sampleEvents, sampleExpenses, sampleTasks } from './dashboard-samples';

const icons = {
  home: 'M3 12 12 4l9 8M5 10v10h14V10M9 20v-6h6v6',
  calendar: 'M5 5h14a2 2 0 0 1 2 2v13H3V7a2 2 0 0 1 2-2ZM7 3v4m10-4v4M3 10h18',
  tasks: 'M8 5H5v16h14V5h-3M8 3h8v4H8zM8 13l2 2 5-5',
  money: 'M3 5h15v4M3 5v10h4m0-6h14v11H7zM12 14h4m-2-2v4',
  vendors: 'M5 21V3h14v18M3 21h18M9 7h1m4 0h1m-6 4h1m4 0h1m-5 10v-5h4v5',
  people:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2h14Zm0-6a4 4 0 0 1 6 4v2h-3M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-8a4 4 0 0 1 0 8',
  mail: 'M3 5h18v14H3zM3 6l9 7 9-7',
  activity: 'M3 12h4l3-6 4 12 3-6h4',
  photo: 'M3 4h18v16H3zM3 17l5-5 4 4 4-5 5 6M8 8h.01',
  globe:
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM2 12h20M12 2a16 16 0 0 1 0 20 16 16 0 0 1 0-20Z',
  settings:
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM10 3h4l1 3 3 1 3 4v2l-3 4-3 1-1 3h-4l-1-3-3-1-3-4v-2l3-4 3-1z',
} as const;

type IconName = keyof typeof icons;

function DashboardIcon({ name }: { name: IconName }) {
  return (
    <svg
      aria-hidden="true"
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={icons[name]} />
    </svg>
  );
}

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
}: {
  wedding: Wedding;
  editDetails?: () => void;
  team: ReactNode;
  preview?: boolean;
}) {
  const sample = preview || process.env.NODE_ENV === 'development';
  const admin = wedding.role === 'WEDDING_ADMIN';
  const canEdit = admin && editDetails;
  const overview = '/weddings/' + wedding.id;
  const initials = [wedding.groomName, wedding.brideName]
    .map((name) => Array.from(name.trim())[0])
    .filter(Boolean)
    .join('&')
    .toUpperCase();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const navId = useId();
  const countdown = weddingCountdown(wedding.weddingDate, wedding.timezone);
  const groups: {
    label: string;
    items: { label: string; icon: IconName; href?: string; badge?: string | undefined }[];
  }[] = [
    {
      label: 'Main',
      items: [
        { label: 'Overview', icon: 'home', href: '#dashboard-overview' },
        {
          label: 'Events',
          icon: 'calendar',
          href: '#dashboard-events',
          badge: sample ? '5' : undefined,
        },
        {
          label: 'Tasks',
          icon: 'tasks',
          href: '#dashboard-tasks',
          badge: sample ? '12' : undefined,
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
      value: String(sampleEvents.length),
      detail: 'Next: Haldi Ceremony',
      icon: 'calendar',
    },
    { label: 'Invited families', value: '142', detail: 'Family invitations', icon: 'people' },
    { label: 'Pending tasks', value: '12', detail: '3 due this week', icon: 'tasks' },
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
      <aside
        className="wedding-dashboard-sidebar"
        onKeyDown={(event) => {
          if (event.key === 'Escape' && menuOpen && menuButton.current?.getClientRects().length) {
            event.preventDefault();
            setMenuOpen(false);
            menuButton.current.focus();
          }
        }}
      >
        <div className="wedding-dashboard-brand">
          <Link href="/weddings">
            <span aria-hidden="true">♥</span>
            <strong>
              Make My Marriage<small>Workspace</small>
            </strong>
          </Link>
          <button
            ref={menuButton}
            type="button"
            className="wedding-dashboard-navigation"
            aria-expanded={menuOpen}
            aria-controls={navId}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            Menu <span aria-hidden="true">⌄</span>
          </button>
        </div>
        <nav
          id={navId}
          aria-label="Wedding workspace"
          className="wedding-dashboard-nav"
          data-open={menuOpen}
        >
          <Link href="/weddings" className="wedding-dashboard-switch">
            <span aria-hidden="true">←</span>
            My Weddings
          </Link>
          {groups.map(({ label, items }) => (
            <div key={label} className="wedding-dashboard-nav-group">
              <p>{label}</p>
              <ul>
                {items.map(({ label: item, icon, href, badge }) => {
                  const content = (
                    <>
                      <DashboardIcon name={icon} />
                      <span>{item}</span>
                      {badge && <small>{badge}</small>}
                    </>
                  );
                  return (
                    <li key={item}>
                      {href ? (
                        <Link
                          href={href}
                          aria-current={item === 'Overview' ? 'page' : undefined}
                          onClick={() => setMenuOpen(false)}
                        >
                          {content}
                        </Link>
                      ) : item === 'Wedding Settings' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            editDetails?.();
                          }}
                        >
                          {content}
                        </button>
                      ) : (
                        <span>{content}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <div className="wedding-dashboard-account">
            <UserIdentity />
            <SignOutButton className="wedding-text-button" />
          </div>
        </nav>
      </aside>
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
                : 'Wedding details and your planning team are live. Planning figures, schedules, tasks, and activity are examples.'}
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
              {sample && (
                <p>
                  <strong>Sample next event</strong> · Haldi Ceremony · Nov 12, 10:00 AM · Courtyard
                  Poolside
                </p>
              )}
            </div>
            <div className="wedding-dashboard-actions">
              <Link className="wedding-button wedding-button-secondary" href="#dashboard-events">
                <DashboardIcon name="calendar" /> Events
              </Link>
              <Link className="wedding-button wedding-button-secondary" href="#dashboard-tasks">
                <DashboardIcon name="tasks" /> Tasks
              </Link>
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
                  {sample ? value : '—'}
                  <small>{sample ? detail : 'Coming soon'}</small>
                </dd>
              </div>
            ))}
          </dl>
          <div className="wedding-dashboard-columns">
            <DashboardPanel
              id="dashboard-events"
              title="Upcoming Events"
              icon="calendar"
              description={sample ? '5 sample wedding events' : 'Your wedding schedule'}
            >
              {sample ? (
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
              ) : (
                <p>The wedding schedule will appear here when Events is available.</p>
              )}
            </DashboardPanel>
            <DashboardPanel
              id="dashboard-tasks"
              title="Tasks Requiring Attention"
              icon="tasks"
              description="Assigned tasks and approaching deadlines"
            >
              {sample ? (
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
              ) : (
                <p>Coming soon</p>
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
