import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import withPWAInit from "@ducanh2912/next-pwa";

// 1. Configure the PWA Engine
const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development", // Only run in production
  workboxOptions: {
    disableDevLogs: true,
  },
});

// 2. Your Base Config (Kept exactly as is)
const nextConfig: NextConfig = {
  reactCompiler: false, 
};

// 3. Wrap everything: Sentry protects the PWA, which wraps the Config
export default withSentryConfig(
  withPWA(nextConfig), 
  {
    // --- Sentry Settings (Preserved) ---
    org: "krama", 
    project: "javascript-nextjs", 

    sourcemaps: {
      deleteSourcemapsAfterUpload: true,
    },

    reactComponentAnnotation: {
      enabled: true,
    },

    silent: !process.env.CI,
    disableLogger: true,
  }
);