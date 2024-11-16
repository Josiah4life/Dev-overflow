/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // missingSuspenseWithCSRBailout: false,
    // serverActions: true, Not needed, enabled by default, give errors during build process
    mdxRs: true,
  },
  serverExternalPackages: ["mongoose"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
      {
        protocol: "http",
        hostname: "*",
      },
    ],
  },
};

export default nextConfig;
