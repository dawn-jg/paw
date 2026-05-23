import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import categoryData from '@/data/categories.json';

// Map URL slugs to category names
const SLUG_MAP: Record<string, string> = {
  dogs: 'Dogs',
  cats: 'Cats',
  'small-pets': 'Small Pets',
  birds: 'Birds',
  fish: 'Fish',
  reptiles: 'Reptiles',
};

const CAT_META: Record<string, { title: string; desc: string; emoji: string }> = {
  Dogs: { title: 'Dog Reviews', desc: 'Food, toys, beds, grooming — honest reviews for every dog parent.', emoji: '🐕' },
  Cats: { title: 'Cat Reviews', desc: 'Litter, scratchers, treats — everything your feline deserves.', emoji: '🐈' },
  'Small Pets': { title: 'Small Pet Reviews', desc: 'Habitats, food, and accessories for rabbits, hamsters, guinea pigs, and more.', emoji: '🐹' },
  Birds: { title: 'Bird Reviews', desc: 'Cages, food, toys — reviews that help your feathered friend thrive.', emoji: '🦜' },
  Fish: { title: 'Fish Reviews', desc: 'Aquariums, filters, decor — everything for a thriving underwater world.', emoji: '🐠' },
  Reptiles: { title: 'Reptile Reviews', desc: 'Terrariums, heat lamps, substrates — expert picks for scaly pets.', emoji: '🦎' },
};

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const catName = SLUG_MAP[params.category];
  if (!catName) return { title: 'Not Found' };
  const meta = CAT_META[catName];
  return {
    title: `${meta.title} | PawCritic`,
    description: meta.desc,
  };
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const catName = SLUG_MAP[params.category];
  if (!catName) notFound();

  const cat = (categoryData as any)[catName];
  if (!cat || !cat.posts) notFound();

  const posts = cat.posts;

  return (
    <main className="reviews-page">
      {/* Hero */}
      <section className="reviews-hero">
        <div className="container">
          <h1>
            <span style={{ marginRight: '0.5rem' }}>{CAT_META[catName]?.emoji || '🐾'}</span>
            {catName}
          </h1>
          <p>{CAT_META[catName]?.desc} — {posts.length} reviews</p>
        </div>
      </section>

      {/* Grid */}
      <section className="reviews-grid container">
        {posts.map((post: any) => (
          <Link
            href={`/${post.slug}`}
            key={post.slug}
            className="review-card"
          >
            <div className="review-img">
              <span className="review-emoji">
                {CAT_META[post.category || catName]?.emoji || '🐾'}
              </span>
              <span className="badge review-badge">{catName}</span>
            </div>
            <div className="review-body">
              <h3 className="review-title">{post.title}</h3>
              <p className="review-excerpt">
                {post.description || post.title}
              </p>
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