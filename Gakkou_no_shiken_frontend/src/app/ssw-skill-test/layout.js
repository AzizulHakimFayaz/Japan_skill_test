export const metadata = {
  title: "SSW Sector Skills Evaluation CBT Mock Tests | Specified Skilled Worker Japan",
  description:
    'Practice authentic SSW (Specified Skilled Worker) skill evaluation mock tests online. Industry-specific CBT exams for Nursing Care, Food Service, Agriculture, and more with instant scoring and textbook syllabi.',
  alternates: {
    canonical: 'https://www.gakkounoshiken.site/ssw-skill-test',
  },
  keywords: [
    'SSW skill test Bangladesh',
    'Specified Skilled Worker exam Japan',
    'SSW nursing care mock test online',
    'SSW food service skills evaluation test',
    'SSW agriculture practice exam CBT',
    'SSW Prometric exam booking Bangladesh',
    'Specified Skilled Worker Type 1 visa',
    'SSW skill test passing score',
  ],
  openGraph: {
    title: 'SSW Sector Skills Evaluation CBT Mock Tests - Gakkou No Shiken',
    description:
      'Prepare for Japan Specified Skilled Worker (SSW) exams with realistic CBT simulations, sector syllabi, and test center guides.',
    url: 'https://www.gakkounoshiken.site/ssw-skill-test',
    images: [
      {
        url: '/img/logo.png',
        width: 512,
        height: 512,
        alt: 'SSW Skills CBT Mock Test Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SSW Sector Skills Evaluation CBT Mock Tests',
    description:
      'Master the SSW Nursing, Food Service, and Agriculture skills tests with online CBT mock exams.',
    images: ['/img/logo.png'],
  },
};

export default function SswSkillTestLayout({ children }) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the SSW (Specified Skilled Worker) Skills Evaluation Test?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "The SSW Skills Evaluation Test assesses whether an applicant possesses the technical knowledge, practical skills, and domain-specific Japanese required to work in designated Japanese industries under the Specified Skilled Worker (SSW-1) visa.",
        },
      },
      {
        '@type': 'Question',
        name: 'Which SSW skill tests can I practice on Gakkou No Shiken?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can practice CBT mock exams for Nursing Care, Food Service Industry, Agriculture, Accommodations/Hospitality, and other high-demand SSW sectors.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the two requirements for obtaining the SSW (i) visa for Japan?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Candidates must pass: 1) A recognized Japanese language exam (JFT-Basic or JLPT N4+), and 2) The industry-specific SSW Skills Evaluation Test for their chosen sector.',
        },
      },
    ],
  };

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
        name: 'SSW Skill Test',
        item: 'https://www.gakkounoshiken.site/ssw-skill-test',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
