import { S3Client } from '@aws-sdk/client-s3'

// For IDRIVE E2 S3-compatible storage
export const s3Client = new S3Client({
  region: process.env.IDRIVE_REGION || 'ap-northeast-1',
  endpoint: process.env.IDRIVE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.IDRIVE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.IDRIVE_SECRET_ACCESS_KEY!,
  },
  // forcePathStyle: true = endpoint/bucket/key
  // forcePathStyle: false = bucket.endpoint/key (virtual-hosted)
  // IDRIVE E2 uses path-style
  forcePathStyle: true,
})
