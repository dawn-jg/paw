import type { Metadata } from 'next'
import './globals.css'
import Header from './components/Header'
import Footer from './components/Footer'

export const metadata: Metadata = {
  title: { default: 'PawCritic - Honest Reviews for Happy Pets', template: '%s | PawCritic' },
  description: 'Honest, research-backed pet product reviews to help you choose the best for your furry, feathered, and scaly friends.',
  keywords: ['pet product reviews', 'dog food', 'cat toys', 'honest pet reviews', 'pet supplies', 'PawCritic'],
  openGraph: {
    title: 'PawCritic - Honest Reviews for Happy Pets',
    description: 'Honest, research-backed pet product reviews for dogs, cats, small pets, birds, fish, and reptiles.',
    url: 'https://pawcritic.com',
    siteName: 'PawCritic',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'PawCritic - Honest Reviews for Happy Pets' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PawCritic - Honest Reviews for Happy Pets',
    description: 'Honest, research-backed pet product reviews for dogs, cats, small pets, birds, fish, and reptiles.',
    images: ['/og-image.svg'],
  },
  robots: { index: true, follow: true },
  metadataBase: new URL('https://pawcritic.com'),
  other: {
    'google-site-verification': 'google3f9140e7a22ef70d',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Dark mode theme script - prevents flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark')}catch(e){}})()` }} />
        {/* Google Fonts */}
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&display=swap" as="style" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"WebSite","name":"PawCritic","url":"https://pawcritic.com","description":"Honest pet product reviews backed by research, testing, and a genuine love for animals.","potentialAction":{"@type":"SearchAction","target":"https://pawcritic.com/search?q={search_term_string}","query-input":"required name=search_term_string"}}) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"Organization","name":"PawCritic","url":"https://pawcritic.com","logo":"https://pawcritic.com/favicon.ico","description":"Honest, research-backed pet product reviews.","sameAs":[]}) }} />
        {/* 51.la Analytics (deferred) */}
        <script charSet="UTF-8" id="LA_COLLECT" src="//sdk.51.la/js-sdk-pro.min.js" async />
        <script dangerouslySetInnerHTML={{ __html: 'LA.init({id:"LAZyhn2IA29Aj114",ck:"LAZyhn2IA29Aj114"})' }} async />
        {/* Google AdSense (deferred) */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7487473818971469" crossOrigin="anonymous"></script>
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
