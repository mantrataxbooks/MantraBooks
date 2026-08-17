import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiOk, apiError } from '@/lib/utils'
import { computeHealth } from '@/lib/finance'
import { z } from 'zod'

const schema = z.object({
  monthlyIncome:        z.number().min(0),
  monthlyExpenses:      z.number().min(0),
  monthlySavings:       z.number().min(0),
  emergencyFund:        z.number().min(0),
  lifeInsuranceCover:   z.number().min(0),
  healthInsuranceCover: z.number().min(0),
  retirementSavings:    z.number().min(0),
  totalDebt:            z.number().min(0),
  monthlyEmi:           z.number().min(0),
  equityPercentage:     z.number().min(0).max(100),
  totalAssets:          z.number().min(0),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return apiError('Unauthorized', 401)

  const userId = session.user.delegateFor ?? session.user.id
  const row = await prisma.financialSummary.findUnique({ where: { userId } })
  if (!row) return apiOk({ noData: true })

  const data = {
    monthlyIncome: row.monthlyIncome, monthlyExpenses: row.monthlyExpenses,
    monthlySavings: row.monthlySavings, emergencyFund: row.emergencyFund,
    lifeInsuranceCover: row.lifeInsuranceCover, healthInsuranceCover: row.healthInsuranceCover,
    retirementSavings: row.retirementSavings, totalDebt: row.totalDebt,
    monthlyEmi: row.monthlyEmi, equityPercentage: row.equityPercentage,
    totalAssets: row.totalAssets,
  }
  return apiOk({ data, report: computeHealth(data), updatedAt: row.updatedAt })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return apiError('Unauthorized', 401)
  if (session.user.delegateFor) return apiError('Delegates cannot edit financial summary.', 403)

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  const row = await prisma.financialSummary.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...parsed.data },
    update: parsed.data,
  })

  const data = parsed.data
  return apiOk({ data, report: computeHealth(data), updatedAt: row.updatedAt })
}
