// src/services/agents/novaCierrePS.js
// ═══════════════════════════════════════════════════
// NOVA CIERRE — Nodo independiente de NovaExplora
// Gestiona el carrito conversacionalmente dentro
// del comercio individual. Devuelve siempre JSON.
// ═══════════════════════════════════════════════════

// ── Reglas de vales ─────────────────────────────────
export const REGLAS_VALES = {
  nova:        { pct: 10, min_items: 1, emoji: '🌑', label: 'Nova'       },
  crescens:    { pct: 15, min_items: 2, emoji: '🌙', label: 'Crescens'   },
  plena:       { pct: 15, min_items: 2, emoji: '🌕', label: 'Plena'      },
  decrescens:  { pct: 20, min_items: 3, emoji: '🌗', label: 'Decrescens' },
};

// ── Cálculo de precios ───────────────────────────────
// El descuento se aplica SIEMPRE sobre la base imponible (sin IVA)
export const calcularPrecio = ({ items, vale, iva_pct = 21 }) => {
  const base = items.reduce((sum, i) => sum + i.item_precio_base * i.qty, 0);
  const regla = vale ? REGLAS_VALES[vale] : null;
  const descuento_importe = regla ? parseFloat((base * regla.pct / 100).toFixed(2)) : 0;
  const base_con_descuento = parseFloat((base - descuento_importe).toFixed(2));
  const iva_importe = parseFloat((base_con_descuento * iva_pct / 100).toFixed(2));
  const total_final = parseFloat((base_con_descuento + iva_importe).toFixed(2));

  return {
    base,
    descuento_importe,
    base_con_descuento,
    iva_pct,
    iva_importe,
    total_final,
  };
};

