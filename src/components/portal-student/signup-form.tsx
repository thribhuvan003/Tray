"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { getBrowserClient } from "@/lib/supabase/browser";

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
  const [roll, setRoll] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, start] = useTransition();
  const [sent, setSent] = useState(false);

  const validate = () => {
    if (!allowedDomain) return null;
    const dom = email.split("@")[1]?.toLowerCase();
    if (!dom) return "Enter a valid email";
    if (dom !== allowedDomain.toLowerCase()) return `Use your @${allowedDomain} email`;
    return null;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }

    start(async () => {
      const sb = getBrowserClient();
      const redirectTo = new URL(
        `/auth/callback?next=${encodeURIComponent(next)}&tenant=${tenantSlug}`,
        window.location.origin
      ).toString();
      const { error } = await sb.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: { display_name: name, roll_no: roll, tenant_slug: tenantSlug },
        },
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
      <div className="surface-elev" style={{ padding: 24, textAlign: "center" }}>
        <div className="chip chip-accent" style={{ marginBottom: 12 }}>
          Email sent
        </div>
        <h2>Confirm your email.</h2>
        <p className="sub" style={{ marginTop: 8 }}>
          We sent a link to <b>{email}</b>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="auth-grid">
        <div className="field">
          <label className="label" htmlFor="su-name">
            Full name
          </label>
          <input
            className="input"
            id="su-name"
            type="text"
            placeholder="Ananya R."
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="label" htmlFor="su-roll">
            Roll no.
          </label>
          <input
            className="input"
            id="su-roll"
            type="text"
            placeholder="22B81A0511"
            value={roll}
            onChange={(e) => setRoll(e.target.value)}
          />
        </div>
      </div>
      <div className="field">
        <label className="label" htmlFor="su-email">
          Email
        </label>
        <input
          className="input"
          id="su-email"
          type="email"
          placeholder={allowedDomain ? `you@${allowedDomain}` : "you@campus.edu"}
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="field">
        <label className="label" htmlFor="su-pass">
          Password
        </label>
        <input
          className="input"
          id="su-pass"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="pwbar" id="pwbar">
          <span className="seg" />
          <span className="seg" />
          <span className="seg" />
          <span className="seg" />
        </div>
        <div className="helper">Use 8+ characters with a mix of letters, numbers, and symbols.</div>
      </div>
      <button className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 8 }} type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create account ->"}
      </button>
    </form>
  );
}
