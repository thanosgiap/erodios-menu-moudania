'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { Language } from '../lib/translations'

export default function LanguageSwitcher({ current }: { current: Language }) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const langs: { code: Language; label: string }[] = [
    { code: 'el', label: 'Ελληνικά' },
    { code: 'en', label: 'English' },
    { code: 'ru', label: 'Русский' },
  ]

  function switchLang(lang: Language) {
    const params = new URLSearchParams(window.location.search)
    params.set('lang', lang)
    router.push(`${pathname}?${params.toString()}`)
    setOpen(false)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>

      {/* Globe icon button */}
      <button
        onClick={() => setOpen(!open)}
        title="Change language"
        style={{
          background: 'transparent',
          border: '0.5px solid rgba(122,106,85,0.3)',
          borderRadius: '2px',
          padding: '6px 8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6B5F52',
          lineHeight: 1,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          background: '#F7F3EE',
          border: '0.5px solid rgba(122,106,85,0.3)',
          borderRadius: '2px',
          overflow: 'hidden',
          zIndex: 100,
          minWidth: '120px',
          boxShadow: '0 4px 12px rgba(44,40,32,0.08)',
        }}>
          {langs.map(l => (
            <button
              key={l.code}
              onClick={() => switchLang(l.code)}
              style={{
                display: 'block',
                width: '100%',
                background: current === l.code ? 'rgba(122,106,85,0.15)' : 'transparent',
                border: 'none',
                borderBottom: '0.5px solid rgba(122,106,85,0.15)',
                padding: '10px 14px',
                fontSize: '13px',
                letterSpacing: '0.08em',
                color: current === l.code ? '#2C2820' : '#4A3F35',
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
                fontWeight: current === l.code ? 400 : 300,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(122,106,85,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = current === l.code ? 'rgba(122,106,85,0.15)' : 'transparent')}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}