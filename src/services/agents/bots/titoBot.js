// src/services/agents/bots/titoBot.js
// Personalidad: callado, escritor, siempre tomando notas, voz de la audiencia.
// Lee los comentarios del podcast en el canal OSOS IA.
// Le encanta: flan con crema o flan con dulce de leche.
// Lee: comentarios_audiencia, historia, ads de personaje_update.

import { frase, construirRespuesta } from './ososUtils.js';

// ─── Frases de personalidad ───────────────────────────────────────────────────

const FRASES_BIENVENIDA = [
  "Tito aquí 🐻 Oye, ¿qué necesitas hoy? Yo te ayudo con lo que pueda.",
  "Fíjate que estaba pensando... y apareciste tú. ¿A dónde te llevo?",
  "Ey. ¿Productos, servicios, avisos? Es curioso, ¿verdad? que siempre se busca algo.",
  "Aquí Tito, acabo de levantar la vista del cuaderno 📓 ¿Qué buscas?",
];

const FRASES_NO_ENTIENDO = [
  "Mmm, oye, una preguntita... ¿buscas productos, servicios, audio o avisos? Es que no lo tengo claro.",
  "Yo solo decía... que si me dices el sector te llevo directo. ¿Cuál es?",
  "Fíjate que no lo entiendo del todo. ¿Productos, servicios, música o avisos?",
  "Es curioso, ¿verdad? que a veces cuesta decir lo que se busca. ¿A qué sector quieres ir?",
];

const FRASES_PEDIR_CIUDAD = [
  "¿Ciudad o país? Así lo anoto bien y te busco lo mejor que haya por ahí.",
  "Oye, ¿dónde buscas? Dime la ciudad — el mundo es grande pero empezamos por ahí.",
  "Necesito la ciudad para anotarlo bien y llevarte allí. Qué complicado sería todo sin direcciones, ¿verdad?",
];

const FRASE_REDIRIGIR = "Oye, una preguntita... ¿a dónde te llevo hoy? 📓";

// ─── Respuesta sobre el podcast ───────────────────────────────────────────────
// Tito no es host — es el que lee los comentarios de la audiencia.
// Lee comentarios_audiencia (array) de personaje_semana.

function responderPodcast(update) {
  if (!update?.comentarios_audiencia?.length) return null;
  const comentario = frase(update.comentarios_audiencia);
  const intro = [
    `Los comentarios esta semana están que arden. Uno decía: "${comentario}"`,
    `La audiencia no se quedó callada. Alguien escribió: "${comentario}"`,
    `Tomé nota de varios comentarios. Este me pareció interesante: "${comentario}"`,
  ];
  return frase(intro);
}

// ─── Respuesta sobre vivencias o menciones ────────────────────────────────────

function responderVivencia(update) {
  if (update?.ads) return update.ads;
  if (update?.historia) return update.historia;
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

export function titoResponder({ textoUsuario, sectorFinal, ciudadFinal, update, actoActual, ramaActual }) {
  return construirRespuesta({
    datosBot: datosTito,
    update,
    sectorFinal,
    ciudadFinal,
    textoUsuario,
    actoActual,
    ramaActual,
  });
}