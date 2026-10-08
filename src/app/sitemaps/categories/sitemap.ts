import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const BASE_URL = 'https://pawcritic.com';

const categories = [
  { slug: 'dogs' }, { slug: 'cats' }, { slug: 'birds' },
  { slug: 'fish' }, { slug: 'small-pets' }, { slug: 'reptiles' },
];

// 分类页 sitemap
// 不输出 lastModified：分类页没有单一真实更新时间，构建时刻的时间戳会被 Google 忽略。
export default function sitemap(): MetadataRoute.Sitemap {
  return categories.map((cat) => ({
    url: `${BASE_URL}/${cat.slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
}
