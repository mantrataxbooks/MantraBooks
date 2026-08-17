import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiOk, apiError } from '@/lib/utils'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(2).max(50),
  permissions: z.array(z.string()).default([]),
})

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return apiError('Forbidden', 403)

  const roles = await (prisma as any).customRole.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return apiOk({ roles })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return apiError('Forbidden', 403)

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  const { name, permissions } = parsed.data

  const existing = await (prisma as any).customRole.findUnique({ where: { name } })
  if (existing) return apiError('Role name already exists.')

  const role = await (prisma as any).customRole.create({
    data: { name, permissions: JSON.stringify(permissions) },
  })

  return apiOk({ role }, 201)
}
