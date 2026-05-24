import { headers } from "next/headers";
import { resolveTenant, getTenantSlugFromHeaders } from "@/lib/tenant";
import { LandingPage } from "@/components/landing/landing-page";

export const dynamic = "force-dynamic";

export default async function Page() {
  const h = await headers();
  // Fall back to default tenant slug or null
  const slug = getTenantSlugFromHeaders(h);
  const tenant = await resolveTenant(slug);

  return <LandingPage tenant={tenant} />;
}
