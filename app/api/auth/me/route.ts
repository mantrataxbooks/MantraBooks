import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { apiOk, apiError } from '@/lib/utils'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return apiError('Unauthorized', 401)
  return apiOk({ id: session.user.id, role: session.user.role, name: session.user.name, email: session.user.email })
}
