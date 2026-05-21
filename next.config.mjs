/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  // Removed static export for dynamic booking features
  // output: "export",
  images: {
    unoptimized: true,
  },
  // Silence workspace root warning
  outputFileTracingRoot: undefined,
};

export default nextConfig;