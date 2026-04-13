import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function onRequestPost(context) {
  const { R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = context.env;
  
  const body = await context.request.json();
  const { fileUrl } = body;

  if (!fileUrl) {
    return new Response(JSON.stringify({ error: "fileUrl es requerido" }), { status: 400 });
  }

  const s3 = new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });

  try {
    const fileName = fileUrl.split('/').pop();
    await s3.send(new DeleteObjectCommand({
      Bucket: "brovision-assets",
      Key: fileName,
    }));

    return new Response(JSON.stringify({ success: true, deleted: fileName }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}