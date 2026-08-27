import type { NextConfig } from "next";

const r2Domain = new URL(process.env.R2_PUBLIC_URL!);

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  cacheComponents: true,
  poweredByHeader: false,
  partialPrefetching: true,

  reactStrictMode: true,
  cacheLife: {
    catalog: {
      stale: 300,
      revalidate: 31536000,
      expire: 31536900,
    },
  },
  experimental: {
    // every ssr query rebuil dall css inline
    // inlineCss: true,
  },
  images: {
    unoptimized: true, // reached the vercel limit
    qualities: [60, 75],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: r2Domain.protocol.replace(":", "") as "https",
        hostname: r2Domain.hostname,
      },
    ],
  },
};

export default nextConfig;
