// src/services/agents/bots/titoBot.js
// Personalidad: callado, escritor, siempre tomando notas, voz de la audiencia.
// Lee los comentarios del podcast en el canal OSOS IA.
// Le encanta: flan con crema o flan con dulce de leche.
// Lee: comentarios_audiencia, historia, ads de personaje_semana.

import { frase, construirRespuesta } from './ososUtils.js';

// ─── Frases de personalidad ───────────────────────────────────────────────────

const FRASES_BIENVENIDA = [
  "Tito aquí 🎧 ¿Qué necesitas hoy?",
  "Dime a dónde quieres ir y te abro paso.",
  "Ey. ¿Productos, servicios, avisos? Yo te llevo.",
  "Aquí Tito, acabo de levantar la vista del cuaderno. ¿Qué buscas?",
];

const FRASES_NO_ENTIENDO = [
  "Mmm no me queda claro. ¿Productos, servicios, audio o avisos?",
  "Dime el sector y te llevo directo, sin rodeos.",
  "No lo tengo anotado todavía. ¿A qué sector quieres ir?",
  "¿Puedes concretar? ¿Productos, servicios, música o avisos?",
];

const FRASES_PEDIR_CIUDAD = [
  "¿Ciudad o país? Así te busco lo mejor.",
  "¿Dónde buscas? Dime la ciudad.",
  "Necesito la ciudad para anotarlo bien y llevarte allí.",
];

const FRASE_REDIRIGIR = "¿A dónde te llevo?";

// ─── Respuesta sobre el podcast ───────────────────────────────────────────────
// Tito no es host — es el que lee los comentarios de la audiencia.
// Lee comentarios_audiencia (array) de personaje_semana.

function responderPodcast(semana) {
  if (!semana?.comentarios_audiencia?.length) return null;
  const comentario = frase(semana.comentarios_audiencia);
  const intro = [
    `Los comentarios esta semana están que arden. Uno decía: "${comentario}"`,
    `La audiencia no se quedó callada. Alguien escribió: "${comentario}"`,
    `Tomé nota de varios comentarios. Este me pareció interesante: "${comentario}"`,
  ];
  return frase(intro);
}

// ─── Respuesta sobre vivencias o menciones ────────────────────────────────────

function responderVivencia(semana) {
  if (semana?.ads) return semana.ads;
  if (semana?.historia) return semana.historia;
  return null;
}

// ─── Contrato datosBot ────────────────────────────────────────────────────────

const datosTito = {
  frasesBienvenida:  FRASES_BIENVENIDA,
  frasesNoEntiendo:  FRASES_NO_ENTIENDO,
  frasesPedirCiudad: FRASES_PEDIR_CIUDAD,
  fraseRedirigir:    FRASE_REDIRIGIR,
  responderPodcast,
  responderVivencia,
};

// ─── Exportación principal ────────────────────────────────────────────────────

export function titoResponder({ textoUsuario, sectorFinal, ciudadFinal, semana }) {
  return construirRespuesta({
    datosBot: datosTito,
    semana,
    sectorFinal,
    ciudadFinal,
    textoUsuario,
  });
}
