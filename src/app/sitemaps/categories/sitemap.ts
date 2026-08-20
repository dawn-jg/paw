import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const BASE_URL = 'https://pawcritic.com';

const categories = [
  { slug: 'dogs' }, { slug: 'cats' }, { slug: 'birds' },
  { slug: 'fish' }, { slug: 'small-pets' }, { slug: 'reptiles' },
];

// 分类页 sitemap
export default function sitemap(): MetadataRoute.Sitemap {
  return categories.map((cat) => ({
    url: `${BASE_URL}/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
}
