import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // We are removing the PWA wrapper for now
  reactCompiler: false, 
};

export default withSentryConfig(nextConfig, {
  // 1. Project Info (Keep your real values here)
  org: "krama", 
  project: "javascript-nextjs", // Make sure this matches your Sentry project slug exactly!

  // 2. Source Maps
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // 3. React Annotation
  reactComponentAnnotation: {
    enabled: true,
  },

  // 4. Tunneling -> REMOVED FOR DIRECT CONNECTION
  // tunnelRoute: "/monitoring",  <-- DELETED THIS LINE

  // 5. Build Logs
  silent: !process.env.CI,

  // 6. Tree Shaking
  disableLogger: true,
});