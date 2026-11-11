'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  createEventSchema,
  updateEventSchema,
  type TeamMember,
  type WeddingEvent,
} from '@make-my-marriage/contracts';
import { authErrorMessage } from '@/lib/api/auth';
import { saveEvent } from '@/lib/api/events';
import { eventFormInput, eventTypes, localEventTime } from '@/lib/events';

export function EventForm({
  weddingId,
  timezone,
  event,
  members,
  onClose,
  onSaved,
  onError,
}: {
  weddingId: string;
  timezone: string;
  event: WeddingEvent | undefined;
  members: TeamMember[] | null;
  onClose: () => void;
  onSaved: (event: WeddingEvent) => void;
  onError: (error: unknown) => boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [type, setType] = useState<WeddingEvent['type']>(event?.type ?? 'CUSTOM');
  const [name, setName] = useState(event?.name ?? '');
  const [editedOrganizers, setEditedOrganizers] = useState<string[] | null>(null);
  const organizers = editedOrganizers ?? event?.organizerIds ?? [];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [zone] = useState(event?.timezone ?? timezone);
  const edited = useRef(new Set<string>());

  useEffect(() => dialog.current?.showModal(), []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fields = new FormData(e.currentTarget);
    setError('');
    setBusy(true);
    try {
      const input = eventFormInput(
        fields,
        edited.current,
        zone,
        event,
        editedOrganizers ?? undefined,
      );
      if (event && Object.keys(input).length === 0) {
        onClose();
        return;
      }
      const result = event
        ? updateEventSchema.safeParse(input)
        : createEventSchema.safeParse(input);
      if (!result.success)
        throw new Error(result.error.issues[0]?.message ?? 'Review the event details.');
      const saved = await saveEvent(weddingId, result.data, event?.id);
      if (dialog.current?.open) onSaved(saved);
    } catch (err) {
      if (!dialog.current?.open || onError(err)) return;
      setError(
        await authErrorMessage(
          err,
          err instanceof Error && err.name !== 'ApiError' && err.name !== 'TypeError'
            ? err.message
            : 'We couldn’t save the event. Try again.',
        ).then((detail) => detail.message),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      className="wedding-dialog event-dialog"
      aria-labelledby="event-form-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
    >
      <form
        onSubmit={submit}
        onChange={({ target }) => {
          if (
            (target instanceof HTMLInputElement ||
              target instanceof HTMLSelectElement ||
              target instanceof HTMLTextAreaElement) &&
            target.name
          ) {
            edited.current.add(target.name);
          }
        }}
        className="event-form"
      >
        <header>
          <p className="wedding-badge">Wedding schedule</p>
          <h2 id="event-form-title">{event ? 'Edit event' : 'Create an event'}</h2>
          <p>Choose a preset or give your celebration a name of its own.</p>
        </header>
        <label>
          Event type
          <select
            name="type"
            value={type}
            onChange={(e) => {
              const next = e.target.value as WeddingEvent['type'];
              if (!event && (!name || name === eventTypes[type].label))
                setName(next === 'CUSTOM' ? '' : eventTypes[next].label);
              setType(next);
            }}
          >
            {Object.entries(eventTypes).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Event name
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={120}
          />
        </label>
        <label>
          Description <small>Optional</small>
          <textarea
            name="description"
            rows={3}
            maxLength={2000}
            defaultValue={event?.description}
          />
        </label>
        <div className="event-field-pair">
          <label>
            Start date and time
            <input
              type="datetime-local"
              name="startAt"
              defaultValue={event?.startAt ? localEventTime(event.startAt, zone) : ''}
            />
          </label>
          <label>
            End date and time
            <input
              type="datetime-local"
              name="endAt"
              defaultValue={event?.endAt ? localEventTime(event.endAt, zone) : ''}
            />
          </label>
        </div>
        <p className="event-hint">
          Leave the start blank to save a draft. For an overnight event, choose the next date for
          the end.
        </p>
        <label>
          Time zone
          <input
            name="timezone"
            defaultValue={zone}
            required
            maxLength={100}
            list="event-timezones"
          />
        </label>
        <datalist id="event-timezones">
          {[...new Set([timezone, zone, ...(Intl.supportedValuesOf?.('timeZone') ?? [])])].map(
            (value) => (
              <option key={value} value={value} />
            ),
          )}
        </datalist>
        <label>
          Venue name <small>Optional</small>
          <input name="venue" defaultValue={event?.venue?.name} maxLength={200} />
        </label>
        <label>
          Address <small>Optional</small>
          <input name="address" defaultValue={event?.venue?.address} maxLength={500} />
        </label>
        <label>
          Map link <small>Optional</small>
          <input type="url" name="mapUrl" defaultValue={event?.venue?.mapUrl} maxLength={2048} />
        </label>
        <fieldset>
          <legend>Event organizers</legend>
          <p className="event-hint">
            Choose from your planning team. Access is managed in Family &amp; Team.
          </p>
          {members ? (
            members.map((member) => (
              <label className="event-checkbox" key={member.id}>
                <input
                  type="checkbox"
                  checked={organizers.includes(member.id)}
                  onChange={(e) => {
                    setEditedOrganizers(
                      members
                        .map(({ id }) => id)
                        .filter((id) =>
                          id === member.id ? e.target.checked : organizers.includes(id),
                        ),
                    );
                  }}
                />
                {member.displayName}
              </label>
            ))
          ) : (
            <p>
              {editedOrganizers === null
                ? 'Team members are unavailable.'
                : 'Team members are unavailable. Your pending organizer changes will still be submitted when you save.'}
            </p>
          )}
        </fieldset>
        {error && (
          <p role="alert" className="wedding-alert">
            {error}
          </p>
        )}
        <footer className="event-actions">
          <button
            type="button"
            className="wedding-button wedding-button-secondary"
            disabled={busy}
            onClick={onClose}
          >
            Go back
          </button>
          <button className="wedding-button" disabled={busy}>
            {busy ? 'Saving…' : event ? 'Save changes' : 'Create event'}
          </button>
        </footer>
      </form>
    </dialog>
  );
}