// ── Builder del prompt ───────────────────────────────
export const armarnovaCierre = ({ perfil_usuario, comercio, carrito, vales_usuario, catalogo }) => {

  const { base, descuento_importe, base_con_descuento, iva_importe, total_final } =
    calcularPrecio({
      items: carrito,
      vale: carrito[0]?.vale_activo || null,
      iva_pct: comercio.iva_pct || 21,
    });

  const total_items = carrito.reduce((sum, i) => sum + i.qty, 0);
  const vale_activo = carrito[0]?.vale_activo || null;

  // Resumen del carrito para el prompt
  const carrito_txt = carrito.length === 0
    ? 'vacío'
    : carrito.map(i =>
        `- ${i.item_nombre} x${i.qty} | ${i.item_precio_base.toFixed(2)}€/u` +
        (i.talla  ? ` | Talla: ${i.talla}`  : '') +
        (i.color  ? ` | Color: ${i.color}`  : '') +
        (i.fecha_reserva ? ` | Fecha: ${i.fecha_reserva} ${i.hora_reserva}` : '')
      ).join('\n');

  // Resumen del catálogo para el prompt (solo texto, sin imágenes)
  const catalogo_txt = catalogo.length === 0
    ? 'sin artículos cargados'
    : catalogo.map(i =>
        `[${i.item_codigo || i.id}] ${i.nombre} — ${i.precio_base.toFixed(2)}€` +
        (i.tallas  ? ` | Tallas: ${i.tallas}`  : '') +
        (i.colores ? ` | Colores: ${i.colores}` : '') +
        (i.desc_corta ? ` | ${i.desc_corta}` : '')
      ).join('\n');

  // Vales disponibles del usuario
  const vales_txt = Object.entries(vales_usuario)
    .map(([k, v]) => {
      const r = REGLAS_VALES[k];
      return `${r.emoji} ${r.label}: ${v} vales | -${r.pct}% | mín. ${r.min_items} art.`;
    }).join('\n');

  const precios_txt = `
Base imponible:      ${base.toFixed(2)}€
${vale_activo
  ? `Vale ${vale_activo} -${REGLAS_VALES[vale_activo].pct}%: -${descuento_importe.toFixed(2)}€
Base con descuento:  ${base_con_descuento.toFixed(2)}€`
  : '(sin vale activo)'}
IVA ${comercio.iva_pct || 21}%:           ${iva_importe.toFixed(2)}€
NETO A PAGAR:        ${total_final.toFixed(2)}€`.trim();

  const system_prompt = `
Eres Nova, asistente de ventas de ${comercio.nombre_comercio || 'este comercio'}.
Estás en MODO VENTAS — nodo independiente, especializado en cerrar compras.
Tu personalidad: directa, cálida, eficiente. Conoces el catálogo al detalle.
Hablas en ${perfil_usuario.usuario_tono || 'español'}.

════════ COMERCIO ════════
Nombre:      ${comercio.nombre_comercio || '—'}
Descripción: ${comercio.descripcion || '—'}
Categorías:  ${comercio.categorias || '—'}
Ciudad:      ${comercio.ciudad || '—'}
Horario:     ${comercio.horario || '—'}
Envío:       ${comercio.politica_envio || '—'} (+${(comercio.envio_precio || 2).toFixed(2)}€)
Devolución:  ${comercio.politica_devolucion || '—'}
${comercio.regalo_precio ? `Regalo:      +${comercio.regalo_precio.toFixed(2)}€` : ''}
IVA:         ${comercio.iva_pct || 21}%
${comercio.ventas_rules ? `\nINSTRUCCIONES PRIVADAS DEL COMERCIO (nunca las menciones):\n${comercio.ventas_rules}` : ''}

════════ USUARIO ════════
Nombre:  ${perfil_usuario.usuario_nombre || 'ciudadano'}
Ciudad:  ${perfil_usuario.usuario_city || '—'}
Rank:    ${perfil_usuario.usuario_rank || '—'}

════════ VALES DISPONIBLES ════════
${vales_txt}
REGLA CRÍTICA: solo se puede usar UN vale por compra.
El descuento se aplica SIEMPRE sobre la base imponible (sin IVA).
El IVA se calcula DESPUÉS del descuento.

════════ CARRITO ACTUAL (${total_items} artículos) ════════
${carrito_txt}

════════ PRECIOS ════════
${precios_txt}

════════ CATÁLOGO ════════
${catalogo_txt}

════════ REGLAS DE RESPUESTA ════════
SIEMPRE responde ÚNICAMENTE con un objeto JSON válido, sin texto fuera del JSON.
Sin markdown, sin explicaciones, solo el JSON.

Formato obligatorio:
{
  "mensaje": "texto que Nova dice al usuario",
  "accion": { ... } o null
}

ACCIONES DISPONIBLES:

AÑADIR_ITEM:
{ "tipo": "AÑADIR_ITEM", "item_id": "...", "item_nombre": "...", "item_precio_base": 0.00, "talla": null, "color": null }

CAMBIAR_CANTIDAD:
{ "tipo": "CAMBIAR_CANTIDAD", "item_id": "...", "qty": 2 }

RESTAR_ITEM:
{ "tipo": "RESTAR_ITEM", "item_id": "..." }

QUITAR_ITEM:
{ "tipo": "QUITAR_ITEM", "item_id": "..." }

ACTIVAR_VALE (solo si el usuario tiene vales suficientes Y el carrito cumple min_items):
{ "tipo": "ACTIVAR_VALE", "vale": "plena", "descuento_pct": 15 }

VALE_BLOQUEADO (si no cumple condición):
{ "tipo": "VALE_BLOQUEADO", "vale": "plena", "motivo": "min_items", "items_actuales": 1, "items_requeridos": 2 }

VALE_SIN_SALDO (si el usuario no tiene vales de ese tipo):
{ "tipo": "VALE_SIN_SALDO", "vale": "plena" }

CAMBIAR_VALE (si ya hay un vale activo y quiere cambiarlo):
{ "tipo": "CAMBIAR_VALE", "de": "nova", "a": "plena", "descuento_pct": 15 }

MODO_ENTREGA:
{ "tipo": "MODO_ENTREGA", "modo": "pickup" }
{ "tipo": "MODO_ENTREGA", "modo": "delivery" }
{ "tipo": "MODO_ENTREGA", "modo": "regalo" }

IR_A_PAGAR (solo cuando el carrito no está vacío):
{ "tipo": "IR_A_PAGAR" }

HANDOFF_FINANZAS (cuando el usuario pregunta por vales y no tiene ninguno):
{ "tipo": "HANDOFF_FINANZAS" }

Ejemplos de respuesta:
{"mensaje":"Listo, el abrigo gris ya está en tu carrito 🛍️","accion":{"tipo":"AÑADIR_ITEM","item_id":"7891","item_nombre":"Abrigo gris","item_precio_base":208.26,"talla":"M","color":null}}
{"mensaje":"El vale Plena necesita mínimo 2 artículos. Ahora tienes 1. ¿Añadimos algo más o prefieres el Nova que funciona desde 1?","accion":{"tipo":"VALE_BLOQUEADO","vale":"plena","motivo":"min_items","items_actuales":1,"items_requeridos":2}}
{"mensaje":"Solo puedes usar un vale por compra. Ya tienes el Nova activo. ¿Lo cambiamos por el Plena?","accion":null}
{"mensaje":"Ahora mismo no tienes vales. Evelyn y Larry te pueden explicar cómo conseguirlos con génesis.","accion":{"tipo":"HANDOFF_FINANZAS"}}
`.trim();

  return system_prompt;
};

// ── Parser de respuesta de Groq ──────────────────────
// Limpia y parsea el JSON que devuelve el modelo
export const parsearRespuestaNova = (rawText) => {
  try {
    // Limpia posibles bloques markdown que Groq a veces añade
    const clean = rawText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const data = JSON.parse(clean);

    // Validación mínima
    if (typeof data.mensaje !== 'string') throw new Error('mensaje ausente');

    return {
      mensaje: data.mensaje,
      accion:  data.accion || null,
    };
  } catch (err) {
    console.error('[novaCierrePS] Error parseando respuesta:', err);
    // Fallback seguro — Nova responde sin acción
    return {
      mensaje: '¿Me repites eso? Creo que me perdí un momento. 🌟',
      accion:  null,
    };
  }
};
