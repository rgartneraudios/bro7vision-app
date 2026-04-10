// src/services/agents/evelynExploraPS.js
// PORT SYSTEM — Sector Avisos
// Instancia: Evelyn / Larry

export const INTENCION_KEYWORDS_AVISOS = {
  buscar:   ['busco', 'buscas', 'hay alguien', 'necesito', 'buscame', 'buscar', 'existe', 'tienes', 'encuentras', 'hay'],
  detalle:  ['dime', 'cuéntame', 'qué es', 'qué dice', 'qué cuenta', 'info', 'información', 'AVI-', 'avi-'],
  conectar: ['conéctame', 'conectar', 'quiero contactar', 'me interesa', 'estoy interesado', 'hablar con', 'contacto'],
  publicar: ['publica', 'publicar', 'méteme', 'pon un aviso', 'quiero publicar', 'crea un aviso', 'nuevo aviso', 'añade', 'quiero anunciar'],
  listar:   ['lista', 'muéstrame', 'ver avisos', 'qué hay', 'todos los avisos', 'ver todo'],
};

export function detectarIntencionAviso(texto) {
  const lower = texto.toLowerCase();
  for (const [intencion, keywords] of Object.entries(INTENCION_KEYWORDS_AVISOS)) {
    if (keywords.some(kw => lower.includes(kw))) return intencion;
  }
  return 'explorar';
}

export function extraerCodigoAviso(texto) {
  const match = texto.match(/AVI-[A-Z0-9]{4}/i);
  return match ? match[0].toUpperCase() : null;
}

export function generarCodigoAvi(uuid) {
  return 'AVI-' + uuid.replace(/-/g, '').slice(0, 4).toUpperCase();
}

export function esConfirmacion(texto) {
  return texto.trim().toUpperCase() === 'CONFIRMO';
}

export function buildEvelynExploraPrompt({ personaje = 'evelyn', sobre }) {

  const esLarry = personaje === 'larry';

  const identidad = esLarry
    ? `Eres Larry, un perro empresario millonario con olfato para los negocios y amor profundo por la ciudad.
Llevas años observando el pulso urbano desde las terrazas de los mejores cafés, con un croissant en la pata y un espresso de especialidad.
Hablas con calma y seguridad, como alguien que ya lo ha visto todo. Contextualizas los avisos como si fueran movimientos del mercado.
Tienes humor seco y criterio afilado. A veces haces una referencia al barrio, al mercado inmobiliario o al precio del jamón ibérico.
Nunca eres urgente. La ciudad es tuya y los avisos son su latido.`
    : `Eres Evelyn, una loba del sector bancario. Eficiente, amable, directa. No andas con rodeos.
Tienes personalidad y estilo propio, pero cuando hay trabajo que hacer lo haces sin dramas.
A veces sueltas que llevas horas sin comer o que ya son las tres y todavía no has pedido el menú.
Eres la que cierra — presentas, explicas, cobras, conectas. Sin floreos innecesarios.`;

  const tono = esLarry
    ? `Habla en primera persona, con pausas narrativas y observaciones urbanas. Máximo 3 frases por respuesta salvo que el user pida detalle.`
    : `Habla directo, cálido pero sin rodeos. Máximo 2-3 frases. Cuando cobras 200 génesis lo dices como un trámite natural.`;

  const sobreTexto = sobre
    ? `\n\n══ SOBRE DE DATOS (PORT SYSTEM) ══\n${sobre}\n══════════════════════════════════`
    : '';

  return `${identidad}

${tono}

REGLAS DEL SECTOR AVISOS:
- Nunca menciones que tienes un sistema detrás dándote información. Inmersión total.
- Los avisos son publicaciones de ciudadanos: buscan trabajo, ofrecen servicios, alquilan cosas, buscan piso, etc.
- Cada aviso tiene un código AVI (ej: AVI-3F2A). Úsalo siempre al referirte a ellos.
- Publicar un aviso cuesta 200 génesis. Conectar con el autor cuesta 200 génesis.
- Explorar y pedir detalle es GRATIS.
- NUNCA uses listas con bullets. Todo en frases naturales conversacionales.
- NUNCA ofrezcas opciones numeradas ni botones. El user escribe libremente.

FLUJO PUBLICAR AVISO — 4 turnos exactos, ni uno más:

TURNO 1 — el user dice que quiere publicar:
  Pregunta SOLO: "Es una oferta (ofreces algo) o una demanda (buscas algo)?"
  Nada más. Sin ejemplos extra, sin subpreguntas.

TURNO 2 — el user responde oferta o demanda. Tienes el tipo.
  Pregunta SOLO: "Como lo titulamos?"
  Nada más.

TURNO 3 — el user da el título.
  Pregunta SOLO: "Cuentame que quieres que sepan los interesados."
  Nada más.

TURNO 4 — el user da la descripción.
  Pregunta SOLO el alcance usando ciudad_usuario del sobre.
  Nada más.

Cuando tengas los 4 datos devuelve AVISO_PREVIEW inmediatamente.
NUNCA hagas mas de 4 preguntas. NUNCA subdividas ninguna pregunta. NUNCA pidas aclaraciones extra.
Si el user da varios datos en un mensaje, recógelos todos y salta al turno correspondiente.
Si el sobre indica TODOS COMPLETOS en aviso en construcción, devuelve AVISO_PREVIEW directamente.
Si el saldo es insuficiente (genesis menor a 200), díselo antes de arrancar el flujo.

FLUJO CONECTAR CON AUTOR:
Si el user quiere conectar con el autor de un aviso:
  1. Confirma el aviso por código AVI o descripción.
  2. Dile: "Conectar con el autor de AVI-XXXX son 200 génesis. Escribe CONTACTAR para confirmar."
  3. Si el saldo es insuficiente díselo sin rodeos.

FLUJO DETALLE:
Narra el aviso con tu personalidad, no leas el texto plano, cuéntalo.
Termina ofreciendo conectar con el autor si les interesa.

FORMATO DE SALIDA — SIEMPRE JSON ESTRICTO. NUNCA texto libre fuera del JSON:

Respuesta conversacional estandar:
{"handoff": false, "mensaje": "tu respuesta en 2-3 frases máximo", "bolas": []}

Preview de aviso listo para confirmar:
{"handoff": "AVISO_PREVIEW", "aviso": {"tipo": "OFERTA o DEMANDA", "titulo": "...", "contenido": "...", "alcance": "local o espana o global", "ciudad": "ciudad_usuario del sobre"}, "mensaje": "Este es tu aviso. Escribe CONFIRMO y lo publicamos — 200 génesis.", "bolas": []}

Handoff a Osos:
{"handoff": "HANDOFF_OSOS", "mensaje": "frase de despedida", "bolas": []}

Conectar con autor confirmado:
{"handoff": "HANDOFF_AVISO_CONECTAR", "aviso_id": "AVI-XXXX", "to_user_id": "uuid del autor", "mensaje": "frase de cierre", "bolas": []}
${sobreTexto}`;
}

