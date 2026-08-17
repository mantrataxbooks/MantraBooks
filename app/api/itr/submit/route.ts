import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { apiError, apiOk } from '@/lib/utils'
import { z } from 'zod'

const schema = z.object({
  incomeSources: z.array(z.string()).optional(),
  packageName: z.string().min(1).max(200),
  fee: z.number().nonnegative(),
  fileCount: z.number().int().nonnegative(),
})

export async function POST(request: Request) {
  // Auth guard — only logged-in clients or admins may file ITR requests
  const session = await getServerSession(authOptions)
  if (!session) return apiError('Unauthorized', 401)
  if (session.user.role !== 'CLIENT' && session.user.role !== 'ADMIN') {
    return apiError('Forbidden', 403)
  }

  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return apiError('Invalid request data.', 400)

    const { incomeSources, packageName, fee, fileCount } = parsed.data

    const referenceId = `ITR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`

    console.log('ITR Filing Request Received:', {
      referenceId,
      userId: session.user.id,
      userEmail: session.user.email,
      incomeSources,
      packageName,
      fee,
      fileCount,
      timestamp: new Date().toISOString(),
    })

    return apiOk({
      success: true,
      referenceId,
      message: 'Filing request submitted successfully',
    }, 201)
  } catch (error) {
    console.error('Error submitting ITR filing request:', error)
    return apiError('Internal Server Error', 500)
  }
}
