import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack is default in Next.js 16+
  turbopack: {},
  // Keep webpack config for when --webpack flag is used explicitly
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.cache = false;
    }
    return config;
  },
  async headers() {
    return [
      {
        source: "/fonts/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;