import Link from 'next/link';
import { LandingIcon } from './landing-icon';

export function HeroSection() {
  return (
    <section
      className="relative w-full overflow-hidden pb-space-xl pt-space-md lg:pb-32 lg:pt-space-lg"
      id="overview"
    >
      <p className="mx-auto max-w-[1440px] px-margin-mobile lg:px-margin mb-4 text-center font-label-md text-label-md text-secondary">
        {'Sample preview · Actions shown are illustrative'}
      </p>
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[860px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-peach-clay/20 via-sand-alt/40 to-peach-clay/10 blur-3xl"></div>
      <div className="pointer-events-none absolute top-1/3 -right-32 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl"></div>
      <div className="mx-auto max-w-[1440px] px-margin-mobile lg:px-margin">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <div className="inline-flex items-center gap-space-xs rounded-full bg-surface border border-outline px-4 py-1.5 shadow-xs">
            <LandingIcon name="auto_awesome" className="text-[16px] text-primary" />
            <span className="font-label-md text-label-md uppercase tracking-wider text-espresso font-bold">
              {'ONE PLACE FOR YOUR ENTIRE WEDDING'}
            </span>
          </div>
          <h1 className="mt-space-md font-display text-display font-extrabold tracking-tight text-espresso lg:text-[4rem] lg:leading-[4.5rem]">
            {'\n          Less planning. '}
            <span className="text-primary">{'More celebrating.'}</span>
          </h1>
          <p className="mt-space-md max-w-2xl font-body-lg text-body-lg text-secondary">
            {
              '\n          Plan every event, coordinate both families, manage guests and expenses, and share every wedding moment — all from one beautifully organized place.\n        '
            }
          </p>
          <div className="mt-space-lg flex flex-wrap items-center justify-center gap-space-md">
            <Link
              className="inline-flex h-12 items-center justify-center gap-space-xs rounded-xl bg-primary px-space-lg font-label-lg text-label-lg font-semibold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-hover hover:shadow-lg"
              href="/signup"
            >
              <span>{'Start Planning'}</span>
              <LandingIcon name="arrow_forward" className="text-[20px]" />
            </Link>
            <Link
              className="inline-flex h-12 items-center justify-center gap-space-xs rounded-xl bg-surface border border-outline px-space-lg font-label-lg text-label-lg font-semibold text-espresso shadow-xs transition-all hover:bg-surface-container-low"
              href="#how-it-works"
            >
              <LandingIcon name="play_circle" className="text-primary text-[20px]" />
              <span>{'See How It Works'}</span>
            </Link>
          </div>
          <div className="mt-space-md flex items-center justify-center gap-2">
            <LandingIcon name="verified" className="text-[18px] text-primary" />
            <span className="font-label-sm text-label-sm text-secondary">
              {'Built for Indian weddings. Simple for everyone.'}
            </span>
          </div>
        </div>
        <div className="relative mx-auto mt-space-xl max-w-6xl">
          <div className="relative overflow-hidden rounded-2xl bg-surface border border-outline p-space-md shadow-xl lg:p-space-lg">
            <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-md border-b border-outline/60">
              <div className="flex items-center gap-space-md">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-brick/70"></span>
                  <span className="h-3 w-3 rounded-full bg-amber-warm/70"></span>
                  <span className="h-3 w-3 rounded-full bg-sage/70"></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                  <h2 className="font-headline-sm text-headline-sm font-bold text-espresso">
                    {'Priya & Rahul’s Wedding'}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-space-sm">
                <span className="inline-flex items-center gap-1 rounded-full bg-sand-alt border border-outline px-3 py-1 font-label-sm text-label-sm font-semibold text-espresso">
                  <LandingIcon name="timer" className="text-[14px] text-primary" />
                  {' 42 Days to Go\n              '}
                </span>
                <div className="flex items-center -space-x-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary font-label-sm text-label-sm text-white">
                    {'PR'}
                  </div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-espresso font-label-sm text-label-sm text-white">
                    {'RS'}
                  </div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary font-label-sm text-label-sm text-white">
                    {'AK'}
                  </div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sand-alt border border-outline font-label-sm text-label-sm text-espresso">
                    {'+1'}
                  </div>
                </div>
                <span className="hidden font-label-sm text-label-sm text-secondary sm:inline">
                  {'4 Family Admins active'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-space-sm lg:grid-cols-4 pt-space-md">
              <div className="rounded-xl bg-surface-container-low border border-outline/70 p-space-sm">
                <p className="font-label-sm text-label-sm text-secondary">{'Total Events'}</p>
                <p className="mt-1 font-headline-sm text-headline-sm font-bold text-espresso">
                  {'5 Events'}
                </p>
                <p className="font-label-sm text-label-sm text-primary font-medium">
                  {'Haldi to Reception'}
                </p>
              </div>
              <div className="rounded-xl bg-surface-container-low border border-outline/70 p-space-sm">
                <p className="font-label-sm text-label-sm text-secondary">{'Invited Families'}</p>
                <p className="mt-1 font-headline-sm text-headline-sm font-bold text-espresso">
                  {'142 Families'}
                </p>
                <p className="font-label-sm text-label-sm text-secondary">
                  {'42 responses received'}
                </p>
              </div>
              <div className="rounded-xl bg-surface-container-low border border-outline/70 p-space-sm">
                <p className="font-label-sm text-label-sm text-secondary">{'Amount Paid'}</p>
                <p className="mt-1 font-headline-sm text-headline-sm font-bold text-espresso">
                  {'₹12,30,000'}
                </p>
                <p className="font-label-sm text-label-sm text-sage font-medium">
                  {'Agreed: ₹18,50,000'}
                </p>
              </div>
              <div className="rounded-xl bg-surface-container-low border border-outline/70 p-space-sm">
                <p className="font-label-sm text-label-sm text-secondary">
                  {'Outstanding Balance'}
                </p>
                <p className="mt-1 font-headline-sm text-headline-sm font-bold text-espresso">
                  {'₹6,20,000'}
                </p>
                <p className="font-label-sm text-label-sm text-amber-ink font-medium">
                  {'Across 28 vendors'}
                </p>
              </div>
            </div>
            <div className="mt-space-md grid grid-cols-1 gap-space-md lg:grid-cols-12">
              <div className="rounded-xl bg-surface-container-low border border-outline/70 p-space-md lg:col-span-7">
                <div className="flex items-center justify-between pb-space-sm">
                  <h3 className="font-label-lg text-label-lg font-bold text-espresso">
                    {'Event Sequence & Logistics'}
                  </h3>
                  <span className="font-label-sm text-label-sm text-primary font-semibold">
                    {'Both Families Synced'}
                  </span>
                </div>
                <div className="space-y-space-sm">
                  <div className="flex items-center justify-between rounded-lg bg-surface border border-outline/60 p-space-sm shadow-xs">
                    <div className="flex items-center gap-space-sm">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sand-alt border border-outline font-label-md text-espresso font-bold">
                        {'12'}
                      </div>
                      <div>
                        <h4 className="font-label-lg text-label-lg font-semibold text-espresso">
                          {'Haldi Ceremony'}
                        </h4>
                        <p className="font-body-sm text-body-sm text-secondary">
                          {'Nov 12 · 10:00 AM · Courtyard Poolside'}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-sand-alt border border-outline/70 px-2.5 py-0.5 font-label-sm text-label-sm font-medium text-espresso">
                      {'32 Yes · 4 No · 6 Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-surface border border-outline/60 p-space-sm shadow-xs">
                    <div className="flex items-center gap-space-sm">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sand-alt border border-outline font-label-md text-espresso font-bold">
                        {'12'}
                      </div>
                      <div>
                        <h4 className="font-label-lg text-label-lg font-semibold text-espresso">
                          {'Mehendi & Sundowner'}
                        </h4>
                        <p className="font-body-sm text-body-sm text-secondary">
                          {'Nov 12 · 4:00 PM · Shahi Bagh Lawns'}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-sand-alt border border-outline/70 px-2.5 py-0.5 font-label-sm text-label-sm font-medium text-espresso">
                      {'26 Yes · 6 No · 10 Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-surface border border-outline/60 p-space-sm shadow-xs">
                    <div className="flex items-center gap-space-sm">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 font-label-md font-bold">
                        {'13'}
                      </div>
                      <div>
                        <h4 className="font-label-lg text-label-lg font-semibold text-espresso">
                          {'Sangeet Extravaganza'}
                        </h4>
                        <p className="font-body-sm text-body-sm text-secondary">
                          {'Nov 13 · 7:00 PM · Grand Crystal Ballroom'}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-primary px-2.5 py-0.5 font-label-sm text-label-sm font-medium text-white">
                      {'28 Yes · 7 No · 9 Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-surface border border-outline/60 p-space-sm shadow-xs">
                    <div className="flex items-center gap-space-sm">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 font-label-md font-bold">
                        {'14'}
                      </div>
                      <div>
                        <h4 className="font-label-lg text-label-lg font-semibold text-espresso">
                          {'Wedding & Sacred Pheras'}
                        </h4>
                        <p className="font-body-sm text-body-sm text-secondary">
                          {'Nov 14 · 10:30 AM · Mandap Pavilion'}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-primary px-2.5 py-0.5 font-label-sm text-label-sm font-medium text-white">
                      {'40 Yes · 2 No · 5 Pending'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-surface-container-low border border-outline/70 p-space-md lg:col-span-5">
                <div className="flex items-center justify-between pb-space-sm">
                  <h3 className="font-label-lg text-label-lg font-bold text-espresso">
                    {'Vendor Payments Summary'}
                  </h3>
                  <span className="font-label-sm text-label-sm font-semibold text-primary">
                    {'View All'}
                  </span>
                </div>
                <div className="space-y-space-sm">
                  <div className="rounded-lg bg-surface border border-outline/60 p-space-sm shadow-xs">
                    <div className="flex items-center justify-between">
                      <p className="font-label-md text-label-md font-semibold text-espresso">
                        {'Grand Heritage Palace'}
                      </p>
                      <span className="rounded-full bg-sage/15 text-sage border border-sage/30 px-2 py-0.5 font-label-sm text-label-sm font-semibold">
                        {'Paid'}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between font-body-sm text-body-sm text-secondary">
                      <span>{'Venue Advance'}</span>
                      <span className="font-semibold text-espresso">{'₹5,00,000'}</span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-surface border border-outline/60 p-space-sm shadow-xs">
                    <div className="flex items-center justify-between">
                      <p className="font-label-md text-label-md font-semibold text-espresso">
                        {'The Floral Studio'}
                      </p>
                      <span className="rounded-full bg-amber-warm/15 text-amber-ink border border-amber-warm/30 px-2 py-0.5 font-label-sm text-label-sm font-semibold">
                        {'Partial'}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between font-body-sm text-body-sm text-secondary">
                      <span>{'Decor & Stage Mandap'}</span>
                      <span className="font-semibold text-espresso">{'₹1,80,000'}</span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-surface border border-outline/60 p-space-sm shadow-xs">
                    <div className="flex items-center justify-between">
                      <p className="font-label-md text-label-md font-semibold text-espresso">
                        {'Epic Films Cinema'}
                      </p>
                      <span className="rounded-full bg-sand-alt border border-outline px-2 py-0.5 font-label-sm text-label-sm font-semibold text-secondary">
                        {'Advance'}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between font-body-sm text-body-sm text-secondary">
                      <span>{'Photo & 4K Drone'}</span>
                      <span className="font-semibold text-espresso">{'₹1,20,000'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative -mt-16 ml-auto w-full max-w-sm rounded-3xl bg-espresso p-space-sm text-inverse-on-surface shadow-2xl lg:-mt-28 lg:mr-8 border border-espresso">
            <div className="overflow-hidden rounded-2xl bg-surface p-space-md text-on-surface shadow-md">
              <div className="flex items-center justify-between pb-space-sm border-b border-outline/60">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary"></span>
                  <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-secondary">
                    {'Guest Invitation'}
                  </span>
                </div>
                <span className="rounded-full bg-sand-alt border border-outline px-2 py-0.5 font-label-sm text-label-sm font-semibold text-espresso">
                  {'1 link. No login'}
                </span>
              </div>
              <div className="pt-space-xs text-center">
                <span className="font-headline-sm text-headline-sm font-bold text-espresso">
                  {'Welcome, Sharma Family'}
                </span>
                <p className="font-body-sm text-body-sm text-secondary">
                  {'You are cordially invited to celebrate with us'}
                </p>
              </div>
              <div className="mt-space-sm space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-surface-container-low border border-outline/60 p-2">
                  <div>
                    <p className="font-label-md text-label-md font-semibold text-espresso">
                      {'Haldi Ceremony'}
                    </p>
                    <p className="font-label-sm text-label-sm text-secondary">
                      {'Nov 12 · 10:00 AM'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md bg-sage text-white px-2 py-0.5 font-label-sm text-label-sm font-semibold">
                      {'✓ Yes'}
                    </span>
                    <span className="rounded-md bg-surface border border-outline px-2 py-0.5 font-label-sm text-label-sm text-secondary">
                      {'No'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-surface-container-low border border-outline/60 p-2">
                  <div>
                    <p className="font-label-md text-label-md font-semibold text-espresso">
                      {'Sangeet Night'}
                    </p>
                    <p className="font-label-sm text-label-sm text-secondary">
                      {'Nov 13 · 7:00 PM'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md bg-surface border border-outline px-2 py-0.5 font-label-sm text-label-sm text-secondary">
                      {'Yes'}
                    </span>
                    <span className="rounded-md bg-brick text-white px-2 py-0.5 font-label-sm text-label-sm font-semibold">
                      {'✕ No'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-surface-container-low border border-outline/60 p-2">
                  <div>
                    <p className="font-label-md text-label-md font-semibold text-espresso">
                      {'Wedding & Sacred Pheras'}
                    </p>
                    <p className="font-label-sm text-label-sm text-secondary">
                      {'Nov 14 · 10:30 AM'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md bg-sage text-white px-2 py-0.5 font-label-sm text-label-sm font-semibold">
                      {'✓ Yes'}
                    </span>
                    <span className="rounded-md bg-surface border border-outline px-2 py-0.5 font-label-sm text-label-sm text-secondary">
                      {'No'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-space-sm pt-space-xs">
                <span className="flex w-full items-center justify-center gap-1 rounded-xl bg-primary py-2.5 font-label-md text-label-md font-semibold text-white shadow transition">
                  <span>{'View Wedding Schedule & Maps'}</span>
                  <LandingIcon name="arrow_outward" className="text-[16px]" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
