import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";
import { GetStartedWizard } from "./wizard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get started — Tray",
  description: "Set up your campus canteen ordering system in under 5 minutes.",
};

export default async function GetStartedPage() {
  // If the user is already signed in, redirect to the dashboard.
  // We need a lightweight auth check without requiring a tenant context.
  try {
    const h = await headers();
    const cookieHeader = h.get("cookie") ?? "";

    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            // Parse cookie string into array of {name, value} objects
            return cookieHeader
              .split(";")
              .map((c) => c.trim())
              .filter(Boolean)
              .map((c) => {
                const idx = c.indexOf("=");
                return idx === -1
                  ? { name: c, value: "" }
                  : { name: c.slice(0, idx), value: c.slice(idx + 1) };
              });
          },
          setAll() {
            // Read-only in a Server Component — session changes not needed
          },
        },
      }
    );

    const { data } = await supabase.auth.getUser();
    if (data.user) {
      // Already logged in — send to the landing; they can navigate from there
      redirect("/");
    }
  } catch {
    // If auth check fails for any reason, just show the wizard
  }

  return <GetStartedWizard />;
}
