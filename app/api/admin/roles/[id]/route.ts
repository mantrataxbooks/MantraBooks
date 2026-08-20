import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiOk, apiError } from '@/lib/utils'
import { z } from 'zod'

const patchSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  permissions: z.array(z.string()).optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return apiError('Forbidden', 403)

  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  const existing = await (prisma as any).customRole.findUnique({ where: { id } })
  if (!existing) return apiError('Role not found.', 404)

  const role = await (prisma as any).customRole.update({
    where: { id },
    data: {
      ...(parsed.data.name ? { name: parsed.data.name } : {}),
      ...(parsed.data.permissions ? { permissions: JSON.stringify(parsed.data.permissions) } : {}),
    },
  })

  return apiOk({ role })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return apiError('Forbidden', 403)

  const { id } = await params
  const existing = await (prisma as any).customRole.findUnique({ where: { id } })
  if (!existing) return apiError('Role not found.', 404)

  await (prisma as any).customRole.delete({ where: { id } })

  return apiOk({ success: true })
}
