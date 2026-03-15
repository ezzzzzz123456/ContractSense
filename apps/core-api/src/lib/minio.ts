import * as Minio from 'minio';
import { Readable } from 'stream';

export const minioClient = new Minio.Client({
  endPoint: new URL(process.env.S3_ENDPOINT ?? 'http://localhost:9000').hostname,
  port: parseInt(new URL(process.env.S3_ENDPOINT ?? 'http://localhost:9000').port || '9000', 10),
  useSSL: (process.env.S3_ENDPOINT ?? '').startsWith('https'),
  accessKey: process.env.S3_ACCESS_KEY ?? 'minioadmin',
  secretKey: process.env.S3_SECRET_KEY ?? 'minioadmin',
});

const BUCKET = process.env.S3_BUCKET ?? 'contracts';

/**
 * Ensure the bucket exists, creating it if not.
 */
export async function ensureBucket(): Promise<void> {
  const exists = await minioClient.bucketExists(BUCKET);
  if (!exists) {
    await minioClient.makeBucket(BUCKET, 'us-east-1');
    console.log(`[minio] Created bucket: ${BUCKET}`);
  }
}

/**
 * Upload a file buffer to MinIO.
 */
export async function uploadFile(
  objectKey: string,
  buffer: Buffer,
  mimeType: string
): Promise<void> {
  await minioClient.putObject(BUCKET, objectKey, buffer, buffer.length, {
    'Content-Type': mimeType,
  });
}

/**
 * Get a presigned URL for downloading a file (valid 1 hour).
 */
export async function getPresignedUrl(objectKey: string): Promise<string> {
  return minioClient.presignedGetObject(BUCKET, objectKey, 3600);
}

/**
 * Stream a file from MinIO.
 */
export async function streamFile(objectKey: string): Promise<Readable> {
  return minioClient.getObject(BUCKET, objectKey);
}
