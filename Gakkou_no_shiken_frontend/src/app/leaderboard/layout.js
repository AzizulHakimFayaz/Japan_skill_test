export const metadata = {
  title: "Candidate Leaderboard & Rankings | Top Japanese CBT Scorers Bangladesh",
  description:
    'Track live candidate performance, top scores, and hall of fame rankings for JFT-Basic and SSW skill mock tests across Bangladesh.',
  alternates: {
    canonical: 'https://www.gakkounoshiken.site/leaderboard',
  },
  keywords: [
    'JFT-Basic leaderboard Bangladesh',
    'SSW top test scorers',
    'Japanese CBT exam rankings',
    'Gakkou No Shiken top candidates',
    'Japanese mock test score tracker',
  ],
  openGraph: {
    title: 'Candidate Leaderboard & Rankings - Gakkou No Shiken',
    description:
      'Discover top performers and average scores on Bangladesh’s #1 JFT-Basic & SSW CBT mock test platform.',
    url: 'https://www.gakkounoshiken.site/leaderboard',
    images: [
      {
        url: '/img/logo.png',
        width: 512,
        height: 512,
        alt: 'Candidate Leaderboard Rankings',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Candidate Leaderboard & Top CBT Scorers',
    description:
      'View highest scores and live rankings of JFT-Basic and SSW candidates in Bangladesh.',
    images: ['/img/logo.png'],
  },
};

export default function LeaderboardLayout({ children }) {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.gakkounoshiken.site',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Leaderboard',
        item: 'https://www.gakkounoshiken.site/leaderboard',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
