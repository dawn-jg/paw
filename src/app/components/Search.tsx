'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Fuse from 'fuse.js'
import allPosts from '@/data/posts.json'

interface Post {
  title: string
  slug: string
  category: string
  description: string
}

const fuse = new Fuse<Post>(allPosts as Post[], {
  keys: ['title', 'description', 'category'],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 2,
})

export default function Search() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Post[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    const r = fuse.search(query).slice(0, 6).map(r => r.item)
    setResults(r)
  }, [query])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const categoryColor: Record<string, string> = {
    Dogs: '#5B8C5A', Cats: '#E8A838', Birds: '#6B8E9B',
    Fish: '#4A90B8', Reptiles: '#8B6E5A', 'Small Pets': '#8B7E74',
  }

  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <button
        className="search-toggle"
        onClick={() => { setOpen(!open); setQuery('') }}
        aria-label="Search reviews"
        title="Search"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>

      {open && (
        <div className="search-popup">
          <div className="search-input-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0, opacity:0.4}}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              className="search-input"
              placeholder="Search pet product reviews..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && results.length > 0) {
                  setOpen(false);
                  setQuery('');
                  router.push('/' + results[0].slug);
                }
              }}
              autoComplete="off"
            />
            {query && (
              <button className="search-clear" onClick={() => setQuery('')} aria-label="Clear">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {results.length > 0 && (
            <ul className="search-results">
              {results.map(r => (
                <li key={r.slug}>
                  <Link
                    href={`/${r.slug}`}
                    className="search-result-item"
                    onClick={() => { setOpen(false); setQuery('') }}
                  >
                    <div className="search-result-body">
                      <span className="search-result-title">{r.title}</span>
                      <span
                        className="search-result-cat"
                        style={{ color: categoryColor[r.category] || '#5B8C5A' }}
                      >
                        {r.category}
                      </span>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0, opacity:0.3}}>
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {query.length >= 2 && results.length === 0 && (
            <div className="search-empty">No reviews found for &ldquo;{query}&rdquo;</div>
          )}

          {query.length < 2 && (
            <div className="search-hint">Type at least 2 characters to search</div>
          )}
        </div>
      )}
    </div>
  )
}
