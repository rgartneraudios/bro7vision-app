// api/upload.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export default async function handler(req, res) {
  // Solo permitimos peticiones POST
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  const { fileName, fileType } = req.body;

  const s3 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

  try {
    const command = new PutObjectCommand({
      Bucket: "brovision-assets", // Asegúrate que sea el mismo nombre que pusiste en Cloudflare
      Key: fileName,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    res.status(200).json({ uploadUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}