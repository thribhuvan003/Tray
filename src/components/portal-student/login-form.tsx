"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { getBrowserClient } from "@/lib/supabase/browser";

export function LoginForm({ next, tenantId }: { next: string | null; tenantId: string | null }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, start] = useTransition();

  const roleDestination = async (userId: string | null | undefined) => {
    if (!tenantId || !userId) return "/menu";
    const sb = getBrowserClient();
    const { data } = await sb
      .from("tenant_memberships")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle<{ role: string }>();

    if (data?.role === "canteen_admin" || data?.role === "super_admin") return "/admin/dashboard";
    if (data?.role === "kitchen_staff") return "/kitchen";
    return "/menu";
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Enter email and password");
      return;
    }

    start(async () => {
      const sb = getBrowserClient();
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
        return;
      }
      window.location.href = next ?? (await roleDestination(data.user?.id));
    });
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="field">
        <label className="label" htmlFor="login-email">
          Email
        </label>
        <input
          className="input"
          id="login-email"
          type="email"
          placeholder="you@campus.edu"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="field">
        <div className="row-label">
          <label className="label" htmlFor="login-pass">
            Password
          </label>
          <button type="button" onClick={() => toast.success("Reset link sent to your email")}>
            Forgot?
          </button>
        </div>
        <input
          className="input"
          id="login-pass"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 16 }} type="submit" disabled={pending}>
        {pending ? "Signing in..." : "Sign in ->"}
      </button>
    </form>
  );
}
