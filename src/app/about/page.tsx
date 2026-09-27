import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About PawCritic',
  description: 'Meet the PawCritic team — passionate pet owners and product researchers helping you choose the best for your furry, feathered, and scaly friends.',
}

export default function AboutPage() {
  return (
    <div className="static-page">
      <div className="container-wide" style={{ maxWidth: 760, margin: '3rem auto 0' }}>
        
        {/* Hero */}
        <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 className="section-title" style={{ fontSize: '2.4rem', marginBottom: '1rem' }}>
            About PawCritic
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--color-text-muted)', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
            We're a team of pet owners and product researchers on a mission: 
            to help you make confident, informed decisions about what you buy for your pets.
          </p>
        </section>

        {/* Our Story */}
        <section className="static-section">
          <h2>Our Story</h2>
          <p>
            PawCritic was born from a simple frustration: standing in a pet store aisle, scrolling through 
            hundreds of Amazon reviews, and still not knowing which product to trust. Every listing had 
            five-star ratings. Every brand claimed to be "the best." But real pet owners know the truth — 
            not all products are created equal.
          </p>
          <p>
            We started PawCritic to bridge the gap between marketing claims and real-world performance. 
            Since then, we've researched <strong>hundreds of pet products</strong> across six categories — Dogs, Cats, 
            Small Pets, Birds, Fish, and Reptiles — and published in-depth reviews that cut through the noise.
          </p>
        </section>

        {/* Our Team */}
        <section className="static-section">
          <h2>Our Team</h2>
          <p>
            PawCritic is written and maintained by a small editorial team. We do not publish
            individual author profiles, and we do not present our writers as veterinarians,
            veterinary technicians, or other licensed professionals. Where a topic needs clinical
            judgment — nutrition, illness, medication, or injury — we point readers to licensed
            veterinarians and to the veterinary sources cited in each article, rather than offering
            advice in our own voice.
          </p>
          <p>
            What our team actually does is research. We read manufacturer specifications and safety
            documentation, we work through published veterinary and industry guidance, and we analyze
            verified owner feedback at scale to find patterns that hold up across hundreds of reviews.
            Every guide cites its sources, and every guide says so when a question is still contested
            rather than settled.
          </p>
          <p>
            We would rather be straight about that than publish a page of credentials we cannot
            substantiate. If you want the detail, our <Link href="/how-we-test">research methodology</Link> explains
            exactly how a guide gets built, and our <Link href="/editorial-policy">editorial policy</Link> covers
            corrections, independence, and how we make money.
          </p>
        </section>

        {/* Our Values */}
        <section className="static-section">
          <h2>What We Stand For</h2>
          <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', lineHeight: 1.8 }}>
            <li><strong>Honesty First.</strong> We never accept payment for positive reviews. If a product has flaws, we say so.</li>
            <li><strong>Research-First.</strong> Every recommendation is built from documented research, verified owner feedback, and authoritative veterinary and industry sources.</li>
            <li><strong>Transparency.</strong> We clearly disclose our affiliate relationships and explain how we make money.</li>
            <li><strong>Science-Backed.</strong> Wherever possible, we reference veterinary research, nutritional studies, and industry standards.</li>
            <li><strong>Pet Welfare Above All.</strong> Every recommendation starts with one question: is this genuinely good for the animal?</li>
          </ul>
        </section>

        {/* How We Fund Our Work */}
        <section className="static-section">
          <h2>How We Make Money</h2>
          <p>
            PawCritic is reader-supported. When you buy a product through our links, we may earn an 
            affiliate commission — at <strong>no extra cost to you</strong>. This is how we keep the site running, 
            pay our team, and purchase products for testing.
          </p>
          <p>
            We participate in the Amazon Associates program and other affiliate networks. Read more 
            in our <Link href="/editorial-policy">Editorial Policy</Link>.
          </p>
        </section>

        {/* CTA */}
        <section className="static-section" style={{ textAlign: 'center', padding: '2rem 0 3rem' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            Have a question, suggestion, or a product you'd like us to review?
          </p>
          <Link href="/contact" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
            Get in Touch
          </Link>
        </section>

      </div>
    </div>
  )
}
