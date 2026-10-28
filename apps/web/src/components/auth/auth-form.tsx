'use client';
import Link from 'next/link';
import { useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signupSchema, loginSchema } from '@make-my-marriage/contracts';
import { submitAuth, authErrorMessage } from '@/lib/api/auth';
import { AuthHeart } from './auth-shell';

export function AuthForm({
  mode,
  accountCreated = false,
}: {
  mode: 'login' | 'signup';
  accountCreated?: boolean;
}) {
  const isSignup = mode === 'signup';
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const alertRef = useRef<HTMLDivElement>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setErrors({});
    setMessage('');
    const form = event.currentTarget;
    const data = new FormData(form);
    const values = {
      email: String(data.get('email') ?? ''),
      password: String(data.get('password') ?? ''),
    };
    const parsed = isSignup
      ? signupSchema.safeParse({ ...values, displayName: String(data.get('displayName') ?? '') })
      : loginSchema.safeParse({ ...values, rememberMe: data.get('rememberMe') === 'on' });
    const fieldErrors: Record<string, string> = {};
    if (!parsed.success)
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        fieldErrors[key] ??= issue.message;
      }
    if (isSignup && values.password !== String(data.get('confirmPassword') ?? ''))
      fieldErrors.confirmPassword = 'Passwords do not match.';
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      const name = Object.keys(fieldErrors)[0];
      const control = name ? form.elements.namedItem(name) : null;
      if (control instanceof HTMLElement) control.focus();
      return;
    }
    if (!parsed.success) return;
    setBusy(true);
    try {
      await submitAuth(mode, parsed.data);
      form.reset();
      if (isSignup) router.replace('/login?registered=1');
      else window.location.replace('/');
    } catch (error) {
      const result = await authErrorMessage(error);
      setErrors(result.fields);
      setMessage(result.message);
      requestAnimationFrame(() => alertRef.current?.focus());
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page-wrap">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-card-heading">
          <AuthHeart />
          {isSignup && <p className="auth-eyebrow">Make My Marriage</p>}
          <h1 id="auth-title">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
          <p>
            {isSignup
              ? 'Start organizing your wedding in one shared space.'
              : 'Sign in to continue planning your wedding.'}
          </p>
        </div>
        <form onSubmit={submit} noValidate className="auth-form" aria-busy={busy}>
          {!isSignup && accountCreated && (
            <div role="status" className="auth-success">
              Account created successfully. Please sign in to continue.
            </div>
          )}
          {message && (
            <div ref={alertRef} tabIndex={-1} role="alert" className="auth-alert">
              {message}
            </div>
          )}
          {isSignup && (
            <div className="auth-field">
              <label htmlFor="displayName">Full Name</label>
              <input
                id="displayName"
                name="displayName"
                autoComplete="name"
                placeholder="e.g. Rahul Sharma"
                maxLength={100}
                required
                disabled={busy}
                aria-invalid={!!errors.displayName}
                aria-describedby={errors.displayName ? 'displayName-error' : undefined}
              />
              {errors.displayName && (
                <p id="displayName-error" className="auth-field-error">
                  {errors.displayName}
                </p>
              )}
            </div>
          )}
          <div className="auth-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="rahul@example.com"
              maxLength={254}
              required
              disabled={busy}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="auth-field-error">
                {errors.email}
              </p>
            )}
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <div className="auth-password">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                placeholder={isSignup ? 'Create password' : 'Enter your password'}
                required
                disabled={busy}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? 'password-error' : isSignup ? 'password-help' : undefined
                }
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword(!showPassword)}
                disabled={busy}
              >
                <Eye hidden={showPassword} />
              </button>
            </div>
            {isSignup && (
              <p className="auth-help" id="password-help">
                At least 8 characters with a mix of letters and numbers. Maximum 72 UTF-8 bytes.
              </p>
            )}
            {errors.password && (
              <p id="password-error" className="auth-field-error">
                {errors.password}
              </p>
            )}
          </div>
          {isSignup && (
            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="auth-password">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  required
                  disabled={busy}
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                />
                <button
                  type="button"
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  aria-pressed={showConfirm}
                  onClick={() => setShowConfirm(!showConfirm)}
                  disabled={busy}
                >
                  <Eye hidden={showConfirm} />
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="auth-field-error">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}
          {!isSignup && (
            <div className="auth-login-options">
              <label>
                <input type="checkbox" name="rememberMe" disabled={busy} /> Remember me for 30 days
              </label>
              <Link href="/forgot-password">Forgot password?</Link>
            </div>
          )}
          <button className="auth-primary" type="submit" disabled={busy}>
            {busy
              ? isSignup
                ? 'Creating account…'
                : 'Signing in…'
              : isSignup
                ? 'Create Account'
                : 'Sign In'}{' '}
            {!busy && <span aria-hidden="true">→</span>}
          </button>
          <p className="auth-switch">
            {isSignup ? 'Already have an account?' : 'New to Make My Marriage?'}{' '}
            <Link href={isSignup ? '/login' : '/signup'}>
              {isSignup ? 'Sign In' : 'Create an account'}
            </Link>
          </p>
          <span className="sr-only" role="status">
            {busy ? 'Submitting your details. Please wait.' : ''}
          </span>
        </form>
      </section>
      <Link href="/" className="auth-back auth-bottom-back">
        <span aria-hidden="true">←</span> Back to Home
      </Link>
    </div>
  );
}
function Eye({ hidden }: { hidden: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12" />
      <circle cx="12" cy="12" r="3" />
      {hidden && <path d="M3 3l18 18" />}
    </svg>
  );
}
