export const metadata = {
  title: "JFT-Basic CBT Mock Tests & Prometric Exam Guide | Bangladesh's #1",
  description:
    'Practice authentic JFT-Basic Computer-Based Testing (CBT) mock exams online. Featuring native audio, 4-section breakdown, Dhaka & Chittagong test center guides, and official Irodori learning resources.',
  alternates: {
    canonical: 'https://www.gakkounoshiken.site/jft-basic',
  },
  keywords: [
    'JFT-Basic mock test online',
    'JFT-Basic practice exam Bangladesh',
    'JFT listening practice audio',
    'Prometric JFT Dhaka test center',
    'JFT pass mark out of 250',
    'JFT vs JLPT N4 difference',
    'Irodori Japanese textbook free download',
    'JFT exam voucher Bangladesh',
  ],
  openGraph: {
    title: 'JFT-Basic CBT Mock Tests & Exam Prep - Gakkou No Shiken',
    description:
      'Practice official-style JFT-Basic CBT mock exams with instant scoring, native listening, and test venue guides.',
    url: 'https://www.gakkounoshiken.site/jft-basic',
    images: [
      {
        url: '/img/logo.png',
        width: 512,
        height: 512,
        alt: 'JFT-Basic Mock Test Bangladesh',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JFT-Basic CBT Mock Tests & Prometric Guide',
    description:
      'Pass your JFT-Basic exam with authentic CBT mock tests and comprehensive syllabus breakdown.',
    images: ['/img/logo.png'],
  },
};

export default function JftBasicLayout({ children }) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the difference between JFT-Basic and JLPT N4?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Both JFT-Basic and JLPT N4 fulfill the Japanese language prerequisite for Japan's Specified Skilled Worker (SSW Type 1) visa. However, JFT-Basic is conducted multiple times a month via Computer-Based Testing (CBT) with instant score reports, whereas JLPT is held only twice a year on paper.",
        },
      },
      {
        '@type': 'Question',
        name: 'What is the passing score for the JFT-Basic exam?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The passing score for JFT-Basic is 200 points out of a maximum score of 250 points (an accuracy rate of approximately 80%).',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I retake the JFT-Basic test if I fail?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Candidates must wait 30 full days after taking a JFT-Basic exam before sitting for another attempt.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where are the JFT-Basic Prometric test centers located in Bangladesh?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Prometric authorized UTC test venues are located in Dhaka (Dhanmondi, Banani) and Chittagong (Agrabad). Candidates must arrive 30 minutes prior with an original passport and Prometric admission ticket.',
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
        name: 'JFT-Basic',
        item: 'https://www.gakkounoshiken.site/jft-basic',
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
