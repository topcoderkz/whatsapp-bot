/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  async rewrites() {
    const botUrl = process.env.BOT_INTERNAL_URL || 'http://localhost:3000';
    return [
      {
        source: '/api/bot/:path*',
        destination: `${botUrl}/admin/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
