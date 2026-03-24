// api/delete-r2.js
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  const { fileUrl } = req.body;
  if (!fileUrl) return res.status(400).json({ error: "fileUrl es requerido" });

  const s3 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

  try {
    // Extraemos solo el nombre del archivo desde la URL pública
    // Ej: https://pub-57f2bfe6...r2.dev/1234567890-video.mp4  →  1234567890-video.mp4
    const fileName = fileUrl.split('/').pop();

    await s3.send(new DeleteObjectCommand({
      Bucket: "brovision-assets",
      Key: fileName,
    }));

    res.status(200).json({ success: true, deleted: fileName });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
