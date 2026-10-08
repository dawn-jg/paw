import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const BASE_URL = 'https://pawcritic.com';

// 静态页面 sitemap
// 注：此处不输出 lastModified —— 静态页没有真实更新时间，new Date() 会给所有 URL
// 打上同一个构建时刻，Google 会直接忽略这种不可信的 lastmod。文章 sitemap 使用
// 真实的 post.date，那是本站唯一可信的 lastmod 来源。
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/reviews`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/blog`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/buying-guides`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/comparisons`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/how-we-test`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/editorial-policy`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/affiliate-disclosure`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/newsletter`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/privacy-policy`, changeFrequency: 'monthly', priority: 0.3 },
  ];
}
