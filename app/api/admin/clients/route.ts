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
  company: z.string().optional(),
  gstNumber: z.string().max(15).optional(),
  cinNumber: z.string().max(21).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),
})

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !['ADMIN', 'SUPPORT', 'PAYMENTS'].includes(session.user.role)) return apiError('Forbidden', 403)

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const limit = parseInt(searchParams.get('limit') || '100')

  const where: any = { role: 'CLIENT' }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { company: { contains: search } },
      { gstNumber: { contains: search } },
      { cinNumber: { contains: search } },
    ]
  }

  const [clients, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, phone: true,
        company: true, gstNumber: true, cinNumber: true,
        address: true, city: true, state: true, pincode: true,
        isActive: true, createdAt: true,
        _count: { select: { invoices: true, documents: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  return apiOk({ clients, total })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return apiError('Forbidden', 403)

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  const { name, email, phone, company, gstNumber, cinNumber, address, city, state, pincode } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return apiError('Email already registered.')

  const tempPassword = generateTempPassword()
  const passwordHash = await bcrypt.hash(tempPassword, 12)

  const client = await prisma.user.create({
    data: {
      name, email,
      phone: phone || null,
      company: company || null,
      gstNumber: gstNumber || null,
      cinNumber: cinNumber || null,
      address: address || null,
      city: city || null,
      state: state || null,
      pincode: pincode || null,
      passwordHash,
      role: 'CLIENT',
    },
  })

  try {
    await sendWelcomeEmail(email, name, tempPassword)
  } catch (err) {
    console.error('Welcome email failed:', err)
  }

  return apiOk({ client: { id: client.id, name: client.name, email: client.email } }, 201)
}
