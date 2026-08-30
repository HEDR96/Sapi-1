import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3Client } from './s3'

export async function uploadToS3(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'cattle'
): Promise<string> {
  const key = `${folder}/${Date.now()}-${fileName}`

  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.IDRIVE_BUCKET,
    Key: key,
    Body: file,
    ContentType: contentType,
    ACL: 'public-read',
  }))

  return `${process.env.IDRIVE_ENDPOINT}/${process.env.IDRIVE_BUCKET}/${key}`
}

export async function getSignedUploadUrl(
  fileName: string,
  contentType: string,
  folder: string
): Promise<{ uploadUrl: string; key: string }> {
  const key = `${folder}/${Date.now()}-${fileName}`

  const command = new PutObjectCommand({
    Bucket: process.env.IDRIVE_BUCKET,
    Key: key,
    ContentType: contentType,
  })

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

  return { uploadUrl, key }
}
