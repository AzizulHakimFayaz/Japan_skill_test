export const metadata = {
  title: 'Free JLPT Mock Tests (N5, N4, N3, N2, N1) — Online Practice & 7-Language Explanations',
  description:
    'Practice free online JLPT N5, N4, N3, N2, and N1 mock tests on Gakkou No Shiken. Access 1,935+ timed practice sets, 32,800+ vocabulary, kanji, grammar & reading questions, a 3-minute level placement test, and explanations in English, Bangla, Indonesian, Nepali, Vietnamese, Tagalog & Hindi.',
  keywords: [
    'JLPT mock test',
    'JLPT mock test free',
    'JLPT N5 mock test online',
    'JLPT N4 practice test',
    'JLPT N3 mock exam',
    'JLPT N2 mock test',
    'JLPT N1 practice test',
    'JLPT mock test Bangladesh',
    'JLPT level checker',
    'free Japanese proficiency test online',
  ],
  alternates: {
    canonical: 'https://www.gakkounoshiken.site/jlpt',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.gakkounoshiken.site/jlpt',
    title: 'Free JLPT Mock Tests (N5–N1) | 32,800+ Questions & Level Checker',
    description:
      'Take free JLPT N5, N4, N3, N2 & N1 mock exams online with instant scoring, 3-minute placement test, and 7-language explanations.',
    images: [{ url: '/img/logo.png', width: 512, height: 512, alt: 'Gakkou No Shiken JLPT Mock Hub' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free JLPT Mock Tests (N5–N1) | Gakkou No Shiken',
    description:
      'Practice 1,935+ free JLPT N5–N1 mock test sets with 7-language explanations and instant results.',
    images: ['/img/logo.png'],
  },
};

export default function JlptLayout({ children }) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Are the JLPT N5, N4, N3, N2, and N1 mock tests free on Gakkou No Shiken?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. All 1,935+ JLPT practice sets and 32,800+ questions across levels N5, N4, N3, N2, and N1—plus the 3-minute JLPT level placement test—are 100% free to practice online.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the passing score for JLPT N5 and JLPT N4?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Out of 180 total points, the overall passing score is 80/180 for JLPT N5 and 90/180 for JLPT N4, provided you also meet the minimum sectional scores in Language Knowledge/Reading and Listening.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which explanation languages are supported for JLPT mock tests?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Gakkou No Shiken provides JLPT question explanations in 7 languages: English, Bengali (Bangla), Indonesian, Nepali, Vietnamese, Tagalog, and Hindi.',
        },
      },
      {
        '@type': 'Question',
        name: 'Should I take JLPT N4 or JFT-Basic for the Japan SSW visa?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Both JLPT N4 and JFT-Basic (200/250) satisfy the Japanese language requirement for Japan’s Specified Skilled Worker (SSW Type 1) visa. JFT-Basic is offered frequently via Prometric CBT with instant results, while JLPT is held twice a year in July and December and is also recognized by universities and employers.',
        },
      },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.gakkounoshiken.site' },
      { '@type': 'ListItem', position: 2, name: 'JLPT Mock Tests (N5–N1)', item: 'https://www.gakkounoshiken.site/jlpt' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
