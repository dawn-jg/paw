import { MetadataRoute } from 'next';
import posts from '@/data/posts.json';

export const dynamic = 'force-static';

const BASE_URL = 'https://pawcritic.com';

// 文章 sitemap（369 篇 < 50000，单文件）
export default function sitemap(): MetadataRoute.Sitemap {
  return (posts as any[]).map((post) => ({
    url: `${BASE_URL}/${post.slug}`,
    lastModified: new Date(post.date || Date.now()),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
}
