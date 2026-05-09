'use client'

import Link from 'next/link'
import { useState } from 'react'

const navLinks = [
  { href: '/dogs', label: 'Dogs' },
  { href: '/cats', label: 'Cats' },
  { href: '/small-pets', label: 'Small Pets' },
  { href: '/birds', label: 'Birds' },
  { href: '/fish', label: 'Fish' },
  { href: '/reptiles', label: 'Reptiles' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <nav className="nav-bar">
        <Link href="/" className="logo">
          <span className="logo-icon" role="img" aria-label="paw">{"\u{1F43E}"}</span>
          <span className="logo-text">PawCritic</span>
        </Link>

        <div className={`nav-links ${open ? "open" : ""}`}>
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="nav-right">
          <Link href="/reviews" className="btn-primary btn-sm">Latest</Link>
          <button className="burger" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            <span>{open ? "\u2715" : "\u2630"}</span>
          </button>
        </div>
      </nav>
    </header>
  )
}
