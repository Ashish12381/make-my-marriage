'use client';
import Link from 'next/link';
import { useRef, type ReactNode } from 'react';
import { AuthHeart } from '../auth/auth-shell';
import { SignOutButton } from '../auth/sign-out-button';
export function WeddingShell({ children }: { children: ReactNode }) {
  const menuRef = useRef<HTMLDetailsElement>(null);
  const closeMenu = () => menuRef.current?.removeAttribute('open');
  return (
    <div className="wedding-app">
      <a className="landing-skip-link" href="#wedding-content">
        Skip to content
      </a>
      <header className="wedding-header">
        <div className="wedding-header-inner">
          <Link href="/" className="wedding-brand">
            <AuthHeart small />
            <span>
              Make My Marriage<small>One wedding. Both families.</small>
            </span>
          </Link>
          <nav aria-label="Workspace navigation" className="wedding-desktop-nav">
            <Link href="/weddings">My Weddings</Link>
            <Link href="/account">My Account</Link>
            <SignOutButton />
          </nav>
          <details
            className="wedding-mobile-nav"
            ref={menuRef}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                closeMenu();
                menuRef.current?.querySelector('summary')?.focus();
              }
            }}
          >
            <summary aria-label="Open workspace navigation">☰</summary>
            <nav aria-label="Mobile workspace navigation">
              <Link href="/weddings" onClick={closeMenu}>
                My Weddings
              </Link>
              <Link href="/account" onClick={closeMenu}>
                My Account
              </Link>
              <Link href="/" onClick={closeMenu}>
                Home
              </Link>
              <SignOutButton />
            </nav>
          </details>
        </div>
      </header>
      <main id="wedding-content" className="wedding-content">
        {children}
      </main>
      <footer className="wedding-footer">
        <span>♡ Make My Marriage — One wedding. Both families.</span>
        <span>© {new Date().getFullYear()} Make My Marriage.</span>
      </footer>
    </div>
  );
}
