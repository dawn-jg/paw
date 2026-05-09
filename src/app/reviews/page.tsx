import Link from 'next/link'
import { Metadata } from 'next'
import allPosts from '@/data/latest.json'

export const metadata: Metadata = {
  title: 'All Reviews | PawCritic',
  description: 'Browse our complete collection of honest, research-backed pet product reviews.',
}

const catEmoji: Record<string, string> = {
  Dogs: '\u{1F415}',
  Cats: '\u{1F408}',
  'Small Pets': '\u{1F439}',
  Birds: '\u{1F99C}',
  Fish: '\u{1F420}',
  Reptiles: '\u{1F98E}',
}

// Combine latest.json sorted posts
const posts = [...allPosts].sort(
  (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
)

export default function ReviewsPage() {
  return (
    <main className="reviews-page">
      <section className="reviews-hero">
        <div className="container">
          <h1>All Reviews</h1>
          <p>
            {posts.length} honest, research-backed pet product reviews for every type of pet.
          </p>
        </div>
      </section>

      <section className="reviews-grid container">
        {posts.map((post: any) => (
          <Link
            href={`/${post.slug}`}
            key={post.slug}
            className="review-card"
          >
            <div className="review-img">
              <span className="review-emoji">
                {catEmoji[post.category] || '\u{1F43E}'}
              </span>
              <span className="badge review-badge">{post.category}</span>
            </div>
            <div className="review-body">
              <h3 className="review-title">{post.title}</h3>
              <p className="review-excerpt">
                {post.description || post.title.substring(0, 80)}
              </p>
              <div className="card-meta">
                <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                <span className="read-more">Read Review</span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}
