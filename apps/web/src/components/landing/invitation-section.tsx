import { LandingIcon } from './landing-icon';

export function InvitationSection() {
  return (
    <section className="w-full py-space-xl lg:py-32" id="family-rsvp">
      <p className="mx-auto max-w-[1440px] px-margin-mobile lg:px-margin mb-4 text-center font-label-md text-label-md text-secondary">
        {'Sample preview · Actions shown are illustrative'}
      </p>
      <div className="mx-auto max-w-[1440px] px-margin-mobile lg:px-margin">
        <div className="grid grid-cols-1 items-center gap-space-xl lg:grid-cols-12">
          <div className="mx-auto w-full max-w-sm lg:col-span-5">
            <div className="overflow-hidden rounded-3xl bg-espresso p-space-sm shadow-2xl border border-espresso">
              <div className="rounded-2xl bg-surface p-space-md text-on-surface">
                <div className="text-center">
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
                    {'Personalized Invitation'}
                  </span>
                  <h3 className="mt-1 font-headline-sm text-headline-sm font-bold text-espresso">
                    {'Priya & Rahul'}
                  </h3>
                  <p className="font-body-sm text-body-sm text-secondary">
                    {'November 12-15, 2027 · Jaipur'}
                  </p>
                </div>
                <div className="mt-space-md rounded-xl bg-surface-container-low border border-outline/70 p-3 text-center">
                  <p className="font-label-sm text-label-sm text-secondary">{'Honored Guest'}</p>
                  <p className="font-label-lg text-label-lg font-bold text-espresso">
                    {'The Sharma Family'}
                  </p>
                  <p className="font-label-sm text-label-sm text-secondary">
                    {'Please confirm your attendance for each event'}
                  </p>
                </div>
                <div className="mt-space-sm space-y-2.5">
                  <div className="rounded-lg bg-surface-container-low border border-outline/60 p-2.5">
                    <div className="flex justify-between font-label-sm text-label-sm">
                      <span className="font-bold text-espresso">{'Haldi Ceremony'}</span>
                      <span className="text-secondary">{'Nov 12 · 10 AM'}</span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <span className="flex-1 rounded-md bg-sage text-white py-1 font-label-sm text-label-sm font-semibold">
                        {'✓ Yes'}
                      </span>
                      <span className="flex-1 rounded-md bg-surface border border-outline/70 py-1 font-label-sm text-label-sm text-secondary">
                        {'No'}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-surface-container-low border border-outline/60 p-2.5">
                    <div className="flex justify-between font-label-sm text-label-sm">
                      <span className="font-bold text-espresso">{'Sangeet Night'}</span>
                      <span className="text-secondary">{'Nov 13 · 7 PM'}</span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <span className="flex-1 rounded-md bg-surface border border-outline/70 py-1 font-label-sm text-label-sm text-secondary">
                        {'Yes'}
                      </span>
                      <span className="flex-1 rounded-md bg-brick text-white py-1 font-label-sm text-label-sm font-bold">
                        {'✕ No'}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-surface-container-low border border-outline/60 p-2.5">
                    <div className="flex justify-between font-label-sm text-label-sm">
                      <span className="font-bold text-espresso">{'Wedding & Sacred Pheras'}</span>
                      <span className="text-secondary">{'Nov 14 · 10:30 AM'}</span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <span className="flex-1 rounded-md bg-sage text-white py-1 font-label-sm text-label-sm font-semibold">
                        {'✓ Yes'}
                      </span>
                      <span className="flex-1 rounded-md bg-surface border border-outline/70 py-1 font-label-sm text-label-sm text-secondary">
                        {'No'}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="mt-space-md block w-full rounded-xl bg-primary py-2.5 text-center font-label-md text-label-md font-semibold text-white shadow-sm">
                  {'\n                Update Responses\n              '}
                </span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <span className="font-label-md text-label-md uppercase tracking-wider text-primary font-bold">
              {'GUEST RSVP'}
            </span>
            <h2 className="mt-space-xs font-headline-lg text-headline-lg font-bold tracking-tight text-espresso">
              {'One invitation. Every celebration.'}
            </h2>
            <p className="mt-space-sm font-body-lg text-body-lg text-secondary">
              {
                'Invite each family once and let them respond separately to every event they are invited to. No guest account needed, no confusing forms.'
              }
            </p>
            <div className="mt-space-lg grid grid-cols-1 gap-space-sm sm:grid-cols-2">
              <div className="rounded-xl bg-surface border border-outline p-space-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sand-alt border border-outline text-primary">
                  <LandingIcon name="link" className="text-[20px]" />
                </div>
                <h3 className="mt-space-sm font-label-lg text-label-lg font-bold text-espresso">
                  {'1 Link. No Login Required'}
                </h3>
                <p className="mt-1 font-body-sm text-body-sm text-secondary">
                  {
                    'Guests tap their secure link to RSVP directly. Grandparents love how effortless it is.'
                  }
                </p>
              </div>
              <div className="rounded-xl bg-surface border border-outline p-space-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sand-alt border border-outline text-primary">
                  <LandingIcon name="visibility" className="text-[20px]" />
                </div>
                <h3 className="mt-space-sm font-label-lg text-label-lg font-bold text-espresso">
                  {'Event-Level Privacy'}
                </h3>
                <p className="mt-1 font-body-sm text-body-sm text-secondary">
                  {
                    'Families only see and RSVP to events they are invited to — keeping intimate functions private.'
                  }
                </p>
              </div>
              <div className="rounded-xl bg-surface border border-outline p-space-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sand-alt border border-outline text-primary">
                  <LandingIcon name="mail" className="text-[20px]" />
                </div>
                <h3 className="mt-space-sm font-label-lg text-label-lg font-bold text-espresso">
                  {'Email Invitations & Reminders'}
                </h3>
                <p className="mt-1 font-body-sm text-body-sm text-secondary">
                  {'Send invitations and friendly RSVP reminders directly to pending families.'}
                </p>
              </div>
              <div className="rounded-xl bg-surface border border-outline p-space-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sand-alt border border-outline text-primary">
                  <LandingIcon name="event_available" className="text-[20px]" />
                </div>
                <h3 className="mt-space-sm font-label-lg text-label-lg font-bold text-espresso">
                  {'Event-wise RSVP'}
                </h3>
                <p className="mt-1 font-body-sm text-body-sm text-secondary">
                  {
                    'See Yes, No and Pending responses separately for every event a family is invited to.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
