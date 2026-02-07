import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import withPWAInit from "@ducanh2912/next-pwa";

// 1. Configure the PWA Engine
const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

// 2. Your Base Config - SIMPLEST VERSION (just removed reactCompiler)
const nextConfig: NextConfig = {
  // That's it! No other changes needed.
};

// 3. Wrap everything: Sentry protects the PWA, which wraps the Config
export default withSentryConfig(
  withPWA(nextConfig), 
  {
    org: "krama", 
    project: "javascript-nextjs", 

    sourcemaps: {
      deleteSourcemapsAfterUpload: true,
    },

    // Fixed: moved from top-level to webpack namespace (Sentry v10+)
    webpack: {
      reactComponentAnnotation: {
        enabled: true,
      },
      treeshake: {
        removeDebugLogging: true,
      },
    },

    silent: !process.env.CI,
  }
);