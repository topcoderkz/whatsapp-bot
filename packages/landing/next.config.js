/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'storage.googleapis.com' },
    ],
  },
  async rewrites() {
    // In local dev, uploaded images live in admin's public/uploads/
    if (process.env.NODE_ENV !== 'production') {
      return [
        {
          source: '/uploads/:path*',
          destination: 'http://localhost:3001/uploads/:path*',
        },
        {
          source: '/:locale/uploads/:path*',
          destination: 'http://localhost:3001/uploads/:path*',
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;
