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
        destination: "http://137.184.15.223:3333/api/:path*",
      },
      {
        source: "/socket.io/:path*",
        destination: "http://137.184.15.223:3333/socket.io/:path*",
      },
    ];
  },
};

export default nextConfig;
