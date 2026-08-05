import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

// ─── Author profiles (3 experts) ─────────────────────
interface AuthorProfile {
  name: string;
  title: string;
  bio: string;
  initials: string;
  sameAs: string[];
}

const AUTHORS: Record<string, AuthorProfile> = {
  'dr-sarah-chen': {
    name: 'Dr. Sarah Chen',
    title: 'Veterinary Consultant & Senior Reviewer',
    bio: 'Veterinary consultant and senior reviewer at PawCritic with 8 years of clinical experience in small animal practice. Sarah specializes in dog and cat health, nutrition, and product safety, translating clinical evidence into practical buying advice for pet parents.',
    initials: 'SC',
    sameAs: ['https://www.linkedin.com/in/pawcritic-sarah-chen'],
  },
  'emily-zhao': {
    name: 'Emily Zhao',
    title: 'Avian & Small Pet Specialist',
    bio: 'Emily Zhao is a dedicated avian specialist and small pet enthusiast. With years of hands-on experience in bird care and training, she provides practical, well-researched advice for pet bird and small pet owners.',
    initials: 'EZ',
    sameAs: ['https://www.linkedin.com/in/pawcritic-emily-zhao'],
  },
  'marcus-rivera': {
    name: 'Marcus Rivera',
    title: 'Aquatics & Reptile Gear Specialist',
    bio: 'Aquatics and reptile gear specialist with a passion for husbandry. Marcus has been reviewing pet products for over 7 years and focuses on fish and reptile habitat equipment, testing for safety, durability, and real-world performance.',
    initials: 'MR',
    sameAs: ['https://www.linkedin.com/in/pawcritic-marcus-rivera'],
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
    title: `${author.name} — PawCritic`,
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    url: `https://pawcritic.com/author/${slug}`,
    jobTitle: author.title,
    description: author.bio,
    sameAs: author.sameAs,
  };

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
