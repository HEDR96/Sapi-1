import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { s3Client } from './s3'

export async function deleteFromS3(key: string): Promise<void> {
  // Extract key from full URL if needed
  const keyName = key.includes(process.env.IDRIVE_ENDPOINT || '')
    ? key.split(`${process.env.IDRIVE_ENDPOINT}/${process.env.IDRIVE_BUCKET}/`)[1]
    : key

  await s3Client.send(new DeleteObjectCommand({
    Bucket: process.env.IDRIVE_BUCKET,
    Key: keyName,
  }))
}
