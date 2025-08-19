import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'localhost',
      '127.0.0.1',
      // Add your production/staging image domains here
    ],
  },
};

export default nextConfig;
