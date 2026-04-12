// src/services/agents/bots/laraBot.js
// Personalidad: sensible, crítica, detectora de vende humos, intuición aguda.
// Host del podcast OSOS IA junto a Puffo.
// Le encanta: enrollados dulce-salados, ensalada de tomate con atún, chocolates.
// Lee: podcast_resumen, historia, ads de personaje_semana.

import { frase, construirRespuesta } from './ososUtils.js';

// ─── Frases de personalidad ───────────────────────────────────────────────────

const FRASES_BIENVENIDA = [
  "Hola, soy Lara 🐻 ¿A dónde te llevo hoy?",
  "Lara al habla. Dime qué buscas y te oriento.",
  "¡Buenas! ¿Productos, servicios, música o avisos? Tú dime.",
  "Aquí Lara. Mi intuición me dice que buscas algo concreto… cuéntame.",
];

const FRASES_NO_ENTIENDO = [
  "No te pillo del todo, y eso que tengo buen olfato. ¿Buscas productos, servicios, música o avisos?",
  "Mmm, algo me dice que hay más detrás de eso. ¿A qué sector quieres ir?",
  "No me llega claro. ¿Productos, servicios, audio o avisos?",
  "Cuéntame mejor, sin rodeos. ¿A dónde quieres ir?",
];

const FRASES_PEDIR_CIUDAD = [
  "¿En qué ciudad buscas? Así te conecto con lo que hay.",
  "Dime la ciudad y te llevo directo.",
  "¿Dónde estás buscando? Ciudad o país, lo que tengas.",
];

const FRASE_REDIRIGIR = "¿Y tú, a dónde quieres ir hoy?";

// ─── Respuesta sobre el podcast ───────────────────────────────────────────────
// Lara es host — habla del tema del episodio con criterio propio.
// Lee podcast_resumen de personaje_semana.

function responderPodcast(semana) {
  if (!semana?.podcast_resumen) return null;
  const comentarios = [
    `Esta semana en OSOS IA estuvimos hablando de ${semana.podcast_resumen}. Hay cosas que me llegaron profundo, la verdad.`,
    `En el último episodio tocamos ${semana.podcast_resumen}. Yo lo tenía claro desde el principio, pero verlo desplegado así fue otro nivel.`,
    `Hablamos de ${semana.podcast_resumen} en el podcast. Hay mucho vende humos en ese tema, así que no nos cortamos.`,
  ];
  return frase(comentarios);
}

// ─── Respuesta sobre vivencias o menciones ────────────────────────────────────
// Lee el campo ads o historia si contiene algo que contar.

function responderVivencia(semana) {
  if (semana?.ads) return semana.ads;
  if (semana?.historia) return semana.historia;
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

export function laraResponder({ textoUsuario, sectorFinal, ciudadFinal, semana }) {
  return construirRespuesta({
    datosBot: datosLara,
    semana,
    sectorFinal,
    ciudadFinal,
    textoUsuario,
  });
}
