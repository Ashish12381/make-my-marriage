import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Keep repository-wide guidance in the root AGENTS.md.
  agentRules: false,
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: String.raw`make-my-marriage-nine-rho\.vercel\.app` }],
        destination: 'https://planyourwedding.online/:path*',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    const upstream = process.env.API_UPSTREAM_ORIGIN;
    if (!upstream) return [];

    const url = new URL(upstream);
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash
    ) {
      throw new Error('API_UPSTREAM_ORIGIN must be an HTTPS origin without a path or credentials.');
    }
    return [{ source: '/api/v1/:path*', destination: `${url.origin}/api/v1/:path*` }];
  },
};

export default nextConfig;
