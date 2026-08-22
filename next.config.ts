import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-a63d741996974f309ae0fc2488e0ba5b.r2.dev",
      },
    ],
  },
};

export default nextConfig;
