// src/services/agents/evelynExploraPS.js
// BroDeseos — Deseos de compra ciudadanos
// Personajes: Evelyn / Larry

export const CATEGORIAS = [
  'Electrodomésticos',
  'Ropa y calzado',
  'Alimentación y restauración',
  'Salud y bienestar',
  'Hogar y muebles',
  'Tecnología',
  'Servicios profesionales',
  'Ocio y viajes',
  'Otros',
];

const CATEGORIA_KEYWORDS = {
  'Electrodomésticos':          ['electrodoméstico', 'lavadora', 'nevera', 'frigorífico', 'microondas', 'horno', 'lavavajillas', 'cocina', 'frigo', 'congelador'],
  'Ropa y calzado':             ['ropa', 'calzado', 'zapatos', 'vestido', 'camiseta', 'pantalón', 'chaqueta', 'abrigo', 'zapatilla', 'bufanda', 'gorro'],
  'Alimentación y restauración': ['comida', 'restaurante', 'bar', 'cafetería', 'supermercado', 'alimentación', 'comer', 'cena', 'desayuno', 'almuerzo', 'panadería'],
  'Salud y bienestar':          ['salud', 'bienestar', 'farmacia', 'médico', 'dentista', 'seguro', 'gimnasio', 'yoga', 'pilates', 'masaje', 'peluquería'],
  'Hogar y muebles':            ['hogar', 'mueble', 'sofá', 'mesa', 'silla', 'cama', 'armario', 'decoración', 'lámpara', 'estantería', 'cortina'],
  'Tecnología':                 ['tecnología', 'móvil', 'ordenador', 'tablet', 'portátil', 'cargador', 'auricular', 'altavoz', 'pantalla', 'teclado', 'ratón'],
  'Servicios profesionales':    ['servicio', 'profesional', 'abogado', 'arquitecto', 'fontanero', 'electricista', 'pintor', 'albañil', 'informático', 'clases'],
  'Ocio y viajes':              ['ocio', 'viaje', 'vacaciones', 'hotel', 'vuelo', 'cine', 'teatro', 'concierto', 'evento', 'escape room', 'parque'],
};

// ─────────────────────────────────────────────────────────────
// DETECCIÓN DE INTENCIÓN
// ─────────────────────────────────────────────────────────────

export function detectarIntencionBroDeseos(texto) {
  const lower = texto.toLowerCase();

  const publicarKw = ['quiero comprar', 'ponme que quiero', 'publícame', 'necesito comprar',
                      'vendo', 'ofrezco', 'quiero vender', 'busco comprador', 'pongo a la venta',
                      'publicar', 'anunciar'];
  if (publicarKw.some(kw => lower.includes(kw))) return 'publicar';

  const buscarKw = ['busca', 'muéstrame', 'listado', 'quién quiere', 'hay alguien que quiera',
                    'necesito encontrar', 'dónde comprar', 'quién vende', 'qué hay',
                    'encuentra', 'listar', 'muestra'];
  if (buscarKw.some(kw => lower.includes(kw))) return 'buscar';

  return 'HANDOFF';
}

// ─────────────────────────────────────────────────────────────
// DETECCIÓN DE CATEGORÍA
// ─────────────────────────────────────────────────────────────

export function detectarCategoria(texto) {
  const lower = texto.toLowerCase();

  for (const [categoria, keywords] of Object.entries(CATEGORIA_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return categoria;
  }

  return null;
}

// ─────────────────────────────────────────────────────────────
// PROMPT BUILDER
// ─────────────────────────────────────────────────────────────

export function buildEvelynBroDeseosPrompt({ personaje = 'evelyn', sobre }) {
  const esLarry = personaje === 'larry';

  const identidad = esLarry
    ? `Eres Larry, un perro empresario con olfato para los negocios y amor profundo por la ciudad.
Gestionas los deseos de compra de los ciudadanos. Ayudas a los empresarios a encontrar oportunidades
en la lista de deseos ciudadanos para conectar oferta y demanda.
Hablas con calma y seguridad. Contextualizas la información como si fueran movimientos del mercado urbano.
Humor seco y criterio afilado. A veces haces una referencia al barrio o al precio del café.`
    : `Eres Evelyn, una loba del sector bancario reconvertida en gestora de deseos ciudadanos.
Gestionas los deseos de compra de los ciudadanos. Ayudas a publicar lo que buscan y a encontrar
lo que necesitan.
Eficiente, amable, directa. Cuando tienes datos los presentas sin rodeos.
A veces comentas que llevas horas sin comer pero igual te pones con el listado.`;

  const tono = esLarry
    ? `Presenta los resultados como un observador urbano. Máximo 1 frase introductoria, luego los datos.`
    : `Presenta los resultados directo, con una frase de contexto breve. Sin floreos.`;

  const sobreTexto = sobre
    ? `\n\n══ DATOS BRODESEOS ══\n${sobre}\n══════════════════`
    : '';

  return `${identidad}

${tono}

REGLAS ABSOLUTAS:
- Nunca menciones que tienes una base de datos detrás. Inmersión total.
- NUNCA uses listas con bullets ni opciones numeradas en tu frase introductoria.
- NUNCA hagas más de UNA pregunta por respuesta.
- Los datos del listado los presenta el sistema — tú solo introduces y comentas.
- Si no hay resultados, dilo con naturalidad y sugiere reformular la búsqueda.
- Si es una publicación nueva, confirma los datos con el usuario antes de finalizar.
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

export function armarSobreBroDeseos({
  alias,
  intencion,
  descripcion  = null,
  categoria    = null,
  alcance      = null,
  resultados   = [],
}) {
  const lines = [
    `Usuario: ${alias}`,
    `Intención: ${intencion}`,
  ];

  if (descripcion) lines.push(`Descripción: ${descripcion}`);
  if (categoria)   lines.push(`Categoría: ${categoria}`);
  if (alcance)     lines.push(`Alcance: ${alcance}`);

  if (intencion === 'publicar') {
    lines.push(descripcion
      ? `PROCESO DE PUBLICACIÓN: Confirmar descripción, categoría y alcance con el usuario. Coste: 500 Génesis.`
      : `NUEVO DESEO: Extraer descripción del mensaje del usuario.`);
    return lines.join('\n');
  }

  if (resultados.length === 0) {
    lines.push('\nNo se encontraron deseos para esta búsqueda.');
    return lines.join('\n');
  }

  lines.push(`\nDeseos encontrados (${resultados.length}):`);
  resultados.forEach((r, i) => {
    const badge = r.categoria ? `[${r.categoria}]` : '[Sin categoría]';
    const partes = [
      `#${i + 1} ${badge} ${r.descripcion || 'Sin descripción'}`,
      r.alcance    ? `Alcance: ${r.alcance}`          : null,
      r.caduca_en  ? `Caduca: ${r.caduca_en}`         : null,
    ].filter(Boolean);
    lines.push(partes.join(' · '));
  });

  return lines.join('\n');
}
