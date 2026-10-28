import Link from 'next/link';
export default function ForgotPasswordPage() {
  return (
    <section className="auth-card">
      <div className="auth-card-heading">
        <h1>Password recovery</h1>
        <p>
          Email-based password recovery is not available yet. Please return to sign in if you
          remember your password.
        </p>
      </div>
      <Link className="auth-primary auth-bottom-back" href="/login">
        Back to Sign In
      </Link>
    </section>
  );
}
