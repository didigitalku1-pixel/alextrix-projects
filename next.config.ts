import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable type checking in build - do NOT skip
  typescript: {
    ignoreBuildErrors: false,
  },

  // Enable React strict mode for catching subtle bugs
  reactStrictMode: true,

  // Output standalone build for self-hosting / Docker / Vercel
  output: "standalone",

  // Allow cross-origin requests from preview domains
  allowedDevOrigins: ["*.space-z.ai"],

  // Clean URLs: /templates → /?tab=templates (internal rewrite, URL stays clean)
  // /templates/[slug] still works for detail pages (rewrites only match exact paths)
  async rewrites() {
    return [
      { source: "/templates", destination: "/?tab=templates" },
      { source: "/components", destination: "/?tab=components" },
      { source: "/assets", destination: "/?tab=assets" },
      { source: "/skills", destination: "/?tab=skills" },
    ];
  },
};

export default nextConfig;
