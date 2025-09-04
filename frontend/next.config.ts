import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3333/api/:path*",
      },
      {
        source: "/socket.io/:path*",
        destination: "http://localhost:3333/socket.io/:path*",
      },
    ];
  },
};

export default nextConfig;
