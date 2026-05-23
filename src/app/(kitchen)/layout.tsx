import { resolveTenant } from "@/lib/tenant";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export default async function KitchenLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const slug = h.get("x-tenant-slug") ?? "aditya";
  const tenant = await resolveTenant(slug);
  if (!tenant) notFound();
  return (
    <div
      data-portal="kitchen"
      className="min-h-screen font-sans bg-cream-200 text-tomato-900 relative overflow-x-hidden"
    >
      <div className="paper-grain fixed inset-0 z-0" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
