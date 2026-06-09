/** @type {import('next').NextConfig} */
const BACKEND_URL = process.env.BACKEND_PROXY_URL || "https://api.aman.yichalal.ai"

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.aman.yichalal.ai",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "api.aman.yichalal.ai",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "staging.aman.yichalal.ai",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/media/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
    ]
  },
}

export default nextConfig
