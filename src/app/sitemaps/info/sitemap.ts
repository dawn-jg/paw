import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const BASE_URL = 'https://pawcritic.com';

// 作者档案页 sitemap
// 注：本站不使用虚构的个人作者人设，署名统一为编辑团队。
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/author/editorial-team`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];
}
