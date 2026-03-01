/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  // Silence workspace root warning
  outputFileTracingRoot: undefined,
};

export default nextConfig;