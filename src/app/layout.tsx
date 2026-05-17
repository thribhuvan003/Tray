import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, Manrope, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";
import { Toaster } from "sonner";
import { resolveTenant } from "@/lib/tenant";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tray — Skip the line. Eat sooner.",
  description:
    "A canteen ordering system for college campuses. Order on your phone, pay by UPI, collect with a 4-digit code.",
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Tray",
    description: "One system, three doors. Run the canteen from one screen.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0d12" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const slug = h.get("x-tenant-slug") ?? "aditya";
  const tenant = await resolveTenant(slug);

  return (
    <html
      lang="en"
      data-tenant-id={tenant?.id ?? ""}
      data-tenant-slug={tenant?.slug ?? ""}
      className={`${inter.variable} ${fraunces.variable} ${manrope.variable} ${jetbrains.variable}`}
      style={
        {
          // Map Google-font variables to the design-system tokens used in globals.css
          ["--font-inter" as string]: undefined,
        } as React.CSSProperties
      }
    >
      <body>
        <Providers tenantId={tenant?.id ?? null}>
          {children}
        </Providers>
        <Toaster
          position="top-center"
          richColors
          toastOptions={{ style: { fontFamily: "var(--font-sans)" } }}
        />
      </body>
    </html>
  );
}
