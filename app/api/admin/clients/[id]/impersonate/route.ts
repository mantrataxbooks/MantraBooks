import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateToken, apiOk, apiError } from '@/lib/utils'

const IMPERSONATION_EXPIRES_MS = 5 * 60 * 1000 // 5 minutes — single use, short lived

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return apiError('Forbidden', 403)

  const { id } = await params
  const client = await prisma.user.findUnique({ where: { id } })
  if (!client || client.role !== 'CLIENT') return apiError('Client not found.', 404)
  if (!client.isActive) return apiError('Cannot impersonate an inactive client.')

  const token = generateToken()
  await prisma.impersonationToken.create({
    data: {
      adminId: session.user.id,
      clientId: client.id,
      token,
      expiresAt: new Date(Date.now() + IMPERSONATION_EXPIRES_MS),
    },
  })

  return apiOk({ token })
}
