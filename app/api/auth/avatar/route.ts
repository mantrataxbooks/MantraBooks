import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiOk, apiError } from '@/lib/utils'
import { buildAvatarKey, getPresignedUploadUrl, validateAvatar } from '@/lib/s3'
import path from 'path'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return apiError('Unauthorized', 401)
  if (session.user.delegateFor) return apiError('Delegates cannot change profile photo.', 403)

  const { mimeType, filename, size } = await req.json()

  try {
    validateAvatar(mimeType, size)
  } catch (e: any) {
    return apiError(e.message)
  }

  const ext = path.extname(filename || '').toLowerCase() || '.jpg'
  const s3Key = buildAvatarKey(session.user.id, ext)

  try {
    const uploadUrl = await getPresignedUploadUrl(s3Key, mimeType)
    return apiOk({ uploadUrl, s3Key })
  } catch {
    return apiError('Storage not configured. Please contact support.', 503)
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return apiError('Unauthorized', 401)
  if (session.user.delegateFor) return apiError('Delegates cannot change profile photo.', 403)

  const { s3Key } = await req.json()
  if (!s3Key || typeof s3Key !== 'string') return apiError('s3Key required')

  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarUrl: s3Key },
  })

  return apiOk({ success: true })
}
