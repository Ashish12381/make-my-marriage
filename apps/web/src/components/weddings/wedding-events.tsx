'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { TeamMember, WeddingEvent } from '@make-my-marriage/contracts';
import {
  archiveEvent,
  classifyEventsLoadError,
  getEvent,
  listEvents,
  saveEvent,
} from '@/lib/api/events';
import { ApiError } from '@/lib/api/client';
import { authErrorMessage } from '@/lib/api/auth';
import { getTeam } from '@/lib/api/team';
import { getWedding } from '@/lib/api/weddings';
import { redirectAfterSessionLoss } from '@/lib/auth/logout';
import { subscribeToSessionChanges } from '@/lib/auth/session-events';
import { eventSchedule, eventTypes, groupEvents, isUpcomingEvent } from '@/lib/events';
import { EventForm } from './event-form';
import { WorkspaceSidebar, type WorkspaceNavGroup } from './workspace-sidebar';

const filters = ['All events', 'Upcoming', 'Drafts', 'Past', 'Cancelled'] as const;
type Filter = (typeof filters)[number];
type LoadedEvents = {
  title: string;
  timezone: string;
  members: TeamMember[] | null;
  events: WeddingEvent[];
};
type Dialog = 'form' | 'cancel' | 'archive';

function filterEvents(events: WeddingEvent[], filter: Filter, query: string) {
  const match = (event: WeddingEvent) => {
    switch (filter) {
      case 'All events':
        return true;
      case 'Upcoming':
        return isUpcomingEvent(event);
      case 'Drafts':
        return event.status === 'DRAFT';
      case 'Past':
        return (
          event.status === 'COMPLETED' || (event.status === 'SCHEDULED' && !isUpcomingEvent(event))
        );
      case 'Cancelled':
        return event.status === 'CANCELLED';
    }
  };
  return events.filter(
    (event) =>
      match(event) &&
      [event.name, event.venue?.name, eventTypes[event.type].label].some((value) =>
        value?.toLowerCase().includes(query.trim().toLowerCase()),
      ),
  );
}

function statusLabel(event: WeddingEvent) {
  return { SCHEDULED: 'Scheduled', DRAFT: 'Draft', COMPLETED: 'Completed', CANCELLED: 'Cancelled' }[
    event.status
  ];
}

