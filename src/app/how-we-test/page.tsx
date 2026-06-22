import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How We Test Pet Products',
  description: 'Our rigorous, multi-step testing methodology for pet product reviews — from initial research to final rating.',
}

export default function HowWeTestPage() {
  return (
    <div className="static-page">
      <div className="container-wide" style={{ maxWidth: 760, margin: '3rem auto 0' }}>
        
        <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
          How We Test Pet Products
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          Last updated: June 2026
        </p>

        <section className="static-section">
          <h2>Our Testing Promise</h2>
          <p>
            Every product featured on PawCritic goes through our <strong>6-step evaluation process</strong>. 
            We don't just read the manual and write a review — we use the product, stress-test it, 
            compare it against competitors, and measure it against objective criteria. When we say 
            "Best Overall," we mean it.
          </p>
        </section>

        <section className="static-section">
          <h2>The 6-Step Process</h2>

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

          <h3>Step 2: Hands-On Testing</h3>
          <p>
            This is where the real work happens. We purchase products ourselves (no free samples from 
            manufacturers) and test them under real conditions:
          </p>
          <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', lineHeight: 1.8 }}>
            <li><strong>Dog &amp; Cat products:</strong> Tested with our own pets over 2–4 weeks. Food tested for palatability, digestibility, and ingredient quality. Toys tested for durability under enthusiastic play.</li>
            <li><strong>Aquarium equipment:</strong> Installed in active tanks, monitored for temperature stability (for heaters), flow rate (for pumps), light output (for fixtures), and long-term reliability.</li>
            <li><strong>Reptile products:</strong> Tested in bioactive and traditional enclosures. Heating elements measured with infrared thermometers for gradient accuracy.</li>
            <li><strong>Bird &amp; Small Pet products:</strong> Set up in actual cages and habitats. Evaluated for safety (no sharp edges, non-toxic materials), durability, and engagement.</li>
          </ul>

          <h3>Step 3: Performance Metrics</h3>
          <p>
            Every product gets scored on a <strong>1–5 scale</strong> across 5 dimensions:
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', margin: '1rem 0' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-alt, #f4f4f4)' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid var(--color-border, #ddd)' }}>Dimension</th>
                <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid var(--color-border, #ddd)' }}>What We Measure</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Build Quality', 'Materials, durability, manufacturing defects, longevity'],
                ['Performance', 'Does it do what it claims? Measured results vs. advertised specs'],
                ['Safety', 'Non-toxic materials, no choking hazards, electrical safety (where applicable)'],
                ['Ease of Use', 'Setup time, learning curve, maintenance requirements, instruction clarity'],
                ['Value', 'Price vs. quality vs. longevity — is it worth it?'],
              ].map(([dim, desc]) => (
                <tr key={dim}>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--color-border, #ddd)', fontWeight: 600 }}>{dim}</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--color-border, #ddd)' }}>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Step 4: Competitive Comparison</h3>
          <p>
            We compare each product head-to-head against its closest competitors at similar price points. 
            If two products score similarly, we ask: which one is easier to maintain? Which has better 
            customer support? Which has a longer warranty?
          </p>

          <h3>Step 5: Long-Term Follow-Up</h3>
          <p>
            For key products, we follow up after <strong>2 and 6 months</strong> to check on long-term durability. 
            If a product develops issues over time, we update the review and adjust the rating accordingly.
          </p>

          <h3>Step 6: Final Review &amp; Rating</h3>
          <p>
            Our editorial team combines all data — performance scores, competitive analysis, customer 
            review sentiment from thousands of verified purchases — into a final rating and written review. 
            Every review includes a clear <strong>Best For</strong> recommendation so you know exactly 
            which product fits your specific situation.
          </p>
        </section>

        <section className="static-section">
          <h2>Why Trust PawCritic?</h2>
          <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', lineHeight: 1.8 }}>
            <li><strong>No free rides.</strong> We purchase every product we test. No sponsored reviews, no paid placements.</li>
            <li><strong>Transparent ratings.</strong> Every score is explained. If a product gets 3 stars, you'll know exactly why.</li>
            <li><strong>Regular updates.</strong> Reviews are revisited as new models launch or older products are discontinued.</li>
            <li><strong>Veterinary consultant review.</strong> Health and safety claims are reviewed by our consulting veterinarian.</li>
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
