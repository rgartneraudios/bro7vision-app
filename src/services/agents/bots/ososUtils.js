// src/services/agents/bots/ososUtils.js
// Lógica compartida para laraBot, titoBot y puffoBot.
// Los bots pasan sus propios datos (frases, update) y este módulo
// construye la respuesta. Sin IA, sin API, sin dependencias externas.

// ─── Selector aleatorio ───────────────────────────────────────────────────────

export function frase(pool) {
  if (!pool || pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Sectores que no requieren ciudad ────────────────────────────────────────

const SECTORES_SIN_UBICACION = ['REINOS', 'ORACULO', 'GAMES'];

// ─── Detección de intención ───────────────────────────────────────────────────

const PALABRAS_SALUDO   = ['hola', 'hey', 'buenas', 'ey', 'hi', 'buenos', 'qué tal', 'que tal'];
const PALABRAS_PODCAST  = ['podcast', 'episodio', 'capítulo', 'capitulo', 'programa', 'escuché', 'escuche', 'oí', 'oi', 'hablaron', 'tema', 'de qué', 'de que', 'trataba', 'trata'];
const PALABRAS_VIVENCIA = ['pizzería', 'pizzeria', 'restaurante', 'fuisteis', 'fuiste', 'estuvisteis', 'promo', 'recomendáis', 'recomendais', 'os gustó', 'os gusto'];
const PALABRAS_SECTOR   = [
  'nova', 'productos', 'comprar', 'tienda', 'shop',
  'isabella', 'servicios', 'profesional', 'peluquería', 'peluqueria',
  'mapache', 'música', 'musica', 'audio', 'escuchar',
  'evelyn', 'avisos', 'anuncios', 'tablón', 'tablon',
  'oráculo', 'oraculo', 'reinos', 'juegos', 'games',
];

const PALABRAS_HANDOFF = [
  'dame con', 'pásame con', 'pasame con', 'llévame a', 'llevame a',
  'quiero ir a', 'ir a', 'nova', 'isabella', 'mapache', 'evelyn',
  'jaguar', 'orumama', 'reinos', 'juegos', 'games', 'oráculo', 'oraculo'
];

export function detectarIntencion(textoUsuario) {
  const lower = textoUsuario.toLowerCase().trim();

  if (PALABRAS_HANDOFF.some(p => lower.includes(p))) return 'handoff';
  if (PALABRAS_SALUDO.some(s => lower.startsWith(s) || lower === s)) return 'saludo';
  if (PALABRAS_PODCAST.some(p => lower.includes(p)))                  return 'podcast';
  if (PALABRAS_VIVENCIA.some(v => lower.includes(v)))                 return 'vivencia';
  if (PALABRAS_SECTOR.some(p => lower.includes(p)))                   return 'sector';
  return 'desconocido';
}

// ─── Detección de rama (respuesta sí/no del usuario) ─────────────────────────

const PALABRAS_SI = ['sí', 'si', 'claro', 'dale', 'adelante', 'quiero', 'sigo', 'venga', 'sigue'];
const PALABRAS_NO = ['no', 'mejor no', 'paso', 'otra', 'cambia', 'prefiero'];

export function detectarRama(textoUsuario) {
  const lower = textoUsuario.toLowerCase().trim();
  if (PALABRAS_SI.some(p => lower.includes(p))) return 'a';
  if (PALABRAS_NO.some(p => lower.includes(p))) return 'b';
  return null;
}

// ─── Constructor de respuesta ─────────────────────────────────────────────────

export function construirRespuesta({ datosBot, update, sectorFinal, ciudadFinal, textoUsuario, actoActual, ramaActual }) {

  // — Historia ramificada — acto 2 o 3 ───────────────────────────────────────
  if (actoActual && actoActual !== 'acto_1' && update) {
    const clave    = ramaActual ? `${actoActual}${ramaActual}` : actoActual;
    const contenido = update[clave];
    const pregunta  = actoActual === 'acto_2' ? update.pregunta_2 : null;
    if (contenido) {
      const mensaje = pregunta ? `${contenido}\n\n${pregunta}` : contenido;
      const siguienteActo = actoActual === 'acto_2' ? 'acto_3' : null;
      return { mensaje, handoff: false, siguienteActo };
    }
  }

  // — Inicio de historia — acto 1 ─────────────────────────────────────────────
  if (actoActual === 'acto_1' && update?.acto_1) {
    const pregunta = update.pregunta_1 ? `\n\n${update.pregunta_1}` : '';
    return { mensaje: `${update.acto_1}${pregunta}`, handoff: false, siguienteActo: 'acto_2' };
  }

  const intencion = detectarIntencion(textoUsuario);
  if (intencion === 'handoff') {
  if (!ciudadFinal) {
    return { mensaje: frase(datosBot.frasesPedirCiudad), handoff: false };
  }
}

  // — Saludo ──────────────────────────────────────────────────────────────────
  if (intencion === 'saludo') {
    if (update?.historia) {
      return { mensaje: `${update.historia} ${datosBot.fraseRedirigir}`, handoff: false };
    }
    if (update?.frases_saludo?.length) {
      return { mensaje: frase(update.frases_saludo), handoff: false };
    }
    return { mensaje: frase(datosBot.frasesBienvenida), handoff: false };
  }

  // — Podcast ─────────────────────────────────────────────────────────────────
  if (intencion === 'podcast') {
    const respuesta = datosBot.responderPodcast?.(update);
    if (respuesta) {
      return { mensaje: `${respuesta} ${datosBot.fraseRedirigir}`, handoff: false };
    }
    return { mensaje: `${frase(datosBot.frasesBienvenida)} ${datosBot.fraseRedirigir}`, handoff: false };
  }

  // — Vivencia ────────────────────────────────────────────────────────────────
  if (intencion === 'vivencia') {
    const respuesta = datosBot.responderVivencia?.(update);
    if (respuesta) {
      return { mensaje: `${respuesta} ${datosBot.fraseRedirigir}`, handoff: false };
    }
    return { mensaje: frase(datosBot.frasesBienvenida), handoff: false };
  }

  // — Sector detectado sin ciudad ─────────────────────────────────────────────
  if (intencion === 'sector') {
    if (sectorFinal && !ciudadFinal && !SECTORES_SIN_UBICACION.includes(sectorFinal)) {
      return { mensaje: frase(datosBot.frasesPedirCiudad), handoff: false };
    }
  }

  // — Tiene sector pero falta ciudad (detectado por PS) ───────────────────────
  if (sectorFinal && !ciudadFinal && !SECTORES_SIN_UBICACION.includes(sectorFinal)) {
    return { mensaje: frase(datosBot.frasesPedirCiudad), handoff: false };
  }

  // — No entendió nada ────────────────────────────────────────────────────────
  return { mensaje: frase(datosBot.frasesNoEntiendo), handoff: false };
}