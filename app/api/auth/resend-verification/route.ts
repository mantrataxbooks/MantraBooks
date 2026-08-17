import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiOk, apiError } from '@/lib/utils'
import { sendVerificationEmail } from '@/lib/email'
import { rateLimit, getIp, rateLimitResponse } from '@/lib/rate-limit'
import { randomBytes } from 'crypto'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return apiError('Unauthorized', 401)

  // Rate limit: max 3 resend attempts per user/IP per 15 minutes
  const ip = getIp(req)
  const rl = rateLimit(`resend-verify:${session.user.id}:${ip}`, 3, 15 * 60 * 1000)
  if (!rl.allowed) return rateLimitResponse(rl.resetAt)

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return apiError('User not found', 404)

  if (user.emailVerified) return apiError('Email is already verified.')

  const emailVerifyToken = randomBytes(32).toString('hex')
  const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerifyToken, emailVerifyExpires },
  })

  try {
    await sendVerificationEmail(user.email, user.name, emailVerifyToken)
  } catch {
    return apiError('Failed to send email. Please try again later.', 503)
  }

  return apiOk({ message: 'Verification email sent.' })
}
