"use client";

import { useEffect } from "react";

/**
 * Catches Google OAuth auth codes or token hashes that land on ANY page
 * (not just /auth/callback) when Supabase's redirect URL isn't whitelisted.
 *
 * Supabase falls back to the Site URL when the redirectTo isn't in the
 * allowlist — appending ?code= or #access_token= to the root path.
 * Our middleware intercepts ?code= on / for SSR, but client-side JS can
 * also handle it for implicit-flow hashes or any edge cases.
 */
export function AuthRescue() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const tokenHash = url.searchParams.get("token_hash");
    const hash = window.location.hash;

    if (!code && !tokenHash && !hash.includes("access_token=") && !hash.includes("refresh_token=")) {
      return; // nothing to process
    }

    // Build callback URL, forwarding all params + restoring context from cookie
    const callbackUrl = new URL("/auth/callback", window.location.origin);

    // Forward query params
    url.searchParams.forEach((value, key) => {
      if (key !== "code" || value) callbackUrl.searchParams.set(key, value);
    });
    if (code) callbackUrl.searchParams.set("code", code);
    if (tokenHash) callbackUrl.searchParams.set("token_hash", tokenHash);

    // Restore role/tenant/next from the pre-OAuth cookie
    try {
      const match = document.cookie.match(/(?:^|; )_tray_auth_ctx=([^;]*)/);
      if (match) {
        const ctx = JSON.parse(decodeURIComponent(match[1])) as {
          role?: string; tenant?: string; next?: string;
        };
        if (ctx.role && !callbackUrl.searchParams.has("role"))
          callbackUrl.searchParams.set("role", ctx.role);
        if (ctx.tenant && !callbackUrl.searchParams.has("tenant"))
          callbackUrl.searchParams.set("tenant", ctx.tenant);
        if (ctx.next && !callbackUrl.searchParams.has("next"))
          callbackUrl.searchParams.set("next", ctx.next);
        // Clear cookie
        document.cookie = "_tray_auth_ctx=; path=/; max-age=0";
      }
    } catch { /* non-fatal */ }

    // For implicit flow: pass hash as-is so /auth/callback can process it
    if (hash.includes("access_token=")) {
      window.location.href = `/auth/callback${hash}`;
      return;
    }

    window.location.href = callbackUrl.toString();
  }, []);

  return null;
}
