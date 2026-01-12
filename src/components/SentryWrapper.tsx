"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function SentryWrapper() {
  
  useEffect(() => {
    // Double protection: Only run if we are in the browser
    if (typeof window !== "undefined") {
      console.log("🚀 Sentry Initializing (Safe Mode)...");
      
      Sentry.init({
        // Paste your DSN key here
        dsn: "https://514dfd908c8e8013d472de5e1b4718a4@o4510696116060160.ingest.us.sentry.io/4510696117305344",
        
        debug: true,
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        
        // This function caused the crash on the server. 
        // Now it is safe because we are inside useEffect + Client Component.
        integrations: [
          Sentry.replayIntegration(),
        ],
      });
    }
  }, []);

  return null; // This component is invisible
}