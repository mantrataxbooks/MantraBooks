import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateToken, apiOk, apiError } from '@/lib/utils'
import { sendDelegateInviteEmail } from '@/lib/email'
import { z } from 'zod'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'CLIENT') return apiError('Forbidden', 403)

  const ownerId = session.user.delegateFor || session.user.id

  const delegations = await prisma.delegation.findMany({
    where: { ownerId },
    include: { delegate: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return apiOk({ delegations })
}

const inviteSchema = z.object({ email: z.string().email() })

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'CLIENT') return apiError('Forbidden', 403)

  const ownerId = session.user.delegateFor || session.user.id

  const body = await req.json()
  const parsed = inviteSchema.safeParse(body)
  if (!parsed.success) return apiError('Valid email required.')

  const { email } = parsed.data

  if (email.toLowerCase() === session.user.email.toLowerCase()) {
    return apiError('Cannot invite yourself.')
  }

  // Check duplicate active delegation
  const existing = await prisma.delegation.findFirst({
    where: { ownerId, email: email.toLowerCase(), status: { not: 'REVOKED' } },
  })
  if (existing) return apiError('This email already has a pending or active delegation.')

  const owner = await prisma.user.findUnique({ where: { id: ownerId }, select: { name: true } })
  const token = generateToken(32)

  const delegation = await prisma.delegation.create({
    data: {
      ownerId,
      email: email.toLowerCase(),
      token,
      status: 'PENDING',
    },
  })

  try {
    await sendDelegateInviteEmail(email, owner?.name || 'Your CA', token, session.user.name)
  } catch (err) {
    console.error('Delegate invite email failed:', err)
  }

  return apiOk({ delegation }, 201)
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'CLIENT') return apiError('Forbidden', 403)

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return apiError('Delegation ID required.')

  const ownerId = session.user.delegateFor || session.user.id

  const delegation = await prisma.delegation.findFirst({ where: { id, ownerId } })
  if (!delegation) return apiError('Delegation not found.', 404)

  await prisma.delegation.update({ where: { id }, data: { status: 'REVOKED' } })

  return apiOk({ message: 'Delegation revoked.' })
}
