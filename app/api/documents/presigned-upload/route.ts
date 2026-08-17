import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateUpload, buildS3Key, getPresignedUploadUrl } from '@/lib/s3'
import { apiOk, apiError } from '@/lib/utils'
import { z } from 'zod'

const schema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  size: z.number().positive(),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return apiError('Unauthorized', 401)

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return apiError('Invalid request.')

  const { filename, mimeType, size } = parsed.data

  try {
    validateUpload(filename, mimeType, size)
  } catch (err: any) {
    return apiError(err.message)
  }

  // Delegate uploads on behalf of owner; admin can specify via header
  const clientId = session.user.role === 'CLIENT'
    ? (session.user.delegateFor || session.user.id)
    : (req.headers.get('x-client-id') || session.user.id)

  const s3Key = buildS3Key(clientId, filename)

  const uploadUrl = await getPresignedUploadUrl(s3Key, mimeType)

  // Create document record in PENDING state
  const document = await prisma.document.create({
    data: {
      clientId,
      uploadedBy: session.user.id,
      s3Key,
      filename,
      mimeType,
      size,
      status: 'PENDING',
    },
  })

  return apiOk({ uploadUrl, s3Key, documentId: document.id }, 200)
}
