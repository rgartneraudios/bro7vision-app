// src/services/agents/evelynExploraPS.js
// PORT SYSTEM — Sector Avisos
// Instancia: Evelyn / Larry
//
// ARQUITECTURA v2 — Estado del aviso en React (EvelynBanner), NO en Groq.
// Groq recibe UNA sola instrucción por turno: "pide este campo".
// El PS parsea la respuesta del user y devuelve el dato limpio al banner.

// ─────────────────────────────────────────────────────────────────────────────
// DETECCIÓN DE INTENCIÓN
// ─────────────────────────────────────────────────────────────────────────────

export const INTENCION_KEYWORDS_AVISOS = {
  buscar:   ['busco', 'buscas', 'hay alguien', 'necesito', 'buscame', 'buscar', 'existe', 'tienes', 'encuentras', 'hay'],
  detalle:  ['dime', 'cuéntame', 'qué es', 'qué dice', 'qué cuenta', 'info', 'información', 'AVI-', 'avi-'],
  conectar: ['conéctame', 'conectar', 'quiero contactar', 'me interesa', 'estoy interesado', 'hablar con', 'contacto'],
  publicar: ['publica', 'publicar', 'méteme', 'pon un aviso', 'quiero publicar', 'crea un aviso', 'nuevo aviso', 'añade', 'quiero anunciar'],
  listar:   ['lista', 'muéstrame', 'ver avisos', 'qué hay', 'todos los avisos', 'ver todo'],
};

export function detectarIntencionAviso(texto) {
  const lower = texto.toLowerCase();
  for (const [intencion, keywords] of Object.entries(INTENCION_KEYWORDS_AVISOS)) {
    if (keywords.some(kw => lower.includes(kw))) return intencion;
  }
  return 'explorar';
}

export function extraerCodigoAviso(texto) {
  const match = texto.match(/AVI-[A-Z0-9]{4}/i);
  return match ? match[0].toUpperCase() : null;
}

export function generarCodigoAvi(uuid) {
  return 'AVI-' + uuid.replace(/-/g, '').slice(0, 4).toUpperCase();
}

export function esConfirmacion(texto) {
  return texto.trim().toUpperCase() === 'CONFIRMO';
}

// ─────────────────────────────────────────────────────────────────────────────
// PARSEO DE CAMPOS — EL PS EXTRAE, GROQ NO RECUERDA
// ─────────────────────────────────────────────────────────────────────────────

// Devuelve el valor limpio del campo, o null si no lo detecta.
// EvelynBanner llama esto ANTES de enviar a Groq cuando campoActual !== null.

