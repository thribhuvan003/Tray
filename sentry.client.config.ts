import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  // Tray org: tray-k9 | project: javascript-nextjs | org-id: 4511462728925185
  environment: process.env.NODE_ENV ?? "development",

  // Sample 10% of traces in production; 100% in dev
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Replay: 10% of sessions, 100% of error sessions
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,    // GDPR: don't record student emails/names
      blockAllMedia: true,
    }),
  ],

  // Don't send PII
  sendDefaultPii: false,

  // Ignore noise from browser extensions and ad blockers
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "Non-Error exception captured",
    /^Loading chunk/,
  ],
});
