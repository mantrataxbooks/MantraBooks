import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateInvoicePDF } from '@/lib/pdf'
import { apiError } from '@/lib/utils'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return apiError('Unauthorized', 401)

  const { id } = await params
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true },
  })
  if (!invoice) return apiError('Invoice not found.', 404)

  const effectiveClientId = session.user.delegateFor || session.user.id
  const isOwner = invoice.clientId === effectiveClientId
  const isStaff = ['ADMIN', 'SUPPORT', 'PAYMENTS'].includes(session.user.role)
  if (!isOwner && !isStaff) return apiError('Forbidden', 403)

  const pdfBuffer = await generateInvoicePDF({
    invoiceNo: invoice.invoiceNo,
    type: invoice.type,
    date: invoice.createdAt,
    dueDate: invoice.dueDate,
    paidAt: invoice.paidAt,
    client: {
      name: invoice.client.name,
      email: invoice.client.email,
      phone: invoice.client.phone,
      company: invoice.client.company,
      gstNumber: invoice.client.gstNumber,
      cinNumber: invoice.client.cinNumber,
      address: invoice.client.address,
      city: invoice.client.city,
      state: invoice.client.state,
      pincode: invoice.client.pincode,
    },
    items: invoice.items as any,
    subtotal: Number(invoice.subtotal),
    gstRate: Number(invoice.gstRate),
    gstAmount: Number(invoice.gstAmount),
    total: Number(invoice.total),
    notes: invoice.notes,
  })

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${invoice.invoiceNo}.pdf"`,
      'Content-Length': String(pdfBuffer.length),
    },
  })
}
