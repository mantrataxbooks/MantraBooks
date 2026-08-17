import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateTicketNo, apiOk, apiError } from '@/lib/utils'
import { z } from 'zod'

const createSchema = z.object({
  title: z.string().min(3).max(200),
  message: z.string().min(10),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
})

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

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.ticket.count({ where }),
  ])

  return apiOk({ tickets, total })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'CLIENT') return apiError('Only clients can raise tickets.', 403)

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  const { title, message, priority } = parsed.data
  const count = await prisma.ticket.count()
  const ticketNo = generateTicketNo(count)
  const effectiveClientId = session.user.delegateFor || session.user.id

  const ticket = await prisma.ticket.create({
    data: {
      ticketNo,
      clientId: effectiveClientId,
      title,
      priority,
      status: 'OPEN',
      messages: {
        create: {
          senderId: session.user.id,  // actual sender (delegate's own id)
          message,
        },
      },
    },
  })

  return apiOk({ ticket }, 201)
}
