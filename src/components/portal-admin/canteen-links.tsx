"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, MonitorSmartphone, ShoppingBag, LayoutDashboard, School } from "lucide-react";

type Link = {
  label: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  who: string;
  accent: string;
};

function CopyRow({ link }: { link: Link }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(link.url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-graphite-200/10 bg-graphite-800/40 px-4 py-3 group">
      {/* icon */}
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${link.accent}`}>
        {link.icon}
      </div>

      {/* text */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-graphite-100">{link.label}</span>
          <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-graphite-500">
            {link.who}
          </span>
        </div>
        <p className="mt-0.5 truncate text-[11px] text-graphite-500 font-mono">{link.url}</p>
      </div>

      {/* actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={copy}
          title="Copy link"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-graphite-400 hover:bg-graphite-700 hover:text-graphite-100 transition-colors"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>
        <a
          href={link.url}
          target="_blank"
          rel="noreferrer"
          title="Open in new tab"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-graphite-400 hover:bg-graphite-700 hover:text-graphite-100 transition-colors"
        >
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}

export function CanteenLinks({
  tenantSlug,
  tenantName,
  collegeSlug,
  appUrl,
}: {
  tenantSlug: string;
  tenantName: string;
  collegeSlug?: string | null;
  appUrl: string;
}) {
  const base = appUrl.replace(/\/$/, "");

  const links: Link[] = [
    {
      label: "Student ordering",
      description: "Share with students or customers",
      url: `${base}/c/${tenantSlug}/menu`,
      icon: <ShoppingBag size={16} className="text-sky-300" />,
      who: "Students · Customers",
      accent: "bg-sky-500/15",
    },
    {
      label: "Kitchen board",
      description: "Open on the kitchen tablet",
      url: `${base}/c/${tenantSlug}/kitchen`,
      icon: <MonitorSmartphone size={16} className="text-tomato-400" />,
      who: "Kitchen staff",
      accent: "bg-tomato-500/15",
    },
    {
      label: "Admin dashboard",
      description: "Your management console",
      url: `${base}/c/${tenantSlug}/admin/dashboard`,
      icon: <LayoutDashboard size={16} className="text-lime" />,
      who: "You · Canteen admin",
      accent: "bg-lime/15",
    },
    ...(collegeSlug
      ? [
          {
            label: "College portal",
            description: "All canteens at this institution",
            url: `${base}/college/${collegeSlug}`,
            icon: <School size={16} className="text-violet-400" />,
            who: "College director",
            accent: "bg-violet-500/15",
          } satisfies Link,
        ]
      : []),
  ];

  return (
    <section className="mb-6 rounded-2xl border border-graphite-200/10 bg-graphite-900/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-[13px] font-semibold text-graphite-100">{tenantName} — Your links</h2>
          <p className="mt-0.5 text-[11px] text-graphite-500">
            Share the student link with your customers. Open the kitchen link on your tablet.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {links.map((l) => (
          <CopyRow key={l.label} link={l} />
        ))}
      </div>
    </section>
  );
}