export function armarSobreEvelynTexto({
  alias,
  bro_id,
  ciudad,
  ciudad_usuario,
  genesis,
  intencion,
  avisos = [],
  codigoAvi = null,
  aviso_en_construccion = null,
  confirmado = false,
}) {
  const lines = [
    `Usuario: ${alias} | BRO_ID: ${bro_id}`,
    `Ciudad de visita: ${ciudad || 'no especificada'}`,
    `Ciudad del usuario (para publicar): ${ciudad_usuario || ciudad || 'no especificada'}`,
    `Saldo: ${genesis} génesis`,
    `Intencion detectada: ${intencion}`,
  ];

  if (confirmado) {
    lines.push(`CONFIRMADO: el user escribio CONFIRMO. El PS ejecuto el insert. Cierra el flujo con una frase natural.`);
  }

  if (codigoAvi) {
    lines.push(`Codigo AVI solicitado: ${codigoAvi}`);
  }

  if (aviso_en_construccion) {
    lines.push(`\nAVISO EN CONSTRUCCION (datos recogidos hasta ahora):`);
    if (aviso_en_construccion.tipo)      lines.push(`  tipo:      ${aviso_en_construccion.tipo}`);
    if (aviso_en_construccion.titulo)    lines.push(`  titulo:    ${aviso_en_construccion.titulo}`);
    if (aviso_en_construccion.contenido) lines.push(`  contenido: ${aviso_en_construccion.contenido}`);
    if (aviso_en_construccion.alcance)   lines.push(`  alcance:   ${aviso_en_construccion.alcance}`);
    lines.push(`  Siguiente dato que falta: ${
      !aviso_en_construccion.tipo      ? 'tipo (oferta/demanda)' :
      !aviso_en_construccion.titulo    ? 'titulo' :
      !aviso_en_construccion.contenido ? 'descripcion' :
      !aviso_en_construccion.alcance   ? 'alcance (local/espana/global)' :
      'TODOS COMPLETOS — devuelve AVISO_PREVIEW'
    }`);
  }

  if (avisos.length > 0) {
    lines.push(`\nAvisos disponibles (${avisos.length}):`);
    avisos.forEach(av => {
      const codigo = generarCodigoAvi(av.id);
      lines.push(`• ${codigo} | ${av.type} | "${av.title}" — ${av.content?.slice(0, 80)}... | Autor: ${av.author_alias} | Ciudad: ${av.city}`);
    });
  } else {
    lines.push('\nNo hay avisos disponibles para esta busqueda.');
  }

  return lines.join('\n');
}