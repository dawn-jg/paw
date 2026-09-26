import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How We Research & Review Pet Products',
  description: 'Our research-based methodology: how we shortlist products, analyze verified owner feedback, cross-check expert sources, and build transparent ratings.',
}

export default function HowWeTestPage() {
  return (
    <div className="static-page">
      <div className="container-wide" style={{ maxWidth: 760, margin: '3rem auto 0' }}>

        <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
          How We Research &amp; Review Pet Products
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          Last updated: September 2026
        </p>

        <section className="static-section">
          <h2>Our Approach, Stated Plainly</h2>
          <p>
            PawCritic is a research-based review site. We want to be upfront about what that means:
            <strong> we do not run a physical testing lab</strong>, and we don't claim to have personally
            used every one of the hundreds of products we cover. Instead, every recommendation on this
            site is built from structured research — combining manufacturer specifications, safety and
            recall records, large-scale analysis of verified owner feedback, and cross-checking against
            veterinary and expert sources.
          </p>
          <p>
            We believe honest research, clearly explained, is more useful to pet owners than invented
            testing claims. So this page describes exactly how our reviews are made.
          </p>
        </section>

        <section className="static-section">
          <h2>The 6-Step Research Process</h2>

          <h3>Step 1: Market Research &amp; Shortlisting</h3>
          <p>
            We scan the market — Amazon best-sellers, specialty pet retailers, veterinary recommendations,
            and community forums like Reddit's r/Aquariums, r/dogs, and r/CatAdvice. From hundreds of
            options, we narrow down to <strong>7–10 top contenders</strong> per category based on:
          </p>
          <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', lineHeight: 1.8 }}>
            <li>Sales volume and customer review count</li>
            <li>Brand reputation and history</li>
            <li>Unique features or innovation</li>
            <li>Price-to-value ratio</li>
          </ul>

          <h3>Step 2: Specification &amp; Safety Analysis</h3>
          <p>
            For each shortlisted product, we examine the manufacturer's full specifications and materials,
            then check for red flags:
          </p>
          <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', lineHeight: 1.8 }}>
            <li><strong>Safety records:</strong> CPSC recalls, FDA pet food recalls, and brand-wide safety history</li>
            <li><strong>Standards compliance:</strong> AAFCO nutritional adequacy (for foods), ASTM durability standards (for toys), electrical safety certifications (for powered equipment)</li>
            <li><strong>Materials transparency:</strong> whether the manufacturer discloses what the product is actually made of</li>
          </ul>

          <h3>Step 3: Verified Owner Feedback Analysis</h3>
          <p>
            Real-world performance comes from the people who live with these products every day. We read
            and analyze <strong>hundreds to thousands of verified-purchase reviews per product</strong>,
            looking for patterns rather than anecdotes:
          </p>
          <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', lineHeight: 1.8 }}>
            <li>Recurring failure modes reported across many independent reviews</li>
            <li>How the product performs for different pet sizes, breeds, and temperaments</li>
            <li>Complaints that appear after months of use, not just first impressions</li>
            <li>How the manufacturer responds when things go wrong</li>
          </ul>
          <p>
            We weight detailed, verified reviews over one-line ratings, and we treat clusters of identical
            reviews as a warning sign rather than social proof.
          </p>

          <h3>Step 4: Expert Source Cross-Checking</h3>
          <p>
            Health, nutrition, and safety claims are cross-checked against authoritative veterinary and
            industry sources, including AAHA, AVMA, Cornell University College of Veterinary Medicine,
            AAFCO, and species-specific expert organizations. Where a claim is contested or evidence is
            thin, our articles say so instead of picking a side for drama.
          </p>

          <h3>Step 5: Competitive Comparison</h3>
          <p>
            We compare each product head-to-head against its closest competitors at similar price points.
            If two products research similarly, we ask: which one is easier to maintain? Which has better
            customer support? Which has a longer warranty?
          </p>

          <h3>Step 6: Rating &amp; Review</h3>
          <p>
            Our editorial team combines all research — specification analysis, owner-feedback patterns,
            expert-source cross-checks, and competitive positioning — into a final rating and written
            review. Every review includes a clear <strong>Best For</strong> recommendation so you know
            exactly which product fits your specific situation.
          </p>
        </section>

        <section className="static-section">
          <h2>How We Make Money — And Why It Doesn't Pick Our Winners</h2>
          <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', lineHeight: 1.8 }}>
            <li><strong>Affiliate links, clearly disclosed.</strong> Some links are Amazon affiliate links — if you buy through one, we may earn a commission at no extra cost to you. Every article with affiliate links carries a disclosure.</li>
            <li><strong>Rankings aren't for sale.</strong> No manufacturer can pay for placement. Commission rates do not influence which products we recommend — we regularly recommend products with low or no affiliate commission when the research supports them.</li>
            <li><strong>Transparent ratings.</strong> Every score is explained. If a product gets 3 stars, you'll know exactly why.</li>
            <li><strong>Regular updates.</strong> Reviews are revisited as new models launch or older products are discontinued.</li>
          </ul>
        </section>

        <section className="static-section">
          <h2>Our Limitations</h2>
          <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', lineHeight: 1.8 }}>
            <li>We can't test every product variant, and manufacturing can change without notice. Always check the current product listing and manual before purchase.</li>
            <li>Review-based research inherits the blind spots of its sources — we mitigate this with volume analysis and expert cross-checking, but it's not a substitute for hands-on experience with your specific pet.</li>
            <li>Nothing on this site is veterinary advice. For health concerns, consult your veterinarian.</li>
          </ul>
        </section>

        <section className="static-section" style={{ paddingBottom: '3rem' }}>
          <p style={{ fontSize: '1.1rem' }}>
            Want the full picture? Read our <Link href="/editorial-policy">Editorial Policy</Link> for
            how we handle corrections, conflicts of interest, and reader feedback.
          </p>
        </section>

      </div>
    </div>
  )
}
