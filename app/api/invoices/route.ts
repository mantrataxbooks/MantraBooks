import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendInvoiceEmail } from '@/lib/email'
import { generateInvoiceNo, apiOk, apiError } from '@/lib/utils'
import { z } from 'zod'

const createSchema = z.object({
  clientId: z.string().min(1),
  dueDate: z.string().optional().nullable(),
  notes: z.string().optional(),
  gstRate: z.number().min(0).max(28).default(18),
  items: z.array(z.object({
    description: z.string().min(1),
    qty: z.number().positive(),
    rate: z.number().min(0),
    amount: z.number().min(0),
  })).min(1),
})

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return apiError('Unauthorized', 401)

  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all') === 'true'
  const status = searchParams.get('status') || ''
  const limit = parseInt(searchParams.get('limit') || '100')

  const isAdmin = session.user.role === 'ADMIN'
  const isEmployee = ['SUPPORT', 'PAYMENTS'].includes(session.user.role)

  if (all && !isAdmin && !isEmployee) return apiError('Forbidden', 403)

  const effectiveClientId = session.user.delegateFor || session.user.id
  const where: any = {}
  if (!all || session.user.role === 'CLIENT') where.clientId = effectiveClientId
  if (status) where.status = status

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: { client: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    prisma.invoice.count({ where }),
  ])

  return apiOk({ invoices, total })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return apiError('Forbidden', 403)

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  const { clientId, dueDate, notes, gstRate, items } = parsed.data

  const client = await prisma.user.findUnique({ where: { id: clientId } })
  if (!client || client.role !== 'CLIENT') return apiError('Client not found.')

  const subtotal = items.reduce((s, i) => s + i.amount, 0)
  const gstAmount = Math.round(subtotal * gstRate / 100 * 100) / 100
  const total = subtotal + gstAmount

  const count = await prisma.invoice.count()
  const invoiceNo = generateInvoiceNo('MTB', count)

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNo,
      clientId,
      type: 'PROFORMA',
      status: 'PENDING',
      items,
      subtotal,
      gstRate,
      gstAmount,
      total,
      notes: notes || null,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  })

  try {
    await sendInvoiceEmail(client.email, client.name, invoiceNo, 'PROFORMA', total)
  } catch (err) {
    console.error('Invoice email failed:', err)
  }

  return apiOk({ invoice }, 201)
}
