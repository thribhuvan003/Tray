import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? "development",

  // Server traces: 10% in production (webhooks, server actions, API routes)
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Capture console.error on critical server paths (webhook, placeOrder, etc.)
  integrations: [
    Sentry.captureConsoleIntegration({ levels: ["error"] }),
  ],

  sendDefaultPii: false,

  // Tag every event with the Tray project identifier
  initialScope: {
    tags: {
      project: "tray",
      component: "server",
    },
  },
});
