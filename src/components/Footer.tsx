import Link from "next/link";

const categories = [
  { name: "Dogs", href: "/dogs" },
  { name: "Cats", href: "/cats" },
  { name: "Small Pets", href: "/small-pets" },
  { name: "Birds", href: "/birds" },
  { name: "Fish", href: "/fish" },
  { name: "Reptiles", href: "/reptiles" },
];

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🐾</span>
              <span className="text-xl font-bold">PawCritic</span>
            </div>
            <p className="text-blue-200 text-sm">
              Your trusted guide to pet products. Honest, thorough reviews across all pet types.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Pet Categories</h3>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.name}>
                  <Link href={cat.href} className="text-blue-200 hover:text-white transition-colors text-sm">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/affiliate-disclosure" className="hover:text-white transition-colors">Affiliate Disclosure</Link></li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h3 className="font-semibold mb-4">Affiliate Disclosure</h3>
            <p className="text-blue-200 text-sm">
              PawCritic.com is a participant in the Amazon Services LLC Associates Program and other affiliate programs. We earn commissions from qualifying purchases at no extra cost to you.
            </p>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-8 pt-8 text-center text-blue-300 text-sm">
          © {new Date().getFullYear()} PawCritic. All rights reserved.
        </div>
      </div>
    </footer>
  );
}