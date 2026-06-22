import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Editorial Policy',
  description: 'PawCritic editorial policy — our commitment to honest reviews, editorial independence, correction procedures, and affiliate transparency.',
}

export default function EditorialPolicyPage() {
  return (
    <div className="static-page">
      <div className="container-wide" style={{ maxWidth: 760, margin: '3rem auto 0' }}>
        
        <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
          Editorial Policy
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          Last updated: June 2026
        </p>

        <section className="static-section">
          <h2>1. Editorial Independence</h2>
          <p>
            PawCritic maintains <strong>complete editorial independence</strong>. Our reviews, ratings, 
            and recommendations are based solely on our testing and research. We do not:
          </p>
          <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', lineHeight: 1.8 }}>
            <li>Accept payment or gifts in exchange for positive reviews</li>
            <li>Allow manufacturers to review or approve content before publication</li>
            <li>Guarantee favorable placement or ratings to any brand</li>
            <li>Accept free products without clear disclosure (we prefer to purchase ourselves)</li>
          </ul>
        </section>

        <section className="static-section">
          <h2>2. How We Fund Our Work</h2>
          <p>
            PawCritic generates revenue through <strong>affiliate commissions</strong>. When you click 
            a link to a retailer (such as Amazon) and make a purchase, we may earn a small percentage 
            of the sale — at no additional cost to you.
          </p>
          <p>
            We participate in the following affiliate programs:
          </p>
          <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', lineHeight: 1.8 }}>
            <li>Amazon Services LLC Associates Program</li>
          </ul>
          <p>
            Affiliate relationships <strong>never influence</strong> our reviews or ratings. Products 
            are selected for review based on quality and relevance, not commission rates. We disclose 
            our affiliate relationship on every page containing affiliate links.
          </p>
        </section>

        <section className="static-section">
          <h2>3. Review Selection Criteria</h2>
          <p>
            We select products for review based on:
          </p>
          <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', lineHeight: 1.8 }}>
            <li><strong>Popularity:</strong> Products that are widely used and frequently searched for</li>
            <li><strong>Innovation:</strong> Products that introduce meaningful new features or technology</li>
            <li><strong>Reader Requests:</strong> Products our community asks us to evaluate</li>
            <li><strong>Category Gaps:</strong> Product categories where we identify a need for trustworthy information</li>
          </ul>
        </section>

        <section className="static-section">
          <h2>4. Rating Scale</h2>
          <p>
            Every product receives a rating from 1 to 5 stars based on weighted scores across 
            five dimensions (see <Link href="/how-we-test">How We Test</Link> for details):
          </p>
          <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', lineHeight: 1.8 }}>
            <li>★★★★★ <strong>Excellent:</strong> Best-in-class performance, exceptional value. Highly recommended.</li>
            <li>★★★★☆ <strong>Very Good:</strong> Strong performer with minor drawbacks. Recommended.</li>
            <li>★★★☆☆ <strong>Decent:</strong> A solid choice, but better alternatives may exist at similar price points.</li>
            <li>★★☆☆☆ <strong>Mediocre:</strong> Has significant flaws or is overpriced relative to performance.</li>
            <li>★☆☆☆☆ <strong>Poor:</strong> We cannot recommend it. Either unsafe, unreliable, or poor value.</li>
          </ul>
        </section>

        <section className="static-section">
          <h2>5. Corrections Policy</h2>
          <p>
            We strive for accuracy in every article. If you believe we've made an error:
          </p>
          <ol style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', lineHeight: 1.8 }}>
            <li>Contact us at <a href="mailto:hello@pawcritic.com">hello@pawcritic.com</a> with the article URL and a description of the issue.</li>
            <li>Our editorial team reviews all correction requests within <strong>48 hours</strong>.</li>
            <li>Verified errors are corrected immediately. Significant corrections are noted at the top of the article with the date of revision.</li>
            <li>If a correction changes the substance of a review (e.g., a recalled product), we add a prominent notice and may update the rating.</li>
          </ol>
        </section>

        <section className="static-section">
          <h2>6. Product Recalls</h2>
          <p>
            If a product we've reviewed is subject to a safety recall, we will:
          </p>
          <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', lineHeight: 1.8 }}>
            <li>Add a <strong>prominent recall notice</strong> at the top of the review</li>
            <li>Remove all purchase links until the safety issue is resolved</li>
            <li>Update the review if/when a revised version of the product is released</li>
          </ul>
        </section>

        <section className="static-section">
          <h2>7. Reader Feedback</h2>
          <p>
            Your experience matters. If you've used a product we reviewed and had a different experience 
            — better or worse — we want to hear about it. Reader feedback helps us identify products 
            that perform differently in the long run versus initial testing, and we may update our 
            reviews to reflect emerging patterns.
          </p>
        </section>

        <section className="static-section" style={{ paddingBottom: '3rem' }}>
          <h2>8. Affiliate Disclaimer</h2>
          <p style={{ background: 'var(--color-surface-alt, #f9f9f9)', padding: '1rem', borderRadius: 8, fontSize: '0.9rem' }}>
            <strong>Disclosure:</strong> PawCritic is a participant in the Amazon Services LLC 
            Associates Program, an affiliate advertising program designed to provide a means for 
            sites to earn advertising fees by advertising and linking to Amazon.com. As an Amazon 
            Associate, we earn from qualifying purchases. This does not affect the price you pay or 
            the products we choose to review.
          </p>
        </section>

      </div>
    </div>
  )
}
