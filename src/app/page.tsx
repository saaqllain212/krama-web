'use client';

import { useEffect } from 'react';
import LandingPage from "@/components/landing/LandingPage";
import * as Sentry from "@sentry/nextjs"; // Import Sentry here

export default function Page() {
  
  useEffect(() => {
    console.log("🔍 Page Loaded");
  }, []);

  return (
    <>
      <button
        onClick={() => {
          console.log("💣 Sending manual report to Sentry...");
          // This forces Sentry to wake up and send data
          Sentry.captureException(new Error("Sentry Test: Manual Force Report!"));
        }}
        className="fixed bottom-4 right-4 z-50 bg-red-600 text-white p-4 font-bold border-4 border-black shadow-neo"
      >
        💣 FORCE SENTRY
      </button>

      <LandingPage />
    </>
  );
}