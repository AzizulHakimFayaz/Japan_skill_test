import { getTests } from '@/lib/api';

export const revalidate = 3600; // Refresh sitemap hourly

export default async function sitemap() {
  const baseUrl = 'https://www.gakkounoshiken.site';

  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/jft-basic`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/ssw-skill-test`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/accounts/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/accounts/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  let testRoutes = [];
  try {
    const data = await getTests();
    const testsList = data?.tests || [
      ...(data?.tests_by_category?.basic || []),
      ...(data?.tests_by_category?.skill || []),
    ];

    // Remove duplicates if any
    const uniqueTests = Array.from(new Map(testsList.map((t) => [t.id, t])).values());

    testRoutes = uniqueTests.map((t) => ({
      url: `${baseUrl}/test/${t.id}`,
      lastModified: t.updated_at ? new Date(t.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    }));
  } catch (err) {
    console.error('Sitemap dynamic test fetch fallback:', err);
    // Fallback routes if backend is not reached during static generation
    testRoutes = [1, 2, 3, 4].map((id) => ({
      url: `${baseUrl}/test/${id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    }));
  }

  return [...staticRoutes, ...testRoutes];
}
