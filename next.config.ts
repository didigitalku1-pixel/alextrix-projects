import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable type checking in build - do NOT skip
  typescript: {
    ignoreBuildErrors: false,
  },

  // Enable React strict mode for catching subtle bugs
  reactStrictMode: true,

  // Output standalone build for self-hosting / Docker / Vercel
  // Matches package.json "start" script that uses .next/standalone/server.js
  output: "standalone",

  // Allow cross-origin requests from preview domains
  allowedDevOrigins: ["*.space-z.ai"],
};

export default nextConfig;
