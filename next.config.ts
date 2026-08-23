import type { NextConfig } from "next";

const r2Domain = new URL(process.env.R2_PUBLIC_URL!)

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    inlineCss: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: r2Domain.protocol.replace(":", "") as "https",
        hostname: r2Domain.hostname,
      },
    ],
  },
};

export default nextConfig;
