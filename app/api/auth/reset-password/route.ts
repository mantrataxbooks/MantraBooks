import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { apiOk, apiError } from '@/lib/utils'
import { rateLimit, getIp, rateLimitResponse } from '@/lib/rate-limit'
import { z } from 'zod'

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
})

export async function POST(req: Request) {
  // Rate limit: max 10 attempts per IP per 15 minutes
  const ip = getIp(req)
  const rl = rateLimit(`reset-password:${ip}`, 10, 15 * 60 * 1000)
  if (!rl.allowed) return rateLimitResponse(rl.resetAt)

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return apiError('Invalid request.')

  const { token, password } = parsed.data

  const reset = await prisma.passwordReset.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!reset || reset.used || reset.expiresAt < new Date()) {
    return apiError('Invalid or expired reset link.', 400)
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.$transaction([
    prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
    prisma.passwordReset.update({ where: { id: reset.id }, data: { used: true } }),
  ])

  return apiOk({ message: 'Password reset successfully.' })
}
