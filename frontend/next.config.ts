import type { NextConfig } from "next";
import path from "path";

// Use a unique build directory per port to allow multiple instances
const port = process.env.PORT || '3000';
const distDir = `.next-${port}`;

const nextConfig: NextConfig = {
  /* config options here */
  distDir: distDir,
};

export default nextConfig;
