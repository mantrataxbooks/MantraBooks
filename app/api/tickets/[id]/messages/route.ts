import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiOk, apiError } from '@/lib/utils'
import { z } from 'zod'

const schema = z.object({
  message: z.string().min(1).max(4000),
})

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return apiError('Unauthorized', 401)

  const { id } = await params
  const ticket = await prisma.ticket.findUnique({ where: { id } })
  if (!ticket) return apiError('Ticket not found.', 404)

  const effectiveClientId = session.user.delegateFor || session.user.id
  const isOwner = ticket.clientId === effectiveClientId
  const isStaff = ['ADMIN', 'SUPPORT'].includes(session.user.role)
  if (!isOwner && !isStaff) return apiError('Forbidden', 403)

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  const message = await prisma.ticketMessage.create({
    data: {
      ticketId: id,
      senderId: session.user.id,
      message: parsed.data.message,
    },
    include: { sender: { select: { id: true, name: true, role: true } } },
  })

  // Reopen a resolved/closed ticket when the client replies again.
  if (isOwner && !isStaff && ['RESOLVED', 'CLOSED'].includes(ticket.status)) {
    await prisma.ticket.update({ where: { id }, data: { status: 'OPEN' } })
  } else {
    await prisma.ticket.update({ where: { id }, data: { updatedAt: new Date() } })
  }

  return apiOk({ message }, 201)
}
