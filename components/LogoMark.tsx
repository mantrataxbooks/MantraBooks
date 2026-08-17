import React from 'react'
import Link from 'next/link'

interface LogoProps {
  /** href for the logo link. Defaults to "/" */
  href?: string
  /** Force a dark or light variant. "dark" = white text for dark navbars, "light" = dark text (default) */
  variant?: 'light' | 'dark'
  /** Custom height of the icon box. Default 38 */
  size?: 'sm' | 'md' | 'lg'
  /** Extra className on the wrapper */
  className?: string
  style?: React.CSSProperties
}

const sizes = {
  sm: { box: 34, fontSize: '0.7rem',  iconFont: '1rem',   wordM: '0.95rem', wordT: '0.58rem', gap: 8 },
  md: { box: 40, fontSize: '0.82rem', iconFont: '1.15rem', wordM: '1.05rem', wordT: '0.68rem', gap: 10 },
  lg: { box: 48, fontSize: '0.95rem', iconFont: '1.3rem',  wordM: '1.2rem',  wordT: '0.78rem', gap: 12 },
}

export function LogoMark({ href = '/', variant = 'light', size = 'md', style, className }: LogoProps) {
  const s = sizes[size]
  const textColor = variant === 'dark' ? '#FFFFFF' : '#0F172A'

  return (
    <Link
      href={href}
      aria-label="Mantra Taxbooks — Home"
      className={className}
      style={{
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        flexShrink: 0,
        ...style,
      }}
    >
      {/* Blue rounded square icon */}
      <div
        style={{
          width: s.box,
          height: s.box,
          borderRadius: Math.round(s.box * 0.24),
          background: 'linear-gradient(135deg, #2563EB 0%, #1A56DB 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(26,86,219,0.30)',
        }}
      >
        <span
          style={{
            color: '#FFFFFF',
            fontWeight: 900,
            fontSize: s.iconFont,
            lineHeight: 1,
            fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
            letterSpacing: '-0.04em',
          }}
        >
          M
        </span>
      </div>

      {/* Word-mark */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span
          style={{
            color: textColor,
            fontWeight: 800,
            fontSize: s.wordM,
            letterSpacing: '0.08em',
            fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
            lineHeight: 1.1,
          }}
        >
          MANTRA
        </span>
        <span
          style={{
            color: '#1A56DB',
            fontWeight: 700,
            fontSize: s.wordT,
            letterSpacing: '0.18em',
            fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
            lineHeight: 1.3,
            marginTop: 1,
          }}
        >
          TAXBOOKS
        </span>
      </div>
    </Link>
  )
}

export default LogoMark
