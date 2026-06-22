import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact PawCritic',
  description: 'Get in touch with the PawCritic team — product review requests, feedback, corrections, and partnership inquiries.',
}

export default function ContactPage() {
  return (
    <div className="static-page">
      <div className="container-wide" style={{ maxWidth: 760, margin: '3rem auto 0' }}>
        
        <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
          Contact Us
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          We'd love to hear from you.
        </p>

        <section className="static-section">
          <h2>How to Reach Us</h2>
          <p><strong>Email:</strong>{' '}
            <a href="mailto:hello@pawcritic.com">hello@pawcritic.com</a>
          </p>
          <p style={{ marginTop: '1rem' }}>
            We typically respond within <strong>2 business days</strong>. For urgent matters, 
            please include "URGENT" in your subject line.
          </p>
        </section>

        <section className="static-section">
          <h2>What to Contact Us About</h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h3>🔍 Product Review Requests</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
              Have a product you think we should review? Tell us what it is and why it deserves 
              our attention. We review products that are widely available and relevant to our readers.
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3>✏️ Corrections &amp; Feedback</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
              Spotted an error or outdated information? We take accuracy seriously and will 
              correct verified mistakes within 48 hours. Please include a link to the specific 
              page and a description of the issue.
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3>🤝 Partnership &amp; Media Inquiries</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
              Interested in working with us? We're open to collaborations that align with our 
              values. Please note: we do <strong>not</strong> accept payment for positive reviews 
              or guaranteed placement. Read our <Link href="/editorial-policy">Editorial Policy</Link> 
              before reaching out.
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3>📝 General Questions</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
              Just want to say hi or have a question about a specific product? We read every message 
              and love hearing from fellow pet people.
            </p>
          </div>
        </section>

        <section className="static-section">
          <h2>Important Notes</h2>
          <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', lineHeight: 1.8 }}>
            <li>We do <strong>not</strong> sell, rent, or share your personal information with third parties. See our <Link href="/privacy-policy">Privacy Policy</Link>.</li>
            <li>For veterinary medical advice, please consult a licensed veterinarian — we can't provide individual medical guidance.</li>
            <li>Product return/exchange inquiries should be directed to the retailer you purchased from (e.g., Amazon, Chewy).</li>
          </ul>
        </section>

      </div>
    </div>
  )
}
