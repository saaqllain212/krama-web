import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

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

const nextConfig: NextConfig = {
  // 1. Temporarily disable the compiler to save memory during build
  reactCompiler: false, 
  
  // 2. Suppress the Turbopack warning by using an empty object if needed
  // experimental: { turbo: {} }, 
};

export default withPWA(nextConfig);