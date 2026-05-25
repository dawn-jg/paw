import { Metadata } from 'next'
import Link from 'next/link'
import latestPosts from '@/data/latest.json'

export const metadata: Metadata = {
  alternates: { canonical: 'https://pawcritic.com' },
}

// Use top 3 latest posts for featured section
const featuredReviews = latestPosts.slice(0, 3).map((p: any) => ({
  title: p.title,
  category: p.category,
  slug: p.slug,
  excerpt: p.description || `${p.title.substring(0, 80)}...`,
  rating: 4.5 + Math.random() * 0.5, // placeholder rating until real ratings are added
}))

const trustStats = [
  { number: '1,200+', label: 'Products Tested' },
  { number: '50,000+', label: 'Monthly Readers' },
  { number: '8+', label: 'Years of Expertise' },
  { number: '100%', label: 'Honest Reviews' },
]

const categories = [
  { name: 'Dogs', slug: 'dogs', emoji: '\u{1F415}', desc: 'Food, toys, beds and more', color: '#5B8C5A' },
  { name: 'Cats', slug: 'cats', emoji: '\u{1F408}', desc: 'Litter, scratchers, treats', color: '#E8A838' },
  { name: 'Small Pets', slug: 'small-pets', emoji: '\u{1F439}', desc: 'Habitat, food, accessories', color: '#8B7E74' },
  { name: 'Birds', slug: 'birds', emoji: '\u{1F99C}', desc: 'Cages, food, enrichment', color: '#6B8E9B' },
  { name: 'Fish', slug: 'fish', emoji: '\u{1F420}', desc: 'Tanks, filters, decor', color: '#4A90B8' },
  { name: 'Reptiles', slug: 'reptiles', emoji: '\u{1F98E}', desc: 'Terrariums, heat, lighting', color: '#8B6E5A' },
]

const cardEmoji: Record<string, string> = {
  Dogs: '\u{1F415}',
  Cats: '\u{1F408}',
  'Small Pets': '\u{1F439}',
  Birds: '\u{1F99C}',
  Fish: '\u{1F420}',
  Reptiles: '\u{1F98E}',
}

export default function Home() {
  return (
    <>
      {/* ========== HERO ========== */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="container-wide hero-grid">
          <div className="hero-text">
            <span className="hero-chip animate-in">
              {'\u{1F43E}'} The Trusted Pet Review Authority
            </span>
            <h1 className="hero-heading animate-in" style={{ animationDelay: '0.1s' }}>
              Honest Pet Product Reviews
              <br />
              <span className="hero-highlight">You Can Trust</span>
            </h1>
            <p className="hero-desc animate-in" style={{ animationDelay: '0.2s' }}>
              We test pet products like our pets depend on it &mdash; because they do.
              No sponsored reviews. No sugar-coating.
            </p>
            <div className="hero-cta animate-in" style={{ animationDelay: '0.3s' }}>
              <Link href="/reviews" className="btn-primary">Browse All Reviews</Link>
              <a href="#why-trust" className="btn-outline">Why Trust Us?</a>
            </div>
          </div>
          <div className="hero-visual animate-in" style={{ animationDelay: '0.2s' }}>
            <div className="hero-card">
              <span className="hero-pets">
                {'\u{1F415}\u{1F408}\u{1F439}\u{1F99C}\u{1F420}\u{1F98E}'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== WHY TRUST US ========== */}
      <section id="why-trust" className="trust">
        <div className="container-wide">
          <h2 className="section-title">Why Trust PawCritic?</h2>
          <p className="section-subtitle">
            Every review is backed by thorough research, hands-on testing, and a genuine love for animals.
          </p>

          <div className="stats-row">
            {trustStats.map((s, i) => (
              <div
                key={i}
                className="stat-card animate-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <span className="stat-num">{s.number}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="values-row">
            {[
              { icon: '\u{1F52C}', title: 'Research-Backed', desc: 'Grounded in veterinary research, ingredient analysis, and real-world testing.' },
              { icon: '\u{1F91D}', title: 'No Sponsored Reviews', desc: 'We buy every product we test. No brand can pay for a better rating.' },
              { icon: '\u{1F3E0}', title: 'Real-World Testing', desc: 'Our team tests products in real homes with real pets.' },
              { icon: '\u{1F504}', title: 'Regularly Updated', desc: 'We revisit reviews regularly to keep recommendations fresh.' },
            ].map((v, i) => (
              <div key={i} className="value-card">
                <span className="value-icon">{v.icon}</span>
                <h3 className="value-title">{v.title}</h3>
                <p className="value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CATEGORIES ========== */}
      <section className="cats">
        <div className="container-wide">
          <h2 className="section-title">Explore by Pet</h2>
          <p className="section-subtitle">
            Find expert reviews tailored to your specific pet. From dogs to reptiles,
            we have got every pet covered.
          </p>
          <div className="cats-grid">
            {categories.map((c) => (
              <Link href={`/${c.slug}`} key={c.slug} className="cat-card">
                <span className="cat-emoji">{c.emoji}</span>
                <h3 className="cat-name">{c.name}</h3>
                <p className="cat-desc">{c.desc}</p>
                <span className="cat-arrow" style={{ color: c.color }}>View Reviews</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURED REVIEWS ========== */}
      <section className="featured">
        <div className="container-wide">
          <div className="featured-top">
            <div>
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '0.25rem' }}>
                Latest Reviews
              </h2>
              <p className="section-subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>
                Fresh insights for smarter pet care decisions.
              </p>
            </div>
            <Link href="/reviews" className="btn-outline">View All</Link>
          </div>

          <div className="featured-grid">
            {featuredReviews.map((r, i) => (
              <Link href={`/${r.slug}`} key={i} className="review-card">
                <div className="review-img">
                  <span className="review-emoji">{cardEmoji[r.category] || '\u{1F43E}'}</span>
                  <span className="badge review-badge">{r.category}</span>
                </div>
                <div className="review-body">
                  <span className="review-rating">&#11088; {r.rating.toFixed(1)}</span>
                  <h3 className="review-title">{r.title}</h3>
                  <p className="review-excerpt">{r.excerpt.substring(0, 100)}</p>
                  <span className="review-link">Read Full Review</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA BANNER ========== */}
      <section className="cta">
        <div className="container-wide">
          <div className="cta-box">
            <h2 className="cta-heading">Ready to find the best for your pet?</h2>
            <p className="cta-desc">
              Browse hundreds of honest, detailed reviews by pet owners who care as much as you do.
            </p>
            <Link href="/reviews" className="btn-primary cta-btn">Start Browsing</Link>
          </div>
        </div>
      </section>
    </>
  )
}
