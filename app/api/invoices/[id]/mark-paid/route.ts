import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendInvoiceEmail } from '@/lib/email'
import { generateInvoiceNo, apiOk, apiError } from '@/lib/utils'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return apiError('Forbidden', 403)

  const { id } = await params
  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { client: true } })
  if (!invoice) return apiError('Invoice not found.', 404)
  if (invoice.status === 'PAID') return apiError('Invoice is already paid.')
  if (invoice.type !== 'PROFORMA') return apiError('Only proforma invoices can be marked paid.')

  const paidAt = new Date()
  const taxCount = await prisma.invoice.count({ where: { type: 'TAX' } })
  const taxInvoiceNo = generateInvoiceNo('MTB-TAX', taxCount)

  const [taxInvoice] = await prisma.$transaction([
    prisma.invoice.create({
      data: {
        invoiceNo: taxInvoiceNo,
        clientId: invoice.clientId,
        type: 'TAX',
        status: 'PAID',
        items: invoice.items as any,
        subtotal: invoice.subtotal,
        gstRate: invoice.gstRate,
        gstAmount: invoice.gstAmount,
        total: invoice.total,
        notes: invoice.notes,
        dueDate: invoice.dueDate,
        paidAt,
      },
    }),
    prisma.invoice.update({
      where: { id },
      data: { status: 'PAID', paidAt },
    }),
  ])

  await prisma.invoice.update({
    where: { id },
    data: { taxInvoiceId: taxInvoice.id },
  })

  try {
    await sendInvoiceEmail(invoice.client.email, invoice.client.name, taxInvoiceNo, 'TAX', Number(invoice.total))
  } catch (err) {
    console.error('Tax invoice email failed:', err)
  }

  return apiOk({ success: true, taxInvoiceId: taxInvoice.id })
}
