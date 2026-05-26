import { LandingPage } from "@/components/landing/landing-page";
import { resolveTenant } from "@/lib/tenant";
import { headers } from "next/headers";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const h = await headers();
  const slug = h.get("x-tenant-slug") ?? "";
  const tenant = slug ? await resolveTenant(slug) : null;
  const sp = await searchParams;
  const msg = typeof sp.msg === "string" ? sp.msg : undefined;
  return <LandingPage tenant={tenant} msg={msg} />;
}
