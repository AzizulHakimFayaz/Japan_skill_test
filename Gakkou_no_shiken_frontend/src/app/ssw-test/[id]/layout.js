import { getTestDetail, getTests } from '@/lib/api';
import { cache } from 'react';

export const revalidate = 300; // Cache test metadata and layout for 5 minutes

export async function generateStaticParams() {
  try {
    const data = await getTests('skill');
    const testsList = data?.tests || (Array.isArray(data) ? data : []);
    if (testsList && testsList.length > 0) {
      const ids = Array.from(new Set(testsList.map((t) => String(t.id))));
      return ids.map((id) => ({ id }));
    }
  } catch (e) {
    // fallback test ids
  }
  return [{ id: '8' }, { id: '2' }];
}

const getCachedTestDetail = cache(async (id) => {
  return getTestDetail(id);
});

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  try {
    const test = await getCachedTestDetail(id);
    const testTitle = test?.title || `SSW Skill Test #${id}`;
    const totalQ = test?.total_questions || test?.questions_count || 45;
    const duration = test?.duration_minutes || test?.time_limit || 60;

    return {
      title: `${testTitle} | Official Prometric CBT Mock Exam`,
      description: `Practice ${testTitle} (SSW Skill Evaluation Test) online with authentic Prometric CBT interface, ${totalQ} questions, ${duration} minutes timer, listening audio, and instant score report.`,
      alternates: {
        canonical: `https://www.gakkounoshiken.site/ssw-test/${id}`,
      },
      keywords: [
        testTitle,
        `${testTitle} mock test online`,
        'SSW CBT practice test',
        'Prometric CBT test Bangladesh',
        'Specified Skilled Worker exam practice',
        'Gakkou No Shiken SSW CBT',
      ],
      openGraph: {
        title: `${testTitle} - SSW Skill Mock Exam`,
        description: `Full Prometric CBT simulation with native audio, typing questions, and instant pass/fail evaluation.`,
        url: `https://www.gakkounoshiken.site/ssw-test/${id}`,
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
        title: `${testTitle} | Prometric CBT Mock Exam`,
        description: `Practice ${testTitle} online with instant scoring and native audio.`,
        images: ['/img/logo.png'],
      },
    };
  } catch (err) {
    return {
      title: `SSW Skill Test #${id} | Prometric CBT Portal`,
      description:
        'Official Prometric CBT mock exam simulation for Specified Skilled Worker (SSW) skill tests.',
      alternates: {
        canonical: `https://www.gakkounoshiken.site/ssw-test/${id}`,
      },
    };
  }
}

export default function SswTestLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#1E232A] text-slate-100 flex flex-col justify-between select-none">
      {children}
    </div>
  );
}
