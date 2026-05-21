import { LandingPage } from "@/components/landing/landing-page";
import { resolveTenant } from "@/lib/tenant";
import { headers } from "next/headers";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const h = await headers();
  const slug = h.get("x-tenant-slug") ?? "aditya";
  const tenant = await resolveTenant(slug);
  void searchParams;
  return <LandingPage tenant={tenant} />;
}
