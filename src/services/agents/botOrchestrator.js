// src/services/agents/botOrchestrator.js
// Orquestador de bots JS puros. Solo modo osos activo — el resto tiene hooks propios.

// ─── Helper: normalizar handoff ───────────────────────────────────────────────

function normalizarHandoff(resultado, extraData = {}) {
  if (!resultado.handoff) return resultado;
  if (typeof resultado.handoff === 'string') {
    return {
      ...resultado,
      handoffData: { agente: resultado.handoff, ...extraData },
      handoff: true,
    };
  }
  return {
    ...resultado,
    handoffData: { ...resultado.handoffData, ...extraData },
  };
}

// ─── Helper: contenido update ─────────────────────────────────────────────────

async function cargarUpdate(supabase, personaje_id) {
  if (!supabase || !personaje_id) return null;
  try {
    const { data } = await supabase
      .from('personaje_update')
      .select('*')
      .eq('personaje_id', personaje_id.toLowerCase())
      .limit(1)
      .maybeSingle();
    return data || null;
  } catch {
    return null;
  }
}

// ─── Modo Osos ────────────────────────────────────────────────────────────────

async function modoOsos({ textoUsuario, oso_id, sectorFinal, ciudadFinal, actoActual, ramaActual, supabase }) {
  const id     = (oso_id || 'lara').toLowerCase();
  const update = await cargarUpdate(supabase, id);

  const fallbacks = [
    '¿A qué sector quieres ir? Dime y te llevo.',
    'Dime qué buscas y te oriento.',
    '¿Productos, servicios, audio o avisos?',
  ];
  const resultado = { mensaje: fallbacks[Math.floor(Math.random() * fallbacks.length)], handoff: false };

  return normalizarHandoff(resultado, { oso_id: resultado.oso_id });
}

// ─── Orquestador principal ────────────────────────────────────────────────────

export async function botOrchestrator({
  mode,
  textoUsuario,
  // OSOS
  oso_id, sectorFinal, ciudadFinal, actoActual, ramaActual,
  // Infra
  supabase,
}) {
  switch (mode) {
    case 'osos': return modoOsos({ textoUsuario, oso_id, sectorFinal, ciudadFinal, actoActual, ramaActual, supabase });
    default:     return { mensaje: '...', handoff: false };
  }
}
