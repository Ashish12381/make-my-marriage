import { LandingIcon } from './landing-icon';

export function ExpensesSection() {
  return (
    <section
      className="w-full bg-sand-alt/55 py-space-xl lg:py-32 border-y border-outline/60"
      id="expenses"
    >
      <p className="mx-auto max-w-[1440px] px-margin-mobile lg:px-margin mb-4 text-center font-label-md text-label-md text-secondary">
        {'Illustrative wedding preview'}
      </p>
      <div className="mx-auto max-w-[1440px] px-margin-mobile lg:px-margin">
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-label-md text-label-md uppercase tracking-wider text-primary font-bold">
            {'EXPENSE TRACKING'}
          </span>
          <h2 className="mt-space-xs font-headline-lg text-headline-lg font-bold tracking-tight text-espresso">
            {'Know where every rupee goes.'}
          </h2>
          <p className="mt-space-sm font-body-lg text-body-lg text-secondary">
            {'Track actual wedding expenses, payments and outstanding balances in one place.'}
          </p>
        </div>
        <div className="mt-space-xl overflow-hidden rounded-2xl bg-surface border border-outline shadow-xl">
          <div className="grid grid-cols-2 divide-y md:grid-cols-4 md:divide-y-0 md:divide-x divide-outline/60 bg-surface-container-low border-b border-outline/60">
            <div className="p-space-md">
              <span className="font-label-sm text-label-sm text-secondary">{'Agreed Costs'}</span>
              <p className="mt-1 font-headline-md text-headline-md font-bold text-espresso">
                {'₹18,50,000'}
              </p>
              <span className="font-label-sm text-label-sm text-secondary">
                {'Total agreed contracts'}
              </span>
            </div>
            <div className="p-space-md">
              <span className="font-label-sm text-label-sm text-secondary">{'Amount Paid'}</span>
              <p className="mt-1 font-headline-md text-headline-md font-bold text-sage">
                {'₹12,30,000'}
              </p>
              <span className="font-label-sm text-label-sm text-sage font-medium">
                {'Recorded payments'}
              </span>
            </div>
            <div className="p-space-md">
              <span className="font-label-sm text-label-sm text-secondary">
                {'Outstanding Balance'}
              </span>
              <p className="mt-1 font-headline-md text-headline-md font-bold text-amber-ink">
                {'₹6,20,000'}
              </p>
              <span className="font-label-sm text-label-sm text-amber-ink font-medium">
                {'Due on milestones'}
              </span>
            </div>
            <div className="p-space-md">
              <span className="font-label-sm text-label-sm text-secondary">{'Active Vendors'}</span>
              <p className="mt-1 font-headline-md text-headline-md font-bold text-espresso">
                {'28 Vendors'}
              </p>
              <span className="font-label-sm text-label-sm text-secondary">
                {'Across 5 celebrations'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm bg-sand-alt/80 border-b border-outline/60 px-space-md py-3 text-espresso">
            <LandingIcon name="account_balance_wallet" className="text-[20px] text-primary" />
            <p className="font-body-sm text-body-sm font-medium">
              {
                'All vendor agreements, payment receipts, and due dates consolidated into a single family view.'
              }
            </p>
          </div>
          <div className="grid grid-cols-1 gap-space-lg p-space-md lg:grid-cols-12 lg:p-space-lg">
            <div className="space-y-space-md lg:col-span-5">
              <div>
                <h3 className="font-label-lg text-label-lg font-bold text-espresso">
                  {'Actual Payments by Scope'}
                </h3>
                <div className="mt-space-sm space-y-2">
                  <div>
                    <div className="flex justify-between font-label-sm text-label-sm">
                      <span className="text-espresso font-semibold">{'Wedding-wide'}</span>
                      <span className="text-secondary">{'65% (₹8,00,000)'}</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-sand-alt">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: '65%' }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-label-sm text-label-sm">
                      <span className="text-espresso font-semibold">{'Sangeet Night'}</span>
                      <span className="text-secondary">{'15% (₹1,80,000)'}</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-sand-alt">
                      <div
                        className="h-full rounded-full bg-peach-clay"
                        style={{ width: '15%' }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-label-sm text-label-sm">
                      <span className="text-espresso font-semibold">{'Reception Gala'}</span>
                      <span className="text-secondary">{'12% (₹1,50,000)'}</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-sand-alt">
                      <div
                        className="h-full rounded-full bg-espresso"
                        style={{ width: '12%' }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-label-sm text-label-sm">
                      <span className="text-espresso font-semibold">{'Mehendi & Haldi'}</span>
                      <span className="text-secondary">{'8% (₹1,00,000)'}</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-sand-alt">
                      <div
                        className="h-full rounded-full bg-secondary"
                        style={{ width: '8%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-surface-container-low border border-outline/70 p-space-sm">
                <span className="font-label-sm text-label-sm font-bold text-espresso">
                  {'Top Vendor Categories'}
                </span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="rounded-md bg-surface border border-outline/60 px-2.5 py-1 font-label-sm text-label-sm text-espresso">
                    {'Venue & Catering (48%)'}
                  </span>
                  <span className="rounded-md bg-surface border border-outline/60 px-2.5 py-1 font-label-sm text-label-sm text-espresso">
                    {'Decor & Florals (22%)'}
                  </span>
                  <span className="rounded-md bg-surface border border-outline/60 px-2.5 py-1 font-label-sm text-label-sm text-espresso">
                    {'Photo & Cinema (14%)'}
                  </span>
                  <span className="rounded-md bg-surface border border-outline/60 px-2.5 py-1 font-label-sm text-label-sm text-espresso">
                    {'Attire & Jewellery (10%)'}
                  </span>
                  <span className="rounded-md bg-surface border border-outline/60 px-2.5 py-1 font-label-sm text-label-sm text-espresso">
                    {'Music & Sound (6%)'}
                  </span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto lg:col-span-7">
              <div className="flex items-center justify-between pb-space-sm">
                <h3 className="font-label-lg text-label-lg font-bold text-espresso">
                  {'Recent Payments & Contracts'}
                </h3>
                <span className="font-label-sm text-label-sm font-semibold text-primary">
                  {'Vendor Payments'}
                </span>
              </div>
              <div className="space-y-space-sm">
                <div className="rounded-xl bg-surface border border-outline/70 p-space-sm shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-label-lg text-label-lg font-bold text-espresso">
                        {'Grand Heritage Palace'}
                      </h4>
                      <span className="rounded-full bg-sand-alt border border-outline px-2 py-0.5 font-label-sm text-label-sm text-espresso">
                        {'Single wedding-wide contract'}
                      </span>
                    </div>
                    <span className="rounded-full bg-sage/15 text-sage border border-sage/30 px-2 py-0.5 font-label-sm text-label-sm font-semibold">
                      {'₹5,00,000 Paid'}
                    </span>
                  </div>
                  <p className="mt-1 font-body-sm text-body-sm text-secondary">
                    {'Venue & Lawn services · Haldi · Sangeet · Wedding · Reception'}
                  </p>
                </div>
                <div className="rounded-xl bg-surface border border-outline/70 p-space-sm shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-label-lg text-label-lg font-bold text-espresso">
                        {'Aura Floral & Production'}
                      </h4>
                      <span className="rounded-full bg-sand-alt border border-outline px-2 py-0.5 font-label-sm text-label-sm text-espresso">
                        {'Decor & Stage Mandap'}
                      </span>
                    </div>
                    <span className="rounded-full bg-amber-warm/15 text-amber-ink border border-amber-warm/30 px-2 py-0.5 font-label-sm text-label-sm font-semibold">
                      {'₹1,80,000 Paid of ₹8,00,000'}
                    </span>
                  </div>
                  <p className="mt-1 font-body-sm text-body-sm text-secondary">
                    {'Mandap, Trussing & Lighting · Due Nov 10'}
                  </p>
                </div>
                <div className="rounded-xl bg-surface border border-outline/70 p-space-sm shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-label-lg text-label-lg font-bold text-espresso">
                        {'Royal Feast Catering'}
                      </h4>
                      <span className="rounded-full bg-sand-alt border border-outline px-2 py-0.5 font-label-sm text-label-sm text-espresso">
                        {'Wedding-wide catering'}
                      </span>
                    </div>
                    <span className="rounded-full bg-sage/15 text-sage border border-sage/30 px-2 py-0.5 font-label-sm text-label-sm font-semibold">
                      {'₹3,00,000 Paid'}
                    </span>
                  </div>
                  <p className="mt-1 font-body-sm text-body-sm text-secondary">
                    {'Catering services · Haldi · Sangeet · Wedding · Reception'}
                  </p>
                </div>
                <div className="rounded-xl bg-surface border border-outline/70 p-space-sm shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-label-lg text-label-lg font-bold text-espresso">
                        {'Pixel Storytellers'}
                      </h4>
                      <span className="rounded-full bg-sand-alt border border-outline px-2 py-0.5 font-label-sm text-label-sm text-espresso">
                        {'Photo & Cinema'}
                      </span>
                    </div>
                    <span className="rounded-full bg-amber-warm/15 text-amber-ink border border-amber-warm/30 px-2 py-0.5 font-label-sm text-label-sm font-semibold">
                      {'₹1,20,000 Paid of ₹1,20,000'}
                    </span>
                  </div>
                  <p className="mt-1 font-body-sm text-body-sm text-secondary">
                    {'Candid, drone & traditional video coverage'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="mx-auto max-w-[1440px] px-margin-mobile lg:px-margin mt-4 text-sm text-secondary text-center">
        {'Wedding-wide payments are counted once, separately from event-specific payments.'}
      </p>
    </section>
  );
}
