import { LandingIcon } from './landing-icon';

export function VendorsSection() {
  return (
    <section
      className="w-full bg-sand-alt/55 py-space-xl lg:py-32 border-y border-outline/60"
      id="vendors"
    >
      <p className="mx-auto max-w-[1440px] px-margin-mobile lg:px-margin mb-4 text-center font-label-md text-label-md text-secondary">
        {'Illustrative vendor results · not live listings'}
      </p>
      <div className="mx-auto max-w-[1440px] px-margin-mobile lg:px-margin">
        <div className="flex flex-col justify-between gap-space-md md:flex-row md:items-end">
          <div>
            <span className="font-label-md text-label-md uppercase tracking-wider text-primary font-bold">
              {'NEARBY VENDORS'}
            </span>
            <h2 className="mt-space-xs font-headline-lg text-headline-lg font-bold tracking-tight text-espresso">
              {'Find the right people nearby.'}
            </h2>
            <p className="mt-space-sm max-w-2xl font-body-lg text-body-lg text-secondary">
              {
                'Discover wedding vendors near your venue and keep your shortlist organized in one place.'
              }
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-surface border border-outline px-4 py-1.5 font-label-sm text-label-sm text-secondary shadow-xs">
            <LandingIcon name="location_on" className="text-[16px] text-primary" />
            <span>{'Filtering within 15 km of The Oberoi Rajvilas, Jaipur'}</span>
          </div>
        </div>
        <div className="mt-space-lg grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-surface border border-outline p-space-md shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="rounded bg-sand-alt border border-outline/70 px-2 py-0.5 font-label-sm text-label-sm font-semibold text-primary">
                {'Photography'}
              </span>
              <div className="flex items-center gap-1 font-label-sm text-label-sm font-bold text-espresso">
                <LandingIcon name="star" className="text-amber-warm text-[16px]" />
                {' 4.9\n            '}
              </div>
            </div>
            <h3 className="mt-space-sm font-label-lg text-label-lg font-bold text-espresso">
              {'Pixel Storytellers'}
            </h3>
            <p className="font-body-sm text-body-sm text-secondary">
              {'2.4 km from venue · Photography'}
            </p>
            <div className="mt-space-md flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-secondary">
                {'Add your own notes and quotations'}
              </span>
              <span className="rounded-lg bg-surface border border-outline px-3 py-1 font-label-sm text-label-sm font-bold text-primary transition">
                {'Shortlist'}
              </span>
            </div>
          </div>
          <div className="rounded-xl bg-surface border border-outline p-space-md shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="rounded bg-sand-alt border border-outline/70 px-2 py-0.5 font-label-sm text-label-sm font-semibold text-primary">
                {'Mehendi Artist'}
              </span>
              <div className="flex items-center gap-1 font-label-sm text-label-sm font-bold text-espresso">
                <LandingIcon name="star" className="text-amber-warm text-[16px]" />
                {' 4.8\n            '}
              </div>
            </div>
            <h3 className="mt-space-sm font-label-lg text-label-lg font-bold text-espresso">
              {'Henna Traditions by Pooja'}
            </h3>
            <p className="font-body-sm text-body-sm text-secondary">
              {'4.1 km from venue · Mehendi'}
            </p>
            <div className="mt-space-md flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-secondary">
                {'Organic Rajasthani cone'}
              </span>
              <span className="rounded-lg bg-surface border border-outline px-3 py-1 font-label-sm text-label-sm font-bold text-primary transition">
                {'Shortlist'}
              </span>
            </div>
          </div>
          <div className="rounded-xl bg-surface border border-outline p-space-md shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="rounded bg-sand-alt border border-outline/70 px-2 py-0.5 font-label-sm text-label-sm font-semibold text-primary">
                {'Decor & Florals'}
              </span>
              <div className="flex items-center gap-1 font-label-sm text-label-sm font-bold text-espresso">
                <LandingIcon name="star" className="text-amber-warm text-[16px]" />
                {' 5.0\n            '}
              </div>
            </div>
            <h3 className="mt-space-sm font-label-lg text-label-lg font-bold text-espresso">
              {'Aura Floral & Production'}
            </h3>
            <p className="font-body-sm text-body-sm text-secondary">
              {'1.8 km from venue · Decoration'}
            </p>
            <div className="mt-space-md flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-secondary">
                {'Mandap & Trussing'}
              </span>
              <span className="rounded-lg bg-sand-alt border border-outline px-3 py-1 font-label-sm text-label-sm font-bold text-primary">
                {'Shortlisted ✓'}
              </span>
            </div>
          </div>
          <div className="rounded-xl bg-surface border border-outline p-space-md shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="rounded bg-sand-alt border border-outline/70 px-2 py-0.5 font-label-sm text-label-sm font-semibold text-primary">
                {'DJ & Sound'}
              </span>
              <div className="flex items-center gap-1 font-label-sm text-label-sm font-bold text-espresso">
                <LandingIcon name="star" className="text-amber-warm text-[16px]" />
                {' 4.9\n            '}
              </div>
            </div>
            <h3 className="mt-space-sm font-label-lg text-label-lg font-bold text-espresso">
              {'Rhythm Beats Entertainment'}
            </h3>
            <p className="font-body-sm text-body-sm text-secondary">
              {'3.0 km from venue · Music & Sound'}
            </p>
            <div className="mt-space-md flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-secondary">
                {'Live Dhol + Line Array Sound'}
              </span>
              <span className="rounded-lg bg-surface border border-outline px-3 py-1 font-label-sm text-label-sm font-bold text-primary transition">
                {'Shortlist'}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-space-md text-center">
          <span className="font-label-sm text-label-sm text-secondary">
            {
              '\n          Direct contact with local wedding professionals — contact and book outside the app.\n        '
            }
          </span>
        </div>
      </div>
    </section>
  );
}
