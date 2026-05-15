/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Language', value: 'ru' },
        ],
      },
    ];
  },

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
