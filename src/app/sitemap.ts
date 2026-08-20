import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const BASE_URL = 'https://pawcritic.com';

// 主 sitemap.xml = sitemap index，指向 4 个分区 sitemap
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/sitemaps/static/sitemap.xml` },
    { url: `${BASE_URL}/sitemaps/categories/sitemap.xml` },
    { url: `${BASE_URL}/sitemaps/articles/sitemap.xml` },
    { url: `${BASE_URL}/sitemaps/info/sitemap.xml` },
  ];
}
