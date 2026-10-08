import { LandingIcon } from './landing-icon';

export function WebsiteSection() {
  return (
    <section
      className="w-full bg-sand-alt/55 py-space-xl lg:py-32 border-y border-outline/60"
      id="wedding-website"
    >
      <p className="mx-auto max-w-[1440px] px-margin-mobile lg:px-margin mb-4 text-center font-label-md text-label-md text-secondary">
        {'Sample preview · Actions shown are illustrative'}
      </p>
      <div className="mx-auto max-w-[1440px] px-margin-mobile lg:px-margin">
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-label-md text-label-md uppercase tracking-wider text-primary font-bold">
            {'YOUR WEDDING WEBSITE'}
          </span>
          <h2 className="mt-space-xs font-headline-lg text-headline-lg font-bold tracking-tight text-espresso">
            {'\n          Your wedding, beautifully shared.\n        '}
          </h2>
          <p className="mt-space-sm font-body-lg text-body-lg text-secondary">
            {
              'Publish an elegant wedding website with your event schedule, venue directions, RSVP access, shared photo albums, and live streaming for remote relatives.'
            }
          </p>
        </div>
        <div className="mt-space-xl overflow-hidden rounded-2xl bg-surface border border-outline shadow-xl">
          <div className="flex items-center gap-space-sm bg-surface-container-low border-b border-outline/60 px-space-md py-3">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-brick/70"></span>
              <span className="h-3 w-3 rounded-full bg-amber-warm/70"></span>
              <span className="h-3 w-3 rounded-full bg-sage/70"></span>
            </div>
            <div className="mx-auto flex w-full max-w-md items-center justify-center rounded-md bg-surface border border-outline/70 py-1 font-label-sm text-label-sm text-secondary">
              <LandingIcon name="lock" className="mr-1 text-[14px] text-primary" />
              {' makemymarriage.com/priya-and-rahul\n          '}
            </div>
          </div>
          <div className="relative overflow-hidden p-space-lg text-center lg:p-space-xl">
            <div className="mx-auto max-w-2xl">
              <span className="font-label-md text-label-md uppercase tracking-widest text-primary font-semibold">
                {'YOUR WEDDING WEBSITE'}
              </span>
              <h3 className="mt-2 font-display text-display font-bold text-espresso">
                {'Priya & Rahul'}
              </h3>
              <p className="mt-1 font-headline-sm text-headline-sm text-secondary">
                {'November 12-15, 2027 · The Oberoi Rajvilas, Jaipur'}
              </p>
              <div className="mt-space-md flex flex-wrap items-center justify-center gap-space-sm">
                <span className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-label-md text-label-md font-semibold text-white shadow-xs transition">
                  <LandingIcon name="videocam" className="text-[18px]" />
                  {' Watch Live on YouTube\n              '}
                </span>
                <span className="inline-flex items-center gap-2 rounded-xl bg-surface border border-outline px-5 py-2.5 font-label-md text-label-md font-semibold text-espresso transition">
                  <LandingIcon name="map" className="text-[18px] text-primary" />
                  {' View Venue Directions\n              '}
                </span>
              </div>
            </div>
            <div className="mt-space-xl grid grid-cols-1 gap-space-sm sm:grid-cols-3">
              <div className="rounded-xl bg-surface-container-low border border-outline/70 p-space-md text-left">
                <span className="font-label-sm text-label-sm font-bold text-primary">
                  {'DAY 1 · NOV 12'}
                </span>
                <h4 className="mt-1 font-label-lg text-label-lg font-bold text-espresso">
                  {'Haldi & Mehendi'}
                </h4>
                <p className="font-body-sm text-body-sm text-secondary">
                  {'Courtyard Poolside · 10:00 AM'}
                </p>
                <p className="mt-2 font-label-sm text-label-sm text-secondary font-medium">
                  {'Attire: Festive Yellows & Mint Green'}
                </p>
              </div>
              <div className="rounded-xl bg-surface-container-low border border-outline/70 p-space-md text-left">
                <span className="font-label-sm text-label-sm font-bold text-primary">
                  {'DAY 2 · NOV 13'}
                </span>
                <h4 className="mt-1 font-label-lg text-label-lg font-bold text-espresso">
                  {'Sangeet & Cocktails'}
                </h4>
                <p className="font-body-sm text-body-sm text-secondary">
                  {'Grand Crystal Ballroom · 7:00 PM'}
                </p>
                <p className="mt-2 font-label-sm text-label-sm text-secondary font-medium">
                  {'Attire: Indo-Western Glamour'}
                </p>
              </div>
              <div className="rounded-xl bg-surface-container-low border border-outline/70 p-space-md text-left">
                <span className="font-label-sm text-label-sm font-bold text-primary">
                  {'DAY 3 · NOV 14'}
                </span>
                <h4 className="mt-1 font-label-lg text-label-lg font-bold text-espresso">
                  {'Vedic Pheras & Dinner'}
                </h4>
                <p className="font-body-sm text-body-sm text-secondary">
                  {'Mandap Pavilion · 10:30 AM'}
                </p>
                <p className="mt-2 font-label-sm text-label-sm text-secondary font-medium">
                  {'Attire: Traditional Royal Pastels'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
