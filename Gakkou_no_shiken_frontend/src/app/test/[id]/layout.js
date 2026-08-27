import { getTestDetail, getTests } from '@/lib/api';
import { cache } from 'react';

export const revalidate = 300; // Cache test metadata and layout for 5 minutes

export async function generateStaticParams() {
  try {
    const data = await getTests();
    const testsList = data?.tests || [
      ...(data?.tests_by_category?.basic || []),
      ...(data?.tests_by_category?.skill || []),
    ];
    if (testsList && testsList.length > 0) {
      const ids = Array.from(new Set(testsList.map((t) => String(t.id))));
      return ids.map((id) => ({ id }));
    }
  } catch (e) {
    // fallback test ids
  }
  return [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }, { id: '6' }];
}

const getCachedTestDetail = cache(async (id) => {
  return getTestDetail(id);
});

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  try {
    const test = await getCachedTestDetail(id);
    const testTitle = test?.title || `Mock Test #${id}`;
    const categoryName = test?.category === 'skill' ? 'SSW Skill Test' : 'JFT-Basic';
    const totalQ = test?.total_questions || test?.questions_count || 60;
    const duration = test?.duration_minutes || test?.time_limit || 60;

    return {
      title: `${testTitle} | Official Prometric CBT Mock Exam`,
      description: `Practice ${testTitle} (${categoryName}) online with authentic Prometric CBT interface, ${totalQ} questions, ${duration} minutes timer, native listening audio, and instant CEFR score report.`,
      alternates: {
        canonical: `https://www.gakkounoshiken.site/test/${id}`,
      },
      keywords: [
        testTitle,
        `${testTitle} mock test online`,
        `${categoryName} CBT practice test`,
        'Prometric CBT test Bangladesh',
        'Japanese mock exam with audio',
        'Gakkou No Shiken CBT test',
      ],
      openGraph: {
        title: `${testTitle} - ${categoryName} Mock Test`,
        description: `Score 200+ on ${testTitle}. Full Prometric CBT simulation with native audio and CEFR score.`,
        url: `https://www.gakkounoshiken.site/test/${id}`,
        images: [
          {
            url: '/img/logo.png',
            width: 512,
            height: 512,
            alt: `${testTitle} Mock Test`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${testTitle} | CBT Mock Exam`,
        description: `Practice ${testTitle} online with instant scoring and native listening audio.`,
        images: ['/img/logo.png'],
      },
    };
  } catch (err) {
    return {
      title: `Mock Test #${id} | JFT-Basic & SSW CBT Platform`,
      description:
        'Practice official Computer-Based Testing (CBT) mock exams for JFT-Basic and SSW skills with authentic Prometric simulation.',
      alternates: {
        canonical: `https://www.gakkounoshiken.site/test/${id}`,
      },
    };
  }
}

export default async function TestDetailLayout({ children, params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  let test = null;
  try {
    test = await getCachedTestDetail(id);
  } catch {}

  const testTitle = test?.title || `Mock Test #${id}`;
  const categoryName = test?.category === 'skill' ? 'SSW Skill Test' : 'JFT-Basic';
  const duration = test?.duration_minutes || test?.time_limit || 60;

  const quizSchema = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: testTitle,
    description: `Official-style ${categoryName} Computer-Based Testing (CBT) mock exam with instant scoring and audio.`,
    educationalLevel: test?.category === 'skill' ? 'Intermediate SSW-1' : 'A2 CEFR',
    assesses: 'Japanese Language & Workplace Competency',
    timeRequired: `PT${duration}M`,
    provider: {
      '@type': 'EducationalOrganization',
      name: 'Gakkou No Shiken',
      url: 'https://www.gakkounoshiken.site',
    },
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
        name: categoryName,
        item: `https://www.gakkounoshiken.site/${test?.category === 'skill' ? 'ssw-skill-test' : 'jft-basic'}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: testTitle,
        item: `https://www.gakkounoshiken.site/test/${id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
