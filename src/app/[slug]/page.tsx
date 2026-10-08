import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import ShareButtons from '../components/ShareButtons';

// ─── Types ───────────────────────────────────────────
interface Post {
  title: string;
  slug: string;
  category: string;
  date: string;
  charCount: number;
  description: string;
  content: string;
  author?: string;
  authorSlug?: string;
  authorBio?: string;
}

interface CatPost {
  title: string;
  slug: string;
  date: string;
  description: string;
}

interface Category {
  name: string;
  posts: CatPost[];
}

// ─── Data loaders ────────────────────────────────────
function loadPosts(): Post[] {
  const file = path.join(process.cwd(), 'src', 'data', 'posts.json');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function loadCategories(): Record<string, Category> {
  const file = path.join(process.cwd(), 'src', 'data', 'categories.json');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

// ─── Route resolution ────────────────────────────────
const CAT_SLUGS = new Set(['dogs', 'cats', 'small-pets', 'birds', 'fish', 'reptiles']);

// Static info pages (footer links) — those with dedicated pages are excluded
const INFO_SLUGS = new Set([
  'newsletter',
]);

// Listing pages (footer links that show article collections)
const LISTING_SLUGS = new Set(['blog', 'buying-guides', 'comparisons']);

// All valid non-article slugs
const ALL_STATIC_SLUGS = new Set([...CAT_SLUGS, ...INFO_SLUGS, ...LISTING_SLUGS]);

// AdSense 恢复期：薄内容（<1500词）暂时 noindex，扩充完成后从 noindex-slugs.json 移除恢复索引
const NOINDEX_SLUGS = new Set<string>(JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/noindex-slugs.json'), 'utf8')));

const EMOJI: Record<string, string> = {
  'Dogs': '\uD83D\uDC15', 'Cats': '\uD83D\uDC08', 'Small Pets': '\uD83D\uDC39',
  'Birds': '\uD83E\uDD9C', 'Fish': '\uD83D\uDC20', 'Reptiles': '\uD83E\uDD8E',
};

// ─── SEO title normalisation ─────────────────────────
// The root layout appends " | PawCritic" (11 chars) to every title, and Google
// truncates SERP titles at roughly 580px (~60 chars), so a headline longer than
// 49 chars gets cut mid-word. Articles keep their full headline in the <h1>,
// breadcrumb and OpenGraph tags — only <title> is shortened here.
const TITLE_BRAND = ' | PawCritic';
const TITLE_MAX = 60;
const TITLE_STOPWORDS = /\s+(?:a|an|and|or|for|the|of|to|with|in|on|at|that|which|is|are|was|were|from|by|your|their|its|as|but|not|it|you|when|how|why|what|into|so|vs)$/i;

function tidyTitle(s: string): string {
  let out = s
    .replace(/\s+/g, ' ')
    .replace(/\s+([:;,.!?)])/g, '$1')
    .replace(/\(\s*\)/g, '')
    .replace(/['"|:;,\u2010-\u2015&-]+$/, '')
    .trim();
  let prev = '';
  while (prev !== out) {
    prev = out;
    out = out
      .replace(TITLE_STOPWORDS, '')
      .replace(/\(\s*\)/g, '')
      .replace(/['"|:;,\u2010-\u2015&-]+$/, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return out;
}

function fitsTitle(s: string): boolean {
  return (s + TITLE_BRAND).length <= TITLE_MAX;
}

function stripYear(s: string): string {
  return tidyTitle(s.replace(/\s*\b20\d\d\b\s*/g, ' '));
}

/** Cut a "Head: Subtitle" headline at the colon, but only when the whole subtitle fits. */
function colonSubtitle(base: string): string | null {
  const i = base.indexOf(':');
  if (i < 20) return null;
  const head = base.slice(0, i);
  const tail = base.slice(i + 1).trim();
  if (!head || !tail) return null;
  const full = tidyTitle(`${head}: ${tail}`);
  return full.length >= 18 && fitsTitle(full) ? full : null;
}

// Editorial qualifiers used only to break a rare title collision.
const TITLE_SUFFIXES = ['', ' Guide', ' Tips', ' Explained', ' 2026'];

/**
 * Shorten one headline. Candidates are tried in order of preference and the
 * first one not already in `taken` wins, so no two articles can ever share a
 * <title>:
 *   1. bare natural cuts at punctuation (keeps the most informative head)
 *   2. the "Head: Subtitle" cut when the entire subtitle still fits
 *   3. word-boundary truncations from the character budget downwards
 *   4. a short qualifier, then a numeric counter, as guaranteed-unique resorts.
 */
function shortenTitle(raw: string, taken: Set<string>): string {
  const base = raw.replace(/\s*\|\s*PawCritic\s*$/i, '').trim();
  if (fitsTitle(base)) return base;

  const cands: string[] = [];
  const consider = (s?: string | null) => {
    if (!s) return;
    const c = tidyTitle(s);
    if (c.length >= 18 && fitsTitle(c) && !cands.includes(c)) cands.push(c);
  };

  for (const sep of [':', ' \u2014 ', ' \u2013 ', ' - ', '(', '?']) {
    const i = base.indexOf(sep);
    if (i < 20) continue;
    consider(base.slice(0, i));
    consider(stripYear(base.slice(0, i)));
  }
  consider(colonSubtitle(base));

  const budget = TITLE_MAX - TITLE_BRAND.length;
  for (let i = Math.min(base.length, budget); i >= 18; i--) {
    if (i < base.length && base[i] !== ' ') continue;
    consider(base.slice(0, i));
  }

  for (const c of cands) if (!taken.has(c)) return c;

  // Every candidate is already used: append a qualifier, then a counter.
  const best = cands[0] || tidyTitle(base.slice(0, budget));
  for (const suffix of TITLE_SUFFIXES) {
    const c = tidyTitle(best + suffix);
    if (c.length >= 18 && fitsTitle(c) && !taken.has(c)) return c;
  }
  let n = 2;
  while (taken.has(`${best} (${n})`)) n++;
  return `${best} (${n})`;
}

// Resolved once per build; collisions are broken in posts.json order.
const SEO_TITLES: Map<string, string> = (() => {
  const all = loadPosts();
  const map = new Map<string, string>();
  const taken = new Set<string>();
  for (const p of all) {
    const base = p.title.replace(/\s*\|\s*PawCritic\s*$/i, '').trim();
    if (fitsTitle(base)) { taken.add(base); map.set(p.slug, base); }
  }
  for (const p of all) {
    if (map.has(p.slug)) continue;
    const t = shortenTitle(p.title, taken);
    taken.add(t);
    map.set(p.slug, t);
  }
  return map;
})();

type RouteResult =
  | { type: 'category'; key: string }
  | { type: 'info'; slug: string }
  | { type: 'listing'; slug: string }
  | { type: 'post'; post: Post };

function resolveRoute(slug: string): RouteResult | null {
  // Category?
  if (CAT_SLUGS.has(slug)) {
    const cats = loadCategories();
    const key = Object.keys(cats).find(k => k.toLowerCase().replace(/\s+/g, '-') === slug);
    if (key) return { type: 'category', key };
  }
  // Info page?
  if (INFO_SLUGS.has(slug)) return { type: 'info', slug };
  // Listing page?
  if (LISTING_SLUGS.has(slug)) return { type: 'listing', slug };
  // Article?
  const posts = loadPosts();
  const post = posts.find(p => p.slug === slug);
  if (post) return { type: 'post', post };
  return null;
}

// ─── Static params ───────────────────────────────────
export function generateStaticParams() {
  const cats = loadCategories();
  const catParams = Object.keys(cats).map(name => ({
    slug: name.toLowerCase().replace(/\s+/g, '-')
  }));
  const infoParams = [...INFO_SLUGS].map(s => ({ slug: s }));
  const listParams = [...LISTING_SLUGS].map(s => ({ slug: s }));
  const posts = loadPosts();
  const postParams = posts.map(p => ({ slug: p.slug }));
  const seen = new Set<string>();
  const all: Array<{ slug: string }> = [];
  for (const p of [...catParams, ...infoParams, ...listParams, ...postParams]) {
    if (!seen.has(p.slug)) { seen.add(p.slug); all.push(p); }
  }
  return all;
}

// ─── Metadata ────────────────────────────────────────
// 每篇文章的分享图存在 public/og/<slug>.png；但并非所有文章都有（约 160 篇缺失），
// 缺图时 og:image / twitter:image 会指向 404。回落到站点主图。
const OG_DIR = path.join(process.cwd(), 'public', 'og');
let _ogSlugs: Set<string> | null = null;
function ogSlugs(): Set<string> {
  if (!_ogSlugs) {
    try {
      _ogSlugs = new Set(fs.readdirSync(OG_DIR).map((f) => f.replace(/\.png$/i, '')));
    } catch {
      _ogSlugs = new Set<string>();
    }
  }
  return _ogSlugs;
}
function ogImageUrl(slug: string): string {
  return ogSlugs().has(slug)
    ? `https://pawcritic.com/og/${slug}.png`
    : 'https://pawcritic.com/og-image.png';
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const resolved = resolveRoute(slug);
  if (!resolved) return { title: 'Not Found' };

  if (resolved.type === 'category') {
    return {
      title: `Best ${resolved.key} Products & Reviews`,
      description: `Honest, expert reviews of the best ${resolved.key.toLowerCase()} products. Find top-rated food, toys, accessories and more for your pet.`,
      alternates: { canonical: `https://pawcritic.com/${slug}` },
    };
  }
  if (resolved.type === 'info') return { ...(PAGE_META[slug] ?? { title: slug }), alternates: { canonical: `https://pawcritic.com/${slug}` } };
  if (resolved.type === 'listing') return { ...(PAGE_META[slug] ?? { title: slug }), alternates: { canonical: `https://pawcritic.com/${slug}` } };
  return {
    title: SEO_TITLES.get(slug) || resolved.post.title,
    description: resolved.post.description,
    alternates: { canonical: `https://pawcritic.com/${slug}` },
    ...(NOINDEX_SLUGS.has(slug) ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: resolved.post.title,
      description: resolved.post.description,
      type: 'article',
      url: `https://pawcritic.com/${slug}`,
      publishedTime: resolved.post.date,
      images: [{ url: ogImageUrl(slug), width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: resolved.post.title,
      description: resolved.post.description,
      images: [ogImageUrl(slug)],
    },
  };
}

// ──────────────────────────────────────────────────────
//  Category sub-component
// ──────────────────────────────────────────────────────
function CategoryPageContent({ categoryKey }: { categoryKey: string }) {
  const cats = loadCategories();
  const category = cats[categoryKey];
  const emoji = EMOJI[categoryKey] || '\uD83D\uDC3E';

  return (
    <main className="category-page">
      <section className="category-hero">
        <div className="container">
          <span className="cat-emoji">{emoji}</span>
          <h1>{categoryKey}</h1>
          <p>{category.posts.length} expert reviews to help you choose the best for your pet</p>
        </div>
      </section>

      <section className="category-grid container">
        {category.posts.map(post => (
          <Link key={post.slug} href={`/${post.slug}`} className="review-card">
            <div className="review-card-content">
              <h2>{post.title}</h2>
              <p>{post.description}</p>
              <div className="card-meta">
                <span>{post.date}</span>
                <span className="read-more">Read Review</span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}

// ──────────────────────────────────────────────────────
//  Article sub-component
// ──────────────────────────────────────────────────────
async function getAdjacentPosts(slug: string, category: string) {
  const posts = loadPosts();
  const catPosts = posts.filter(p => p.category === category);
  const idx = catPosts.findIndex(p => p.slug === slug);
  return {
    prev: idx > 0 ? catPosts[idx - 1] : posts[posts.length - 1],
    next: idx < catPosts.length - 1 ? catPosts[idx + 1] : posts[0],
  };
}

function ShareSection({ post }: { post: Post }) {
  const url = `https://www.pawcritic.com/${post.slug}`;

  return <ShareButtons url={url} title={post.title} />;
}

function extractProductReviews(html: string): { name: string; rating: number; description: string; asin: string | null }[] {
  const products: { name: string; rating: number; description: string; asin: string | null }[] = [];
  const seen = new Set<string>();

  // All ASINs in the document, in order of appearance (used to backfill products whose segment lacks a link)
  const allAsins = [...html.matchAll(/amazon\.com\/dp\/([A-Z0-9]{10})/gi)].map(m => m[1]);

  // Split by headings; within each segment look for "Rating: X/5" and an Amazon ASIN
  const htmlParts = html.split(/<h[1-3][^>]*>/g).slice(1);
  for (let i = 0; i < htmlParts.length && products.length < 10; i++) {
    const seg = htmlParts[i].split(/<h[1-3][^>]*>/)[0] || '';
    const hContent = htmlParts[i].split(/<\/h[1-3]>/)[0] || '';
    let hText = hContent.replace(/<[^>]+>/g, '').trim();
    const numMatch = hText.match(/^(?:#|\d+[.)])\s*(.+)/);
    if (numMatch) hText = numMatch[1].trim();

    if (hText.length > 5 && !seen.has(hText) && !/^(Quick|Why|Key|What|How|When|Where|The |A |An |Our Verdict|Frequently|Comparison|Shop|Final)/i.test(hText)) {
      const rMatch = seg.match(/Rating:\s*([\d.]+)\s*\/\s*5/i);
      const rating = rMatch ? parseFloat(rMatch[1]) : 0;
      const aMatch = seg.match(/amazon\.com\/dp\/([A-Z0-9]{10})/i);
      const asin = aMatch ? aMatch[1] : null;
      const descMatch = seg.match(/(?:Best for|Ideal for|Great for|Perfect for)[^.<]{5,120}/i);
      const description = descMatch ? descMatch[0].trim() : '';

      seen.add(hText);
      products.push({ name: hText, rating, asin, description });
    }
  }

  // Backfill ASINs for rated products in document order (product headings and ASIN links appear in the same order)
  const ratedWithAsin = products.filter(p => p.rating > 0);
  let asinIdx = 0;
  ratedWithAsin.forEach(p => {
    if (!p.asin && asinIdx < allAsins.length) {
      p.asin = allAsins[asinIdx++];
    }
  });

  // Fallback: H2/H3 headings as product names when nothing matched
  if (products.length === 0) {
    const fallbackHeadings = html.match(/<h[1-3][^>]*>[^<]{15,100}<\/h[1-3]>/g) || [];
    for (let i = 0; i < fallbackHeadings.length && products.length < 7; i++) {
      const h = fallbackHeadings[i].replace(/<[^>]+>/g, '').trim();
      if (h.length > 8 && !seen.has(h) && !/^(Quick|Why|Key|What|How|When|Where|The |A |An )/i.test(h)) {
        seen.add(h);
        products.push({ name: h, rating: 0, asin: null, description: '' });
      }
    }
  }

  return products.slice(0, 10);
}

function extractFaq(html: string): { q: string; a: string }[] {
  // FAQ section titles vary widely. Find the FIRST plausible FAQ heading (h2 or h3).
  const kwRegex = /<h[23][^>]*>\s*(?:Frequently Asked Questions?(?:\s*\(FAQ\))?|FAQs?\s*:?|(?:FAQ|Common|Top|Your)\s*:?[^<]{0,40}|[A-Z][A-Za-z -]{2,35}?\sFAQ)[^<]*<\/h[23]>/i;
  const kwMatch = html.search(kwRegex);
  if (kwMatch < 0) return [];
  // Find the end of this heading (allow embedded tags like images inside the h2/h3)
  const closeIdx = html.indexOf('</h' + (html.slice(kwMatch).match(/<h([23])/) || ['', '2'])[1] + '>', kwMatch);
  if (closeIdx < 0) return [];
  // Normalize literal \n / \t sequences (cron escaping artifact) before parsing
  let section = html.slice(closeIdx + 5).replace(/\\n/g, '\n').replace(/\\t/g, '\t');
  const faqs: { q: string; a: string }[] = [];
  // Questions are h3 ("Q: ..." or plain), h4, or <p><strong>Q</strong></p>; answers follow in <p>
  const qPattern = /(?:<h[34][^>]*>([\s\S]*?)<\/h[34]>|<p[^>]*><strong>([\s\S]*?)<\/strong><\/p>)\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m: RegExpExecArray | null;
  while ((m = qPattern.exec(section)) !== null && faqs.length < 8) {
    let q = (m[1] || m[2] || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').trim();
    // Strip a leading "Q:" prefix if present
    q = q.replace(/^Q[:.]\s*/i, '').trim();
    const a = (m[3] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').trim();
    if (q && a && q.length > 5 && a.length > 10) {
      faqs.push({ q, a });
    }
  }
  return faqs;
}

function ArticlePageContent({ post }: { post: Post }) {
  const catSlug = post.category.toLowerCase().replace(/\s+/g, '-');

  const reviewedProducts = extractProductReviews(post.content);
  // Only emit Review/AggregateRating schema when we have real ratings (Google penalizes fake review markup)
  const ratedProducts = reviewedProducts.filter(p => p.rating > 0 && p.rating <= 5);
  const hasRealRatings = ratedProducts.length >= 3;
  const faq = extractFaq(post.content);

  // Editorial-team bylines are an organisation, not a natural person — Person
  // markup for a team name sends a false author signal to search engines.
  const authorLd = post.author
    ? post.authorSlug === 'editorial-team'
      ? {
          '@type': 'Organization',
          name: post.author,
          url: `https://pawcritic.com/author/${post.authorSlug}`,
        }
      : {
          '@type': 'Person',
          name: post.author,
          ...(post.authorSlug ? { url: `https://pawcritic.com/author/${post.authorSlug}` } : {}),
        }
    : { '@type': 'Organization', name: 'PawCritic' };

  // Deduplicate offers by ASIN and cap at 6 (articles repeat the same product buttons).
  // Google requires Product markup to carry at least one of offers / review / aggregateRating —
  // a Product block with `offers: []` and no rating is invalid and only earns GSC warnings.
  const productOffers = (() => {
    const seenAsins = new Set<string>();
    const offers: { '@type': string; name: string; url: string; availability: string }[] = [];
    for (const p of reviewedProducts) {
      if (p.asin && !seenAsins.has(p.asin)) {
        seenAsins.add(p.asin);
        offers.push({
          '@type': 'Offer',
          name: p.name,
          url: `https://www.amazon.com/dp/${p.asin}?tag=nannan09-20`,
          availability: 'https://schema.org/InStock',
        });
        if (offers.length >= 6) break;
      }
    }
    return offers;
  })();
  const emitProductLd = productOffers.length > 0 || hasRealRatings;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: authorLd,
    publisher: {
      '@type': 'Organization',
      name: 'PawCritic',
      url: 'https://pawcritic.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://pawcritic.com/${post.slug}`,
    },
  };

  // Breadcrumb JSON-LD (matches the visible breadcrumb UI)
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pawcritic.com/' },
      { '@type': 'ListItem', position: 2, name: post.category, item: `https://pawcritic.com/${catSlug}` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://pawcritic.com/${post.slug}` },
    ],
  };

  return (
    <article className="article-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* FAQPage JSON-LD — emitted when the article has a real FAQ section */}
      {faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faq.map(f => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: f.a,
                },
              })),
            }),
          }}
        />
      )}

      {/* Product + Review JSON-LD — only emitted when it is actually valid:
          real ratings and/or at least one ASIN-backed offer. */}
      {emitProductLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: post.title,
              description: post.description,
              ...(hasRealRatings && {
                review: ratedProducts.map(p => ({
                  '@type': 'Review',
                  reviewRating: {
                    '@type': 'Rating',
                    ratingValue: p.rating,
                    bestRating: 5,
                  },
                  author: authorLd,
                  name: p.name,
                })),
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: (ratedProducts.reduce((s, p) => s + p.rating, 0) / ratedProducts.length).toFixed(1),
                  bestRating: 5,
                  ratingCount: ratedProducts.length,
                  reviewCount: ratedProducts.length,
                },
              }),
              offers: productOffers,
            })}
          }
        />
      )}

      <div className="container article-breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href={`/${catSlug}`}>{post.category}</Link>
        <span>/</span>
        <span>{post.title}</span>
      </div>

      <header className="article-header">
        <div className="container">
          <span className="article-category">{post.category}</span>
          <h1>{post.title}</h1>
          <div className="article-meta">
            <time dateTime={post.date}>
              {post.date}
            </time>
            {post.author && post.authorSlug && (
              <span className="article-author">
                By <Link href={`/author/${post.authorSlug}`} style={{ color: 'inherit', textDecoration: 'underline' }}>{post.author}</Link>
              </span>
            )}
            <span className="article-read-time">
              ~{Math.max(1, Math.round((post.charCount || (post.content || '').length) / 1500))} min read
            </span>
            <ShareSection post={post} />
          </div>
        </div>
      </header>

      <div className="container">
        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      <div className="container article-disclaimer">
        <p>
          <strong>Affiliate Disclosure:</strong> PawCritic is reader-supported.
          When you buy through links on our site, we may earn an affiliate commission at no extra cost to you.
          <Link href="/affiliate-disclosure"> Learn more</Link>.
        </p>
      </div>

      <ArticleNav post={post} />
    </article>
  );
}

async function ArticleNav({ post }: { post: Post }) {
  const adjacent = await getAdjacentPosts(post.slug, post.category);
  return (
    <nav className="article-nav">
      <div className="container">
        <div className="nav-links">
          {adjacent.prev && (
            <Link href={`/${adjacent.prev.slug}`} className="nav-link prev">
              <span>Previous</span>
              <strong>{adjacent.prev.title}</strong>
            </Link>
          )}
          {adjacent.next && (
            <Link href={`/${adjacent.next.slug}`} className="nav-link next">
              <span>Next</span>
              <strong>{adjacent.next.title}</strong>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

// ──────────────────────────────────────────────────────
//  Info page data
// ──────────────────────────────────────────────────────
const PAGE_META: Record<string, Metadata> = {
  about: {
    title: 'About PawCritic - Our Story & Mission',
    description: 'Learn about PawCritic — our mission to provide honest, research-backed pet product reviews for every pet owner.',
  },
  'how-we-test': {
    title: 'How We Research Pet Products',
    description: 'Transparent methodology: how we research and rate every pet product we review. No sponsored reviews, ever.',
  },
  contact: {
    title: 'Contact PawCritic | Get in Touch',
    description: 'Have a question, suggestion, or want us to review a product? Reach out to the PawCritic team.',
  },
  'editorial-policy': {
    title: 'Editorial Policy',
    description: 'Our editorial standards — how we ensure accuracy, objectivity, and transparency in every review.',
  },
  newsletter: {
    title: 'Join Our Newsletter',
    description: 'Get the latest pet product reviews, buying guides, and expert tips delivered to your inbox.',
  },
  blog: {
    title: 'PawCritic Blog - Pet Care Tips & Guides',
    description: 'Read our latest blog posts about pet care, product guides, and expert advice for all types of pets.',
  },
  'buying-guides': {
    title: 'Pet Product Buying Guides',
    description: 'Comprehensive buying guides to help you choose the best products for your pet.',
  },
  comparisons: {
    title: 'Product Comparisons',
    description: 'Side-by-side comparisons of top pet products to help you make informed decisions.',
  },
};

const INFO_CONTENT: Record<string, { heading: string; emoji: string; sections: Array<{ title: string; body: string }> }> = {
  about: {
    heading: 'About PawCritic',
    emoji: '🐾',
    sections: [
      { title: 'Our Mission', body: 'At PawCritic, we believe every pet deserves the best. Our mission is simple: provide honest, research-backed product reviews so pet owners can make confident decisions. No fluff. No sponsored reviews. Just real insights.' },
      { title: 'Who We Are', body: 'We are a team of passionate pet owners and product researchers. Between us, we have cared for dogs, cats, birds, fish, reptiles, and small pets. Every recommendation we publish is built from documented research, verified owner feedback, and authoritative sources rather than invented testing claims.' },
      { title: 'Why Trust Us?', body: 'Every review we publish goes through a rigorous research process. We analyze ingredients, study materials, consult veterinary sources, and cross-check every safety claim against published guidance. Brands cannot pay for better ratings — our editorial integrity is non-negotiable.' },
      { title: 'Our Promise', body: 'We promise to always put pets first. No misleading claims. No hidden sponsorships. Just honest recommendations you can count on.' },
    ],
  },
  'how-we-test': {
    heading: 'How We Research Pet Products',
    emoji: '🔬',
    sections: [
      { title: 'Our Research Process', body: 'Every product featured on PawCritic goes through a research-based evaluation: structured market research, specification and safety analysis, and ongoing review of verified owner feedback. We do not run a physical testing lab, and we do not claim to have personally used every product we cover.' },
      { title: 'Phase 1 — Research', body: 'We begin by analyzing product specifications, ingredient lists, material safety data, and manufacturer claims. We consult veterinary research, industry standards, and regulatory guidelines to establish a baseline for quality and safety.' },
      { title: 'Phase 2 — Verified Owner Feedback Analysis', body: 'We analyze hundreds to thousands of verified-purchase reviews per product, looking for recurring failure modes, how a product performs across different pet sizes and temperaments, and complaints that surface after months of use rather than on day one. Clusters of identical reviews are treated as a warning sign, not as social proof.' },
      { title: 'Phase 3 — Long-Term Assessment', body: 'We revisit products after extended use — sometimes months later — to assess durability, continued effectiveness, and whether they still deliver value. Reviews are updated when products change or new information emerges.' },
      { title: 'Our Rating System', body: 'Products are rated on a 1-5 scale across categories including Quality, Value, Pet Safety, Ease of Use, and Customer Satisfaction. The final score reflects a weighted average, with safety and quality receiving the highest weight.' },
    ],
  },
  contact: {
    heading: 'Contact Us',
    emoji: '📬',
    sections: [
      { title: 'Get in Touch', body: 'We would love to hear from you! Whether you have a question about a review, want to suggest a product for testing, or just want to share your pet story, we are all ears.' },
      { title: 'Product Review Requests', body: 'Do you have a product you would like us to review? Let us know! While we cannot guarantee every request will be fulfilled, we prioritize products our readers are most interested in. Please include the product name, brand, and why you think it deserves a review.' },
      { title: 'Corrections & Feedback', body: 'Accuracy is important to us. If you spot an error in any of our reviews or have feedback on how we can improve, please reach out. We review and respond to every message.' },
      { title: 'Email Us', body: 'You can reach our team at hello@pawcritic.com. We aim to respond within 48 hours, though response times may vary during busy periods.' },
    ],
  },
  'editorial-policy': {
    heading: 'Editorial Policy',
    emoji: '📋',
    sections: [
      { title: 'Our Editorial Standards', body: 'PawCritic upholds the highest standards of editorial integrity. Every piece of content we publish is created through independent research, expert cross-checking, and objective analysis. We are committed to accuracy, transparency, and fairness.' },
      { title: 'Independence', body: 'PawCritic maintains full editorial independence. Brands, manufacturers, and advertisers have no influence over our review content, ratings, or recommendations. We do not accept payment for positive reviews or higher ratings.' },
      { title: 'Affiliate Disclosure', body: 'PawCritic participates in the Amazon Associates Program and other affiliate programs. When you click a link and make a purchase, we may earn a small commission — at no extra cost to you. This does not affect our reviews; we recommend products based on merit alone.' },
      { title: 'Corrections', body: 'If we discover an error in our content, we correct it promptly and note the update. Readers who identify potential errors are encouraged to contact us.' },
      { title: 'Product Sourcing', body: 'We research products using manufacturer specifications, published safety and recall records, and large-scale analysis of verified owner feedback. We do not operate a testing laboratory, and where a product has not been examined firsthand we say so in the review.' },
    ],
  },
  newsletter: {
    heading: 'Join Our Newsletter',
    emoji: '📧',
    sections: [
      { title: 'Stay in the Loop', body: 'Subscribe to the PawCritic newsletter and never miss a review. We send curated roundups of our latest product reviews, buying guides, and pet care tips — straight to your inbox. No spam, ever.' },
      { title: 'What You Will Get', body: 'Each newsletter includes: our latest product reviews and ratings, seasonal buying guides, exclusive pet care tips from our team, and occasional special offers from trusted brands. We send 1-2 emails per week — just the highlights.' },
      { title: 'Subscribe', body: 'Our newsletter signup is coming soon. In the meantime, bookmark PawCritic and check back regularly for fresh reviews and guides. You can also follow us on social media for real-time updates.' },
    ],
  },
};

const LISTING_META: Record<string, { heading: string; subtitle: string; emoji: string }> = {
  blog: { heading: 'Blog', subtitle: 'Pet care explainers, how-to guides and behaviour breakdowns from the PawCritic editorial team.', emoji: '📝' },
  'buying-guides': { heading: 'Buying Guides', subtitle: 'Every best-of and how-to-choose guide, with specs, safety notes and verified owner feedback.', emoji: '🛒' },
  comparisons: { heading: 'Comparisons', subtitle: 'Head-to-head comparisons — which of two options actually fits your pet.', emoji: '⚖️' },
};

// The three footer listing pages each render a DIFFERENT, disjoint slice of the
// corpus. They previously all rendered every post, which made them near-duplicate
// pages (identical card lists differing only by <h1>).
function isBuyingGuide(slug: string): boolean {
  return /^best-/.test(slug) || /buying-guide/.test(slug) || /^how-to-choose/.test(slug);
}
function isComparison(slug: string): boolean {
  return /-vs-/.test(slug) || /-comparison$/.test(slug);
}
function postsForListing(slug: string): Post[] {
  const all = loadPosts().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (slug === 'buying-guides') return all.filter((p) => isBuyingGuide(p.slug));
  if (slug === 'comparisons') return all.filter((p) => !isBuyingGuide(p.slug) && isComparison(p.slug));
  return all.filter((p) => !isBuyingGuide(p.slug) && !isComparison(p.slug));
}

// ──────────────────────────────────────────────────────
//  Info page component
// ──────────────────────────────────────────────────────
function InfoPageContent({ slug }: { slug: string }) {
  const content = INFO_CONTENT[slug];
  if (!content) return null;

  return (
    <main className="static-page">
      <section className="category-hero">
        <div className="container">
          <span className="cat-emoji">{content.emoji}</span>
          <h1>{content.heading}</h1>
        </div>
      </section>

      <section className="static-content container">
        {content.sections.map((sec, i) => (
          <div key={i} className="static-section">
            <h2>{sec.title}</h2>
            <p>{sec.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

// ──────────────────────────────────────────────────────
//  Listing page component (blog / buying-guides / comparisons)
// ──────────────────────────────────────────────────────
function ListingPageContent({ slug }: { slug: string }) {
  const meta = LISTING_META[slug];
  const posts = postsForListing(slug);

  return (
    <main className="category-page">
      <section className="category-hero">
        <div className="container">
          <span className="cat-emoji">{meta.emoji}</span>
          <h1>{meta.heading}</h1>
          <p>{meta.subtitle}</p>
          <p className="listing-count">{posts.length} articles</p>
        </div>
      </section>

      <section className="category-grid container">
        {posts.map(post => (
          <Link key={post.slug} href={`/${post.slug}`} className="review-card">
            <div className="review-card-content">
              <span className="badge review-badge">{post.category}</span>
              <h2>{post.title}</h2>
              <p>{post.description}</p>
              <div className="card-meta">
                <span>{post.date}</span>
                <span className="read-more">Read More</span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}

// ──────── Main Page component ────────────────────────
export default async function UnifiedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resolved = resolveRoute(slug);

  if (!resolved) notFound();

  if (resolved.type === 'category') {
    return <CategoryPageContent categoryKey={resolved.key} />;
  }
  if (resolved.type === 'info') {
    return <InfoPageContent slug={resolved.slug} />;
  }
  if (resolved.type === 'listing') {
    return <ListingPageContent slug={resolved.slug} />;
  }

  return <ArticlePageContent post={resolved.post} />;
}
