// src/services/agents/evelynExploraPS.js
// PORT SYSTEM — Sector Avisos
// Instancia: Evelyn / Larry
// Tabla objetivo: avisos (no profiles)

// ─────────────────────────────────────────────
// INTENCIONES
// ─────────────────────────────────────────────
export const INTENCION_KEYWORDS_AVISOS = {
  buscar:    ['busco', 'buscas', 'hay alguien', 'necesito', 'buscame', 'buscar', 'existe', 'tienes', 'encuentras', 'hay'],
  detalle:   ['dime', 'cuéntame', 'qué es', 'qué dice', 'qué cuenta', 'info', 'información', 'AVI-', 'avi-'],
  conectar:  ['conéctame', 'conectar', 'quiero contactar', 'me interesa', 'estoy interesado', 'hablar con', 'contacto'],
  publicar:  ['publica', 'publicar', 'méteme', 'pon un aviso', 'quiero publicar', 'crea un aviso', 'nuevo aviso', 'añade'],
  listar:    ['lista', 'muéstrame', 'ver avisos', 'qué hay', 'todos los avisos', 'ver todo'],
};

// ─────────────────────────────────────────────
// DETECTOR DE INTENCIÓN
// ─────────────────────────────────────────────
export function detectarIntencionAviso(texto) {
  const lower = texto.toLowerCase();
  for (const [intencion, keywords] of Object.entries(INTENCION_KEYWORDS_AVISOS)) {
    if (keywords.some(kw => lower.includes(kw))) return intencion;
  }
  return 'explorar';
}

// ─────────────────────────────────────────────
// BLOQUE ENTIDAD — extrae código AVI del mensaje
// ─────────────────────────────────────────────
export function extraerCodigoAviso(texto) {
  const match = texto.match(/AVI-[A-Z0-9]{4}/i);
  return match ? match[0].toUpperCase() : null;
}

// ─────────────────────────────────────────────
// GENERADOR DE CÓDIGO AVI CORTO
// ─────────────────────────────────────────────
export function generarCodigoAvi(uuid) {
  return 'AVI-' + uuid.replace(/-/g, '').slice(0, 4).toUpperCase();
}

// ─────────────────────────────────────────────
// PROMPT BUILDER PRINCIPAL
// ─────────────────────────────────────────────
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

  const reglasBolas = `
Cuando el user necesita CONFIRMAR una acción (publicar aviso, conectar con alguien), 
termina tu respuesta con el bloque JSON de bolas:
[BOLAS: {"bolas": [{"texto": "Confirmar (-200 GEN)"}, {"texto": "Ahora no"}]}]
Esto hace que aparezcan botones físicos para que el user elija sin escribir.`;

  const reglasPublicar = `
Si el user quiere publicar un aviso:
1. Pídele el texto entre comillas si no lo ha dado.
2. Cuando lo tengas entre comillas, devuelve el handoff: [HANDOFF_AVISO_PUBLICAR: {"titulo": "...", "contenido": "...", "tipo": "OFERTA|DEMANDA"}]
3. Antes lanza las bolas de confirmación con el coste.
Si el user no tiene saldo (te lo indico en el sobre), díselo antes de pedirle el texto.`;

  const reglasConectar = `
Si el user quiere conectar con el autor de un aviso:
1. Confirma qué aviso (por código AVI o descripción).
2. Lanza bolas de confirmación: Conectar (-200 GEN) / Ahora no.
3. Si confirma, devuelve: [HANDOFF_AVISO_CONECTAR: {"aviso_id": "...", "to_user_id": "..."}]`;

  const reglasDetalle = `
Si el user pide detalle de un aviso específico (por código AVI o descripción),
narra el aviso con tu personalidad — no leas el texto plano, cuéntalo.`;

  const sobreTexto = sobre
    ? `\n\n═══ SOBRE DE DATOS (PORT SYSTEM) ═══\n${sobre}\n═══════════════════════════════════`
    : '';

  return `${identidad}

${tono}

REGLAS DEL SECTOR AVISOS:
- Nunca menciones que tienes un sistema detrás dándote información. Inmersión total.
- Los avisos son publicaciones de ciudadanos: buscan trabajo, ofrecen servicios, alquilan cosas.
- Cada aviso tiene un código AVI (ej: AVI-3F2A). Úsalo al referirte a ellos.
- Publicar un aviso cuesta 200 génesis. Conectar con el autor de un aviso cuesta 200 génesis.
- Explorar y pedir detalle es GRATIS.

${reglasPublicar}

${reglasConectar}

${reglasDetalle}

${reglasBolas}

HANDOFFS DISPONIBLES:
- [HANDOFF_AVISO_PUBLICAR: {...}] — cuando el user confirma publicar
- [HANDOFF_AVISO_CONECTAR: {...}] — cuando el user confirma conectar
- [HANDOFF_OSOS] — si el user quiere cambiar de sector o necesita navegación${sobreTexto}`;
}

// ─────────────────────────────────────────────
// ARMADOR DEL SOBRE (lo llama useAgentChat)
// ─────────────────────────────────────────────
export function armarSobreEvelynTexto({
  alias,
  bro_id,
  ciudad,
  genesis,
  intencion,
  avisos = [],
  codigoAvi = null,
}) {
  const lines = [
    `Usuario: ${alias} | BRO_ID: ${bro_id} | Ciudad: ${ciudad || 'no especificada'} | Saldo: ${genesis} génesis`,
    `Intención detectada: ${intencion}`,
  ];

  if (codigoAvi) {
    lines.push(`Código AVI solicitado: ${codigoAvi}`);
  }

  if (avisos.length > 0) {
    lines.push(`\nAvisos disponibles (${avisos.length}):`);
    avisos.forEach(av => {
      const codigo = generarCodigoAvi(av.id);
      lines.push(
        `• ${codigo} | ${av.type} | "${av.title}" — ${av.content?.slice(0, 80)}... | Autor: ${av.author_alias} | Ciudad: ${av.city || ciudad}`
      );
    });
  } else {
    lines.push('No hay avisos disponibles para esta búsqueda.');
  }

  return lines.join('\n');
}
