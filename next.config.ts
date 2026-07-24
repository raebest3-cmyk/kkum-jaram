import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/admin/login',
        destination: '/admin/login',
      },
      {
        source: '/admin',
        destination: '/admin',
      },
    ]
  },
};

export default nextConfig;
