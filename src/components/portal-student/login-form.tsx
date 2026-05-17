"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Mail, KeyRound, ArrowRight } from "lucide-react";
import { getBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

export function LoginForm({ next }: { next: string }) {
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, start] = useTransition();
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const sb = getBrowserClient();
      const redirectTo = new URL(`/auth/callback?next=${encodeURIComponent(next)}`, window.location.origin).toString();
      if (mode === "magic") {
        const { error } = await sb.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
        });
        if (error) toast.error(error.message);
        else {
          setSent(true);
          toast.success("Magic link sent — check your inbox.");
        }
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) toast.error(error.message);
        else window.location.href = next;
      }
    });
  };

  if (sent) {
    return (
      <div className="rounded-2xl bg-ocean-500/8 border border-ocean-500/30 p-6 text-center">
        <Mail size={32} strokeWidth={1.6} className="mx-auto text-ocean-500 mb-3" />
        <div className="font-medium">Check your inbox</div>
        <p className="text-[13px] text-[color:var(--color-ink)]/65 mt-1">
          We just sent a link to <b className="text-[color:var(--color-ink)]">{email}</b>. It expires in 15 minutes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-1 p-1 rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-paper-dim)] text-[12.5px] font-medium">
        <button
          type="button"
          onClick={() => setMode("magic")}
          className={cn(
            "h-9 rounded-full inline-flex items-center justify-center gap-1.5 transition-colors",
            mode === "magic" ? "bg-ocean-500 text-white" : "text-[color:var(--color-ink)]/65"
          )}
        >
          <Mail size={13} /> Magic link
        </button>
        <button
          type="button"
          onClick={() => setMode("password")}
          className={cn(
            "h-9 rounded-full inline-flex items-center justify-center gap-1.5 transition-colors",
            mode === "password" ? "bg-ocean-500 text-white" : "text-[color:var(--color-ink)]/65"
          )}
        >
          <KeyRound size={13} /> Password
        </button>
      </div>
      <label>
        <span className="sr-only">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="you@yourcollege.edu"
          className="w-full h-12 px-4 rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-paper)] text-[14px] focus:outline-none focus:border-ocean-500"
        />
      </label>
      {mode === "password" && (
        <label>
          <span className="sr-only">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Password"
            className="w-full h-12 px-4 rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-paper)] text-[14px] focus:outline-none focus:border-ocean-500"
          />
        </label>
      )}
      <button
        type="submit"
        disabled={pending}
        className={cn(
          "h-12 rounded-xl bg-ocean-500 text-white text-[14px] font-medium inline-flex items-center justify-center gap-2 hover:bg-ocean-600 transition-colors",
          pending && "opacity-70 cursor-not-allowed"
        )}
      >
        {pending ? "Sending…" : mode === "magic" ? "Send magic link" : "Sign in"} <ArrowRight size={15} />
      </button>
    </form>
  );
}
