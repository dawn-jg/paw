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
  },
  robots: { index: true, follow: true },
  metadataBase: new URL('https://pawcritic.com'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* 51.la Analytics */}
        <script charSet="UTF-8" id="LA_COLLECT" src="//sdk.51.la/js-sdk-pro.min.js"></script>
        <script dangerouslySetInnerHTML={{ __html: 'LA.init({id:"LAZyhn2IA29Aj114",ck:"LAZyhn2IA29Aj114"})' }} />
        {/* Google AdSense */}
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
