import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'localhost',
      '127.0.0.1',
      'https://dep2-backend.onrender.com'
          ],
  },
};

export default nextConfig;
