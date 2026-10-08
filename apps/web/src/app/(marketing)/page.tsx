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

export const metadata: Metadata = {
  title: 'Make My Marriage | One wedding. Both families.',
  description:
    'Plan your Indian wedding together: events, tasks, family invitations, expenses, photos, and a personalized wedding website.',
};

export default function HomePage() {
  return (
    <div className="landing-page bg-oat-milk text-espresso antialiased">
      <a className="landing-skip-link" href="#main-content">
        Skip to content
      </a>
      <LandingHeader />
      <main id="main-content" className="pt-20">
        <HeroSection />
        <FeaturesSection />
        <CollaborationSection />
        <ExpensesSection />
        <InvitationSection />
        <WebsiteSection />
        <GallerySection />
        <VendorsSection />
        <LivestreamSection />
        <HowItWorksSection />
        <ClosingSection />
      </main>
      <LandingFooter />
    </div>
  );
}
