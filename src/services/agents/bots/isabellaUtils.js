// src/services/agents/bots/isabellaUtils.js
// Detección temprana para sector Servicios — Isabella + Profesor.
// Pre-filtra intenciones antes de gastar tokens en Gemini.

// ─────────────────────────────────────────────────────────────────────
// KEYWORDS DE SALIDA → OSOS
// ─────────────────────────────────────────────────────────────────────

const KEYWORDS_SALIDA = [
  // Explícito
  'salir', 'volver', 'inicio', 'recepción', 'recepcion', 'osos', 'portero',
  // Sectores ajenos
  'producto', 'productos', 'tienda', 'shop', 'nova', 'broshop',
  'aviso', 'avisos', 'anuncio', 'anuncios', 'evelyn', 'larry',
  'audio', 'música', 'musica', 'podcast', 'mapache', 'ami',
  'oráculo', 'oraculo', 'orumama', 'jaguar', 'misterio',
  'reinos', 'reino', 'rumores',
  'juego', 'juegos', 'games',
];

// ─────────────────────────────────────────────────────────────────────
// KEYWORDS INTERNAS — switch Isabella ↔ Profesor
// ─────────────────────────────────────────────────────────────────────

const KEYWORDS_PROFESOR   = ['robles', 'profesor robles', 'profesor', 'profe', 'el profesor', 'el profe'];
const KEYWORDS_ISABELLA   = ['isabella', 'la isabella', 'isa'];

// ─────────────────────────────────────────────────────────────────────
// KEYWORDS DE INTENCIÓN
// ─────────────────────────────────────────────────────────────────────

const INTENT_KEYWORDS = {
  precio:      ['precio', 'cuánto', 'cuanto', 'cuesta', 'sesión', 'sesion', 'tarifa', 'coste', 'costo'],
  ubicacion:   ['dónde', 'donde', 'ubicación', 'ubicacion', 'dirección', 'direccion', 'llegar', 'sitio'],
  contacto:    ['contacto', 'teléfono', 'telefono', 'horario', 'cita', 'reserva', 'whatsapp', 'email'],
  descripcion: ['qué es', 'que es', 'cuéntame', 'cuentame', 'info', 'quién es', 'quien es', 'descripción', 'descripcion'],
};

// ─────────────────────────────────────────────────────────────────────
// FRASES
// ─────────────────────────────────────────────────────────────────────

const FRASES_SALIDA = [
  'Espera, que te paso con los Osos. Cuídate.',
  'Un momento, te llevo a recepción.',
  'Los Osos te atienden ahora. Hasta luego.',
  'Te paso con los Osos. Vuelvo a mis notas.',
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

export const detectarSalidaIsabella = (texto) => {
  const t = norm(texto);
  const quiereSalir = KEYWORDS_SALIDA.some(kw => t.includes(norm(kw)));
  if (!quiereSalir) return null;
  return {
    salida:  true,
    mensaje: FRASES_SALIDA[Math.floor(Math.random() * FRASES_SALIDA.length)],
  };
};

// ─────────────────────────────────────────────────────────────────────
// DETECTAR HANDOFF INTERNO — Isabella ↔ Profesor
// Retorna { interno: true, personaje_id } o null
// Solo actúa si el personaje activo NO es ya el destino
// ─────────────────────────────────────────────────────────────────────

export const detectarInternoIsabella = (texto, personajeActivo) => {
  const t = norm(texto);

  if (personajeActivo !== 'profesor' && KEYWORDS_PROFESOR.some(kw => t.includes(norm(kw)))) {
    return { interno: true, personaje_id: 'profesor' };
  }

  if (personajeActivo !== 'isabella' && KEYWORDS_ISABELLA.some(kw => t.includes(norm(kw)))) {
    return { interno: true, personaje_id: 'isabella' };
  }

  return null;
};

// ─────────────────────────────────────────────────────────────────────
// DETECTAR INTENCIÓN
// Retorna string con la intención o 'explorar' como fallback
// ─────────────────────────────────────────────────────────────────────

export const detectarIntencionIsabella = (texto) => {
  const t = norm(texto);
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some(kw => t.includes(norm(kw)))) return intent;
  }
  return 'explorar';
};