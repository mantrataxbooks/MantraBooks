import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiOk, apiError } from '@/lib/utils'
import { z } from 'zod'

const patchSchema = z.object({
  isActive: z.boolean().optional(),
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  gstNumber: z.string().max(15).optional(),
  cinNumber: z.string().max(21).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),
})

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || !['ADMIN', 'SUPPORT', 'PAYMENTS'].includes(session.user.role)) return apiError('Forbidden', 403)

  const { id } = await params
  const client = await prisma.user.findUnique({
    where: { id, role: 'CLIENT' },
    select: {
      id: true, name: true, email: true, phone: true, company: true,
      gstNumber: true, cinNumber: true, address: true, city: true, state: true,
      pincode: true, isActive: true, createdAt: true,
    },
  })
  if (!client) return apiError('Client not found.', 404)

  return apiOk({ client })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return apiError('Forbidden', 403)

  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing || existing.role !== 'CLIENT') return apiError('Client not found.', 404)

  const client = await prisma.user.update({ where: { id }, data: parsed.data })

  return apiOk({ client: { id: client.id, name: client.name, email: client.email, isActive: client.isActive } })
}
