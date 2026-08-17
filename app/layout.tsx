import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { FontAwesomeLoader } from './FontAwesomeLoader'

// ── Font Optimization ─────────────────────────────────────────────────────────
// Using next/font eliminates the render-blocking Google Fonts @import in CSS.
// The font is preloaded and self-hosted by Next.js at build time.
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-plus-jakarta',
})

export const metadata: Metadata = {
  title: 'Mantra Taxbooks — Expert CA Services',
  description: 'Professional CA services — tax filing, GST, compliance, accounting, and more.',
}

// ── Viewport ──────────────────────────────────────────────────────────────────
// Exported separately as required by Next.js App Router (not in metadata).
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <head>
        {/* Font Awesome — loaded non-blocking via a client component
            (event handlers cannot be used in Server Components). */}
        <FontAwesomeLoader />
        <noscript>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
        </noscript>
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
