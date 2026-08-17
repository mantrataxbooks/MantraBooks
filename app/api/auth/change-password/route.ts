import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { apiOk, apiError } from '@/lib/utils'
import { rateLimit, getIp, rateLimitResponse } from '@/lib/rate-limit'
import { z } from 'zod'

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return apiError('Unauthorized', 401)

  // Rate limit: max 5 password changes per user/IP per 15 minutes
  const ip = getIp(req)
  const rl = rateLimit(`change-pw:${session.user.id}:${ip}`, 5, 15 * 60 * 1000)
  if (!rl.allowed) return rateLimitResponse(rl.resetAt)

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return apiError('Invalid request.')

  const { currentPassword, newPassword } = parsed.data

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return apiError('User not found.', 404)
  if (!user.passwordHash) return apiError('This account uses Google sign-in. Password change is not available.')

  const valid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!valid) return apiError('Current password is incorrect.')

  const passwordHash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } })

  return apiOk({ message: 'Password changed successfully.' })
}
