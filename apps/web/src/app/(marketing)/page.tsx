import type { Metadata } from 'next';
import { LandingHeader, LandingFooter } from '@/components/landing/landing-shell';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { CollaborationSection } from '@/components/landing/collaboration-section';
import { ExpensesSection } from '@/components/landing/expenses-section';
import { InvitationSection } from '@/components/landing/invitation-section';
import { WebsiteSection } from '@/components/landing/website-section';
import { GallerySection } from '@/components/landing/gallery-section';
import { VendorsSection } from '@/components/landing/vendors-section';
import { LivestreamSection } from '@/components/landing/livestream-section';
import { HowItWorksSection } from '@/components/landing/how-it-works-section';
import { ClosingSection } from '@/components/landing/closing-section';
import { getServerUser } from '@/lib/auth/server-session';
import { LandingSessionSync } from '@/components/landing/landing-session-sync';

export const metadata: Metadata = {
  title: 'Make My Marriage | One wedding. Both families.',
  description:
    'Plan your Indian wedding together: events, tasks, family invitations, expenses, photos, and a personalized wedding website.',
};

export default async function HomePage() {
  const signedIn = Boolean(await getServerUser());
  return (
    <div className="landing-page bg-oat-milk text-espresso antialiased">
      <LandingSessionSync />
      <a className="landing-skip-link" href="#main-content">
        Skip to content
      </a>
      <LandingHeader signedIn={signedIn} />
      <main id="main-content" className="pt-20">
        <HeroSection signedIn={signedIn} />
        <FeaturesSection />
        <CollaborationSection />
        <ExpensesSection />
        <InvitationSection />
        <WebsiteSection />
        <GallerySection />
        <VendorsSection />
        <LivestreamSection />
        <HowItWorksSection />
        <ClosingSection signedIn={signedIn} />
      </main>
      <LandingFooter signedIn={signedIn} />
    </div>
  );
}
