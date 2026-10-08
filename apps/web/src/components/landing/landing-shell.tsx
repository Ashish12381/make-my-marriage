import Link from 'next/link';
import { MobileNavigation } from './mobile-navigation';

const navigation = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Why Make My Marriage', href: '#shared-planning' },
];

function Brand() {
  return (
    <Link
      href="/"
      className="flex shrink-0 items-center gap-2.5 font-heading text-lg font-bold tracking-tight sm:text-xl"
      aria-label="Make My Marriage home"
    >
      <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-oat-milk bg-peach-clay" />
      </span>
      <span>Make My Marriage</span>
    </Link>
  );
}

export function LandingHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-warm-taupe/70 bg-oat-milk/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-3 px-4 lg:px-10">
        <Brand />
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-6 text-sm font-semibold text-muted xl:flex"
        >
          {navigation.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-espresso">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/login"
            className="hidden rounded-lg px-2 py-3 text-sm font-semibold text-muted hover:text-espresso sm:inline-flex"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="hidden rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover sm:inline-flex"
          >
            Start Planning
          </Link>
          <MobileNavigation navigation={navigation} />
        </div>
      </div>
    </header>
  );
}

export function LandingFooter() {
  return (
    <footer className="bg-espresso text-oat-milk">
      <div className="mx-auto max-w-[1440px] px-4 py-10 lg:px-10">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <Brand />
            <p className="mt-4 max-w-md text-base leading-relaxed text-warm-taupe">
              Collaborative wedding planning for Indian couples and families. Coordinate events,
              invite families, track expenses, and share your celebrations.
            </p>
          </div>
          <nav
            aria-label="Footer navigation"
            className="flex flex-col items-start gap-3 text-sm md:justify-self-end"
          >
            <span className="text-xs font-semibold tracking-wider text-peach-clay uppercase">
              Product
            </span>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <Link href="/login">Sign In</Link>
            <Link href="/signup">Start Planning</Link>
          </nav>
        </div>
        <div className="mt-10 flex flex-col justify-between gap-3 border-t border-warm-taupe/20 pt-6 text-xs text-warm-taupe sm:flex-row">
          <p>© {new Date().getFullYear()} Make My Marriage. All rights reserved.</p>
          <p>One wedding. Both families. One shared experience.</p>
        </div>
      </div>
    </footer>
  );
}
