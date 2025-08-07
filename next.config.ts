import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/chat',
        destination: '/'
      }
    ]
  }
};

export default nextConfig;
