import { LandingIcon } from './landing-icon';

export function GallerySection() {
  return (
    <section className="w-full py-space-xl lg:py-32" id="photo-sharing">
      <div className="mx-auto max-w-[1440px] px-margin-mobile lg:px-margin">
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-label-md text-label-md uppercase tracking-wider text-primary font-bold">
            {'PHOTO SHARING'}
          </span>
          <h2 className="mt-space-xs font-headline-lg text-headline-lg font-bold tracking-tight text-espresso">
            {'Every moment. One shared gallery.'}
          </h2>
          <p className="mt-space-sm font-body-lg text-body-lg text-secondary">
            {
              'Guests upload candid photos instantly via authorized link or QR code — without creating an account or downloading an app.'
            }
          </p>
        </div>
        <div className="mt-space-xl grid grid-cols-1 gap-space-lg md:grid-cols-3">
          <div className="rounded-2xl bg-surface border border-outline p-space-lg shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sand-alt border border-outline text-primary">
              <LandingIcon name="qr_code_scanner" className="text-[24px]" />
            </div>
            <h3 className="mt-space-md font-headline-sm text-headline-sm font-bold text-espresso">
              {'Instant Guest Uploads'}
            </h3>
            <p className="mt-space-xs font-body-md text-body-md text-secondary">
              {
                'Place QR codes on celebration tables. Guests snap and upload candid pictures straight from their mobile browser.'
              }
            </p>
            <div className="mt-space-md rounded-lg bg-surface-container-low border border-outline/60 p-space-sm font-label-sm text-label-sm text-secondary">
              {'✓ Zero app download needed'}
              <br />
              {'✓ High quality optimized storage'}
            </div>
          </div>
          <div className="rounded-2xl bg-surface border border-outline p-space-lg shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sand-alt border border-outline text-primary">
              <LandingIcon name="lock_open" className="text-[24px]" />
            </div>
            <h3 className="mt-space-md font-headline-sm text-headline-sm font-bold text-espresso">
              {'Flexible Album Privacy'}
            </h3>
            <p className="mt-space-xs font-body-md text-body-md text-secondary">
              {
                'Set albums to Public, Invited Guests Only, or Organizers Only to choose who can view each album.'
              }
            </p>
            <div className="mt-space-md rounded-lg bg-surface-container-low border border-outline/60 p-space-sm font-label-sm text-label-sm text-secondary">
              {'✓ Granular event albums'}
              <br />
              {'✓ Protected family collections'}
            </div>
          </div>
          <div className="rounded-2xl bg-surface border border-outline p-space-lg shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sand-alt border border-outline text-primary">
              <LandingIcon name="verified_user" className="text-[24px]" />
            </div>
            <h3 className="mt-space-md font-headline-sm text-headline-sm font-bold text-espresso">
              {'Share with Confidence'}
            </h3>
            <p className="mt-space-xs font-body-md text-body-md text-secondary">
              {
                'Valid photos appear after technical verification, according to album privacy. Wedding Admins and authorized Organizers can delete unwanted uploads.'
              }
            </p>
            <div className="mt-space-md rounded-lg bg-surface-container-low border border-outline/60 p-space-sm font-label-sm text-label-sm text-secondary">
              {'✓ Authorized photo deletion'}
              <br />
              {'✓ Individual photo downloads'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
