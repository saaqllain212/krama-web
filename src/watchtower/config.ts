// src/watchtower/config.ts
import * as Sentry from "@sentry/nextjs";

export function initSentry() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN, // We will add this to .env later
    
    // Adjust this value in production, or use 1.0 for 100% capture during testing
    tracesSampleRate: 1.0,

    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% if an error happens
    
    // Privacy: Don't record passwords or text inputs
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  });
}