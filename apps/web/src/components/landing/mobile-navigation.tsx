'use client';

import Link from 'next/link';
import { useRef } from 'react';

export function MobileNavigation({
  navigation,
}: {
  navigation: readonly { label: string; href: string }[];
}) {
  const menuRef = useRef<HTMLDetailsElement>(null);
  const closeMenu = () => menuRef.current?.removeAttribute('open');
  return (
    <details
      ref={menuRef}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          menuRef.current?.removeAttribute('open');
          menuRef.current?.querySelector('summary')?.focus();
        }
      }}
      className="relative xl:hidden"
    >
      <summary
        className="flex size-11 cursor-pointer list-none items-center justify-center rounded-xl border border-warm-taupe bg-warm-cream"
        aria-label="Open navigation menu"
      >
        <span aria-hidden="true" className="text-xl">
          ☰
        </span>
      </summary>
      <nav
        aria-label="Mobile navigation"
        className="absolute right-0 top-14 flex w-64 flex-col rounded-xl border border-warm-taupe bg-warm-cream p-3 shadow-lg"
      >
        {navigation.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={closeMenu}
            className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-sand"
          >
            {item.label}
          </a>
        ))}
        <Link
          href="/login"
          onClick={closeMenu}
          className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-sand"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          onClick={closeMenu}
          className="rounded-lg bg-primary px-3 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Start Planning
        </Link>
      </nav>
    </details>
  );
}
