import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'PawCritic privacy policy – how we collect, use, and protect your information.',
}

export default function PrivacyPage() {
  return (
    <div className="static-page">
      <div className="container-wide" style={{ maxWidth: 760, margin: '3rem auto 0' }}>
        <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
          Privacy Policy
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          Last updated: {new Date().toISOString().slice(0, 10)}
        </p>

        <section className="static-section">
          <h2>1. Introduction</h2>
          <p>
            PawCritic (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your information when you visit our website
            pawcritic.com.
          </p>
        </section>

        <section className="static-section">
          <h2>2. Information We Collect</h2>
          <p><strong>Automatically Collected Information:</strong> When you visit our site, certain information
            may be collected automatically, including your IP address, browser type, operating system, referring
            URLs, device type, and pages visited. This is standard for most websites and is used for analytics
            and security.</p>
          <p><strong>Cookies and Tracking Technologies:</strong> We and our third-party partners use cookies, web
            beacons, and similar technologies to:</p>
          <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', lineHeight: 1.8 }}>
            <li>Understand how you use our site (analytics)</li>
            <li>Display relevant advertisements (Google AdSense)</li>
            <li>Track affiliate referrals (Amazon Associates)</li>
          </ul>
        </section>

        <section className="static-section">
          <h2>3. How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', lineHeight: 1.8 }}>
            <li>Operate and improve our website</li>
            <li>Analyze traffic patterns and user behavior</li>
            <li>Display personalized advertisements</li>
            <li>Track affiliate referral commissions</li>
            <li>Protect against fraudulent or unauthorized activity</li>
          </ul>
        </section>

        <section className="static-section">
          <h2>4. Third-Party Services</h2>
          <p>We use the following third-party services that may collect and process your data:</p>
          <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', lineHeight: 1.8 }}>
            <li><strong>Google AdSense</strong> – displays advertisements using cookies. Google uses cookies to
              serve ads based on your visits to our site and other sites. You can opt out of personalized ads at
              <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
                &nbsp;adssettings.google.com</a>.</li>
            <li><strong>51.la Analytics</strong> – Chinese analytics platform that collects anonymized visitor
              data including IP address and page views. Their privacy policy is available at
              <a href="https://www.51.la/privacy" target="_blank" rel="noopener noreferrer">
                &nbsp;www.51.la/privacy</a>.</li>
            <li><strong>Amazon Associates</strong> – affiliate program. Amazon may place cookies to track
              purchases made through our affiliate links. See
              <a href="https://www.amazon.com/privacy" target="_blank" rel="noopener noreferrer">
                &nbsp;Amazon&apos;s Privacy Notice</a>.</li>
          </ul>
        </section>

        <section className="static-section">
          <h2>5. Cookies</h2>
          <p>You can control cookies through your browser settings. Most browsers allow you to refuse or accept
            cookies. Disabling cookies may affect your experience on our site.</p>
          <p>Key cookies used:</p>
          <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', lineHeight: 1.8 }}>
            <li><strong>_ga / _gid</strong> (Google Analytics) – session and traffic analysis</li>
            <li><strong>__gads</strong> (Google AdSense) – ad personalization</li>
            <li><strong>AWSALB / AWSALBCORS</strong> (Amazon) – affiliate link tracking</li>
          </ul>
        </section>

        <section className="static-section">
          <h2>6. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have rights regarding your personal data, including:</p>
          <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', lineHeight: 1.8 }}>
            <li>The right to access, correct, or delete your data</li>
            <li>The right to opt out of personalized advertising</li>
            <li>The right to withdraw consent for cookie usage</li>
          </ul>
          <p>To exercise these rights, please <Link href="/contact">contact us</Link>.</p>
        </section>

        <section className="static-section">
          <h2>7. Amazon Affiliate Disclosure</h2>
          <p>PawCritic is a participant in the Amazon Services LLC Associates Program, an affiliate advertising
            program designed to provide a means for sites to earn advertising fees by advertising and linking to
            Amazon.com. As an Amazon Associate, we earn from qualifying purchases.</p>
        </section>

        <section className="static-section">
          <h2>8. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an
            updated revision date. We encourage you to review this policy periodically.</p>
        </section>

        <section className="static-section">
          <h2>9. Contact</h2>
          <p>If you have questions about this Privacy Policy, please <Link href="/contact">contact us</Link>.</p>
        </section>
      </div>
    </div>
  )
}
