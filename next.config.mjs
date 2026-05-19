/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
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
    ],
  },
}

export default nextConfig
