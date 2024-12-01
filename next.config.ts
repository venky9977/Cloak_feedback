import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    appDir: true, // Ensures Next.js recognizes the `app` directory
  },
};

export default nextConfig;
