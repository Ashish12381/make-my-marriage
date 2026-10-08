export function HowItWorksSection() {
  return (
    <section
      className="w-full bg-sand-alt/55 py-space-xl lg:py-32 border-y border-outline/60"
      id="how-it-works"
    >
      <div className="mx-auto max-w-[1440px] px-margin-mobile lg:px-margin">
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-label-md text-label-md uppercase tracking-wider text-primary font-bold">
            {'HOW IT WORKS'}
          </span>
          <h2 className="mt-space-xs font-headline-lg text-headline-lg font-bold tracking-tight text-espresso">
            {'From planning to celebration in three simple steps.'}
          </h2>
          <p className="mt-space-sm font-body-lg text-body-lg text-secondary">
            {'No complicated setup required. Coordinate both families effortlessly.'}
          </p>
        </div>
        <div className="mt-space-xl grid grid-cols-1 gap-space-lg md:grid-cols-3">
          <div className="flex flex-col justify-between rounded-2xl bg-surface border border-outline p-space-lg shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sand-alt border border-outline font-headline-sm text-headline-sm font-bold text-primary">
                  {'1'}
                </div>
                <span className="font-label-sm text-label-sm text-secondary">{'01 / Setup'}</span>
              </div>
              <h3 className="mt-space-md font-headline-sm text-headline-sm font-bold text-espresso">
                {'Create your wedding'}
              </h3>
              <p className="mt-space-xs font-body-md text-body-md text-secondary">
                {
                  'Add your wedding details and create your events (Haldi, Mehendi, Sangeet, Wedding, Reception).'
                }
              </p>
            </div>
            <div className="mt-space-md rounded-lg bg-surface-container-low border border-outline/60 p-space-sm font-label-sm text-label-sm text-secondary">
              {'✓ Add dates and venues'}
              <br />
              {'✓ Custom event timeline'}
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-2xl bg-surface border border-outline p-space-lg shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sand-alt border border-outline font-headline-sm text-headline-sm font-bold text-primary">
                  {'2'}
                </div>
                <span className="font-label-sm text-label-sm text-secondary">
                  {'02 / Collaborate'}
                </span>
              </div>
              <h3 className="mt-space-md font-headline-sm text-headline-sm font-bold text-espresso">
                {'Invite your family'}
              </h3>
              <p className="mt-space-xs font-body-md text-body-md text-secondary">
                {
                  'Invite your partner and trusted family members to plan together with designated responsibilities.'
                }
              </p>
            </div>
            <div className="mt-space-md rounded-lg bg-surface-container-low border border-outline/60 p-space-sm font-label-sm text-label-sm text-secondary">
              {'✓ Both families in sync'}
              <br />
              {'✓ Module-specific organizer access'}
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-2xl bg-surface border border-outline p-space-lg shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary font-headline-sm text-headline-sm font-bold text-white shadow-xs">
                  {'3'}
                </div>
                <span className="font-label-sm text-label-sm text-secondary">
                  {'03 / Celebrate'}
                </span>
              </div>
              <h3 className="mt-space-md font-headline-sm text-headline-sm font-bold text-espresso">
                {'Plan and celebrate'}
              </h3>
              <p className="mt-space-xs font-body-md text-body-md text-secondary">
                {'Manage events, guests, expenses, photos and your wedding website from one place.'}
              </p>
            </div>
            <div className="mt-space-md rounded-lg bg-surface-container-low border border-outline/60 p-space-sm font-label-sm text-label-sm text-secondary">
              {'✓ Event-wise RSVP tracking'}
              <br />
              {'✓ Shared memory gallery'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
