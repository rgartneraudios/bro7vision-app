// src/services/agents/bots/mapacheUtils.js
// Detección temprana para sector Audio — Mapache + Ami.
// Pre-filtra intenciones antes de gastar tokens en Gemini.

// ─────────────────────────────────────────────────────────────────────
// KEYWORDS DE SALIDA → OSOS
// ─────────────────────────────────────────────────────────────────────

const KEYWORDS_SALIDA = [
  // Explícito
  'salir', 'volver', 'inicio', 'recepción', 'recepcion', 'osos', 'portero',
  // Sectores ajenos
  'producto', 'productos', 'tienda', 'shop', 'nova', 'broshop',
  'servicio', 'servicios', 'isabella', 'profesor', 'prmaestro',
  'aviso', 'avisos', 'anuncio', 'anuncios', 'evelyn', 'larry',
  'oráculo', 'oraculo', 'orumama', 'jaguar', 'misterio',
  'reinos', 'reino', 'rumores',
  'juego', 'juegos', 'games',
];

// ─────────────────────────────────────────────────────────────────────
// KEYWORDS INTERNAS — switch Mapache ↔ Ami
// ─────────────────────────────────────────────────────────────────────

const KEYWORDS_AMI     = ['ami', 'amí', 'la ami', 'amy'];
const KEYWORDS_MAPACHE = ['mapache', 'el mapache'];

// ─────────────────────────────────────────────────────────────────────
// KEYWORDS DE INTENCIÓN
// ─────────────────────────────────────────────────────────────────────

const INTENT_KEYWORDS = {
  play:        ['pon', 'ponme', 'play', 'escuchar', 'reproducir', 'quiero oir', 'quiero oír'],
  descripcion: ['qué es', 'que es', 'cuéntame', 'cuentame', 'info', 'quién es', 'quien es', 'descripción', 'descripcion'],
};

// ─────────────────────────────────────────────────────────────────────
// FRASES DE SALIDA
// ─────────────────────────────────────────────────────────────────────

const FRASES_SALIDA = [
  'Espera, que te paso con los Osos. 🦝',
  'Un momento, te llevo a recepción.',
  'Los Osos te atienden ahora. Hasta luego.',
  'Te paso con los Osos. Yo sigo en cabina.',
];

// ─────────────────────────────────────────────────────────────────────
// NORMALIZAR
// ─────────────────────────────────────────────────────────────────────

const norm = (str) =>
  str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// ─────────────────────────────────────────────────────────────────────
// DETECTAR SALIDA → OSOS
// Retorna { salida: true, mensaje } o null
// ─────────────────────────────────────────────────────────────────────

export const detectarSalidaMapache = (texto) => {
  const t = norm(texto);
  const quiereSalir = KEYWORDS_SALIDA.some(kw => t.includes(norm(kw)));
  if (!quiereSalir) return null;
  return {
    salida:  true,
    mensaje: FRASES_SALIDA[Math.floor(Math.random() * FRASES_SALIDA.length)],
  };
};

// ─────────────────────────────────────────────────────────────────────
// DETECTAR HANDOFF INTERNO — Mapache ↔ Ami
// Retorna { interno: true, personaje_id } o null
// ─────────────────────────────────────────────────────────────────────

export const detectarInternoMapache = (texto, personajeActivo) => {
  const t = norm(texto);

  if (personajeActivo !== 'ami' && KEYWORDS_AMI.some(kw => t.includes(norm(kw)))) {
    return { interno: true, personaje_id: 'ami' };
  }

  if (personajeActivo !== 'mapache' && KEYWORDS_MAPACHE.some(kw => t.includes(norm(kw)))) {
    return { interno: true, personaje_id: 'mapache' };
  }

  return null;
};

// ─────────────────────────────────────────────────────────────────────
// DETECTAR INTENCIÓN
// Retorna string con la intención o 'explorar' como fallback
// ─────────────────────────────────────────────────────────────────────

export const detectarIntencionMapache = (texto) => {
  const t = norm(texto);
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some(kw => t.includes(norm(kw)))) return intent;
  }
  return 'explorar';
};