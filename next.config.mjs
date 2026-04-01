/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: { serverActions: { allowedOrigins: ["localhost:3000"] } },
  // Expose HF_TOKEN as a public env var for client-side HF Inference calls
  env: {
    NEXT_PUBLIC_HF_TOKEN: process.env.HF_TOKEN ?? '',
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        "better-sqlite3": false,
      };
    }
    return config;
  },
};

export default nextConfig;
