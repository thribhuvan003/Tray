import "server-only";
import { env, featureFlags } from "@/lib/env";

type SendArgs = { to: string; subject: string; html: string; from?: string };

export async function sendEmail(args: SendArgs) {
  if (!featureFlags.resendLive) {
    console.log("[email:noop]", { to: args.to, subject: args.subject });
    return { id: "noop", queued: false };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: args.from ?? "Tray <hello@tray.app>",
      to: args.to,
      subject: args.subject,
      html: args.html,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`Resend send failed: ${res.status} ${body}`);
    return { id: "failed", queued: false };
  }
  const data = (await res.json()) as { id: string };
  return { id: data.id, queued: true };
}
