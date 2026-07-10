import { Hero } from '../components/Hero';
import { TrustedBy } from '../components/TrustedBy';
import { Features } from '../components/Features';
import { HowItWorks } from '../components/HowItWorks';
import { Integrations } from '../components/Integrations';
import { DashboardShowcase } from '../components/DashboardShowcase';
import { Benefits } from '../components/Benefits';
import { Testimonials } from '../components/Testimonials';
import { Pricing } from '../components/Pricing';
import { FAQ } from '../components/FAQ';
import { CTA } from '../components/CTA';

export function Home() {
  return (
    <main className="w-full flex flex-col items-center">
      <Hero />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <Integrations />
      <DashboardShowcase />
      <Benefits />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
    </main>
  );
}
