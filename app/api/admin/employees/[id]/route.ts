import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiOk, apiError } from '@/lib/utils'
import { z } from 'zod'

const patchSchema = z.object({
  isActive: z.boolean().optional(),
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  role: z.enum(['SUPPORT', 'PAYMENTS']).optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return apiError('Forbidden', 403)

  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing || !['SUPPORT', 'PAYMENTS'].includes(existing.role)) return apiError('Employee not found.', 404)

  const employee = await prisma.user.update({ where: { id }, data: parsed.data })

  return apiOk({ employee: { id: employee.id, name: employee.name, email: employee.email, role: employee.role, isActive: employee.isActive } })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return apiError('Forbidden', 403)

  const { id } = await params
  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing || !['SUPPORT', 'PAYMENTS'].includes(existing.role)) return apiError('Employee not found.', 404)

  // Deactivate rather than hard-delete so historical ticket/invoice records keep a valid owner.
  await prisma.user.update({ where: { id }, data: { isActive: false } })

  return apiOk({ success: true })
}
