"use client";

import { useState } from "react";
import { X as XIcon, CheckCircle2 } from "lucide-react";

type Link = { label: string; url: string };

function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that block clipboard without interaction context
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 shrink-0 text-[10px] font-mono font-semibold uppercase tracking-[0.08em] px-2 py-0.5 rounded border border-[var(--admin-line-2)] text-[var(--admin-ink-3)] hover:text-[var(--admin-lime)] hover:border-[var(--admin-lime)]/40 transition-colors cursor-pointer"
      aria-label={`Copy ${url}`}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function LinkRow({ label, url }: Link) {
  return (
    <div className="flex items-center gap-2 flex-wrap py-1.5 border-b border-[var(--admin-line)] last:border-0">
      <span className="w-36 shrink-0 text-[11px] font-mono uppercase tracking-[0.08em] text-[var(--admin-ink-3)]">
        {label}
      </span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[12px] text-[var(--admin-sky)] hover:text-[var(--admin-sky)]/80 truncate transition-colors"
      >
        {url}
      </a>
      <CopyButton url={url} />
    </div>
  );
}

export function WelcomeBanner({
  tenantSlug,
  collegeSlug,
  appUrl,
}: {
  tenantSlug: string;
  collegeSlug: string;
  appUrl: string;
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const links: Link[] = [
    { label: "Student ordering", url: `${appUrl}/c/${tenantSlug}/menu` },
    { label: "Kitchen board", url: `${appUrl}/c/${tenantSlug}/kitchen` },
    { label: "Admin dashboard", url: `${appUrl}/c/${tenantSlug}/admin/dashboard` },
    { label: "College portal", url: `${appUrl}/college/${collegeSlug}` },
  ];

  const nextSteps = [
    "Add your UPI ID in Settings → so students can pay you directly",
    "Add your menu items in Menu Manager",
    "Share the student link or QR code with your students",
  ];

  return (
    <div className="mb-8 rounded-xl border border-[var(--admin-lime)]/25 bg-[var(--admin-lime)]/5 p-5 relative">
      <button
        aria-label="Dismiss welcome banner"
        onClick={() => setDismissed(true)}
        className="absolute top-4 right-4 text-[var(--admin-ink-3)] hover:text-[var(--admin-ink-2)] transition-colors cursor-pointer"
      >
        <XIcon size={15} />
      </button>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-[22px]" aria-hidden="true">🎉</span>
        <div>
          <h2 className="text-[15px] font-semibold text-[var(--admin-ink)]">Your canteen is live!</h2>
          <p className="text-[12px] text-[var(--admin-ink-3)] mt-0.5">Share these links with your team</p>
        </div>
      </div>

      <div className="mb-5">
        {links.map((l) => (
          <LinkRow key={l.label} label={l.label} url={l.url} />
        ))}
      </div>

      <div>
        <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--admin-ink-3)] mb-2">
          Next steps
        </div>
        <ul className="flex flex-col gap-1.5">
          {nextSteps.map((step) => (
            <li key={step} className="flex items-start gap-2 text-[12px] text-[var(--admin-ink-2)]">
              <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-[var(--admin-lime)]" />
              {step}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
