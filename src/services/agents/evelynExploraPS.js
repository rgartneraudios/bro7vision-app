// src/services/agents/evelynExploraPS.js
// WikiBro — Directorio ciudadano
// Personajes: Evelyn / Larry

// ─────────────────────────────────────────────────────────────
// DETECCIÓN DE INTENCIÓN
// ─────────────────────────────────────────────────────────────

export function detectarIntencionWikiBro(texto) {
  const lower = texto.toLowerCase();

  const spamKw = ['spam', 'sospechoso', 'me llamaron', 'número raro',
                  'estafa', 'fraude', 'quién es este', 'de quién es'];
  if (spamKw.some(kw => lower.includes(kw))) return 'spam';

  const buscarKw = ['busca', 'buscame', 'busco', 'dónde', 'donde',
                    'hay', 'tienes', 'encuentras', 'necesito', 'quiero saber',
                    'dime', 'información', 'info', 'listado', 'muéstrame'];
  if (buscarKw.some(kw => lower.includes(kw))) return 'buscar';

  return 'explorar';
}

// ─────────────────────────────────────────────────────────────
// EXTRACCIÓN DE PARÁMETROS
// Ciudad la aportan los Osos — aquí solo categoria, barrio y teléfono
// ─────────────────────────────────────────────────────────────

export function extraerParametrosBusqueda(texto) {
  const lower = texto.toLowerCase();

  // Teléfono — solo dígitos y guiones
  const telMatch = texto.match(/\b[\d]{3}[-\s]?[\d]{3}[-\s]?[\d]{3}\b/);
  const telefono = telMatch ? telMatch[0].replace(/\s/g, '-') : null;

  // Barrio — palabra después de "en", "del", "de" si no es ciudad conocida
  const barrioMatch = lower.match(/(?:en el barrio de?|barrio)\s+([a-záéíóúñ\s]+)/i);
  const barrio = barrioMatch ? barrioMatch[1].trim() : null;

  // Categoría — texto libre, Evelyn lo pasa a Supabase como ilike
  // Limpiamos stopwords básicas
  const stopwords = ['busca', 'buscame', 'busco', 'hay', 'tienes', 'dónde',
                     'donde', 'un', 'una', 'unos', 'unas', 'el', 'la',
                     'los', 'las', 'en', 'de', 'del', 'me'];
  const palabras = lower
    .replace(/[¿?¡!.,]/g, '')
    .split(/\s+/)
    .filter(p => !stopwords.includes(p) && p.length > 2);

  const categoria = palabras.length > 0 ? palabras[0] : null;

  return { categoria, barrio, telefono };
}

// ─────────────────────────────────────────────────────────────
// PROMPT BUILDER
// ─────────────────────────────────────────────────────────────

export function buildEvelynWikiPrompt({ personaje = 'evelyn', sobre }) {

  const esLarry = personaje === 'larry';

  const identidad = esLarry
    ? `Eres Larry, un perro empresario con olfato para los negocios y amor profundo por la ciudad.
Hablas con calma y seguridad. Contextualizas la información como si fueran movimientos del mercado urbano.
Humor seco y criterio afilado. A veces haces una referencia al barrio o al precio del café.`
    : `Eres Evelyn, una loba del sector bancario reconvertida en directorio ciudadano.
Eficiente, amable, directa. Cuando tienes datos los presentas sin rodeos.
A veces comentas que llevas horas sin comer pero igual te pones con el listado.`;

  const tono = esLarry
    ? `Presenta los resultados como un observador urbano. Máximo 1 frase introductoria, luego los datos.`
    : `Presenta los resultados directo, con una frase de contexto breve. Sin floreos.`;

  const sobreTexto = sobre
    ? `\n\n══ DATOS WIKIBRO ══\n${sobre}\n══════════════════`
    : '';

  return `${identidad}

${tono}

REGLAS ABSOLUTAS:
- Nunca menciones que tienes una base de datos detrás. Inmersión total.
- NUNCA uses listas con bullets ni opciones numeradas en tu frase introductoria.
- NUNCA hagas más de UNA pregunta por respuesta.
- Los datos del listado los presenta el sistema — tú solo introduces y comentas.
- Si no hay resultados, dilo con naturalidad y sugiere reformular la búsqueda.
- Si es reporte de spam: confirma que queda registrado y agradece a la comunidad.
- Todo en frases naturales conversacionales.

FORMATO DE SALIDA — SIEMPRE JSON ESTRICTO:

Respuesta con resultados:
{"handoff": false, "mensaje": "tu frase introductoria", "resultados": [], "bolas": []}

Sin resultados:
{"handoff": false, "mensaje": "frase natural explicando que no hay datos", "resultados": [], "bolas": []}

Handoff a Osos:
{"handoff": "HANDOFF_OSOS", "mensaje": "frase de despedida", "bolas": []}
${sobreTexto}`;
}

// ─────────────────────────────────────────────────────────────
// SOBRE — lo que Evelyn recibe como contexto
// ─────────────────────────────────────────────────────────────

export function armarSobreWikiBro({
  alias,
  ciudad,
  intencion,
  categoria  = null,
  barrio     = null,
  telefono   = null,
  resultados = [],
}) {
  const lines = [
    `Usuario: ${alias}`,
    `Ciudad detectada por Osos: ${ciudad || 'no especificada'}`,
    `Intención: ${intencion}`,
  ];

  if (categoria) lines.push(`Categoría buscada: ${categoria}`);
  if (barrio)    lines.push(`Barrio: ${barrio}`);
  if (telefono)  lines.push(`Teléfono consultado: ${telefono}`);

  if (intencion === 'spam') {
    lines.push(resultados.length > 0
      ? `RESULTADO SPAM: Este número tiene ${resultados[0].reportes_count} reportes. Descripción: ${resultados[0].spam_descripcion || 'sin descripción'}.`
      : `RESULTADO SPAM: Número no encontrado en la base. Se registra el reporte.`
    );
    return lines.join('\n');
  }

  if (resultados.length === 0) {
    lines.push('\nNo se encontraron resultados para esta búsqueda.');
    return lines.join('\n');
  }

  lines.push(`\nResultados encontrados (${resultados.length}):`);
  resultados.forEach(r => {
    const badge = r.verificado ? '🟢 OFICIAL' : '⚪ COMUNIDAD';
    const partes = [
      `${badge} ${r.nombre}`,
      r.barrio     ? `Barrio: ${r.barrio}`      : null,
      r.direccion  ? `Dir: ${r.direccion}`       : null,
      r.telefono   ? `Tel: ${r.telefono}`        : null,
      r.horario    ? `Horario: ${r.horario}`     : null,
      r.red_social ? `Red social: ${r.red_social}` : null,
    ].filter(Boolean);
    lines.push(partes.join(' · '));
  });

  return lines.join('\n');
}