import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  metadataBase: new URL('https://www.gakkounoshiken.site'),
  alternates: {
    canonical: 'https://www.gakkounoshiken.site',
  },
  title: {
    default: "JFT-Basic & SSW Skill CBT Mock Test | Bangladesh's #1 Japanese Exam Platform - Gakkou No Shiken",
    template: '%s | JFT-Basic & SSW Mock Test Platform',
  },
  description:
    "Bangladesh's 1st & #1 official Computer-Based Testing (CBT) mock exam platform for JFT-Basic & SSW (Specified Skilled Worker) exams. Authentic Prometric CBT simulations, native listening audio, 10 language aids, and instant CEFR score reports.",
  keywords: [
    'JFT-Basic practice exam',
    'JFT mock test online',
    'JFT mock test Bangladesh',
    'SSW skill mock test',
    'SSW exam Bangladesh',
    'Specified Skilled Worker Japanese test',
    'Prometric CBT practice Bangladesh',
    'JFT listening practice online',
    'Gakkou No Shiken',
    '学校の試験',
    'Japanese CBT test Bangladesh',
    'JFT BDJ01 BDJ02 mock exam',
    'SSW nursing food agriculture CBT test',
  ],
  authors: [{ name: 'Gakkou No Shiken' }],
  creator: 'Gakkou No Shiken',
  publisher: 'Gakkou No Shiken',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.gakkounoshiken.site',
    siteName: "JFT-Basic & SSW CBT Mock Test Platform | Bangladesh's #1",
    title: "JFT-Basic & SSW Skill CBT Mock Test | Bangladesh's #1 Japanese Exam Platform",
    description:
      "Bangladesh's 1st authentic Prometric CBT examination simulator for JFT-Basic & SSW skills with native listening audio and instant CEFR score reports.",
    images: [
      {
        url: '/img/logo.png',
        width: 512,
        height: 512,
        alt: 'JFT-Basic & SSW Skill CBT Mock Test Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "JFT-Basic & SSW Skill CBT Mock Test | Bangladesh's #1 Japanese Exam Platform",
    description:
      "Bangladesh's 1st authentic Prometric CBT examination simulator for JFT-Basic & SSW skills with native listening audio and instant CEFR score reports.",
    images: ['/img/logo.png'],
  },
  verification: {
    google: 'fI-KwMB7mR1ngiM-wpYJb7Wj9iP5ytkJF3FRLSjRDRU',
  },
  icons: {
    icon: [
      { url: '/favicon.ico?v=5', sizes: 'any' },
      { url: '/img/logo.png?v=5', type: 'image/png' },
      { url: '/icon.png?v=5', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=5',
    apple: '/apple-icon.png?v=5',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-slate-50 dark:bg-[#060913]">
      <head>
        <link rel="icon" type="image/png" href="/img/logo.png?v=5" />
        <link rel="shortcut icon" href="/favicon.ico?v=5" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=5" />

        {/* Schema.org EducationalOrganization & WebSite JSON-LD for Google Rich Snippets & Brand Knowledge Graph */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'Gakkou No Shiken',
                alternateName: [
                  'JFT-Basic & SSW CBT Mock Test Platform',
                  '学校の試験',
                  'GakkouNoShiken',
                ],
                url: 'https://www.gakkounoshiken.site',
                potentialAction: {
                  '@type': 'SearchAction',
                  target: {
                    '@type': 'EntryPoint',
                    urlTemplate: 'https://www.gakkounoshiken.site/?q={search_term_string}',
                  },
                  'query-input': 'required name=search_term_string',
                },
              },
              {
                '@context': 'https://schema.org',
                '@type': 'EducationalOrganization',
                name: 'JFT-Basic & SSW Skill CBT Mock Test Platform - Gakkou No Shiken',
                alternateName: [
                  'Gakkou No Shiken',
                  "Bangladesh's #1 Japanese CBT Exam Platform",
                  '学校の試験',
                ],
                url: 'https://www.gakkounoshiken.site',
                logo: 'https://www.gakkounoshiken.site/img/logo.png',
                image: 'https://www.gakkounoshiken.site/img/logo.png',
                description:
                  "Bangladesh's 1st and leading Computer-Based Testing (CBT) mock exam platform for JFT-Basic and SSW skill evaluation tests with native audio and CEFR score reports.",
                sameAs: [
                  'https://www.facebook.com/gakkounoshiken',
                  'https://www.youtube.com/@gakkounoshiken',
                ],
              },
            ]),
          }}
        />

        {/* Anti-FOUC Instant Theme Initializer */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('gns_theme');
                if (t === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />

        {/* Leaflet CSS for maps */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        {/* Google Identity Services (One-Tap & 1-Click Sign-In) */}
        <script src="https://accounts.google.com/gsi/client" async defer></script>

        {/* Google AdSense Account Meta Tag & Script */}
        <meta name="google-adsense-account" content="ca-pub-8435487820435842" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8435487820435842"
          crossOrigin="anonymous"
        ></script>
      </head>

      <body className="flex flex-col min-h-full text-slate-800 dark:text-slate-100 bg-transparent antialiased font-sans selection:bg-red-500 selection:text-white relative overflow-x-hidden transition-colors duration-500">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

