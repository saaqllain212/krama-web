import * as Sentry from "@sentry/nextjs";

console.log("🚀 Sentry Client Config is Loading..."); // This confirms the file is running

Sentry.init({
  // Your real DSN key
  dsn: "https://514dfd908c8e8013d472de5e1b4718a4@o4510696116060160.ingest.us.sentry.io/4510696117305344",

  // Enable debug to see logs in console
  debug: true,

  // Record 100% of errors for testing
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  integrations: [
    Sentry.replayIntegration(),
  ],
});