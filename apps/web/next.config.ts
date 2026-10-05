import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Keep repository-wide guidance in the root AGENTS.md.
  agentRules: false,
  reactStrictMode: true,
};

export default nextConfig;
