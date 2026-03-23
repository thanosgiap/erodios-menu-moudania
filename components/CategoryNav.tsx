'use client'

import { useState } from 'react'

type Props = {
  categories: string[]
  labels: Record<string, string>
}

export default function CategoryNav({ categories, labels }: Props) {
  const [open, setOpen] = useState(false)

  function scrollTo(cat: string) {
    const el = document.getElementById(cat)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setOpen(false)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>

      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        title="Jump to category"
        style={{
          background:     'transparent',
          border:         '0.5px solid rgba(122,106,85,0.3)',
          borderRadius:   '2px',
          padding:        '6px 8px',
          cursor:         'pointer',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          color:          '#6B5F52',
          gap:            '6px',
          fontFamily:     'inherit',
          fontSize:       '11px',
          letterSpacing:  '0.12em',
        }}
      >
        {/* Menu / list icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <line x1="3" y1="6"  x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position:     'absolute',
          top:          'calc(100% + 4px)',
          right:        0,
          background:   '#F7F3EE',
          border:       '0.5px solid rgba(122,106,85,0.3)',
          borderRadius: '2px',
          overflow:     'hidden',
          zIndex:       100,
          minWidth:     '160px',
          boxShadow:    '0 4px 12px rgba(44,40,32,0.08)',
        }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => scrollTo(cat)}
              style={{
                display:       'block',
                width:         '100%',
                background:    'transparent',
                border:        'none',
                borderBottom:  '0.5px solid rgba(122,106,85,0.15)',
                padding:       '9px 14px',
                fontSize:      '11px',
                letterSpacing: '0.12em',
                color:         '#6B5F52',
                cursor:        'pointer',
                fontFamily:    'inherit',
                textAlign:     'left',
                fontWeight:    300,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(122,106,85,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {labels[cat] ?? cat}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}