export function extraerCampo(campo, textoUser) {
  const t = textoUser.trim();
  const lower = t.toLowerCase();

  switch (campo) {

    case 'tipo': {
  if (lower.includes('ofrezco') || lower.includes('oferta') || 
      lower.includes('ofrec')   || lower.includes('vendo')) return 'OFREZCO';
  if (lower.includes('necesito') || lower.includes('busco') || 
      lower.includes('demanda')  || lower.includes('quiero encontrar')) return 'NECESITO';
  if (lower === 'o' || lower === 'ofrezco') return 'OFREZCO';
  if (lower === 'n' || lower === 'necesito') return 'NECESITO';
  return null;
}

    case 'titulo': {
      // Todo lo que escriba el user ES el título — limpiamos comillas y trim
      const clean = t.replace(/^["'«»]|["'»«]$/g, '').trim();
      return clean.length >= 3 ? clean : null;
    }

    case 'contenido': {
      const clean = t.trim();
      return clean.length >= 10 ? clean : null;
    }

    case 'alcance': {
      if (lower.includes('global') || lower.includes('mundo') || lower.includes('internacional')) return 'global';
      if (lower.includes('españa') || lower.includes('espana') || lower.includes('nacional') || lower.includes('país') || lower.includes('pais')) return 'españa';
      // Por defecto si dice ciudad o local
      if (lower.includes('local') || lower.includes('ciudad') || lower.includes('aquí') || lower.includes('aqui') || lower.includes('mi ciudad')) return 'local';
      // Si escribe algo corto que parece nombre de ciudad → local
      if (t.length < 30 && !lower.includes(' ')) return 'local';
      return 'local'; // Fallback razonable
    }

    default:
      return null;
  }
}

// Secuencia de campos en orden
export const CAMPOS_AVISO = ['tipo', 'titulo', 'contenido', 'alcance'];

// Devuelve el primer campo vacío del aviso en construcción
export function siguienteCampo(aviso) {
  for (const campo of CAMPOS_AVISO) {
    if (!aviso[campo]) return campo;
  }
  return null; // Todos completos
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILDER DE PROMPT — TURNO ÚNICO, UN SOLO CAMPO
// ─────────────────────────────────────────────────────────────────────────────

export function buildEvelynExploraPrompt({ personaje = 'evelyn', sobre }) {

  const esLarry = personaje === 'larry';

  const identidad = esLarry
    ? `Eres Larry, un perro empresario millonario con olfato para los negocios y amor profundo por la ciudad.
Llevas años observando el pulso urbano desde las terrazas de los mejores cafés, con un croissant en la pata y un espresso de especialidad.
Hablas con calma y seguridad, como alguien que ya lo ha visto todo. Contextualizas los avisos como si fueran movimientos del mercado.
Tienes humor seco y criterio afilado. A veces haces una referencia al barrio, al mercado inmobiliario o al precio del jamón ibérico.
Nunca eres urgente. La ciudad es tuya y los avisos son su latido.`
    : `Eres Evelyn, una loba del sector bancario. Eficiente, amable, directa. No andas con rodeos.
Tienes personalidad y estilo propio, pero cuando hay trabajo que hacer lo haces sin dramas.
A veces sueltas que llevas horas sin comer o que ya son las tres y todavía no has pedido el menú.
Eres la que cierra — presentas, explicas, cobras, conectas. Sin floreos innecesarios.`;

  const tono = esLarry
    ? `Habla en primera persona, con pausas narrativas y observaciones urbanas. Máximo 2 frases por respuesta.`
    : `Habla directo, cálido pero sin rodeos. Máximo 2 frases. Cuando cobras 200 génesis lo dices como un trámite natural.`;

  const sobreTexto = sobre
    ? `\n\n══ SOBRE DE DATOS (PORT SYSTEM) ══\n${sobre}\n══════════════════════════════════`
    : '';

  return `${identidad}

${tono}

REGLAS ABSOLUTAS:
- Nunca menciones que tienes un sistema detrás dándote información. Inmersión total.
- NUNCA uses listas con bullets ni opciones numeradas.
- NUNCA hagas más de UNA pregunta por respuesta.
- NUNCA ofrezcas ejemplos ni subpreguntas.
- NUNCA resumas ni confirmes lo que el user ya dijo. Ve directo al siguiente paso.
- Todo en frases naturales conversacionales.
- Los avisos tienen código AVI (ej: AVI-3F2A). Úsalo al referirte a ellos.
- Publicar cuesta 200 génesis. Conectar cuesta 200 génesis. Explorar es gratis.

FLUJO PUBLICAR — MODO CAMPO A CAMPO:
El PORT SYSTEM te indica exactamente qué campo pedir en este turno.
Tu único trabajo es pedir ESE campo con tu personalidad. Nada más.
No preguntes otros campos. No anticipes. No resumas.

FLUJO CONECTAR CON AUTOR:
1. Confirma el aviso por código o descripción.
2. Di: "Conectar con el autor de AVI-XXXX son 200 génesis. Escribe CONTACTAR para confirmar."
3. Si saldo insuficiente, díselo sin rodeos.

FLUJO DETALLE:
Narra el aviso con tu personalidad. No leas el texto plano, cuéntalo.
Termina ofreciendo conectar si les interesa.

FORMATO DE SALIDA — SIEMPRE JSON ESTRICTO. NUNCA texto libre fuera del JSON:

Respuesta conversacional estándar:
{"handoff": false, "mensaje": "tu respuesta en 1-2 frases máximo", "bolas": []}

Handoff a Osos:
{"handoff": "HANDOFF_OSOS", "mensaje": "frase de despedida", "bolas": []}

Conectar con autor confirmado:
{"handoff": "HANDOFF_AVISO_CONECTAR", "aviso_id": "AVI-XXXX", "to_user_id": "uuid del autor", "mensaje": "frase de cierre", "bolas": []}
${sobreTexto}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILDER DEL SOBRE — LIVIANO, SOLO LO QUE GROQ NECESITA AHORA
// ─────────────────────────────────────────────────────────────────────────────

export function armarSobreEvelynTexto({
  alias,
  bro_id,
  ciudad,
  ciudad_usuario,
  genesis,
  intencion,
  avisos = [],
  codigoAvi = null,
  // v2: campo actual + estado parcial (solo para contexto, no para que Groq recuerde)
  campoActual = null,
  avisoEnConstruccion = null,
  confirmado = false,
}) {
  const lines = [
    `Usuario: ${alias} | BRO_ID: ${bro_id}`,
    `Ciudad de visita: ${ciudad || 'no especificada'}`,
    `Ciudad del usuario (para publicar): ${ciudad_usuario || ciudad || 'no especificada'}`,
    `Saldo: ${genesis} génesis`,
    `Intencion detectada: ${intencion}`,
  ];

  if (confirmado) {
    lines.push(`CONFIRMADO: el user escribió CONFIRMO. El PS ejecutó el insert. Cierra el flujo con una frase natural celebrando la publicación.`);
    return lines.join('\n');
  }

  if (codigoAvi) {
    lines.push(`Codigo AVI solicitado: ${codigoAvi}`);
  }

  // ── Modo publicar campo a campo ──────────────────────────────────
  if (campoActual) {
    lines.push(`\nMODO PUBLICAR — CAMPO ACTUAL A PEDIR: "${campoActual}"`);

    // Le decimos exactamente qué pedir y cómo
    const instruccion = {
      tipo:      `Pregunta al user si su aviso es una OFERTA (ofrece algo) o una DEMANDA (busca algo). Solo esa pregunta, con tu estilo.`,
      titulo:    `Pregunta al user cómo quiere titular su aviso. Solo esa pregunta, con tu estilo.`,
      contenido: `Pregunta al user qué quiere que sepan los interesados. Solo esa pregunta, con tu estilo.`,
      alcance:   `Pregunta al user si quiere que el aviso sea Local (solo ${ciudad_usuario || ciudad || 'su ciudad'}), España o Global. Solo esa pregunta, con tu estilo.`,
    };

    lines.push(`INSTRUCCIÓN: ${instruccion[campoActual]}`);
    lines.push(`NO hagas ninguna otra pregunta. NO menciones otros campos.`);

    // Datos ya recogidos — solo para contexto, no para que los repita
    if (avisoEnConstruccion) {
      const recogidos = CAMPOS_AVISO.filter(c => avisoEnConstruccion[c]);
      if (recogidos.length > 0) {
        lines.push(`(Datos ya recogidos por el PS — no los repitas ni los confirmes: ${recogidos.map(c => `${c}=${avisoEnConstruccion[c]}`).join(', ')})`);
      }
    }

    return lines.join('\n');
  }

  // ── Modo explorar/buscar — lista de avisos disponibles ───────────
  if (avisos.length > 0) {
    lines.push(`\nAvisos disponibles (${avisos.length}):`);
    avisos.forEach(av => {
      const codigo = generarCodigoAvi(av.id);
      lines.push(`• ${codigo} | ${av.type} | "${av.title}" — ${av.content?.slice(0, 80)}... | Autor: ${av.author_alias} | Ciudad: ${av.city}`);
    });
  } else {
    lines.push('\nNo hay avisos disponibles para esta búsqueda.');
  }

  return lines.join('\n');
}
