import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiOk, apiError } from '@/lib/utils'
import { z } from 'zod'

const patchSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  assignedTo: z.string().optional(),
})

async function canAccess(session: any, ticket: { clientId: string; assignedTo: string | null }) {
  const effectiveClientId = session.user.delegateFor || session.user.id
  const isOwner = ticket.clientId === effectiveClientId
  const isStaff = ['ADMIN', 'SUPPORT'].includes(session.user.role)
  return isOwner || isStaff
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return apiError('Unauthorized', 401)

  const { id } = await params
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true } },
      messages: {
        include: { sender: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!ticket) return apiError('Ticket not found.', 404)
  if (!(await canAccess(session, ticket))) return apiError('Forbidden', 403)

  return apiOk({ ticket, messages: ticket.messages })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || !['ADMIN', 'SUPPORT'].includes(session.user.role)) return apiError('Forbidden', 403)

  const { id } = await params
  const ticket = await prisma.ticket.findUnique({ where: { id } })
  if (!ticket) return apiError('Ticket not found.', 404)

  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      ...(parsed.data.assignedTo !== undefined ? { assignedTo: parsed.data.assignedTo || null } : {}),
    },
  })

  return apiOk({ ticket: updated })
}
