import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // We are removing the PWA wrapper for now
  reactCompiler: false, // Keep this false for now to save memory
};

export default nextConfig;