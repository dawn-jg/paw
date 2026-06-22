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
            We're a team of pet owners, product testers, and researchers on a mission: 
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
            We started PawCritic in 2025 to bridge the gap between marketing claims and real-world performance. 
            Since then, we've tested <strong>hundreds of pet products</strong> across six categories — Dogs, Cats, 
            Small Pets, Birds, Fish, and Reptiles — and published in-depth reviews that cut through the noise.
          </p>
        </section>

        {/* Our Team */}
        <section className="static-section">
          <h2>Our Team</h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.25rem' }}>Dr. Sarah Chen, DVM</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Veterinary Consultant &amp; Senior Reviewer
            </p>
            <p>
              With 8 years of clinical experience in small animal practice and a passion for evidence-based 
              pet care, Sarah ensures every review meets rigorous health and safety standards. She specializes 
              in dog and cat nutrition, behavioral enrichment, and preventive care.
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.25rem' }}>Marcus Rivera</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Lead Product Tester &amp; Aquatics Specialist
            </p>
            <p>
              A lifelong aquarist who maintains 6 tanks at home (from a 5-gallon nano cube to a 150-gallon reef), 
              Marcus brings hands-on expertise to every fish and aquarium product review. He's also our go-to 
              for reptile and amphibian products.
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.25rem' }}>Emily Zhao</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Content Director &amp; Small Animal Expert
            </p>
            <p>
              Owner of 3 guinea pigs, 2 rabbits, and 1 very opinionated parrot, Emily oversees content quality 
              and covers the Small Pets and Birds categories. She's obsessed with enrichment, cage design, and 
              finding those niche products that make a real difference.
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.25rem' }}>James Kim</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Research Lead &amp; Data Analyst
            </p>
            <p>
              James brings a data-driven approach to product evaluation. He analyzes thousands of user reviews, 
              compares specs across competing products, and ensures every rating on PawCritic is backed by 
              measurable criteria — not gut feelings.
            </p>
          </div>
        </section>

        {/* Our Values */}
        <section className="static-section">
          <h2>What We Stand For</h2>
          <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', lineHeight: 1.8 }}>
            <li><strong>Honesty First.</strong> We never accept payment for positive reviews. If a product has flaws, we say so.</li>
            <li><strong>Real Testing.</strong> We buy products ourselves and put them through real-world use — in our homes, with our pets.</li>
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
