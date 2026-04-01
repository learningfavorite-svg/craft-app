/** @type {import('next').NextConfig} */

// NEXT_OUTPUT_MODE=server → Docker mode (API routes + postgres)
// NEXT_OUTPUT_MODE=export or unset → Electron static export
const isServerMode = process.env.NEXT_OUTPUT_MODE === 'server';

const nextConfig = {
  // Static export for Electron; server mode for Docker with API routes
  ...(isServerMode ? {} : { output: 'export' }),

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
        'better-sqlite3': false,
      };
    }
    // Exclude pg from client bundle — only used in API routes (server)
    if (!isServer) {
      config.externals = [...(config.externals || []), 'pg', 'pg-native'];
    }
    return config;
  },
};

export default nextConfig;
