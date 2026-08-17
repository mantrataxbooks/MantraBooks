import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiOk, apiError } from '@/lib/utils'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return apiError('Unauthorized', 401)

  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all') === 'true'
  const status = searchParams.get('status') || ''

  const isAdmin = session.user.role === 'ADMIN'
  const isEmployee = ['SUPPORT', 'PAYMENTS'].includes(session.user.role)

  if (all && !isAdmin && !isEmployee) return apiError('Forbidden', 403)

  const effectiveClientId = session.user.delegateFor || session.user.id
  const where: any = {}
  if (!all || session.user.role === 'CLIENT') where.clientId = effectiveClientId
  if (status) where.status = status

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      include: { client: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.document.count({ where }),
  ])

  return apiOk({ documents, total })
}
