import type { NextConfig } from "next";
import path from "node:path";

// Pin the workspace root to this project. Without it, Next infers the root from a
// stray lockfile in the home directory and prints a warning on build/start.
const projectRoot = path.join(__dirname);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: { root: projectRoot },
  outputFileTracingRoot: projectRoot,
};
export default nextConfig;
