import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Affiliate Disclosure',
  description:
    'How PawCritic earns money: our participation in the Amazon Associates Program and other affiliate programs, how outbound links are marked, and why commissions never influence our recommendations.',
  alternates: { canonical: 'https://pawcritic.com/affiliate-disclosure' },
  robots: { index: true, follow: true },
};

const SECTIONS: Array<{ title: string; body: string[] }> = [
  {
    title: 'The Short Version',
    body: [
      'PawCritic is reader-supported. Some links on this site are affiliate links, which means we may earn a commission if you buy through them — at no additional cost to you.',
      'Commissions never influence which products we cover, how we rank them, or what we say about them. Brands cannot pay for a better placement, a higher score, or a positive verdict.',
    ],
  },
  {
    title: 'Amazon Associates Program',
    body: [
      'PawCritic is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.',
      'As an Amazon Associate, we earn from qualifying purchases.',
    ],
  },
  {
    title: 'How Affiliate Links Are Marked',
    body: [
      'Every outbound link on PawCritic that earns us a commission is marked in the page markup with rel="sponsored nofollow" and opens in a new tab. You can confirm this by inspecting any product link on the site.',
      'Links that do not earn us a commission — internal guides, sources, veterinary and regulatory references — are never marked as sponsored.',
    ],
  },
  {
    title: 'What We Do With the Money',
    body: [
      'Affiliate revenue covers the cost of running PawCritic: hosting, research access to specifications and safety documentation, and the time our editorial team spends analyzing verified owner feedback and published veterinary guidance.',
      'It is the only reason this site can stay free to read and free of paywalls.',
    ],
  },
  {
    title: 'Editorial Independence',
    body: [
      'Our reviews are written before any commission is known, and a product that does not perform well is not recommended simply because it sells. Where a product has not been examined firsthand, we say so.',
      'You can read the full methodology on our How We Research page and our editorial standards on the Editorial Policy page.',
    ],
  },
  {
    title: 'Other Affiliate Programs',
    body: [
      'In addition to Amazon Associates, PawCritic may participate in other affiliate programs from time to time. The same standards apply: any such link is marked rel="sponsored nofollow", and participation never buys editorial treatment.',
    ],
  },
  {
    title: 'Questions',
    body: [
      'If anything about our affiliate relationships is unclear, or you want to know whether a specific link is monetized, email us at hello@pawcritic.com and we will tell you.',
    ],
  },
];

export default function AffiliateDisclosurePage() {
  return (
    <main className="static-page">
      <section className="category-hero">
        <div className="container">
          <span className="cat-emoji">{'\u{1F4B0}'}</span>
          <h1>Affiliate Disclosure</h1>
          <p>How we earn money, and why it does not change what we recommend.</p>
        </div>
      </section>

      <section className="static-content container">
        {SECTIONS.map((sec) => (
          <div key={sec.title} className="static-section">
            <h2>{sec.title}</h2>
            {sec.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ))}

        <div className="static-section">
          <p>
            See also: <Link href="/editorial-policy">Editorial Policy</Link>,{' '}
            <Link href="/how-we-test">How We Research Pet Products</Link>, and{' '}
            <Link href="/privacy-policy">Privacy Policy</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}
