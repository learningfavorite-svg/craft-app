/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export — Electron loads out/index.html directly (no server needed)
  output: "export",
  // Required for static export with Next.js Image component
  images: { unoptimized: true },
  // Expose HF token for client-side Hugging Face Inference calls
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
