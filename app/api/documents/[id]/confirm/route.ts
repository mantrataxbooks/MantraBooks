import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiOk, apiError } from '@/lib/utils'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return apiError('Unauthorized', 401)

  const { id } = await params
  const doc = await prisma.document.findUnique({ where: { id } })
  if (!doc) return apiError('Document not found.', 404)

  const effectiveClientId = session.user.delegateFor || session.user.id
  const isOwner = doc.clientId === effectiveClientId
  const isStaff = ['ADMIN', 'SUPPORT'].includes(session.user.role)
  if (!isOwner && !isStaff) return apiError('Forbidden', 403)

  // Confirms the client's direct-to-S3 upload succeeded and moves the
  // document out of PENDING into the admin review queue.
  const document = await prisma.document.update({
    where: { id },
    data: { status: doc.status === 'PENDING' ? 'UNDER_REVIEW' : doc.status },
  })

  return apiOk({ document })
}
