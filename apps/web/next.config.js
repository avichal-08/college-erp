/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: "../../",
  },
  experimental: {
    outputFileTracingRoot: "../../",
  },
};

export default nextConfig;