import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'
import path from 'path'

export const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.AWS_S3_BUCKET!
const UPLOAD_EXPIRES = 15 * 60   // 15 minutes
const DOWNLOAD_EXPIRES = 15 * 60 // 15 minutes

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.ms-excel',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export function validateUpload(filename: string, mimeType: string, size: number) {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error('File type not allowed. Allowed: PDF, JPG, PNG, DOCX, XLSX')
  }
  if (size > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size is 10 MB')
  }
  return true
}

export function buildS3Key(clientId: string, filename: string): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const ext = path.extname(filename).toLowerCase()
  const safeName = path.basename(filename, ext).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 50)
  return `documents/${clientId}/${year}/${month}/${randomUUID()}-${safeName}${ext}`
}

export async function getPresignedUploadUrl(s3Key: string, mimeType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: s3Key,
    ContentType: mimeType,
    ServerSideEncryption: 'AES256',
  })
  return getSignedUrl(s3, command, { expiresIn: UPLOAD_EXPIRES })
}

export async function getPresignedDownloadUrl(s3Key: string, filename: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: s3Key,
    ResponseContentDisposition: `attachment; filename="${filename}"`,
  })
  return getSignedUrl(s3, command, { expiresIn: DOWNLOAD_EXPIRES })
}

export async function getPresignedViewUrl(s3Key: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: s3Key })
  return getSignedUrl(s3, command, { expiresIn: DOWNLOAD_EXPIRES })
}

export async function deleteS3Object(s3Key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: s3Key }))
}

const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_AVATAR_SIZE = 2 * 1024 * 1024

export function validateAvatar(mimeType: string, size: number) {
  if (!ALLOWED_AVATAR_TYPES.includes(mimeType)) {
    throw new Error('Only JPG, PNG, or WebP images allowed.')
  }
  if (size > MAX_AVATAR_SIZE) {
    throw new Error('Image too large. Maximum size is 2 MB.')
  }
}

export function buildAvatarKey(userId: string, ext: string): string {
  return `avatars/${userId}/${randomUUID()}${ext}`
}
