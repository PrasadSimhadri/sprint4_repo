import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude pg from Turbopack bundling (Node.js native module)
  serverExternalPackages: ['pg', 'pg-pool'],
};

export default nextConfig;
