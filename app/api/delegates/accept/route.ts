import { prisma } from '@/lib/prisma'
import { apiOk, apiError } from '@/lib/utils'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  token: z.string().min(1),
  name: z.string().min(2).optional(),
  password: z.string().min(8).optional(),
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  if (!token) return apiError('Token required.')

  const delegation = await prisma.delegation.findUnique({
    where: { token },
    include: { owner: { select: { name: true, company: true } } },
  })

  if (!delegation) return apiError('Invalid invite link.', 404)
  if (delegation.status !== 'PENDING') return apiError('This invite has already been used or revoked.', 410)

  const existingUser = await prisma.user.findUnique({ where: { email: delegation.email } })

  return apiOk({
    ownerName: delegation.owner.name,
    ownerCompany: delegation.owner.company,
    email: delegation.email,
    hasAccount: !!existingUser,
  })
}

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  const { token, name, password } = parsed.data

  const delegation = await prisma.delegation.findUnique({
    where: { token },
    include: { owner: { select: { name: true } } },
  })

  if (!delegation || delegation.status !== 'PENDING') {
    return apiError('Invalid or expired invite link.', 410)
  }

  let delegateId: string

  const existingUser = await prisma.user.findUnique({ where: { email: delegation.email } })

  if (existingUser) {
    delegateId = existingUser.id
  } else {
    if (!name || !password) return apiError('Name and password required for new accounts.')
    const passwordHash = await bcrypt.hash(password, 12)
    const newUser = await prisma.user.create({
      data: {
        name,
        email: delegation.email,
        passwordHash,
        role: 'CLIENT',
        isActive: true,
      },
    })
    delegateId = newUser.id
  }

  await prisma.delegation.update({
    where: { id: delegation.id },
    data: { delegateId, status: 'ACTIVE', token: null },
  })

  return apiOk({ message: 'Access granted. You can now log in.' })
}
