export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/attempt/',
          '/accounts/my-results/',
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
          '/attempt/',
          '/accounts/my-results/',
          '/*?*preview=',
          '/*?*token=',
        ],
      },
    ],
    sitemap: 'https://www.gakkounoshiken.site/sitemap.xml',
    host: 'https://www.gakkounoshiken.site',
  };
}
