import type { NextConfig } from "next";

// Static export so the same build runs on GitHub Pages and Vercel.
// NEXT_PUBLIC_BASE_PATH is set to "/Risk-Calculator" only in the GitHub
// Pages workflow; local dev and Vercel serve from the root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  turbopack: {
    root: __dirname,
  },
  ...(basePath ? { basePath } : {}),
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
