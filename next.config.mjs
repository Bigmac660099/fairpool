/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Candidate/symbol images may be hosted anywhere in the demo data layer.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
