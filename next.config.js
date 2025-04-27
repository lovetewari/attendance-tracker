/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    // Handle native modules like bcrypt
    config.externals = [...(config.externals || []), "bcrypt"]
    return config
  },
  // Add this to ensure environment variables are loaded properly
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    PORT: process.env.PORT,
    FRONTEND_URL: process.env.FRONTEND_URL,
  },
}

module.exports = nextConfig
