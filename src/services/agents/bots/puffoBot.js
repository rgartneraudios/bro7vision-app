// src/services/agents/bots/puffoBot.js
// Personalidad: oso maduro, experiencia de calle, habla de todo —
// desde bolsa de valores hasta fontanería. Host del podcast junto a Lara.
// Le encanta: quesos exóticos, pizzas, canelones italianos,
//             bebidas gaseosas, dulce de membrillo con queso al plato.
// Lee: podcast_resumen, historia, ads de personaje_update.

import { frase, construirRespuesta } from './ososUtils.js';

// ─── Frases de personalidad ───────────────────────────────────────────────────

const FRASES_BIENVENIDA = [
  "Puffo aquí 🐾 Dime, ¿a dónde te llevo hoy?",
  "¡Okey! Micrófono abierto — ¿qué buscas?",
  "¡Hola! ¿Tienes algo en mente o abrimos el debate juntos?",
  "Aquí Puffo. He escuchado de todo en esta vida, así que dime sin rodeos. ¿A dónde vamos?",
];

const FRASES_NO_ENTIENDO = [
  "Ajá... no te sigo del todo. ¿Productos, servicios, música o avisos? Dame el titular.",
  "Interesante... pero necesito más contexto. ¿A qué sector quieres ir?",
  "Te corto un segundo ahí. ¿Productos, servicios, audio o avisos? Eso primero.",
  "Ya, ya... pero el foco, ¿dónde está? ¿Qué sector buscas?",
];

const FRASES_PEDIR_CIUDAD = [
  "Fíjate, necesito un dato clave — ¿en qué ciudad buscas?",
  "Dime la ciudad. Sin eso no tengo contexto para llevarte allí.",
  "¿Dónde buscas? Ciudad o país — lo que tengas sobre la mesa.",
];

const FRASE_REDIRIGIR = "Dime, ¿a dónde quieres ir hoy? El micrófono sigue abierto. 🎙️";

// ─── Respuesta sobre el podcast ───────────────────────────────────────────────
// Puffo es host — habla desde la experiencia y el criterio de vida.
// Lee podcast_resumen de personaje_update.

function responderPodcast(update) {
  if (!update?.podcast_resumen) return null;
  const comentarios = [
    `Esta semana en OSOS IA estuvimos con ${update.podcast_resumen}. Con los años ves ese tema de otra manera, te lo digo yo.`,
    `Hablamos de ${update.podcast_resumen} en el último episodio. Hay cosas que solo se entienden cuando las has vivido.`,
    `El podcast de esta semana fue sobre ${update.podcast_resumen}. Me lo pasé bien, aunque Lara y yo no estuvimos del todo de acuerdo, como siempre.`,
  ];
  return frase(comentarios);
}

// ─── Respuesta sobre vivencias o menciones ────────────────────────────────────

function responderVivencia(update) {
  if (update?.ads) return update.ads;
  if (update?.historia) return update.historia;
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

export function puffoResponder({ textoUsuario, sectorFinal, ciudadFinal, update, actoActual, ramaActual }) {
  return construirRespuesta({
    datosBot: datosPuffo,
    update,
    sectorFinal,
    ciudadFinal,
    textoUsuario,
    actoActual,
    ramaActual,
  });
}