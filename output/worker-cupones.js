/**
 * CUPONES WORKER — Bro7Vision
 * ================================================================
 * Endpoints:
 *   POST /upload-presigned  → subida firmada a R2
 *
 * Secrets requeridos en Cloudflare (Settings → Variables):
 *   SUPABASE_URL         → https://xxxx.supabase.co
 *   SUPABASE_SERVICE_KEY → service_role key de Supabase
 * ================================================================
 */

// ================================================================
// ENTRY POINT
// ================================================================
export default {
  async fetch(request, env) {

    const corsHeaders = {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-file-name, x-file-type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST' && request.method !== 'GET') {
      return json({ error: 'Método no permitido' }, 405, corsHeaders);
    }

    try {
      const url = new URL(request.url);

      if (url.pathname === '/upload-presigned') return await handleUploadPresigned(request, env, corsHeaders);

      // GET /banners/* → sirve imagen desde R2 (bucket privado)
      if (request.method === 'GET' && url.pathname.startsWith('/banners/')) {
        return await handleGetBanner(request, env, corsHeaders);
      }

      return json({ error: 'Ruta no encontrada' }, 404, corsHeaders);

    } catch (err) {
      console.error('[Worker Global Error]', err);
      return json({
        error:    'Error interno en el servidor',
        detalles: err.message || String(err),
      }, 500, corsHeaders);
    }
  }
};

// ================================================================
// HELPER S3 — firma y ejecuta request contra R2
// ================================================================
async function s3Fetch(env, method, key, contentType, body) {
  const endpoint  = env.R2_ENDPOINT;
  const accessKey = env.R2_ACCESS_KEY_ID;
  const secretKey = env.R2_SECRET_ACCESS_KEY;
  const bucket    = 'brovision-assets';
  const region    = 'auto';

  const now       = new Date();
  const dateStamp = now.toISOString().slice(0,10).replace(/-/g,'');
  const amzDate   = now.toISOString().replace(/[:\-]|\.\d{3}/g,'').slice(0,15) + 'Z';

  const host     = new URL(endpoint).host;
  const fullPath = `/${bucket}/${key}`;

  const emptyHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const payloadHash = body ? await sha256Hex(body) : emptyHash;

  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-amz-date:${amzDate}\n`;
  const signedHeaders    = 'content-type;host;x-amz-date';

  const canonicalRequest = [
    method, fullPath, '',
    canonicalHeaders, signedHeaders,
    payloadHash,
  ].join('\n');

  const credScope    = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256', amzDate, credScope,
    await sha256(canonicalRequest),
  ].join('\n');

  const signingKey   = await getSigningKey(secretKey, dateStamp, region, 's3');
  const signature    = await hmacHex(signingKey, stringToSign);
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const headers = {
    'Content-Type':  contentType,
    'x-amz-date':    amzDate,
    'Authorization': authorization,
  };
  if (body) headers['x-amz-content-sha256'] = payloadHash;

  return fetch(`${endpoint}${fullPath}`, { method, headers, body: body || null });
}

// ================================================================
// ENDPOINT: /upload-presigned → sube imagen a R2
// ================================================================
async function handleUploadPresigned(request, env, corsHeaders) {
  try {
    const contentType = request.headers.get('x-file-type') || 'application/octet-stream';
    const fileName    = request.headers.get('x-file-name');

    if (!fileName) {
      return json({ error: 'x-file-name header obligatorio' }, 400, corsHeaders);
    }

    const fileData = await request.arrayBuffer();
    const r2Res = await s3Fetch(env, 'PUT', fileName, contentType, fileData);

    if (!r2Res.ok) {
      const errText = await r2Res.text();
      console.error('[upload-presigned R2 error]', r2Res.status, errText);
      return json({ error: `R2 rechazó el archivo: ${r2Res.status}` }, 500, corsHeaders);
    }

    const url = `https://media.bro7vision.com/${fileName}`;
    return json({ ok: true, url }, 200, corsHeaders);

  } catch (err) {
    console.error('[upload-presigned]', err);
    return json({ error: err.message }, 500, corsHeaders);
  }
}

// ================================================================
// ENDPOINT: GET /banners/* → sirve imagen desde R2
// ================================================================
async function handleGetBanner(request, env, corsHeaders) {
  try {
    const key = new URL(request.url).pathname.replace(/^\//, '');
    if (!key) return json({ error: 'Falta key' }, 400, corsHeaders);

    const r2Res = await s3Fetch(env, 'GET', key, 'application/octet-stream', null);

    if (!r2Res.ok) {
      return json({ error: 'Imagen no encontrada' }, 404, corsHeaders);
    }

    const contentType = r2Res.headers.get('content-type') || 'image/png';
    const r2Body = await r2Res.arrayBuffer();

    return new Response(r2Body, {
      status: 200,
      headers: {
        'Content-Type':  contentType,
        'Cache-Control': 'public, max-age=86400',
        ...corsHeaders,
      },
    });
  } catch (err) {
    console.error('[handleGetBanner]', err);
    return json({ error: err.message }, 500, corsHeaders);
  }
}

// ── Helpers de firma AWS4 ─────────────────────────────────────────
async function hmac(key, data) {
  const k = typeof key === 'string'
    ? new TextEncoder().encode(key)
    : key;
  const cryptoKey = await crypto.subtle.importKey(
    'raw', k, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
}

async function hmacHex(key, data) {
  const buf = await hmac(key, data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getSigningKey(secret, date, region, service) {
  const kDate    = await hmac('AWS4' + secret, date);
  const kRegion  = await hmac(kDate,           region);
  const kService = await hmac(kRegion,         service);
  return hmac(kService, 'aws4_request');
}

// ================================================================
// HELPERS COMPARTIDOS
// ================================================================

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

async function sha256(text) {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text)
  );
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sha256Hex(data) {
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

