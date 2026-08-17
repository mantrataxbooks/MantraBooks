import { prisma } from '@/lib/prisma'
import { apiOk, apiError } from '@/lib/utils'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) return apiError('Verification token is required.')

  const user = await prisma.user.findUnique({ where: { emailVerifyToken: token } })

  if (!user) return apiError('Invalid or expired verification link.', 400)

  if (user.emailVerified) return apiOk({ message: 'Email already verified.' })

  if (user.emailVerifyExpires && user.emailVerifyExpires < new Date()) {
    return apiError('Verification link has expired. Please request a new one.', 400)
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerifyToken: null, emailVerifyExpires: null },
  })

  return apiOk({ message: 'Email verified successfully.' })
}
