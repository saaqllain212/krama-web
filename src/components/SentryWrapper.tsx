"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function SentryWrapper() {
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 🤫 Silent Mode: Logs removed, Debug false
      Sentry.init({
        dsn: "https://514dfd908c8e8013d472de5e1b4718a4@o4510696116060160.ingest.us.sentry.io/4510696117305344",
        
        debug: false, // 👈 Changed to false for production
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        
        integrations: [
          Sentry.replayIntegration(),
        ],
      });
    }
  }, []);

  return null;
}