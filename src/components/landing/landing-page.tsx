import type { ResolvedTenant } from "@/lib/tenant";
import { LandingNav } from "./nav";
import { LandingHero } from "./hero";
import { StatBar } from "./stat-bar";
import { PullQuote } from "./pull-quote";
import { HowItWorks } from "./how-it-works";
import { FeaturesBento } from "./features-bento";
import { PortalCards } from "./portal-cards";
import { Testimonials } from "./testimonials";
import { Pricing } from "./pricing";
import { ClosingCta } from "./closing";
import { LandingFooter } from "./footer";

export function LandingPage({ tenant }: { tenant: ResolvedTenant | null }) {
  return (
    <div data-portal="student" className="min-h-screen bg-[color:var(--color-paper)] text-[color:var(--color-ink)] antialiased">
      <LandingNav />
      <main>
        <LandingHero tenant={tenant} />
        <StatBar />
        <PullQuote />
        <HowItWorks />
        <FeaturesBento />
        <PortalCards />
        <Testimonials />
        <Pricing />
        <ClosingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
