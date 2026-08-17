import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiOk, apiError } from '@/lib/utils'
import { getPresignedViewUrl } from '@/lib/s3'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().max(20).optional().nullable(),
  company: z.string().max(100).optional().nullable(),
  gstNumber: z.string().max(15).optional().nullable(),
  cinNumber: z.string().max(21).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(50).optional().nullable(),
  state: z.string().max(50).optional().nullable(),
  pincode: z.string().max(10).optional().nullable(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return apiError('Unauthorized', 401)

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, company: true, gstNumber: true, cinNumber: true, address: true, city: true, state: true, pincode: true, avatarUrl: true, emailVerified: true },
  })

  let avatarSignedUrl: string | null = null
  if (user?.avatarUrl) {
    try { avatarSignedUrl = await getPresignedViewUrl(user.avatarUrl) } catch {}
  }

  return apiOk({ user: { ...user, avatarSignedUrl } })
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return apiError('Unauthorized', 401)

  // Delegates cannot change owner profile
  if (session.user.delegateFor) return apiError('Delegates cannot edit the account profile.', 403)

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: { id: true, name: true, email: true, phone: true, company: true, gstNumber: true, cinNumber: true, address: true, city: true, state: true, pincode: true },
  })

  return apiOk({ user })
}
