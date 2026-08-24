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
    ];
  },
};


export default nextConfig;
