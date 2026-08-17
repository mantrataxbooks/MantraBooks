/**
 * Simple in-process IP-based rate limiter.
 *
 * Uses a sliding window counter stored in a Map.
 * Works in Next.js Route Handlers (Node.js runtime).
 * For production with multiple instances, replace the Map with Redis.
 */

interface WindowEntry {
  count: number
  resetAt: number
}

const store = new Map<string, WindowEntry>()

/**
 * Check whether a given key (typically an IP) has exceeded the allowed
 * number of requests within the window.
 *
 * @param key        Identifier for the caller (e.g. IP address)
 * @param limit      Max requests allowed per window
 * @param windowMs   Window duration in milliseconds
 * @returns          `{ allowed: boolean, remaining: number, resetAt: number }`
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count += 1
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}

/** Extract caller IP from a Next.js Route Handler Request object. */
export function getIp(req: Request): string {
  // Vercel / standard proxy headers
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

/** Build a rate-limit-exceeded Response. */
export function rateLimitResponse(resetAt: number): Response {
  const retryAfterSec = Math.ceil((resetAt - Date.now()) / 1000)
  return Response.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSec),
        'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
      },
    }
  )
}
