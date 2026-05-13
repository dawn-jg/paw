import { MetadataRoute } from 'next';
import posts from '@/data/posts.json';

const BASE_URL = 'https://www.pawcritic.com';

const categories = [
  { slug: 'dogs', name: 'Dogs' },
  { slug: 'cats', name: 'Cats' },
  { slug: 'birds', name: 'Birds' },
  { slug: 'fish', name: 'Fish' },
  { slug: 'small-pets', name: 'Small Pets' },
  { slug: 'reptiles', name: 'Reptiles' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/reviews`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const articleRoutes: MetadataRoute.Sitemap = posts.map((post: any) => ({
    url: `${BASE_URL}/${post.slug}`,
    lastModified: new Date(post.pubDate || Date.now()),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}