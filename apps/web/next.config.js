/** @type {import('next').NextConfig} */
const nextConfig = {
  // Comma-separated origins allowed during local dev tunnelling (e.g. ngrok).
  // Leave unset in production — no dev origins should be trusted in prod.
  allowedDevOrigins: process.env.ALLOWED_DEV_ORIGINS
    ? process.env.ALLOWED_DEV_ORIGINS.split(",").map((s) => s.trim())
    : [],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
    ],
  },
};

export default nextConfig;
