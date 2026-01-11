import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  // swcMinify was removed because it's now the default in Next.js 15+
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  reactCompiler: false,
  // Corrected experimental block for Next.js 15/16 types
  experimental: {
    // If you aren't using specific turbo rules, you can also just remove this block
  },
};

export default withPWA(nextConfig);