import './globals.css';
import { AuthProvider } from '@/components/AuthContext';
import { ThemeProvider } from '@/components/ThemeContext';
import AnimatedThemeBackground from '@/components/AnimatedThemeBackground';
import PlayfulCatAndMouse from '@/components/PlayfulCatAndMouse';
import AppLayout from '@/components/AppLayout';

export const metadata = {
  metadataBase: new URL('https://www.gakkounoshiken.site'),
  title: {
    default: 'Gakkou No Shiken (学校の試験) | Official Japanese CBT Exam Portal',
    template: '%s | Gakkou No Shiken',
  },
  description:
    'Practice official Computer-Based Testing (CBT) mock tests for JFT-Basic & Specified Skilled Worker (SSW) exams with authentic Prometric UI, audio listening, instant CEFR scoring, and leaderboards.',
  keywords: [
    'JFT-Basic practice exam',
    'JFT mock test online',
    'SSW skill exam preparation',
    'Specified Skilled Worker Japanese test',
    'Prometric CBT practice',
    'Gakkou No Shiken',
    '学校の試験',
    'Japanese test online with audio',
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
    siteName: 'Gakkou No Shiken (学校の試験)',
    title: 'Gakkou No Shiken | Japanese JFT-Basic & SSW CBT Exam Portal',
    description:
      'Prepare for your official Japanese Prometric exam with live timed CBT tests, native listening audio, and instant CEFR score reports.',
    images: [
      {
        url: '/img/logo.png',
        width: 512,
        height: 512,
        alt: 'Gakkou No Shiken Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gakkou No Shiken | Japanese JFT-Basic & SSW CBT Exam Portal',
    description:
      'Prepare for your official Japanese Prometric exam with live timed CBT tests, native listening audio, and instant CEFR score reports.',
    images: ['/img/logo.png'],
  },
  verification: {
    google: 'fI-KwMB7mR1ngiM-wpYJb7Wj9iP5ytkJF3FRLSjRDRU',
  },
  icons: {
    icon: [
      { url: '/img/logo.png?v=2', sizes: 'any' },
      { url: '/img/logo.png?v=2', type: 'image/png' },
    ],
    shortcut: '/img/logo.png?v=2',
    apple: '/img/logo.png?v=2',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-slate-50 dark:bg-[#060913]">
      <head>
        <link rel="icon" type="image/png" href="/img/logo.png?v=2" />
        <link rel="shortcut icon" type="image/png" href="/img/logo.png?v=2" />
        <link rel="apple-touch-icon" href="/img/logo.png?v=2" />

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
        <ThemeProvider>
          <AnimatedThemeBackground />
          <PlayfulCatAndMouse />
          <AuthProvider>
            <AppLayout>{children}</AppLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

