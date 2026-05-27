import * as Sentry from "@sentry/nextjs";

// Edge config is used by Next.js middleware (our tenant resolver + role guard)
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? "development",
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 1.0,
  sendDefaultPii: false,
});
