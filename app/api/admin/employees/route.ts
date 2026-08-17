import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendWelcomeEmail } from '@/lib/email'
import { generateTempPassword, apiOk, apiError } from '@/lib/utils'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(['SUPPORT', 'PAYMENTS']),
})

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return apiError('Forbidden', 403)

  const employees = await prisma.user.findMany({
    where: { role: { in: ['SUPPORT', 'PAYMENTS'] } },
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  return apiOk({ employees })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return apiError('Forbidden', 403)

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  const { name, email, phone, role } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return apiError('Email already registered.')

  const tempPassword = generateTempPassword()
  const passwordHash = await bcrypt.hash(tempPassword, 12)

  const employee = await prisma.user.create({
    data: { name, email, phone: phone || null, passwordHash, role },
  })

  try {
    await sendWelcomeEmail(email, name, tempPassword)
  } catch (err) {
    console.error('Welcome email failed:', err)
  }

  return apiOk({ employee: { id: employee.id, name: employee.name, email: employee.email, role: employee.role } }, 201)
}
