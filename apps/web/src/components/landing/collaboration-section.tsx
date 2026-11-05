import { LandingIcon } from './landing-icon';
import { CollaborationPreview } from './collaboration-preview';

export function CollaborationSection() {
  return (
    <section className="w-full py-space-xl lg:py-32" id="shared-planning">
      <p className="mx-auto max-w-[1440px] px-margin-mobile lg:px-margin mb-4 text-center font-label-md text-label-md text-secondary">
        {'Illustrative wedding preview'}
      </p>
      <div className="mx-auto max-w-[1440px] px-margin-mobile lg:px-margin">
        <div className="grid grid-cols-1 items-center gap-space-xl lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="font-label-md text-label-md uppercase tracking-wider text-primary font-bold">
              {'FAMILY COLLABORATION'}
            </span>
            <h2 className="mt-space-xs font-headline-lg text-headline-lg font-bold tracking-tight text-espresso">
              {'\n            Plan together. Stay in sync.\n          '}
            </h2>
            <p className="mt-space-sm font-body-lg text-body-lg text-secondary">
              {
                '\n            The couple and selected family members can manage the wedding together with clear responsibilities, distinct event leads, and complete transparency.\n          '
              }
            </p>
            <div className="mt-space-md space-y-space-sm">
              <div className="flex items-start gap-space-sm">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sand-alt border border-outline text-primary">
                  <LandingIcon name="admin_panel_settings" className="text-[16px]" />
                </div>
                <div>
                  <h3 className="font-label-lg text-label-lg font-semibold text-espresso">
                    {'Wedding Admin & Organizer Roles'}
                  </h3>
                  <p className="font-body-sm text-body-sm text-secondary">
                    {
                      'Invite your partner and selected relatives as Wedding Admins, or give Organizers module-specific permissions.'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-space-sm">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sand-alt border border-outline text-primary">
                  <LandingIcon name="assignment_ind" className="text-[16px]" />
                </div>
                <div>
                  <h3 className="font-label-lg text-label-lg font-semibold text-espresso">
                    {'Descriptive Responsibility Tags'}
                  </h3>
                  <p className="font-body-sm text-body-sm text-secondary">
                    {
                      'Designate Event Leads and Logistics Coordinators across Haldi, Mehendi, Sangeet, Wedding, and Reception.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <CollaborationPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
