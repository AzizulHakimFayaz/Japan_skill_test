/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/quiz',
        destination: '/',
        permanent: false,
      },
      {
        source: '/quiz/:id',
        destination: '/test/:id',
        permanent: false,
      },
      {
        source: '/privacy-policy',
        destination: '/privacy',
        permanent: true,
      },
      {
        source: '/terms-of-service',
        destination: '/terms',
        permanent: true,
      },
      {
        source: '/admin',
        destination: 'https://gakkounoshiken.site/admin/',
        permanent: false,
      },
      {
        source: '/admin/:path*',
        destination: 'https://gakkounoshiken.site/admin/:path*',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
