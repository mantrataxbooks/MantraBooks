import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteS3Object } from '@/lib/s3'
import { apiOk, apiError } from '@/lib/utils'
import { z } from 'zod'

const patchSchema = z.object({
  status: z.enum(['PENDING', 'UNDER_REVIEW', 'REVIEWED', 'REJECTED']).optional(),
  reviewNotes: z.string().max(2000).optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || !['ADMIN', 'SUPPORT'].includes(session.user.role)) return apiError('Forbidden', 403)

  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  const doc = await prisma.document.findUnique({ where: { id } })
  if (!doc) return apiError('Document not found.', 404)

  const document = await prisma.document.update({
    where: { id },
    data: {
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      ...(parsed.data.reviewNotes !== undefined ? { reviewNotes: parsed.data.reviewNotes } : {}),
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
    },
  })

  return apiOk({ document })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return apiError('Unauthorized', 401)

  const { id } = await params
  const doc = await prisma.document.findUnique({ where: { id } })
  if (!doc) return apiError('Document not found.', 404)

  const effectiveClientId = session.user.delegateFor || session.user.id
  const isOwner = doc.clientId === effectiveClientId
  const isStaff = ['ADMIN', 'SUPPORT'].includes(session.user.role)
  if (!isOwner && !isStaff) return apiError('Forbidden', 403)

  try {
    await deleteS3Object(doc.s3Key)
  } catch (err) {
    console.error('S3 delete failed:', err)
  }

  await prisma.document.delete({ where: { id } })

  return apiOk({ success: true })
}
