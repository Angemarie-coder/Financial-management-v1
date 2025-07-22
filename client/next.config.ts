import type { NextConfig } from "next";

/**
 * Ignore ESLint errors during builds (temporary workaround for deployment)
 */
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
