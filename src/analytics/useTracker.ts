// src/analytics/useTracker.ts
"use client";

import { usePostHog } from 'posthog-js/react';
import { useCallback } from 'react';

export function useTracker() {
  const posthog = usePostHog();

  // This is the function you will use in your components
  const track = useCallback((eventName: string, properties?: Record<string, any>) => {
    try {
      if (posthog) {
        // Send to PostHog
        posthog.capture(eventName, properties);
        
        // Optional: Log to console in development so you can see it working
        if (process.env.NODE_ENV === 'development') {
          console.log(`📡 TRACKING: ${eventName}`, properties);
        }
      }
    } catch (error) {
      // If tracking fails, do nothing. Don't annoy the user.
      console.warn("Tracking failed", error);
    }
  }, [posthog]);

  return { track };
}