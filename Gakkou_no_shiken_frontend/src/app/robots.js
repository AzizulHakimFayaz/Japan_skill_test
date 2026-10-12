export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/*?*preview=',
          '/*?*token=',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/*?*preview=',
          '/*?*token=',
        ],
      },
      {
        userAgent: 'Mediapartners-Google',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://www.gakkounoshiken.site/sitemap.xml',
    host: 'https://www.gakkounoshiken.site',
  };
}
