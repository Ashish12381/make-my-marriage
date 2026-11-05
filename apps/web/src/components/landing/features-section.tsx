import { LandingIcon } from './landing-icon';

export function FeaturesSection() {
  return (
    <section
      className="w-full bg-sand-alt/55 py-space-xl lg:py-32 border-y border-outline/60"
      id="features"
    >
      <div className="mx-auto max-w-[1440px] px-margin-mobile lg:px-margin">
        <div className="max-w-3xl">
          <span className="font-label-md text-label-md uppercase tracking-wider text-primary font-bold">
            {'WEDDING PLANNING'}
          </span>
          <h2 className="mt-space-xs font-headline-lg text-headline-lg font-bold tracking-tight text-espresso">
            {'\n          Everything you need for your big day.\n        '}
          </h2>
          <p className="mt-space-sm font-body-lg text-body-lg text-secondary">
            {
              '\n          From the first planning conversation to the final celebration, everything stays connected without spreadsheets or fragmented messaging groups.\n        '
            }
          </p>
        </div>
        <div className="mt-space-lg grid grid-cols-1 gap-space-lg md:grid-cols-2">
          <div className="flex flex-col justify-between rounded-2xl bg-surface border border-outline p-space-lg shadow-sm">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sand-alt text-primary border border-outline">
                <LandingIcon name="diversity_1" className="text-[24px]" />
              </div>
              <h3 className="mt-space-md font-headline-sm text-headline-sm font-bold text-espresso">
                {'Plan Together'}
              </h3>
              <p className="mt-space-xs font-body-md text-body-md text-secondary">
                {
                  'Coordinate multiple events, assign specific module permissions to family members, and keep both sides aligned effortlessly.'
                }
              </p>
              <p className="mt-space-sm rounded-lg bg-surface-container-low border border-outline/60 p-space-sm font-body-sm text-body-sm italic text-secondary">
                {'“Clear roles for parents, siblings, and co-hosts without chaotic group chats.”'}
              </p>
            </div>
            <div className="mt-space-md rounded-xl bg-surface-container-low border border-outline/70 p-space-sm">
              <p className="font-label-sm text-label-sm font-bold uppercase text-secondary">
                {'System Roles & Responsibilities'}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-surface border border-outline px-3 py-1 text-espresso shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-primary"></span>
                  <span className="font-label-sm text-label-sm font-semibold">
                    {'Wedding Admin'}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-surface border border-outline px-3 py-1 text-espresso shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-espresso"></span>
                  <span className="font-label-sm text-label-sm font-semibold">
                    {'Organizer · Logistics Lead'}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-surface border border-outline px-3 py-1 text-espresso shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-peach-clay"></span>
                  <span className="font-label-sm text-label-sm font-semibold">
                    {'Organizer · Sangeet Lead'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-2xl bg-surface border border-outline p-space-lg shadow-sm">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sand-alt text-primary border border-outline">
                <LandingIcon name="payments" className="text-[24px]" />
              </div>
              <h3 className="mt-space-md font-headline-sm text-headline-sm font-bold text-espresso">
                {'Manage Every Expense'}
              </h3>
              <p className="mt-space-xs font-body-md text-body-md text-secondary">
                {'Track agreed costs, vendor advances, and remaining balances in one clear view.'}
              </p>
              <p className="mt-space-sm rounded-lg bg-surface-container-low border border-outline/60 p-space-sm font-body-sm text-body-sm italic text-secondary">
                {'“Know exactly what is paid and what is due across every multi-event vendor.”'}
              </p>
            </div>
            <div className="mt-space-md rounded-xl bg-surface-container-low border border-outline/70 p-space-sm">
              <div className="flex items-center justify-between font-label-sm text-label-sm">
                <span className="font-semibold text-espresso">{'Agreed Vendor Costs'}</span>
                <span className="font-bold text-primary">{'₹18,50,000 Total'}</span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-sand-alt border border-outline/60">
                <div className="h-full rounded-full bg-primary" style={{ width: '66.5%' }}></div>
              </div>
              <div className="mt-2 flex items-center justify-between font-label-sm text-label-sm text-secondary">
                <span>{'₹12,30,000 Amount Paid'}</span>
                <span className="font-semibold text-amber-ink">{'₹6,20,000 Outstanding'}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-2xl bg-surface border border-outline p-space-lg shadow-sm">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sand-alt text-primary border border-outline">
                <LandingIcon name="mark_email_read" className="text-[24px]" />
              </div>
              <h3 className="mt-space-md font-headline-sm text-headline-sm font-bold text-espresso">
                {'Invite Effortlessly'}
              </h3>
              <p className="mt-space-xs font-body-md text-body-md text-secondary">
                {
                  'Send one secure invitation link per family with independent Yes/No RSVP responses per sub-event and zero app downloads.'
                }
              </p>
              <p className="mt-space-sm rounded-lg bg-surface-container-low border border-outline/60 p-space-sm font-body-sm text-body-sm italic text-secondary">
                {'“Intuitive for elders and guests on mobile, with sub-event privacy built-in.”'}
              </p>
            </div>
            <div className="mt-space-md rounded-xl bg-surface-container-low border border-outline/70 p-space-sm">
              <div className="flex items-center justify-between text-espresso">
                <span className="font-label-sm text-label-sm font-bold">{'Sharma Family'}</span>
                <span className="rounded bg-sand-alt border border-outline px-2 py-0.5 font-label-sm text-label-sm text-espresso font-medium">
                  {'1 Link · No Login'}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-surface border border-outline/60 p-1.5">
                  <span className="block font-label-sm text-label-sm text-secondary">
                    {'Haldi'}
                  </span>
                  <span className="font-label-sm text-label-sm font-bold text-sage">
                    {'Attending'}
                  </span>
                </div>
                <div className="rounded-lg bg-surface border border-outline/60 p-1.5">
                  <span className="block font-label-sm text-label-sm text-secondary">
                    {'Sangeet'}
                  </span>
                  <span className="font-label-sm text-label-sm font-bold text-sage">
                    {'Attending'}
                  </span>
                </div>
                <div className="rounded-lg bg-surface border border-outline/60 p-1.5">
                  <span className="block font-label-sm text-label-sm text-secondary">
                    {'Wedding'}
                  </span>
                  <span className="font-label-sm text-label-sm font-bold text-sage">
                    {'Attending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-2xl bg-surface border border-outline p-space-lg shadow-sm">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sand-alt text-primary border border-outline">
                <LandingIcon name="photo_camera" className="text-[24px]" />
              </div>
              <h3 className="mt-space-md font-headline-sm text-headline-sm font-bold text-espresso">
                {'Celebrate & Share'}
              </h3>
              <p className="mt-space-xs font-body-md text-body-md text-secondary">
                {
                  'Share a dedicated celebration portal with schedules, venue maps, livestream access, and automated guest photo albums.'
                }
              </p>
              <p className="mt-space-sm rounded-lg bg-surface-container-low border border-outline/60 p-space-sm font-body-sm text-body-sm italic text-secondary">
                {'“Guests upload candid photos instantly via QR code without account creation.”'}
              </p>
            </div>
            <div className="mt-space-md rounded-xl bg-surface-container-low border border-outline/70 p-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-brick animate-pulse"></span>
                  <span className="font-label-sm text-label-sm font-bold text-espresso">
                    {'YouTube Live Stream Connected'}
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-secondary">
                  {'5 Event Albums'}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full bg-surface border border-outline/60 px-2.5 py-1 font-label-sm text-label-sm text-secondary">
                  {'QR Code Table Cards'}
                </span>
                <span className="rounded-full bg-sand-alt border border-outline px-2.5 py-1 font-label-sm text-label-sm font-bold text-espresso">
                  {'Direct Upload'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
