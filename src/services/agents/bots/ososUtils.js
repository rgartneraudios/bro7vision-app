// src/services/agents/bots/ososUtils.js

export function frase(pool) {
  if (!pool || pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

const SECTORES_SIN_UBICACION = ['REINOS', 'ORACULO', 'GAMES'];

const PALABRAS_SALUDO   = ['hola', 'hey', 'buenas', 'ey', 'hi', 'buenos', 'qué tal', 'que tal'];
const PALABRAS_PODCAST  = ['podcast', 'episodio', 'capítulo', 'capitulo', 'programa', 'escuché', 'escuche', 'oí', 'oi', 'hablaron', 'tema', 'de qué', 'de que', 'trataba', 'trata'];
const PALABRAS_VIVENCIA = ['pizzería', 'pizzeria', 'restaurante', 'fuisteis', 'fuiste', 'estuvisteis', 'promo', 'recomendáis', 'recomendais', 'os gustó', 'os gusto'];
const PALABRAS_SECTOR   = [
  'nova', 'productos', 'comprar', 'tienda', 'shop',
  'isabella', 'servicios', 'profesional', 'peluquería', 'peluqueria',
  'mapache', 'música', 'musica', 'audio', 'audios', 'escuchar',
  'evelyn', 'avisos', 'anuncios', 'tablón', 'tablon',
  'oráculo', 'oraculo', 'reinos', 'juegos', 'games', 'señormisterio',
];
const PALABRAS_HANDOFF = [
  'dame con', 'pásame con', 'pasame con', 'llévame a', 'llevame a',
  'quiero ir a', 'ir a', 'nova', 'isabella', 'mapache', 'evelyn', 'ami', 'larry', 'robles', 'profesor robles',
  'jaguar', 'orumama', 'reinos', 'juegos', 'games', 'oráculo', 'oraculo', 'rumores',
  'smisterio', 'misterio', 'señor misterio', 'lara', 'tito',
];
const PALABRAS_REALITY = ['reality', 'escenario', 'canal', 'tuner', 'visor', 'ver videos', 'canales'];

export function detectarIntencion(textoUsuario) {
  const lower = textoUsuario.toLowerCase().trim();
  if (PALABRAS_REALITY.some(p => lower.includes(p))) return 'reality';
  if (PALABRAS_HANDOFF.some(p => lower.includes(p))) return 'handoff';
  if (PALABRAS_SALUDO.some(s => lower.startsWith(s) || lower === s)) return 'saludo';
  if (PALABRAS_PODCAST.some(p => lower.includes(p)))                  return 'podcast';
  if (PALABRAS_VIVENCIA.some(v => lower.includes(v)))                 return 'vivencia';
  if (PALABRAS_SECTOR.some(p => lower.includes(p)))                   return 'sector';
  return 'desconocido';
}

const PALABRAS_SI = ['sí', 'si', 'claro', 'dale', 'adelante', 'quiero', 'sigo', 'venga', 'sigue'];
const PALABRAS_NO = ['no', 'mejor no', 'paso', 'otra', 'cambia', 'prefiero'];

export function detectarRama(textoUsuario) {
  const lower = textoUsuario.toLowerCase().trim();
  if (PALABRAS_SI.some(p => lower.includes(p))) return 'a';
  if (PALABRAS_NO.some(p => lower.includes(p))) return 'b';
  return null;
}

export function construirRespuesta({ datosBot, update, sectorFinal, ciudadFinal, textoUsuario, actoActual, ramaActual }) {

  // — Historia ramificada — acto 2 o 3 ───────────────────────────────
  if (actoActual && actoActual !== 'acto_1' && update) {
    const clave     = ramaActual ? `${actoActual}${ramaActual}` : actoActual;
    const contenido = update[clave];
    const pregunta  = actoActual === 'acto_2' ? update.pregunta_2 : null;
    if (contenido) {
      const mensaje = pregunta ? `${contenido}\n\n${pregunta}` : contenido;
      return { mensaje, handoff: false, siguienteActo: actoActual === 'acto_2' ? 'acto_3' : null };
    }
  }

  // — Inicio de historia — acto 1 ─────────────────────────────────────
  if (actoActual === 'acto_1' && update?.acto_1) {
    const pregunta = update.pregunta_1 ? `\n\n${update.pregunta_1}` : '';
    return { mensaje: `${update.acto_1}${pregunta}`, handoff: false, siguienteActo: 'acto_2' };
  }

  const intencion = detectarIntencion(textoUsuario);

  // — Reality ─────────────────────────────────────────────────────────
  if (intencion === 'reality') {
    return {
      mensaje: frase([
        '¡El Reality te espera! Elige tu escenario 🎬',
        'Accediendo al Reality Tuner... elige tu canal 📡',
        '¡Sintoniza tu frecuencia! El Reality está listo 🌐',
      ]),
      handoff: 'REALITY',
    };
  }

  // — Handoff explícito ───────────────────────────────────────────────
  if (intencion === 'handoff') {
    const lower = textoUsuario.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    let destino = null;
    if (lower.includes('nova')     || lower.includes('producto'))                             destino = 'BROSHOP_PRODUCTO';
    if (lower.includes('isabella') || lower.includes('servicio'))                             destino = 'BROSHOP_SERVICIO';
    if (lower.includes('mapache')  || lower.includes('musica') || lower.includes('audio'))   destino = 'AUDIO';
    if (lower.includes('evelyn')   || lower.includes('aviso'))                                destino = 'BROSHOP_AVISO';
    if (lower.includes('reinos')   || lower.includes('reino')  || lower.includes('rumores')) destino = 'REINOS';
    if (lower.includes('games')    || lower.includes('juegos') || lower.includes('jugar'))   destino = 'GAMES';
    if (lower.includes('oraculo')  || lower.includes('orumama') || lower.includes('jaguar') ||
        lower.includes('misterio') || lower.includes('smisterio'))                            destino = 'ORACULO';

    if (!destino) {
      return { mensaje: frase(datosBot.frasesNoEntiendo), handoff: false };
    }

    if (SECTORES_SIN_UBICACION.includes(destino)) {
      return { mensaje: frase(datosBot.frasesBienvenida), handoff: destino };
    }

    if (!ciudadFinal) {
      return { mensaje: frase(datosBot.frasesPedirCiudad), handoff: false };
    }

    return {
      mensaje:     frase(datosBot.frasesBienvenida),
      handoff:     destino,
      handoffData: { agente: destino, ciudad: ciudadFinal },
    };
  }

  // — Saludo ──────────────────────────────────────────────────────────
  if (intencion === 'saludo') {
    if (update?.historia) return { mensaje: `${update.historia} ${datosBot.fraseRedirigir}`, handoff: false };
    if (update?.frases_saludo?.length) return { mensaje: frase(update.frases_saludo), handoff: false };
    return { mensaje: frase(datosBot.frasesBienvenida), handoff: false };
  }

  // — Podcast ─────────────────────────────────────────────────────────
  if (intencion === 'podcast') {
    const respuesta = datosBot.responderPodcast?.(update);
    if (respuesta) return { mensaje: `${respuesta} ${datosBot.fraseRedirigir}`, handoff: false };
    return { mensaje: `${frase(datosBot.frasesBienvenida)} ${datosBot.fraseRedirigir}`, handoff: false };
  }

  // — Vivencia ────────────────────────────────────────────────────────
  if (intencion === 'vivencia') {
    const respuesta = datosBot.responderVivencia?.(update);
    if (respuesta) return { mensaje: `${respuesta} ${datosBot.fraseRedirigir}`, handoff: false };
    return { mensaje: frase(datosBot.frasesBienvenida), handoff: false };
  }

  // — Sector ──────────────────────────────────────────────────────────
  if (intencion === 'sector') {
    if (sectorFinal && SECTORES_SIN_UBICACION.includes(sectorFinal)) {
      return { mensaje: frase(datosBot.frasesBienvenida), handoff: sectorFinal };
    }
    if (sectorFinal && !ciudadFinal) {
      return { mensaje: frase(datosBot.frasesPedirCiudad), handoff: false };
    }
  }

  // — Sector detectado por PS pero sin ciudad ─────────────────────────
  if (sectorFinal && SECTORES_SIN_UBICACION.includes(sectorFinal)) {
    return { mensaje: frase(datosBot.frasesBienvenida), handoff: sectorFinal };
  }
  if (sectorFinal && !ciudadFinal) {
    return { mensaje: frase(datosBot.frasesPedirCiudad), handoff: false };
  }

  // — Fallback ────────────────────────────────────────────────────────
  return { mensaje: frase(datosBot.frasesNoEntiendo), handoff: false };
}