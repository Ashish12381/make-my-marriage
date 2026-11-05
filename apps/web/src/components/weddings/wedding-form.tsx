'use client';
import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  createWeddingSchema,
  updateWeddingSchema,
  weddingSlugSchema,
  type CreateWeddingInput,
  type Wedding,
} from '@make-my-marriage/contracts';
import { createWedding, updateWedding, checkWeddingSlug } from '@/lib/api/weddings';
import { authErrorMessage } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { redirectAfterSessionLoss } from '@/lib/auth/logout';
import { suggestWeddingSlug, suggestWeddingTitles } from '@/lib/weddings';
import { AuthHeart } from '../auth/auth-shell';
import { WeddingSummary } from './wedding-summary';

const firstStepSchema = createWeddingSchema.pick({
  title: true,
  brideName: true,
  groomName: true,
  weddingDate: true,
  timezone: true,
});
const zones = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'Australia/Sydney',
  'UTC',
];
type Availability = 'unchecked' | 'checking' | 'available' | 'taken' | 'error';
export function WeddingForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: Wedding;
  onSaved?: (wedding: Wedding) => void;
  onCancel?: () => void;
}) {
  const editing = Boolean(initial);
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<CreateWeddingInput>(() => ({
    title: initial?.title ?? '',
    brideName: initial?.brideName ?? '',
    groomName: initial?.groomName ?? '',
    weddingDate: initial?.weddingDate ?? '',
    timezone: initial?.timezone ?? 'Asia/Kolkata',
    slug: initial?.slug ?? '',
    defaultVenue: {
      name: initial?.defaultVenue?.name ?? '',
      address: initial?.defaultVenue?.address ?? '',
      ...(initial?.defaultVenue?.latitude !== undefined
        ? { latitude: initial.defaultVenue.latitude, longitude: initial.defaultVenue.longitude }
        : {}),
    },
  }));
  const [slugEdited, setSlugEdited] = useState(editing);
  const [availability, setAvailability] = useState<Availability>('unchecked');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const alert = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (editing || step !== 2 || !weddingSlugSchema.safeParse(values.slug).success) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setAvailability('checking');
      void checkWeddingSlug(values.slug, controller.signal)
        .then((available) => {
          if (!controller.signal.aborted) setAvailability(available ? 'available' : 'taken');
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          if (error instanceof ApiError && error.response.status === 401)
            redirectAfterSessionLoss();
          else setAvailability('error');
        });
    }, 450);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [editing, step, values.slug]);
  function field(
    name: 'title' | 'brideName' | 'groomName' | 'weddingDate' | 'timezone' | 'slug',
    value: string,
  ) {
    setValues((previous) => {
      const next = { ...previous, [name]: value };
      if ((name === 'brideName' || name === 'groomName') && !slugEdited)
        next.slug = suggestWeddingSlug(next.brideName, next.groomName);
      return next;
    });
    if (name === 'slug') {
      setSlugEdited(true);
      setAvailability('unchecked');
    }
  }
  function goTo(next: number) {
    setStep(next);
    setErrors({});
    setMessage('');
    requestAnimationFrame(() => heading.current?.focus());
  }
  function invalid(issues: readonly { path: PropertyKey[]; message: string }[]) {
    const fields: Record<string, string> = {};
    for (const issue of issues) fields[issue.path.map(String).join('.')] ??= issue.message;
    setErrors(fields);
    requestAnimationFrame(() =>
      document.getElementById(`wedding-${Object.keys(fields)[0]}`)?.focus(),
    );
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setErrors({});
    setMessage('');
    if (!editing && step === 1) {
      const parsed = firstStepSchema.safeParse({
        title: values.title,
        brideName: values.brideName,
        groomName: values.groomName,
        weddingDate: values.weddingDate,
        timezone: values.timezone,
      });
      if (!parsed.success) {
        invalid(parsed.error.issues);
        return;
      }
      goTo(2);
      return;
    }
    const updateValues = {
      title: values.title,
      brideName: values.brideName,
      groomName: values.groomName,
      weddingDate: values.weddingDate,
      timezone: values.timezone,
      defaultVenue: values.defaultVenue,
    };
    if (editing && initial) {
      const parsed = updateWeddingSchema.safeParse(updateValues);
      if (!parsed.success) {
        invalid(parsed.error.issues);
        return;
      }
      setBusy(true);
      try {
        const wedding = await updateWedding(initial.id, parsed.data);
        onSaved?.(wedding);
      } catch (error) {
        await failed(error);
      } finally {
        setBusy(false);
      }
      return;
    }
    const parsed = createWeddingSchema.safeParse(values);
    if (!parsed.success) {
      invalid(parsed.error.issues);
      return;
    }
    if (availability === 'checking') return;
    if (availability === 'taken') {
      setErrors({ slug: 'This address is taken. Choose another.' });
      document.getElementById('wedding-slug')?.focus();
      return;
    }
    setBusy(true);
    try {
      const wedding = await createWedding(parsed.data);
      router.replace(`/weddings/${wedding.id}/ready`);
    } catch (error) {
      await failed(error);
      setBusy(false);
    }
  }
  async function failed(error: unknown) {
    if (error instanceof ApiError && error.response.status === 401) {
      redirectAfterSessionLoss();
      return;
    }
    const detail = await authErrorMessage(
      error,
      'We could not save your wedding. Your entries are still here; please try again.',
    );
    setErrors(detail.fields);
    setMessage(detail.message);
    requestAnimationFrame(() => alert.current?.focus());
  }
  function input(
    name: 'title' | 'brideName' | 'groomName' | 'weddingDate' | 'timezone' | 'slug',
    label: string,
    type = 'text',
  ) {
    return (
      <div className="wedding-field">
        <label htmlFor={`wedding-${name}`}>
          {label} <span aria-hidden="true">*</span>
        </label>
        <input
          id={`wedding-${name}`}
          name={name}
          type={type}
          value={values[name]}
          onChange={(e) => field(name, e.target.value)}
          required
          disabled={busy}
          maxLength={name === 'title' ? 120 : name === 'slug' ? 80 : 100}
          list={name === 'timezone' ? 'wedding-timezones' : undefined}
          autoCapitalize={name === 'slug' ? 'none' : undefined}
          spellCheck={name === 'slug' ? false : undefined}
          aria-invalid={Boolean(errors[name])}
          aria-describedby={errors[name] ? `wedding-${name}-error` : undefined}
        />
        {errors[name] && (
          <p className="wedding-field-error" id={`wedding-${name}-error`}>
            {errors[name]}
          </p>
        )}
      </div>
    );
  }
  const showDetails = editing || step === 1;
  const showLocation = editing || step === 2;
  const titleSuggestions = suggestWeddingTitles(values.brideName, values.groomName);
  return (
    <section className={`wedding-card wedding-form-card ${editing ? 'wedding-edit-form' : ''}`}>
      {!editing && (
        <div className="wedding-form-brand">
          <AuthHeart />
          <strong>Make My Marriage</strong>
          <p>One wedding. Both families.</p>
        </div>
      )}
      {!editing && (
        <ol className="wedding-steps" aria-label="Wedding creation progress">
          <li aria-current={step === 1 ? 'step' : undefined}>
            <span>1</span> Wedding Details
          </li>
          <li aria-current={step === 2 ? 'step' : undefined}>
            <span>2</span> Location &amp; Review
          </li>
        </ol>
      )}
      <h1 ref={heading} tabIndex={-1}>
        {editing
          ? 'Edit Wedding Details'
          : step === 1
            ? 'Let’s make it your wedding'
            : 'Venue, address & review'}
      </h1>
      <p className="wedding-muted">
        {editing
          ? 'Update your celebration details.'
          : step === 1
            ? 'Start with a few details. You can update them later.'
            : 'Add an optional location and review your wedding.'}
      </p>
      <form onSubmit={submit} noValidate aria-busy={busy} className="wedding-form">
        {message && (
          <div className="wedding-alert" ref={alert} role="alert" tabIndex={-1}>
            {message}
          </div>
        )}
        {showDetails && (
          <>
            <div>
              {input('title', 'Wedding title')}
              <div className="wedding-title-suggestions">
                <p className="wedding-help">
                  {titleSuggestions.length
                    ? 'Need inspiration? Choose a suggestion, or write your own.'
                    : 'Not sure what to call it? Enter both names below to see suggestions.'}
                </p>
                {titleSuggestions.length > 0 && (
                  <div
                    className="wedding-title-options"
                    role="group"
                    aria-label="Suggested wedding titles"
                  >
                    {titleSuggestions.map((title) => (
                      <button
                        key={title}
                        type="button"
                        disabled={busy}
                        aria-pressed={values.title === title}
                        onClick={() => {
                          field('title', title);
                          setErrors((previous) => {
                            const next = { ...previous };
                            delete next.title;
                            return next;
                          });
                        }}
                      >
                        {title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="wedding-field-pair">
              {input('brideName', 'Bride’s name')}
              {input('groomName', 'Groom’s name')}
            </div>
            {input('weddingDate', 'Wedding date', 'date')}
            {input('timezone', 'Timezone')}
            <datalist id="wedding-timezones">
              {[...new Set([...zones, ...Intl.supportedValuesOf('timeZone')])].map((zone) => (
                <option key={zone} value={zone} />
              ))}
            </datalist>
          </>
        )}
        {showLocation && (
          <>
            {(['name', 'address'] as const).map((name) => (
              <div className="wedding-field" key={name}>
                <label htmlFor={`wedding-defaultVenue.${name}`}>
                  {name === 'name' ? 'Venue name' : 'Venue address / city'}{' '}
                  <span className="wedding-optional">(optional)</span>
                </label>
                <input
                  id={`wedding-defaultVenue.${name}`}
                  value={values.defaultVenue?.[name] ?? ''}
                  maxLength={name === 'name' ? 200 : 500}
                  disabled={busy}
                  onChange={(e) =>
                    setValues((previous) => ({
                      ...previous,
                      defaultVenue: { ...previous.defaultVenue, [name]: e.target.value },
                    }))
                  }
                  aria-invalid={Boolean(errors[`defaultVenue.${name}`])}
                />
                {errors[`defaultVenue.${name}`] && (
                  <p className="wedding-field-error">{errors[`defaultVenue.${name}`]}</p>
                )}
              </div>
            ))}
            {editing ? (
              <div className="wedding-field">
                <label htmlFor="reserved-slug">Reserved website address</label>
                <input id="reserved-slug" readOnly value={`/w/${values.slug}`} />
                <p className="wedding-muted">
                  Address changes are not available in this version. Your website is not published.
                </p>
              </div>
            ) : (
              <>
                {input('slug', 'Wedding website address')}
                <p className="wedding-url">/w/{values.slug || 'your-wedding'}</p>
                <p className="wedding-help">
                  This address will be reserved when you create your wedding. Your website will not
                  be published yet.
                </p>
                <p
                  role="status"
                  className={availability === 'taken' ? 'wedding-field-error' : 'wedding-help'}
                >
                  {availability === 'checking'
                    ? 'Checking availability…'
                    : availability === 'available'
                      ? 'Available now. Availability is confirmed when you create the wedding.'
                      : availability === 'taken'
                        ? 'This address is already taken. Try another.'
                        : availability === 'error'
                          ? 'Unable to check availability. You can retry by editing the address, or submit to check again.'
                          : ''}
                </p>
                <div className="wedding-review">
                  <div className="wedding-review-heading">
                    <h2>Review Wedding Summary</h2>
                    <button type="button" className="wedding-text-button" onClick={() => goTo(1)}>
                      Edit Step 1
                    </button>
                  </div>
                  <WeddingSummary wedding={values} />
                  <p className="wedding-help">You’ll be a Wedding Admin for this wedding.</p>
                </div>
              </>
            )}
          </>
        )}
        <div className="wedding-form-actions">
          {editing ? (
            <button
              type="button"
              className="wedding-button wedding-button-secondary"
              disabled={busy}
              onClick={onCancel}
            >
              Cancel
            </button>
          ) : step === 2 ? (
            <button
              type="button"
              className="wedding-button wedding-button-secondary"
              disabled={busy}
              onClick={() => goTo(1)}
            >
              ← Back to Step 1
            </button>
          ) : (
            <Link href="/weddings" className="wedding-button wedding-button-secondary">
              Back to My Weddings
            </Link>
          )}
          <button
            className="wedding-button"
            type="submit"
            disabled={busy || (!editing && step === 2 && availability === 'checking')}
          >
            {busy
              ? editing
                ? 'Saving changes…'
                : 'Creating your wedding…'
              : editing
                ? 'Save Changes'
                : step === 1
                  ? 'Continue to Step 2 →'
                  : 'Create Wedding ✓'}
          </button>
        </div>
        {!editing && message && (
          <Link href="/weddings" className="wedding-text-button">
            Check My Weddings before trying again
          </Link>
        )}
      </form>
    </section>
  );
}
