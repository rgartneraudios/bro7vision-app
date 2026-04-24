// src/services/agents/bots/laraBot.js
// Personalidad: sensible, crítica, detectora de vende humos, intuición aguda.
// Host del podcast OSOS IA junto a Puffo.
// Le encanta: enrollados dulce-salados, ensalada de tomate con atún, chocolates.
// Lee: podcast_resumen, historia, ads de personaje_update.

import { frase, construirRespuesta } from './ososUtils.js';

// ─── Frases de personalidad ───────────────────────────────────────────────────

const FRASES_BIENVENIDA = [
  "Hola, soy Lara 🐻 Fluye conmigo — ¿a dónde te llevo hoy?",
  "Lara aquí. Dime qué buscas y te oriento con consciencia.",
  "¡Buenas! ¿Productos, servicios, música o avisos? Tú dime, total.",
  "Aquí Lara 🌿 Mi energía me dice que buscas algo concreto… cuéntame.",
];

const FRASES_NO_ENTIENDO = [
  "No te pillo del todo, y eso que tengo el radar bien calibrado. ¿Buscas productos, servicios, música o avisos?",
  "Mmm, noto que hay más detrás de eso. ¿A qué sector quieres fluir hoy?",
  "No me llega claro, consciente. ¿Productos, servicios, audio o avisos?",
  "Cuéntame mejor, sin tóxicos en el mensaje. ¿A dónde quieres ir?",
];

const FRASES_PEDIR_CIUDAD = [
  "¿En qué ciudad buscas? Así te conecto con lo que hay cerca, de proximidad.",
  "Dime la ciudad y te llevo directo. Lo local tiene su energía vital.",
  "¿Dónde estás buscando? Ciudad o país — lo que fluya.",
];

const FRASE_REDIRIGIR = "¿Y tú, a dónde quieres fluir hoy? 🌿";

// ─── Respuesta sobre el podcast ───────────────────────────────────────────────
// Lara es host — habla del tema del episodio con criterio propio.
// Lee podcast_resumen de personaje_update.

function responderPodcast(update) {
  if (!update?.podcast_resumen) return null;
  const comentarios = [
    `Esta semana en OSOS IA estuvimos hablando de ${update.podcast_resumen}. Hay cosas que me llegaron profundo, la verdad.`,
    `En el último episodio tocamos ${update.podcast_resumen}. Yo lo tenía claro desde el principio, pero verlo desplegado así fue otro nivel.`,
    `Hablamos de ${update.podcast_resumen} en el podcast. Hay mucho vende humos en ese tema, así que no nos cortamos.`,
  ];
  return frase(comentarios);
}

// ─── Respuesta sobre vivencias o menciones ────────────────────────────────────
// Lee el campo ads o historia si contiene algo que contar.

function responderVivencia(update) {
  if (update?.ads) return update.ads;
  if (update?.historia) return update.historia;
  return null;
}

// ─── Contrato datosBot ────────────────────────────────────────────────────────

const datosLara = {
  frasesBienvenida:  FRASES_BIENVENIDA,
  frasesNoEntiendo:  FRASES_NO_ENTIENDO,
  frasesPedirCiudad: FRASES_PEDIR_CIUDAD,
  fraseRedirigir:    FRASE_REDIRIGIR,
  responderPodcast,
  responderVivencia,
};

// ─── Exportación principal ────────────────────────────────────────────────────

export function laraResponder({ textoUsuario, sectorFinal, ciudadFinal, update, actoActual, ramaActual }) {
  return construirRespuesta({
    datosBot: datosLara,
    update,
    sectorFinal,
    ciudadFinal,
    textoUsuario,
    actoActual,
    ramaActual,
  });
}