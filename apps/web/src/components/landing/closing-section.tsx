import Link from 'next/link';
import { LandingIcon } from './landing-icon';

export function ClosingSection() {
  return (
    <section className="w-full py-space-xl lg:py-32" id="start-planning">
      <div className="mx-auto max-w-[1440px] px-margin-mobile lg:px-margin">
        <div className="relative overflow-hidden rounded-3xl bg-espresso p-space-lg text-oat-milk shadow-2xl lg:p-24 border border-espresso">
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl"></div>
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-peach-clay/20 blur-3xl"></div>
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <span className="font-label-md text-label-md uppercase tracking-widest text-peach-clay font-bold">
              {'Start In Seconds'}
            </span>
            <h2 className="mt-space-sm font-display text-display font-bold tracking-tight text-oat-milk lg:text-[4rem] lg:leading-[4.5rem]">
              {'\n            Make room for what really matters.\n          '}
            </h2>
            <p className="mt-space-md font-body-lg text-body-lg text-warm-taupe">
              {
                'Bring every plan, every person and every celebration together in one organized place.'
              }
            </p>
            <div className="mt-space-lg flex flex-wrap items-center justify-center gap-space-md">
              <Link
                className="inline-flex h-12 items-center justify-center gap-space-xs rounded-xl bg-primary px-space-lg font-label-lg text-label-lg font-semibold text-warm-cream shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover"
                href="/signup"
              >
                <span>{'Start Planning Your Wedding'}</span>
                <LandingIcon name="arrow_forward" className="text-[20px]" />
              </Link>
              <Link
                className="inline-flex h-12 items-center justify-center rounded-xl bg-transparent border border-warm-taupe/40 px-space-lg font-label-lg text-label-lg font-semibold text-oat-milk hover:bg-warm-cream/10 transition-colors"
                href="/login"
              >
                {'\n              Sign In\n            '}
              </Link>
            </div>
            <div className="mt-space-md flex flex-wrap items-center justify-center gap-space-md text-warm-taupe/90 font-label-sm text-label-sm">
              <span>{'✓ One place for your entire wedding'}</span>
              <span>{'·'}</span>
              <span>{'✓ Built for Indian weddings and both families'}</span>
              <span>{'·'}</span>
              <span>{'✓ Simple for everyone to use'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
