import { MetadataRoute } from 'next';
import posts from '@/data/posts.json';
import noindexSlugs from '@/data/noindex-slugs.json';

export const dynamic = 'force-static';

const BASE_URL = 'https://pawcritic.com';

// 薄内容（AdSense 恢复期 noindex）不出现在 sitemap
const excluded = new Set<string>(noindexSlugs as string[]);

export default function sitemap(): MetadataRoute.Sitemap {
  return (posts as any[])
    .filter((post) => !excluded.has(post.slug))
    .map((post) => ({
      url: `${BASE_URL}/${post.slug}`,
      lastModified: new Date(post.date || Date.now()),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
}
