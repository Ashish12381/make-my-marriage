import Image from 'next/image';
import { LandingIcon } from './landing-icon';

export function LivestreamSection() {
  return (
    <section className="w-full py-space-xl lg:py-32" id="livestream">
      <p className="mx-auto max-w-[1440px] px-margin-mobile lg:px-margin mb-4 text-center font-label-md text-label-md text-secondary">
        {'Sample preview · Actions shown are illustrative'}
      </p>
      <div className="mx-auto max-w-[1440px] px-margin-mobile lg:px-margin">
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-label-md text-label-md uppercase tracking-wider text-primary font-bold">
            {'LIVESTREAM'}
          </span>
          <h2 className="mt-space-xs font-headline-lg text-headline-lg font-bold tracking-tight text-espresso">
            {'Be there, from anywhere.'}
          </h2>
          <p className="mt-space-sm font-body-lg text-body-lg text-secondary">
            {'Add your YouTube livestream URL and make it accessible from your wedding website.'}
          </p>
        </div>
        <div className="mx-auto mt-space-xl max-w-4xl overflow-hidden rounded-2xl bg-surface border border-outline shadow-xl">
          <div className="flex items-center justify-between bg-espresso px-space-md py-3 text-white">
            <div className="flex items-center gap-space-sm">
              <span className="flex h-2.5 w-2.5 rounded-full bg-brick animate-ping"></span>
              <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-peach-clay">
                {'STREAM PREVIEW'}
              </span>
              <span className="font-label-md text-label-md font-semibold text-white">
                {'Priya & Rahul Sacred Pheras Ceremony'}
              </span>
            </div>
            <div className="flex items-center gap-1 font-label-sm text-label-sm text-peach-clay">
              <LandingIcon name="videocam" className="text-[16px]" />
              <span>{'YouTube Live Connected'}</span>
            </div>
          </div>
          <div className="relative aspect-video w-full overflow-hidden bg-espresso">
            <Image
              className="h-full w-full object-cover opacity-85"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfaWMH4tPe4s_RZvODDBQJ-IkV6UduOkyvQLY3CDT7eJJVguh-bprIeVYix6qjP1TfUCO4sZtTFas667hI3o__shugLbou77dH9mTzbFL6JYo4a7Q7T_83vb74etBXWkQsWpp4uAeacbCYCJVOdLHuo9gKFjck3ChVdblez-o69qSTHgzUoPNfkVpNb-0oahH9W6rB0XoshcNlMqXjZQ1b7GiofEwQiymRLL4Acp-45iTF1cJIHqQ9"
              alt="Illustrative Indian wedding ceremony"
              width={1280}
              height={720}
              unoptimized
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brick text-white shadow-lg">
                <LandingIcon name="play_arrow" className="text-[32px]" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low border-t border-outline/60 p-space-md">
            <div className="flex items-center gap-space-sm">
              <LandingIcon name="smart_display" className="text-primary text-[20px]" />
              <span className="font-body-sm text-body-sm text-espresso font-medium">
                {
                  'Add a YouTube link to each event. Eligible guests open it on YouTube; public and unlisted links can be forwarded.'
                }
              </span>
            </div>
            <span className="inline-flex items-center gap-1 rounded-lg bg-surface border border-outline px-3 py-1.5 font-label-sm text-label-sm font-bold text-espresso transition">
              <LandingIcon name="videocam" className="text-[16px] text-primary" />
              <span>{'Watch Live on YouTube'}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
