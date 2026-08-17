import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function applyCdnHeaders(res: NextResponse, pathname: string): NextResponse {
  const isPrivatePath =
    pathname.startsWith('/api/') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/file-itr') ||
    pathname.startsWith('/company-registration') ||
    pathname.startsWith('/invoices') ||
    pathname.startsWith('/documents') ||
    pathname.startsWith('/tickets') ||
    pathname.startsWith('/change-password') ||
    pathname.startsWith('/summary') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/employee') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/delegates')

  if (isPrivatePath) {
    // Vercel Edge CDN Bypass: Ensure sensitive user data is NEVER cached globally
    res.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate')
    res.headers.set('Pragma', 'no-cache')
    res.headers.set('Expires', '0')
  } else if (pathname === '/' || pathname.startsWith('/services')) {
    // Public Marketing Pages: Vercel Edge Cache + Stale-While-Revalidate
    res.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
  }

  return res
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Publicly accessible pages & assets - NEVER redirect to login
  const isPublic =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/impersonate' ||
    pathname.startsWith('/services') ||
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/delegates/accept') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/hero-bg') ||
    pathname === '/favicon.ico'

  if (isPublic) {
    return applyCdnHeaders(NextResponse.next(), pathname)
  }

  // NEXTAUTH_SECRET must be set in environment — no fallback
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const token = await getToken({ req, secret })
  const role = token?.role as string | undefined

  // Admin routes: require ADMIN role
  if (pathname.startsWith('/admin')) {
    if (!token || role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    return applyCdnHeaders(NextResponse.next(), pathname)
  }

  // Employee routes
  if (pathname.startsWith('/employee')) {
    if (!token) return NextResponse.redirect(new URL('/login', req.url))
    const allowed = ['ADMIN', 'SUPPORT', 'PAYMENTS']
    if (!allowed.includes(role!)) return NextResponse.redirect(new URL('/login', req.url))
    if (pathname.startsWith('/employee/tickets') && !['ADMIN', 'SUPPORT'].includes(role!)) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (pathname.startsWith('/employee/payments') && !['ADMIN', 'PAYMENTS'].includes(role!)) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return applyCdnHeaders(NextResponse.next(), pathname)
  }

  // Client routes: require login (token) and valid role
  const clientPaths = ['/dashboard', '/invoices', '/documents', '/tickets', '/change-password', '/summary', '/file-itr', '/company-registration', '/profile', '/delegates']
  if (clientPaths.some((p) => pathname.startsWith(p))) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (role !== 'CLIENT' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return applyCdnHeaders(NextResponse.next(), pathname)
  }

  return applyCdnHeaders(NextResponse.next(), pathname)
}

export const config = {
  matcher: [
    '/',
    '/services/:path*',
    '/admin/:path*',
    '/employee/:path*',
    '/dashboard/:path*',
    '/invoices/:path*',
    '/documents/:path*',
    '/tickets/:path*',
    '/change-password',
    '/profile',
    '/delegates',
    '/summary',
    '/file-itr',
    '/company-registration',
    '/api/:path*',
  ],
}
