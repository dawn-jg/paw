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

const EMOJI: Record<string, string> = {
  'Dogs': '\uD83D\uDC15', 'Cats': '\uD83D\uDC08', 'Small Pets': '\uD83D\uDC39',
  'Birds': '\uD83E\uDD9C', 'Fish': '\uD83D\uDC20', 'Reptiles': '\uD83E\uDD8E',
};

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
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const resolved = resolveRoute(slug);
  if (!resolved) return { title: 'Not Found' };

  if (resolved.type === 'category') {
    return {
      title: `Best ${resolved.key} Products & Reviews | PawCritic`,
      description: `Honest, expert reviews of the best ${resolved.key.toLowerCase()} products. Find top-rated food, toys, accessories and more for your pet.`,
      alternates: { canonical: `https://pawcritic.com/${slug}` },
    };
  }
  if (resolved.type === 'info') return { ...(PAGE_META[slug] ?? { title: slug }), alternates: { canonical: `https://pawcritic.com/${slug}` } };
  if (resolved.type === 'listing') return { ...(PAGE_META[slug] ?? { title: slug }), alternates: { canonical: `https://pawcritic.com/${slug}` } };
  return {
    title: `${resolved.post.title} | PawCritic`,
    description: resolved.post.description,
    alternates: { canonical: `https://pawcritic.com/${slug}` },
    openGraph: {
      title: resolved.post.title,
      description: resolved.post.description,
      type: 'article',
      url: `https://pawcritic.com/${slug}`,
      publishedTime: resolved.post.date,
      images: [{ url: 'https://pawcritic.com/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: resolved.post.title,
      description: resolved.post.description,
      images: ['https://pawcritic.com/og-image.png'],
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
              <h3>{post.title}</h3>
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: post.author ? {
      '@type': 'Person',
      name: post.author,
      url: post.authorSlug ? `https://pawcritic.com/author/${post.authorSlug}` : undefined,
    } : {
      '@type': 'Organization',
      name: 'PawCritic',
    },
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

      {/* Product + Review JSON-LD — only when real ratings exist; offers use real ASINs */}
      {reviewedProducts.length > 0 && (
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
                  author: post.author ? {
                    '@type': 'Person',
                    name: post.author,
                  } : {
                    '@type': 'Organization',
                    name: 'PawCritic',
                  },
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
              offers: (() => {
                // Deduplicate by ASIN and cap at 6 offers (articles may have multiple buttons for the same product)
                const seenAsins = new Set<string>();
                const offers: { '@type': string; name: string; url: string; availability: string }[] = [];
                for (const p of reviewedProducts) {
                  if (p.asin && !seenAsins.has(p.asin)) {
                    seenAsins.add(p.asin);
                    offers.push({
                      '@type': 'Offer',
                      name: p.name,
                      url: `https://www.amazon.com/dp/${p.asin}?tag=paw070-20`,
                      availability: 'https://schema.org/InStock',
                    });
                    if (offers.length >= 6) break;
                  }
                }
                return offers;
              })(),
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
    title: 'How We Test Pet Products | PawCritic',
    description: 'Transparent methodology: how we research, test, and rate every pet product we review. No sponsored reviews, ever.',
  },
  contact: {
    title: 'Contact PawCritic | Get in Touch',
    description: 'Have a question, suggestion, or want us to review a product? Reach out to the PawCritic team.',
  },
  'editorial-policy': {
    title: 'Editorial Policy | PawCritic',
    description: 'Our editorial standards — how we ensure accuracy, objectivity, and transparency in every review.',
  },
  newsletter: {
    title: 'Join Our Newsletter | PawCritic',
    description: 'Get the latest pet product reviews, buying guides, and expert tips delivered to your inbox.',
  },
  blog: {
    title: 'PawCritic Blog - Pet Care Tips & Guides',
    description: 'Read our latest blog posts about pet care, product guides, and expert advice for all types of pets.',
  },
  'buying-guides': {
    title: 'Pet Product Buying Guides | PawCritic',
    description: 'Comprehensive buying guides to help you choose the best products for your pet.',
  },
  comparisons: {
    title: 'Product Comparisons | PawCritic',
    description: 'Side-by-side comparisons of top pet products to help you make informed decisions.',
  },
};

const INFO_CONTENT: Record<string, { heading: string; emoji: string; sections: Array<{ title: string; body: string }> }> = {
  about: {
    heading: 'About PawCritic',
    emoji: '🐾',
    sections: [
      { title: 'Our Mission', body: 'At PawCritic, we believe every pet deserves the best. Our mission is simple: provide honest, research-backed product reviews so pet owners can make confident decisions. No fluff. No sponsored reviews. Just real insights.' },
      { title: 'Who We Are', body: 'We are a team of passionate pet owners, veterinarians, and researchers. Between us, we have cared for dogs, cats, birds, fish, reptiles, and small pets. We test products in real homes with real pets because that is the only way to truly know what works.' },
      { title: 'Why Trust Us?', body: 'Every review we publish goes through a rigorous research process. We analyze ingredients, study materials, consult veterinary sources, and test products hands-on. Brands cannot pay for better ratings — our editorial integrity is non-negotiable.' },
      { title: 'Our Promise', body: 'We promise to always put pets first. No misleading claims. No hidden sponsorships. Just honest recommendations you can count on.' },
    ],
  },
  'how-we-test': {
    heading: 'How We Test',
    emoji: '🔬',
    sections: [
      { title: 'Our Testing Process', body: 'Every product featured on PawCritic undergoes a comprehensive three-phase evaluation: Research, Hands-On Testing, and Long-Term Assessment. We never review products we have not personally tested or thoroughly researched.' },
      { title: 'Phase 1 — Research', body: 'We begin by analyzing product specifications, ingredient lists, material safety data, and manufacturer claims. We consult veterinary research, industry standards, and regulatory guidelines to establish a baseline for quality and safety.' },
      { title: 'Phase 2 — Hands-On Testing', body: 'Products are tested in real homes with real pets. We evaluate usability, durability, pet acceptance, and real-world performance over a minimum of two weeks. Each product is scored against a standardized rubric covering 10+ criteria.' },
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
      { title: 'Our Editorial Standards', body: 'PawCritic upholds the highest standards of editorial integrity. Every piece of content we publish is created through independent research, hands-on testing, and objective analysis. We are committed to accuracy, transparency, and fairness.' },
      { title: 'Independence', body: 'PawCritic maintains full editorial independence. Brands, manufacturers, and advertisers have no influence over our review content, ratings, or recommendations. We do not accept payment for positive reviews or higher ratings.' },
      { title: 'Affiliate Disclosure', body: 'PawCritic participates in the Amazon Associates Program and other affiliate programs. When you click a link and make a purchase, we may earn a small commission — at no extra cost to you. This does not affect our reviews; we recommend products based on merit alone.' },
      { title: 'Corrections', body: 'If we discover an error in our content, we correct it promptly and note the update. Readers who identify potential errors are encouraged to contact us.' },
      { title: 'Product Sourcing', body: 'We purchase most products we review ourselves. Occasionally, manufacturers provide samples for testing, but this is always disclosed and has no bearing on our evaluation or rating.' },
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
  blog: { heading: 'Blog', subtitle: 'Pet care tips, stories, and expert insights from the PawCritic team.', emoji: '📝' },
  'buying-guides': { heading: 'Buying Guides', subtitle: 'Comprehensive guides to help you choose the right products for your pet.', emoji: '🛒' },
  comparisons: { heading: 'Comparisons', subtitle: 'Side-by-side product comparisons to help you make informed choices.', emoji: '⚖️' },
};

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
  const posts = loadPosts().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <main className="category-page">
      <section className="category-hero">
        <div className="container">
          <span className="cat-emoji">{meta.emoji}</span>
          <h1>{meta.heading}</h1>
          <p>{meta.subtitle}</p>
        </div>
      </section>

      <section className="category-grid container">
        {posts.map(post => (
          <Link key={post.slug} href={`/${post.slug}`} className="review-card">
            <div className="review-card-content">
              <span className="badge review-badge">{post.category}</span>
              <h3>{post.title}</h3>
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
