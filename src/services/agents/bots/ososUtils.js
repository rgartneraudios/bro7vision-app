// src/services/agents/bots/ososUtils.js
// Lógica compartida para laraBot, titoBot y puffoBot.
// Los bots pasan sus propios datos (frases, semana) y este módulo
// construye la respuesta. Sin IA, sin API, sin dependencias externas.

// ─── Selector aleatorio ───────────────────────────────────────────────────────

export function frase(pool) {
  if (!pool || pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Detección de intención ───────────────────────────────────────────────────

const PALABRAS_SALUDO = ['hola', 'hey', 'buenas', 'ey', 'hi', 'buenos', 'qué tal', 'que tal'];
const PALABRAS_PODCAST = ['podcast', 'episodio', 'capítulo', 'capitulo', 'programa', 'escuché', 'escuche', 'oí', 'oi', 'hablaron', 'tema', 'de qué', 'de que', 'trataba', 'trata'];
const PALABRAS_VIVENCIA = ['pizzería', 'pizzeria', 'restaurante', 'fuisteis', 'fuiste', 'estuvisteis', 'promo', 'recomendáis', 'recomendais', 'os gustó', 'os gusto'];

export function detectarIntencion(textoUsuario) {
  const lower = textoUsuario.toLowerCase().trim();

  if (PALABRAS_SALUDO.some(s => lower.startsWith(s) || lower === s)) {
    return 'saludo';
  }
  if (PALABRAS_PODCAST.some(p => lower.includes(p))) {
    return 'podcast';
  }
  if (PALABRAS_VIVENCIA.some(v => lower.includes(v))) {
    return 'vivencia';
  }
  return 'desconocido';
}

// ─── Constructor de respuesta ─────────────────────────────────────────────────
//
// Recibe el contexto del bot activo y construye { mensaje, handoff }.
//
// datosBot = {
//   frasesBienvenida : string[]   — frases de saludo del personaje
//   frasesNoEntiendo : string[]   — frases de fallback
//   frasesPedirCiudad: string[]   — frases cuando falta ciudad
//   responderPodcast : fn(semana) → string | null
//   responderVivencia: fn(semana) → string | null
//   fraseRedirigir   : string     — cierre tras comentar algo ("¿A dónde te llevo?")
// }
//
// semana = fila de personaje_semana o null si no hay contenido cargado.
//
// contexto = { sectorFinal, ciudadFinal }

export function construirRespuesta({ datosBot, semana, sectorFinal, ciudadFinal, textoUsuario }) {
  const intencion = detectarIntencion(textoUsuario);

  // — Saludo ——————————————————————————————————————————————————————————————————
  if (intencion === 'saludo') {
    // Si hay historia semanal la cuenta y pregunta destino
    if (semana?.historia) {
      return {
        mensaje: `${semana.historia} ${datosBot.fraseRedirigir}`,
        handoff: false,
      };
    }
    // Si hay frase de saludo dinámica desde Supabase la usa
    if (semana?.frases_saludo?.length) {
      return {
        mensaje: frase(semana.frases_saludo),
        handoff: false,
      };
    }
    return {
      mensaje: frase(datosBot.frasesBienvenida),
      handoff: false,
    };
  }

  // — Pregunta sobre el podcast ————————————————————————————————————————————————
  if (intencion === 'podcast') {
    const respuesta = datosBot.responderPodcast?.(semana);
    if (respuesta) {
      return {
        mensaje: `${respuesta} ${datosBot.fraseRedirigir}`,
        handoff: false,
      };
    }
    // No hay contenido de podcast cargado esta semana
    return {
      mensaje: `${frase(datosBot.frasesBienvenida)} ${datosBot.fraseRedirigir}`,
      handoff: false,
    };
  }

  // — Pregunta sobre vivencia o mención ————————————————————————————————————————
  if (intencion === 'vivencia') {
    const respuesta = datosBot.responderVivencia?.(semana);
    if (respuesta) {
      return {
        mensaje: `${respuesta} ${datosBot.fraseRedirigir}`,
        handoff: false,
      };
    }
    return {
      mensaje: frase(datosBot.frasesBienvenida),
      handoff: false,
    };
  }

  // — Tiene sector pero falta ciudad ———————————————————————————————————————————
  if (sectorFinal && !ciudadFinal) {
    return {
      mensaje: frase(datosBot.frasesPedirCiudad),
      handoff: false,
    };
  }

  // — No entendió nada ————————————————————————————————————————————————————————
  return {
    mensaje: frase(datosBot.frasesNoEntiendo),
    handoff: false,
  };
}
