import * as Sentry from "@sentry/nextjs";

export function initSentry() {
  Sentry.init({
    // 👇 STEP 1: PASTE YOUR DSN KEY INSIDE THESE QUOTES
    // Example: "https://examplePublicKey@o0.ingest.sentry.io/0"
    // Once this works, we will switch back to process.env.NEXT_PUBLIC_SENTRY_DSN later.
    dsn: "https://514dfd908c8e8013d472de5e1b4718a4@o4510696116060160.ingest.us.sentry.io/4510696117305344", 
    
    // 👇 STEP 2: ENABLE DEBUGGING
    // This makes Sentry print colorful logs to your browser console so we know it's alive.
    debug: true, 

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