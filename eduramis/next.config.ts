import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    // Force correct project root (prevents Next from picking parent folder lockfile)
    root: __dirname,
  },
};

export default nextConfig;