export function WeddingEvents({
  weddingId,
  eventId,
  openCreate = false,
}: {
  weddingId: string;
  eventId?: string;
  openCreate?: boolean;
}) {
  const router = useRouter();
  const overview = '/weddings/' + weddingId;
  const base = overview + '/events';
  const navigation: WorkspaceNavGroup[] = [
    {
      label: 'Main',
      items: [
        { label: 'Overview', icon: 'home', href: overview },
        { label: 'Events', icon: 'calendar', href: base },
        { label: 'Tasks', icon: 'tasks', href: overview + '/tasks' },
      ],
    },
    {
      label: 'Management',
      items: [
        { label: 'Expenses', icon: 'money', href: overview + '#dashboard-expenses' },
        { label: 'Vendors', icon: 'vendors' },
        { label: 'Guests', icon: 'people', href: overview + '#dashboard-rsvp' },
        { label: 'Invitations', icon: 'mail', href: overview + '#dashboard-rsvp' },
      ],
    },
    {
      label: 'Experience',
      items: [
        { label: 'Photo Gallery', icon: 'photo' },
        { label: 'Wedding Website', icon: 'globe', href: overview + '#dashboard-website' },
      ],
    },
    {
      label: 'Collaboration',
      items: [{ label: 'Family & Organizers', icon: 'people', href: overview + '/family' }],
    },
  ];
  const [data, setData] = useState<LoadedEvents | null>(null);
  const [filter, setFilter] = useState<Filter>('All events');
  const [query, setQuery] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [loadError, setLoadError] = useState('');
  const [denied, setDenied] = useState(false);
  const [dialog, setDialog] = useState<Dialog | null>(openCreate ? 'form' : null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const confirmation = useRef<HTMLDialogElement>(null);
  const activeRequest = useRef<AbortController>(null);

  const retry = () => setAttempt((value) => value + 1);
  const rejectAccess = useCallback((error: unknown) => {
    if (!(error instanceof ApiError) || ![401, 403, 404].includes(error.response.status))
      return false;
    activeRequest.current?.abort();
    setData(null);
    setDialog(null);
    setDenied(true);
    setLoadError(
      error.response.status === 403
        ? 'Ask a Wedding Admin for access to Events.'
        : 'This wedding or event is unavailable.',
    );
    if (error.response.status === 401) redirectAfterSessionLoss();
    return true;
  }, []);

  useEffect(() => subscribeToSessionChanges(() => setAttempt((value) => value + 1)), []);
  useEffect(() => {
    const controller = new AbortController();
    activeRequest.current = controller;
    const { signal } = controller;
    const validId = (id: string) => /^[a-f0-9]{24}$/i.test(id);
    if (!validId(weddingId) || (eventId && !validId(eventId))) {
      queueMicrotask(() => {
        if (!signal.aborted) {
          setDenied(true);
          setLoadError('This wedding or event is unavailable.');
        }
      });
      return () => controller.abort();
    }
    void (async () => {
      try {
        const [wedding, events] = await Promise.all([
          getWedding(weddingId, signal),
          eventId
            ? getEvent(weddingId, eventId, signal).then((event) => [event])
            : listEvents(weddingId, signal),
        ]);
        const team = await getTeam(weddingId, signal).catch((error: unknown) => {
          if (error instanceof ApiError && [401, 403, 404].includes(error.response.status))
            throw error;
          return null;
        });
        if (!signal.aborted) {
          setData({
            title: wedding.title,
            timezone: wedding.timezone,
            events,
            members: team?.members ?? null,
          });
          setDenied(false);
          setLoadError('');
        }
      } catch (error) {
        if (signal.aborted) return;
        const outcome = await classifyEventsLoadError(error);
        if (signal.aborted) return;
        if (outcome !== 'unavailable' && rejectAccess(error)) return;
        setDenied(false);
        setLoadError('The Events service is unavailable. Try again.');
      }
    })();
    return () => controller.abort();
  }, [weddingId, eventId, attempt, rejectAccess]);

  useEffect(() => {
    if (dialog === 'cancel' || dialog === 'archive') confirmation.current?.showModal();
  }, [dialog]);

  const event = eventId ? data?.events[0] : undefined;
  function openDialog(next: Dialog) {
    setActionError('');
    setDialog(next);
  }
  async function confirmAction() {
    if (!event || busy) return;
    const element = confirmation.current;
    setBusy(true);
    setActionError('');
    try {
      if (dialog === 'archive') {
        await archiveEvent(weddingId, event.id);
        if (element?.open) router.replace(base);
      } else {
        const updated = await saveEvent(weddingId, { status: 'CANCELLED' }, event.id);
        if (element?.open) {
          setData((current) => current && { ...current, events: [updated] });
          retry();
        }
      }
      if (element?.open) setDialog(null);
    } catch (error) {
      if (element?.open && !rejectAccess(error)) {
        setActionError(
          (await authErrorMessage(error, 'We couldn’t update the event. Try again.')).message,
        );
      }
    } finally {
      setBusy(false);
    }
  }

  const results = data && filterEvents(data.events, filter, query);
  return (
    <div className="wedding-dashboard">
      <WorkspaceSidebar active="Events" groups={navigation} />
      <div>
        <div className="wedding-dashboard-toolbar">
          <strong>Wedding Events</strong>
        </div>
        <div className="wedding-container event-workspace">
          <nav className="event-breadcrumbs" aria-label="Wedding workspace">
            <Link href={overview}>Overview</Link>
            <span aria-hidden="true">/</span>
            {eventId ? <Link href={base}>Events</Link> : <span aria-current="page">Events</span>}
            {event && (
              <>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{event.name}</span>
              </>
            )}
          </nav>
          {loadError && (
            <div className="wedding-alert" role="alert">
              <p>{loadError}</p>
              {!denied && (
                <button className="wedding-text-button" type="button" onClick={retry}>
                  Retry
                </button>
              )}
            </div>
          )}
          {!data && !loadError && (
            <p className="wedding-loading" role="status">
              Loading events…
            </p>
          )}
          {data && (
            <>
              <section className="event-hero">
                <div>
                  <p className="event-eyebrow">{data.title}</p>
                  <h1>{event?.name ?? 'Wedding Events'}</h1>
                  <p>
                    {event
                      ? eventTypes[event.type].label + ' · ' + statusLabel(event)
                      : 'Plan and manage the celebrations that make up your wedding.'}
                  </p>
                </div>
                {!eventId && (
                  <button
                    className="wedding-button"
                    type="button"
                    onClick={() => openDialog('form')}
                  >
                    ＋ Add event
                  </button>
                )}
                {event && event.status !== 'CANCELLED' && (
                  <button
                    className="wedding-button"
                    type="button"
                    onClick={() => openDialog('form')}
                  >
                    Edit event
                  </button>
                )}
              </section>
              {event ? (
                <div className="event-detail-grid">
                  <section className="wedding-card event-panel">
                    <h2>Schedule and venue</h2>
                    <p>
                      {eventSchedule(event)} · {event.timezone}
                    </p>
                    <p>{event.venue?.name || 'Venue to be decided'}</p>
                    {event.venue?.address && <p>{event.venue.address}</p>}
                    {event.venue?.mapUrl && (
                      <a
                        className="wedding-text-button"
                        href={event.venue.mapUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Open map ↗
                      </a>
                    )}
                    {event.description && (
                      <>
                        <h2>About this event</h2>
                        <p className="event-description">{event.description}</p>
                      </>
                    )}
                  </section>
                  <section className="wedding-card event-panel">
                    <h2>Event organizers</h2>
                    {data.members === null ? (
                      <p>Team members are unavailable.</p>
                    ) : (
                      <p>
                        {data.members
                          .filter((member) => event.organizerIds.includes(member.id))
                          .map((member) => member.displayName)
                          .join(', ') || 'No organizers assigned.'}
                      </p>
                    )}
                  </section>
                  <section className="wedding-card event-panel event-lifecycle">
                    <h2>Event status</h2>
                    <p>{statusLabel(event)}</p>
                    <div className="event-actions">
                      {event.status !== 'CANCELLED' && (
                        <button
                          type="button"
                          className="wedding-button wedding-button-secondary"
                          onClick={() => openDialog('cancel')}
                        >
                          Cancel event
                        </button>
                      )}
                      <button
                        type="button"
                        className="wedding-button wedding-button-secondary"
                        onClick={() => openDialog('archive')}
                      >
                        Archive event
                      </button>
                    </div>
                  </section>
                </div>
              ) : (
                <>
                  <div className="event-metrics">
                    <div className="wedding-card">
                      <span>Total events</span>
                      <strong>{data.events.length}</strong>
                    </div>
                    <div className="wedding-card">
                      <span>Upcoming</span>
                      <strong>
                        {data.events.filter((event) => isUpcomingEvent(event)).length}
                      </strong>
                    </div>
                    <div className="wedding-card">
                      <span>Drafts</span>
                      <strong>
                        {data.events.filter((event) => event.status === 'DRAFT').length}
                      </strong>
                    </div>
                  </div>
                  <div className="event-list-tools">
                    <div className="event-filters" role="group" aria-label="Event status">
                      {filters.map((value) => (
                        <button
                          type="button"
                          key={value}
                          aria-pressed={filter === value}
                          onClick={() => setFilter(value)}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    <input
                      aria-label="Search events"
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search events"
                    />
                  </div>
                  {results?.length ? (
                    groupEvents(results).map(([date, events]) => (
                      <section className="event-day" key={date}>
                        <h2>
                          {date
                            ? new Intl.DateTimeFormat('en-IN', {
                                timeZone: 'UTC',
                                dateStyle: 'full',
                              }).format(new Date(date + 'T00:00Z'))
                            : 'Date to be decided'}
                        </h2>
                        <div className="event-list">
                          {events.map((event) => (
                            <Link
                              className="wedding-card event-list-card"
                              key={event.id}
                              href={base + '/' + event.id}
                            >
                              <span className="event-type-icon" aria-hidden="true">
                                {eventTypes[event.type].icon}
                              </span>
                              <div>
                                <h3>{event.name}</h3>
                                <p>
                                  {eventSchedule(event)}
                                  {event.startAt && ` · ${event.timezone}`}
                                </p>
                                <p>{event.venue?.name || 'Venue to be decided'}</p>
                              </div>
                              <span className="event-status" data-status={event.status}>
                                {statusLabel(event)}
                              </span>
                              <span aria-hidden="true">›</span>
                            </Link>
                          ))}
                        </div>
                      </section>
                    ))
                  ) : (
                    <section className="wedding-card wedding-empty">
                      <h2>
                        {data.events.length
                          ? 'No matching events'
                          : 'Plan your first wedding event'}
                      </h2>
                      <p>
                        {data.events.length
                          ? 'Try another filter or search.'
                          : 'Add a ceremony, reception, or another celebration to start your schedule.'}
                      </p>
                      {!data.events.length && (
                        <button
                          className="wedding-button"
                          type="button"
                          onClick={() => openDialog('form')}
                        >
                          Add first event
                        </button>
                      )}
                    </section>
                  )}
                </>
              )}
              {dialog === 'form' && (
                <EventForm
                  weddingId={weddingId}
                  timezone={data.timezone}
                  event={event}
                  members={data.members}
                  onError={rejectAccess}
                  onClose={() => setDialog(null)}
                  onSaved={(saved) => {
                    setDialog(null);
                    if (eventId) {
                      setData((current) => current && { ...current, events: [saved] });
                      retry();
                    } else router.push(base + '/' + saved.id);
                  }}
                />
              )}
              {event && (dialog === 'cancel' || dialog === 'archive') && (
                <dialog
                  ref={confirmation}
                  className="wedding-dialog event-dialog event-confirm"
                  aria-labelledby="event-confirm-title"
                  onCancel={(e) => {
                    e.preventDefault();
                    if (!busy) setDialog(null);
                  }}
                >
                  <h2 id="event-confirm-title">
                    {dialog === 'cancel' ? 'Cancel event?' : 'Archive event?'}
                  </h2>
                  <p>
                    {dialog === 'cancel'
                      ? event.name +
                        ' will move to the Cancelled filter. Its history and default album are kept.'
                      : event.name +
                        ' will be removed from the schedule. Its history and default album are kept.'}
                  </p>
                  {actionError && (
                    <p role="alert" className="wedding-alert">
                      {actionError}
                    </p>
                  )}
                  <div className="event-actions">
                    <button
                      className="wedding-button wedding-button-secondary"
                      type="button"
                      disabled={busy}
                      onClick={() => setDialog(null)}
                    >
                      Go back
                    </button>
                    <button
                      className="wedding-button event-danger"
                      type="button"
                      disabled={busy}
                      onClick={() => void confirmAction()}
                    >
                      {busy ? 'Saving…' : dialog === 'cancel' ? 'Cancel event' : 'Archive event'}
                    </button>
                  </div>
                </dialog>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
