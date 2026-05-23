import type { Metadata, Viewport } from "next";
import {
  Inter, Fraunces, Manrope, JetBrains_Mono, Instrument_Serif,
  Newsreader, Geist, Geist_Mono, Space_Grotesk,
  Bebas_Neue, Cormorant_Garamond, Plus_Jakarta_Sans, Barlow_Condensed, DM_Serif_Display,
  DM_Mono,
} from "next/font/google";
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
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});
// Expressive typography — landing + student portal art direction
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-barlow",
  display: "swap",
});
const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-dm-serif",
  display: "swap",
});
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tray — Campus food, without the queue.",
  description:
    "Students order from any canteen in their campus. Kitchens run live queues. Admins see orders, revenue, and handovers in real time.",
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
    { media: "(prefers-color-scheme: dark)", color: "#0d0c0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const slug = h.get("x-tenant-slug") ?? "aditya";
  const tenant = await resolveTenant(slug);

  // Blocking inline script: resolve theme synchronously before first paint so
  // dark-mode users never see a white flash (FOUC). Mirrors the logic in
  // ThemeProvider; that effect later re-applies idempotently.
  const fouc = `(()=>{try{var t=localStorage.getItem('tray:theme')||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.toggle('dark',d);r.setAttribute('data-theme',d?'dark':'light');}catch(e){}})();`;

  return (
    <html
      lang="en"
      data-tenant-id={tenant?.id ?? ""}
      data-tenant-slug={tenant?.slug ?? ""}
      className={`${inter.variable} ${fraunces.variable} ${manrope.variable} ${jetbrains.variable} ${instrumentSerif.variable} ${newsreader.variable} ${spaceGrotesk.variable} ${geist.variable} ${geistMono.variable} ${bebasNeue.variable} ${cormorant.variable} ${plusJakarta.variable} ${barlowCondensed.variable} ${dmSerif.variable} ${dmMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: fouc }} />
      </head>
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
