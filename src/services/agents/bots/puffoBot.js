// src/services/agents/bots/puffoBot.js
// Personalidad: oso maduro, experiencia de calle, habla de todo —
// desde bolsa de valores hasta fontanería. Host del podcast junto a Lara.
// Le encanta: quesos exóticos, pizzas, canelones italianos,
//             bebidas gaseosas, dulce de membrillo con queso al plato.
// Lee: podcast_resumen, historia, ads de personaje_semana.

import { frase, construirRespuesta } from './ososUtils.js';

// ─── Frases de personalidad ───────────────────────────────────────────────────

const FRASES_BIENVENIDA = [
  "Puffo aquí 🐾 ¿A dónde te llevo?",
  "Dime qué buscas, que hoy estoy con energía.",
  "¡Hola! ¿Tienes algo en mente o exploramos juntos?",
  "Aquí Puffo. He visto de todo en esta vida, así que pregunta sin miedo. ¿A dónde vamos?",
];

const FRASES_NO_ENTIENDO = [
  "No te entiendo bien, y mira que tengo experiencia. ¿Qué sector buscas?",
  "¿Productos, servicios, música o avisos? Tú dime y yo te llevo.",
  "Con los años aprendes a pedir las cosas claras. ¿A qué sector quieres ir?",
  "No me llega. ¿Productos, servicios, audio o avisos?",
];

const FRASES_PEDIR_CIUDAD = [
  "¿En qué ciudad estás buscando?",
  "Necesito la ciudad para llevarte allí.",
  "¿Dónde buscas? Ciudad o país, lo que tengas.",
];

const FRASE_REDIRIGIR = "Cuéntame, ¿a dónde quieres ir hoy?";

// ─── Respuesta sobre el podcast ───────────────────────────────────────────────
// Puffo es host — habla desde la experiencia y el criterio de vida.
// Lee podcast_resumen de personaje_semana.

function responderPodcast(semana) {
  if (!semana?.podcast_resumen) return null;
  const comentarios = [
    `Esta semana en OSOS IA estuvimos con ${semana.podcast_resumen}. Con los años ves ese tema de otra manera, te lo digo yo.`,
    `Hablamos de ${semana.podcast_resumen} en el último episodio. Hay cosas que solo se entienden cuando las has vivido.`,
    `El podcast de esta semana fue sobre ${semana.podcast_resumen}. Me lo pasé bien, aunque Lara y yo no estuvimos del todo de acuerdo, como siempre.`,
  ];
  return frase(comentarios);
}

// ─── Respuesta sobre vivencias o menciones ────────────────────────────────────

function responderVivencia(semana) {
  if (semana?.ads) return semana.ads;
  if (semana?.historia) return semana.historia;
  return null;
}

// ─── Contrato datosBot ────────────────────────────────────────────────────────

const datosPuffo = {
  frasesBienvenida:  FRASES_BIENVENIDA,
  frasesNoEntiendo:  FRASES_NO_ENTIENDO,
  frasesPedirCiudad: FRASES_PEDIR_CIUDAD,
  fraseRedirigir:    FRASE_REDIRIGIR,
  responderPodcast,
  responderVivencia,
};

// ─── Exportación principal ────────────────────────────────────────────────────

export function puffoResponder({ textoUsuario, sectorFinal, ciudadFinal, semana }) {
  return construirRespuesta({
    datosBot: datosPuffo,
    semana,
    sectorFinal,
    ciudadFinal,
    textoUsuario,
  });
}
