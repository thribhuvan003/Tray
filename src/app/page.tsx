import { LandingPage } from "@/components/landing/landing-page";
import { resolveTenant } from "@/lib/tenant";
import { headers } from "next/headers";

export default async function Home() {
  const h = await headers();
  const slug = h.get("x-tenant-slug") ?? "aditya";
  const tenant = await resolveTenant(slug);
  return <LandingPage tenant={tenant} />;
}
