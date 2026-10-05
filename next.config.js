/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm256318-islam-saeed-physics-backend-7uitli.cranl.net',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      }
    ],
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

    if (process.env.NODE_ENV === 'production' && (!apiUrl || !serverUrl)) {
      throw new Error('NEXT_PUBLIC_API_URL and NEXT_PUBLIC_SERVER_URL must be set in production');
    }

    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiUrl || 'http://localhost:5000/api/v1'}/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${serverUrl || 'http://localhost:5000'}/uploads/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
