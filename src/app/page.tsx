'use client';

import { useEffect } from 'react';
import LandingPage from "@/components/landing/LandingPage";

export default function Page() {
  
  // 🔍 DEBUGGER: Print the key when page loads
  useEffect(() => {
    console.log("🔍 DEBUG: Sentry DSN is:", process.env.NEXT_PUBLIC_SENTRY_DSN);
  }, []);

  return (
    <>
      {/* 🔴 SENTRY TEST BUTTON */}
      <button
        onClick={() => {
          throw new Error("Sentry Test: The Eagle has landed from UI!");
        }}
        className="fixed bottom-4 right-4 z-50 bg-red-600 text-white p-4 font-bold border-4 border-black shadow-neo"
      >
        💣 TEST ERROR
      </button>

      <LandingPage />
    </>
  );
}