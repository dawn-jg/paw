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

// Static info pages (footer links)
const INFO_SLUGS = new Set([
  'about',
  'how-we-test',
  'contact',
  'editorial-policy',
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
    };
  }
  if (resolved.type === 'info') return PAGE_META[slug] ?? { title: slug };
  if (resolved.type === 'listing') return PAGE_META[slug] ?? { title: slug };
  return {
    title: `${resolved.post.title} | PawCritic`,
    description: resolved.post.description,
    openGraph: {
      title: resolved.post.title,
      description: resolved.post.description,
      type: 'article',
      publishedTime: resolved.post.date,
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

function extractProductReviews(html: string): { name: string; rating: number; description: string }[] {
  const products: { name: string; rating: number; description: string }[] = [];
  const seen = new Set<string>();

  // Match numbered product headings like "1. Orijen Original - Best Overall"
  var htmlParts = html.split(/<h[1-3][^>]*>/g).slice(1);
  for (var i = 0; i < htmlParts.length && products.length < 10; i++) {
    var hContent = htmlParts[i].split(/<\/h[1-3]>/)[0] || '';
    var hText = hContent.replace(/<[^>]+>/g, '').trim();
    var numMatch = hText.match(/^(?:#|\d+[.)])\s*(.+)/);
    if (numMatch) {
      hText = numMatch[1].trim();
    }
    if (hText.length > 5 && !seen.has(hText) && !/^(Quick|Why|Key|What|How|When|Where|The |A |An )/i.test(hText)) {
      seen.add(hText);
      products.push({ name: hText, rating: 0, description: '' });
    }
  }


  // Fallback: find H2/H3 headings as product names
  if (products.length === 0) {
    var fallbackHeadings = html.match(/<h[1-3][^>]*>[^<]{15,100}<\/h[1-3]>/g) || [];
    for (var i = 0; i < fallbackHeadings.length && products.length < 7; i++) {
      var h = fallbackHeadings[i].replace(/<[^>]+>/g, '').trim();
      if (h.length > 8 && !seen.has(h) && !/^(Quick|Why|Key|What|How|When|Where|The |A |An )/i.test(h)) {
        seen.add(h);
        products.push({ name: h, rating: 0, description: '' });
      }
    }
  }

  // Extract ratings from <strong>Rating: X/5</strong> patterns
  var ratingRegex = /Rating:\s*([\d.]+)\s*\/\s*5/gi;
  var rIdx = 0;
  var rMatch;
  while ((rMatch = ratingRegex.exec(html)) !== null && rIdx < products.length) {
    var val = parseFloat(rMatch[1]);
    if (!isNaN(val) && val >= 1 && val <= 5) {
      products[rIdx].rating = val;
      rIdx++;
    }
  }

  return products.slice(0, 10);
}

function ArticlePageContent({ post }: { post: Post }) {
  const catSlug = post.category.toLowerCase().replace(/\s+/g, '-');

  const reviewedProducts = extractProductReviews(post.content);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: post.author ? {
      '@type': 'Person',
      name: post.author,
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

  return (
    <article className="article-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Product + Review JSON-LD */}
      {reviewedProducts.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: post.title,
              description: post.description,
              review: reviewedProducts.map(p => ({
                '@type': 'Review',
                reviewRating: {
                  '@type': 'Rating',
                  ratingValue: p.rating > 0 ? p.rating : 4.5,
                  bestRating: 5,
                },
                author: {
                  '@type': 'Organization',
                  name: 'PawCritic',
                },
                name: p.name,
              })),
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: (reviewedProducts.reduce((s, p) => s + (p.rating > 0 ? p.rating : 4.5), 0) / reviewedProducts.length).toFixed(1),
                bestRating: 5,
                ratingCount: reviewedProducts.length,
                reviewCount: reviewedProducts.length,
              },
              offers: reviewedProducts.map(p => ({
                '@type': 'Offer',
                name: p.name,
                url: `https://www.amazon.com/dp/PLACEHOLDER?tag=paw070-20`,
                availability: 'https://schema.org/InStock',
              })),
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
            {post.author && (
              <span className="article-author">
                By {post.author}
              </span>
            )}
            <span className="article-read-time">
              ~{Math.max(1, Math.round(post.charCount / 1500))} min read
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
