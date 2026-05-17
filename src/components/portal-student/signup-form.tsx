"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ArrowRight, Mail } from "lucide-react";
import { getBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

export function SignupForm({
  next,
  tenantSlug,
  allowedDomain,
}: {
  next: string;
  tenantSlug: string;
  allowedDomain: string | null;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, start] = useTransition();
  const [sent, setSent] = useState(false);

  const validate = () => {
    if (!allowedDomain) return null;
    const dom = email.split("@")[1]?.toLowerCase();
    if (!dom) return "Enter a valid email";
    if (dom !== allowedDomain.toLowerCase()) {
      return `Use your @${allowedDomain} email`;
    }
    return null;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);
    start(async () => {
      const sb = getBrowserClient();
      const redirectTo = new URL(
        `/auth/callback?next=${encodeURIComponent(next)}&tenant=${tenantSlug}`,
        window.location.origin
      ).toString();
      const { error } = await sb.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo, data: { display_name: name, tenant_slug: tenantSlug } },
      });
      if (error) toast.error(error.message);
      else {
        setSent(true);
        toast.success("Check your inbox to confirm your email.");
      }
    });
  };

  if (sent) {
    return (
      <div className="rounded-2xl bg-ocean-500/8 border border-ocean-500/30 p-6 text-center">
        <Mail size={32} strokeWidth={1.6} className="mx-auto text-ocean-500 mb-3" />
        <div className="font-medium">Confirm your email</div>
        <p className="text-[13px] text-[color:var(--color-ink)]/65 mt-1">
          We sent a link to <b className="text-[color:var(--color-ink)]">{email}</b>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <input
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="name"
        placeholder="Your name"
        className="w-full h-12 px-4 rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-paper)] text-[14px] focus:outline-none focus:border-ocean-500"
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        placeholder={allowedDomain ? `you@${allowedDomain}` : "you@yourcollege.edu"}
        className="w-full h-12 px-4 rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-paper)] text-[14px] focus:outline-none focus:border-ocean-500"
      />
      <input
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
        placeholder="Password (8+ characters)"
        className="w-full h-12 px-4 rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-paper)] text-[14px] focus:outline-none focus:border-ocean-500"
      />
      <button
        type="submit"
        disabled={pending}
        className={cn(
          "h-12 rounded-xl bg-ocean-500 text-white text-[14px] font-medium inline-flex items-center justify-center gap-2 hover:bg-ocean-600 transition-colors",
          pending && "opacity-70 cursor-not-allowed"
        )}
      >
        {pending ? "Creating…" : "Create account"} <ArrowRight size={15} />
      </button>
    </form>
  );
}
