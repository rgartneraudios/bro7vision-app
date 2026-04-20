// src/services/agents/bots/oraculoUtils.js
// Detección temprana para sector Oráculo — Orumama + Jaguar + Señor Misterio.
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
  'audio', 'música', 'musica', 'podcast', 'mapache', 'ami',
  'reinos', 'reino', 'rumores',
  'juego', 'juegos', 'games',
];

// ─────────────────────────────────────────────────────────────────────
// KEYWORDS INTERNAS — switch entre los tres del Oráculo
// ─────────────────────────────────────────────────────────────────────

const KEYWORDS_ORUMAMA   = ['orumama', 'la orumama'];
const KEYWORDS_JAGUAR    = ['jaguar', 'el jaguar'];
const KEYWORDS_SMISTERIO = ['misterio', 'señor misterio', 'smisterio', 'el señor misterio'];

// ─────────────────────────────────────────────────────────────────────
// KEYWORDS DE INTENCIÓN
// ─────────────────────────────────────────────────────────────────────

const INTENT_KEYWORDS = {
  horoscopo: ['horoscopo', 'signo', 'astral', 'sidereo', 'sidéreo', 'ofiuco', 'ascendente'],
  luna:      ['luna', 'fase', 'lunar'],
  hierbas:   ['hierba', 'planta', 'remedio', 'brebaje', 'natural', 'curativo', 'te ', 'infusion'],
  misterio:  ['misterio', 'secreto', 'egipto', 'atlantida', 'lemuria', 'barroco', 'conspiracion', 'civilizacion'],
};

// ─────────────────────────────────────────────────────────────────────
// FRASES DE SALIDA
// ─────────────────────────────────────────────────────────────────────

const FRASES_SALIDA = [
  'Espera, que te paso con los Osos.',
  'Un momento, te llevo a recepción.',
  'Los Osos te atienden ahora. Hasta luego.',
  'Te paso con los Osos. El Oráculo sigue aquí.',
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

export const detectarSalidaOraculo = (texto) => {
  const t = norm(texto);
  const quiereSalir = KEYWORDS_SALIDA.some(kw => t.includes(norm(kw)));
  if (!quiereSalir) return null;
  return {
    salida:  true,
    mensaje: FRASES_SALIDA[Math.floor(Math.random() * FRASES_SALIDA.length)],
  };
};

// ─────────────────────────────────────────────────────────────────────
// DETECTAR HANDOFF INTERNO — Orumama ↔ Jaguar ↔ Señor Misterio
// Retorna { interno: true, personaje_id } o null
// ─────────────────────────────────────────────────────────────────────

export const detectarInternoOraculo = (texto, personajeActivo) => {
  const t = norm(texto);

  if (personajeActivo !== 'orumama' && KEYWORDS_ORUMAMA.some(kw => t.includes(norm(kw)))) {
    return { interno: true, personaje_id: 'orumama' };
  }
  if (personajeActivo !== 'jaguar' && KEYWORDS_JAGUAR.some(kw => t.includes(norm(kw)))) {
    return { interno: true, personaje_id: 'jaguar' };
  }
  if (personajeActivo !== 'smisterio' && KEYWORDS_SMISTERIO.some(kw => t.includes(norm(kw)))) {
    return { interno: true, personaje_id: 'smisterio' };
  }

  return null;
};

// ─────────────────────────────────────────────────────────────────────
// DETECTAR INTENCIÓN
// Retorna string con la intención o 'explorar' como fallback
// ─────────────────────────────────────────────────────────────────────

export const detectarIntencionOraculo = (texto) => {
  const t = norm(texto);
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some(kw => t.includes(norm(kw)))) return intent;
  }
  return 'explorar';
};