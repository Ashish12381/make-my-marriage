import Link from 'next/link';
import type { ReactNode } from 'react';

export function AuthHeart({ small = false }: { small?: boolean }) {
  return (
    <span className={small ? 'auth-brand-heart' : 'auth-heart'} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </span>
  );
}
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell">
      <a className="landing-skip-link" href="#auth-content">
        Skip to content
      </a>
      <header className="auth-header">
        <div className="auth-header-inner">
          <Link href="/" className="auth-brand" aria-label="Make My Marriage home">
            <AuthHeart small />
            <span>Make My Marriage</span>
          </Link>
          <Link href="/" className="auth-back">
            <span aria-hidden="true">←</span> Back to Home
          </Link>
        </div>
      </header>
      <main id="auth-content" className="auth-main">
        {children}
      </main>
      <footer className="auth-footer">
        <span>© {new Date().getFullYear()} Make My Marriage.</span>
        <span>One wedding. Both families.</span>
      </footer>
    </div>
  );
}
