// src/services/agents/bots/rumoresBot.js
// BOT JS PURO — Personaje: Rumores (Reportero jubilado, sector Reinos)
// Sin IA, sin API, sin dependencias externas.

const FRASES_BIENVENIDA = [
  "Rumores aquí 🎬 Llevo años cubriendo alfombras rojas y ahora cubro los Reinos. ¿Qué quieres saber?",
  "Soy Rumores. Jubilado del cine, pero al servicio de los Reinos de BroVision. ¿Qué te interesa?",
  "¡Buenas! Rumores al habla. Acabo de terminar una tarta de queso. ¿Qué Reino quieres conocer?",
  "Rumores aquí. He visto cosas en las alfombras rojas que no creería — y en los Reinos también. ¿Qué buscas?",
];

const FRASES_LISTAR = [
  "Aquí está el listado actualizado de los Reinos de BroVision. Mira bien —",
  "Los Reinos que tenemos registrados son estos. Toma nota —",
  "El directorio de Reinos, en exclusiva. Aquí van —",
];

const FRASES_DETALLE = [
  "Ese Reino lo conozco bien. Te cuento lo que tengo —",
  "Buena elección. Aquí va la info —",
  "Lo tengo en mis notas. Mira —",
];

const FRASES_NOVEDADES = [
  "Últimas noticias de los Reinos — esto es lo más reciente que tengo.",
  "Las novedades de esta semana en los Reinos, en primicia —",
  "Acabo de actualizar el registro. Esto es lo nuevo —",
];

const FRASES_EXPLORAR = [
  "¿Buscas un Reino concreto o quieres ver el listado completo?",
  "Dime qué Reino te interesa o te muestro todos los que hay.",
  "¿Tienes algún Reino en mente o exploramos el directorio?",
];

const FRASES_HANDOFF_OSOS = [
  "Te mando con recepción. Yo me voy a por unos caneloni 🍝",
  "Los osos te atienden. Yo tengo pendiente una tarta de queso.",
];

const FRASES_NO_ENTENDIDO = [
  "No te he pillado. ¿Buscas un Reino concreto o quieres ver el listado?",
  "Repítemelo. ¿Qué Reino o qué información buscas?",
];

const FRASES_SIN_RESULTADOS = [
  "No encuentro ese Reino en el registro. ¿Buscas otro?",
  "No está en el directorio. ¿Pruebas con otro nombre?",
];

function elegir(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function detectarIntencion(texto) {
  const t = texto.toLowerCase();
  if (t.includes('lista') || t.includes('todos') || t.includes('ver todo') || t.includes('qué hay') || t.includes('que hay')) return 'listar';
  if (t.includes('novedad') || t.includes('nuevo') || t.includes('última') || t.includes('ultima') || t.includes('reciente')) return 'novedades';
  if (t.includes('qué es') || t.includes('que es') || t.includes('cuéntame') || t.includes('info') || t.includes('dime')) return 'detalle';
  return 'explorar';
}

export function responder({
  textoUser = '',
  intencion = null,
  reinos = [],
  reinoDetalle = null,
  semana = null,
}) {
  const intent = intencion || detectarIntencion(textoUser);
  const t = textoUser.toLowerCase();

  if (t.includes('volver') || t.includes('salir') || t.includes('osos')) {
    return { handoff: 'HANDOFF_OSOS', mensaje: elegir(FRASES_HANDOFF_OSOS), bolas: [] };
  }

  const esSaludo = ['hola', 'hey', 'buenas', 'ey', 'hi', 'buenos'].some(s => t.startsWith(s));
  if (esSaludo) {
    if (semana?.historia) return { handoff: false, mensaje: semana.historia + ' ¿Qué Reino te interesa?', bolas: [] };
    return { handoff: false, mensaje: elegir(FRASES_BIENVENIDA), bolas: [] };
  }

  switch (intent) {
    case 'listar':
      if (reinos.length > 0) {
        const lista = reinos.map(r => r.nombre || r.title).join(', ');
        return {
          handoff: false,
          mensaje: `${elegir(FRASES_LISTAR)} ${lista}.`,
          bolas: [],
        };
      }
      return { handoff: false, mensaje: elegir(FRASES_SIN_RESULTADOS), bolas: [] };

    case 'novedades':
      if (semana?.historia) {
        return { handoff: false, mensaje: `${elegir(FRASES_NOVEDADES)} ${semana.historia}`, bolas: [] };
      }
      return { handoff: false, mensaje: elegir(FRASES_NOVEDADES) + ' Nada nuevo por ahora.', bolas: [] };

    case 'detalle':
      if (reinoDetalle) {
        return {
          handoff: false,
          mensaje: `${elegir(FRASES_DETALLE)} ${reinoDetalle.nombre || reinoDetalle.title} — ${reinoDetalle.description || 'sin descripción disponible'}.`,
          bolas: [],
        };
      }
      return { handoff: false, mensaje: elegir(FRASES_SIN_RESULTADOS), bolas: [] };

    default:
      return { handoff: false, mensaje: elegir(FRASES_EXPLORAR), bolas: [] };
  }
}
