'use client'

import Link from 'next/link'

const cols: Record<string, { href: string; label: string }[]> = {
  Reviews: [
    { href: '/dogs', label: 'Dogs' },
    { href: '/cats', label: 'Cats' },
    { href: '/small-pets', label: 'Small Pets' },
    { href: '/birds', label: 'Birds' },
    { href: '/fish', label: 'Fish' },
    { href: '/reptiles', label: 'Reptiles' },
  ],
  About: [
    { href: '/about', label: 'About' },
    { href: '/how-we-test', label: 'How We Test' },
    { href: '/contact', label: 'Contact' },
    { href: '/editorial-policy', label: 'Editorial Policy' },
  ],
  Resources: [
    { href: '/blog', label: 'Blog' },
    { href: '/buying-guides', label: 'Buying Guides' },
    { href: '/comparisons', label: 'Comparisons' },
    { href: '/newsletter', label: 'Newsletter' },
  ],
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container-wide">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">{"\u{1F43E}"} PawCritic</Link>
            <p className="footer-tagline">
              Honest pet product reviews backed by research, testing, and genuine love for animals.
            </p>
            <p className="footer-disc">
              As an Amazon Associate, we earn from qualifying purchases. This does not affect our reviews.
            </p>
          </div>

          {Object.entries(cols).map(([heading, links]) => (
            <div key={heading} className="footer-col">
              <h4>{heading}</h4>
              <ul>
                {links.map((l) => (
                  <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} PawCritic. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
