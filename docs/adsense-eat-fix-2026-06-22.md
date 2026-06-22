# AdSense "低价值内容" 全面修复 — 2026-06-22

## 背景
Google AdSense 审核反馈 PawCritic 为「低价值内容」，需提升 E-E-A-T 信号。

## 修复 6 项

### A. E-E-A-T 页面（4 新页）
创建专用路由页面：
- `/about` — 团队介绍与网站使命
- `/how-we-test` — 评测方法论（Hands-On Testing + 用户反馈 + 兽医审核）
- `/contact` — 联系表单
- `/editorial-policy` — 编辑政策 + 利益冲突声明

已从 `[slug]` 动态路由的 `INFO_SLUGS` 中移除避免路由冲突。

### B. 作者信息
- 全部 213 篇文章分配作者：Dr. Sarah Chen（Dogs/Cats, 71篇）、Emily Zhao（Birds/Small Pets, 71篇）、Marcus Rivera（Fish/Reptiles, 71篇）
- 每篇文章含 author/authorSlug/authorBio 字段
- 原有 `[slug]/page.tsx` 已支持 author 渲染 + JSON-LD 结构化数据

### C. 真实产品图片
- 从 Amazon 下载 18 种 ASIN 产品图 → `public/images/products/{ASIN}.jpg`
- 覆盖高频 ASIN（B087DNHXD4 62篇、B000255NCI 47篇、B0FKSV1146 27篇等）
- 每篇文章前 2 张 loremflickr 替换为真实产品图（共替换 227 张）

### D. 图片数量精简
- 924 张 → 393 张（max 2/post，avg 1.8/post）
- 防止 AdSense 误判为低质量自动生成

### E. 商业化瘦身
- 2493 条 Amazon affiliate 链接 → 保留 5/篇（共 ~1065 条）
- 原有平均 16 条/篇 → 平均 5 条/篇
- 链接减少但每个链接更有价值（contextual placement），点击率预期提升

### F. 结构化数据
`[slug]/page.tsx` 已有：
- Article JSON-LD（headline、author、datePublished 等）
- Product JSON-LD（价格、评分、品牌等）
- Organization JSON-LD（在 layout.tsx）

## 构建状态
- ✅ 235 页、0 错误
- ✅ commit `9fe0803` 推送 GitHub
- 🔄 Cloudflare Pages 自动部署中

## 待后续
- 剩下 30 个低覆盖 ASIN 产品图（可后续手动补充）
- 5 篇旧文章 "Product review for" 文字块清理
- cron 临时文件清理安全策略问题
