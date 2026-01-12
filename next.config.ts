import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // We are removing the PWA wrapper for now
  reactCompiler: false, // Keep this false for now to save memory
};

export default withSentryConfig(nextConfig, {
  // 1. Project Info (From Sentry Dashboard)
  org: "krama", 
  project: "javascript-nextjs",

  // 2. Source Maps (The V8 Way)
  // This replaces 'hideSourceMaps' and 'widenClientFileUpload'
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // 3. React Annotation
  reactComponentAnnotation: {
    enabled: true,
  },

  // 4. Tunneling (Avoids Ad-Blockers)
  tunnelRoute: "/monitoring",

  // 5. Build Logs
  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // 6. Tree Shaking
  disableLogger: true,
});