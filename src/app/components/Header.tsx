'use client'

'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import Search from './Search'

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
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try { localStorage.setItem('theme', next ? 'dark' : 'light') } catch {}
  }

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
          <Search />
          <button onClick={toggleTheme} className="search-toggle" aria-label="Toggle dark mode" title={dark ? 'Light mode' : 'Dark mode'}>
            {dark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
          <Link href="/reviews" className="btn-primary btn-sm">Latest</Link>
          <button className="burger" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            <span>{open ? "\u2715" : "\u2630"}</span>
          </button>
        </div>
      </nav>
    </header>
  )
}
