import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Images ──────────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    // Use modern formats for better compression
    formats: ["image/avif", "image/webp"],
    // Cache optimised images for 7 days
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },

  // ── Transpile ESM-only packages ──────────────────────────────────────────────
  transpilePackages: ["motion"],

  // ── Security headers ─────────────────────────────────────────────────────────
  poweredByHeader: false,

  // ── Compression ──────────────────────────────────────────────────────────────
  compress: true,

  // ── Production source maps (disable for smaller bundles) ─────────────────────
  productionBrowserSourceMaps: false,

  // ── Strict mode ──────────────────────────────────────────────────────────────
  reactStrictMode: true,
};

export default nextConfig;
