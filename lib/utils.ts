import { randomBytes } from 'crypto'

export function generateToken(length = 32): string {
  return randomBytes(length).toString('hex')
}

export function generateInvoiceNo(prefix: string, count: number): string {
  const year = new Date().getFullYear()
  const num = String(count + 1).padStart(4, '0')
  return `${prefix}-${year}-${num}`
}

export function generateTicketNo(count: number): string {
  const year = new Date().getFullYear()
  const num = String(count + 1).padStart(5, '0')
  return `TKT-${year}-${num}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function apiError(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

export function apiOk(data: unknown, status = 200) {
  return Response.json(data, { status })
}

/**
 * Generates a cryptographically secure temporary password using randomBytes.
 * Replaces the previous Math.random()-based implementation.
 */
export function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!'
  const bytes = randomBytes(10)
  return Array.from(bytes, (b) => chars[b % chars.length]).join('')
}
