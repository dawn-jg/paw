import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

// ─── Author profile ──────────────────────────────────
// 注：本站不使用虚构的个人作者人设。署名统一为编辑团队，
// 且不声称任何专业资质、执业头衔或亲身产品实测经历。
interface AuthorProfile {
  name: string;
  title: string;
  bio: string;
  initials: string;
  sameAs: string[];
}

const AUTHORS: Record<string, AuthorProfile> = {
  'editorial-team': {
    name: 'PawCritic Editorial Team',
    title: 'Research & Editorial',
    bio: "PawCritic's editorial team builds every guide from manufacturer specifications, published veterinary and industry guidance, and large-scale analysis of verified owner feedback. We do not operate a physical testing lab, and we do not claim to have personally used every product we cover. Read our full research methodology on the How We Research page.",
    initials: 'PC',
    sameAs: [],
  },
};

// ─── Data loader ─────────────────────────────────────
function loadPosts(): any[] {
  const file = path.join(process.cwd(), 'src', 'data', 'posts.json');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

// ─── Static params (3 expert pages) ──────────────────
export function generateStaticParams() {
  return Object.keys(AUTHORS).map((slug) => ({ slug }));
}

// ─── Metadata ────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const author = AUTHORS[slug];
  if (!author) return { title: 'Author Not Found' };
  return {
    title: author.name,
    description: author.bio,
  };
}

// ─── Page ────────────────────────────────────────────
export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = AUTHORS[slug];
  if (!author) notFound();

  const posts = loadPosts()
    .filter((p) => p.authorSlug === slug)
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: author.name,
    url: `https://pawcritic.com/author/${slug}`,
    description: author.bio,
  };
  if (author.sameAs.length) jsonLd.sameAs = author.sameAs;

  return (
    <main className="static-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="category-hero">
        <div className="container" style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-accent, #6366f1), #8b5cf6)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.2rem',
              fontWeight: 700,
              margin: '0 auto 1.25rem',
            }}
          >
            {author.initials}
          </div>
          <h1 style={{ marginBottom: '0.4rem' }}>{author.name}</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
            {author.title}
          </p>
          <p style={{ maxWidth: 640, margin: '0 auto', lineHeight: 1.7, color: 'var(--color-text-muted)' }}>
            {author.bio}
          </p>
          <div style={{ marginTop: '1.5rem' }}>
            <Link href="/about" className="read-more" style={{ color: 'var(--color-accent, #6366f1)' }}>
              Meet the full PawCritic team →
            </Link>
          </div>
        </div>
      </section>

      <section className="static-content container">
        <h2 style={{ marginBottom: '1.5rem' }}>
          Reviews by {author.name} ({posts.length})
        </h2>
        <div className="category-grid">
          {posts.map((post: any) => (
            <Link key={post.slug} href={`/${post.slug}`} className="review-card">
              <div className="review-card-content">
                <span className="badge review-badge">{post.category}</span>
                <h3>{post.title}</h3>
                <p>{(post.description || '').substring(0, 140)}</p>
                <div className="card-meta">
                  <span>{post.date}</span>
                  <span className="read-more">Read More</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
