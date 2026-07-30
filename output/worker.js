/**
 * CUPONES WORKER — Bro7Vision
 * ================================================================
 * Endpoints:
 *   POST /canjear-cupon     → genera cupón, resta lunas
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

      if (url.pathname === '/canjear-cupon')      return await handleCanjearCupon(request, env, corsHeaders);
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
// HELPER COMPARTIDO — verifica token y devuelve user_id
// ================================================================
async function resolverUsuario(env, token) {
  if (!token) return null;
  const perfil = await sbGet(env,
    `profiles?token_hash=eq.${token}&select=id&limit=1`
  );
  if (!perfil || perfil.length === 0) return null;
  return perfil[0].id;
}

// ================================================================
// ENDPOINT: /canjear-cupon
// ================================================================
async function handleCanjearCupon(request, env, corsHeaders) {

  let payload;
  try { payload = await request.json(); }
  catch { return json({ error: 'JSON inválido' }, 400, corsHeaders); }

  const {
    user_id,
    comercio_id,
    tipo_tarjeta,
    valor_euros,
    comercio_nombre,
    web_url,
    coste_lunas,
  } = payload;

  if (!user_id || !comercio_id || !coste_lunas) {
    return json({ error: 'Faltan campos obligatorios' }, 400, corsHeaders);
  }

  // Verificar comercio activo, estado_canje y emisión disponible
  const comercios = await sbGet(env,
    `comercio_cupones?id=eq.${comercio_id}&activo=eq.true&estado_canje=eq.ACTIVO&select=id,comercio_nombre,web_url,palabra_clave_1,palabra_clave_2,emision_total,emision_usada,tipo_tarjeta,valor_euros&limit=1`
  );
  if (!comercios || comercios.length === 0) {
    return json({ error: 'Tarjeta no disponible o suspendida' }, 404, corsHeaders);
  }

  const comercio = comercios[0];

  // Verificar emisión limitada
  if (
    comercio.emision_total !== null &&
    comercio.emision_usada >= comercio.emision_total
  ) {
    return json({ error: 'Tarjeta agotada' }, 409, corsHeaders);
  }

  // Verificar balance de Lunas
  const perfiles = await sbGet(env,
    `profiles?id=eq.${user_id}&select=id,lunas,alias&limit=1`
  );
  if (!perfiles || perfiles.length === 0) {
    return json({ error: 'Usuario no encontrado' }, 404, corsHeaders);
  }

  const balanceActual = perfiles[0].lunas || 0;
  const aliasUsuario  = perfiles[0].alias  || 'desconocido';

  if (balanceActual < coste_lunas) {
    return json({
      error:     'Lunas insuficientes',
      balance:   balanceActual,
      necesario: coste_lunas,
    }, 400, corsHeaders);
  }

  // Verificar si ya tiene un cupón activo de este comercio
  const yaExiste = await sbGet(env,
    `cupones_generados?user_id=eq.${user_id}&comercio_id=eq.${comercio_id}&usado=eq.false&caduca_at=gt.${new Date().toISOString()}&select=id,palabra_clave_2&limit=1`
  );
  if (yaExiste && yaExiste.length > 0) {
    return json({
      error:          'Ya tienes un cupón activo para este comercio',
      palabra_clave_2: yaExiste[0].palabra_clave_2 || null,
    }, 409, corsHeaders);
  }

  const { faseCaduca } = getMoonPhase();
  const nuevoBalance   = balanceActual - coste_lunas;

  // Restar Lunas
  const updateBalance = await sbPatch(env,
    `profiles?id=eq.${user_id}`,
    { lunas: nuevoBalance }
  );
  if (!updateBalance) {
    return json({ error: 'Error al restar Lunas' }, 500, corsHeaders);
  }

  // Insertar en cupones_generados
  const cupon = await sbPost(env, 'cupones_generados', {
    user_id,
    comercio_id,
    tipo_tarjeta:    comercio.tipo_tarjeta    || tipo_tarjeta || null,
    valor_euros:     comercio.valor_euros     || valor_euros  || null,
    lunas_gastadas:  coste_lunas,
    palabra_clave_1: comercio.palabra_clave_1 || null,
    palabra_clave_2: comercio.palabra_clave_2 || null,
    comercio_nombre: comercio_nombre || comercio.comercio_nombre,
    web_url:         web_url         || comercio.web_url || '',
    usado:           false,
    caduca_at:       faseCaduca,
    created_at:      new Date().toISOString(),
  });

  if (!cupon) {
    // Rollback — devolver Lunas
    await sbPatch(env, `profiles?id=eq.${user_id}`, { lunas: balanceActual });
    return json({ error: 'Error al generar cupón. Lunas devueltas.' }, 500, corsHeaders);
  }

  // Incrementar emision_usada si la tarjeta tiene límite
  if (comercio.emision_total !== null) {
    await sbPatch(env,
      `comercio_cupones?id=eq.${comercio_id}`,
      { emision_usada: comercio.emision_usada + 1 }
    );

    // Si se agota con este canje — marcar AGOTADO
    if (comercio.emision_usada + 1 >= comercio.emision_total) {
      await sbPatch(env,
        `comercio_cupones?id=eq.${comercio_id}`,
        { estado_canje: 'AGOTADO', activo: false }
      );
    }
  }

  const fechaLegible = new Date(faseCaduca).toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return json({
    ok:              true,
    alias:           aliasUsuario,
    tipo_tarjeta:    comercio.tipo_tarjeta    || tipo_tarjeta,
    valor_euros:     comercio.valor_euros     || valor_euros,
    comercio_nombre: comercio_nombre          || comercio.comercio_nombre,
    web_url:         web_url                  || comercio.web_url || '',
    palabra_clave_2: comercio.palabra_clave_2 || null,
    caduca_at:       faseCaduca,
    caduca_legible:  fechaLegible,
    lunas_restadas:  coste_lunas,
    balance_nuevo:   nuevoBalance,
    mensaje:         'Tarjeta canjeada. En tu Booster › Mis Cupones tienes tu Luna con la palabra clave secreta.',
  }, 200, corsHeaders);
}

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

function getMoonPhase() {
  const known   = new Date('2000-01-06T18:14:00Z');
  const now     = new Date();
  const elapsed = (now - known) / 86400000;
  const age     = ((elapsed % 29.53058867) + 29.53058867) % 29.53058867;

  const fases = [
    { id: 'NUEVA',     inicio: 0,     fin: 1.85  },
    { id: 'CRECIENTE', inicio: 1.85,  fin: 14.77 },
    { id: 'LLENA',     inicio: 14.77, fin: 16.61 },
    { id: 'MENGUANTE', inicio: 16.61, fin: 29.53 },
  ];

  const fase          = fases.find(f => age >= f.inicio && age < f.fin) || fases[0];
  const diasRestantes = fase.fin - age;
  const faseCaduca    = new Date(now.getTime() + diasRestantes * 86400000);

  return { faseId: fase.id, faseCaduca: faseCaduca.toISOString(), age };
}

async function sbFetch(env, path, method = 'GET', body = null) {
  const url = `${env.SUPABASE_URL}/rest/v1/${path}`;
  const headers = {
    'apikey':        env.SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    'Content-Type':  'application/json',
    'Prefer':        'return=representation',
  };
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (!res.ok) {
    const err = await res.text();
    console.error(`[Supabase ${method}] ${path}`, err);
    return null;
  }
  return res.json();
}

const sbGet   = (env, path)       => sbFetch(env, path, 'GET');
const sbPost  = (env, path, body) => sbFetch(env, path, 'POST',  body);
const sbPatch = (env, path, body) => sbFetch(env, path, 'PATCH', body);