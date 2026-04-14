// src/services/agents/botOrchestrator.js
// Cerebro del sistema. Recibe mode + input + contexto → devuelve { mensaje, handoff, extras }
// Sin IA, sin API. Toda la lógica de negocio vive aquí, fuera del hook React.

import { laraResponder }  from './bots/laraBot';
import { titoResponder }  from './bots/titoBot';
import { puffoResponder } from './bots/puffoBot';
import { responder as novaResponder }      from './bots/novaBot';
import { responder as isabellaResponder }  from './bots/isabellaBot';
import { responder as prmaestroResponder } from './bots/prmaestroBot';
import { responder as mapacheResponder }   from './bots/mapacheBot';
import { responder as amiResponder }       from './bots/amiBot';
import { responder as orumamaResponder }   from './bots/orumamaBot';
import { responder as jaguarResponder }    from './bots/jaguarBot';
import { responder as rumoresResponder }   from './bots/rumoresBot';
import { responder as evelynResponder }    from './bots/evelynBot';
import { responder as larryResponder }     from './bots/larryBot';
import { generarCodigoAvi }               from './evelynExploraPS';
import { getKnowledgeBlock }              from '../../data/SystemKnowledge';
import { getMoonSuffix }                  from '../../utils/moonUtils';
import { responder as smisterioResponder } from './bots/smisterioBot';

// ─── Helper: contenido update ────────────────────────────────────────────────

async function cargarUpdate(supabase, personaje_id) {
  if (!supabase || !personaje_id) return null;
  try {
    const hoy = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('personaje_update')
      .select('*')
      .eq('personaje_id', personaje_id.toLowerCase())
      .lte('semana', hoy)
      .order('semana', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data || null;
  } catch {
    return null;
  }
}

// ─── Helper: consultar avisos ─────────────────────────────────────────────────

async function consultarAvisos(supabase, { ciudad, codigoAvi }) {
  if (!supabase) return [];
  try {
    let query = supabase
      .from('avisos')
      .select('id, type, title, content, author_alias, city, user_id, cost_to_reveal, expires_at')
      .gt('expires_at', new Date().toISOString());

    if (codigoAvi) {
      const { data: todos } = await query.limit(200);
      const encontrado = (todos || []).find(av => generarCodigoAvi(av.id) === codigoAvi);
      return encontrado ? [encontrado] : [];
    }

    if (ciudad && ciudad !== 'global') {
      query = query.or(`city.ilike.%${ciudad}%,city.eq.global`);
    }

    const { data } = await query.limit(20);
    return data || [];
  } catch {
    return [];
  }
}

// ─── Detectores de intención por sector ──────────────────────────────────────

function detectarIntencionNova(texto) {
  const t = texto.toLowerCase();
  if (t.includes('precio') || t.includes('cuánto') || t.includes('cuanto') || t.includes('cuesta') || t.includes('vale')) return 'precio';
  if (t.includes('dónde') || t.includes('donde') || t.includes('ubicación') || t.includes('ubicacion') || t.includes('dirección') || t.includes('llegar')) return 'ubicacion';
  if (t.includes('catálogo') || t.includes('catalogo') || t.includes('qué tiene') || t.includes('que tiene') || t.includes('stock')) return 'catalogo';
  if (t.includes('contacto') || t.includes('teléfono') || t.includes('telefono') || t.includes('horario') || t.includes('whatsapp')) return 'contacto';
  if (t.includes('qué es') || t.includes('que es') || t.includes('cuéntame') || t.includes('cuentame') || t.includes('info')) return 'descripcion';
  return 'explorar';
}

function detectarIntencionServicios(texto) {
  const t = texto.toLowerCase();
  if (t.includes('precio') || t.includes('cuánto') || t.includes('cuanto') || t.includes('sesión') || t.includes('sesion') || t.includes('tarifa')) return 'precio';
  if (t.includes('dónde') || t.includes('donde') || t.includes('ubicación') || t.includes('ubicacion') || t.includes('dirección')) return 'ubicacion';
  if (t.includes('contacto') || t.includes('teléfono') || t.includes('telefono') || t.includes('horario') || t.includes('cita') || t.includes('reserva')) return 'contacto';
  if (t.includes('qué es') || t.includes('que es') || t.includes('cuéntame') || t.includes('cuentame') || t.includes('info') || t.includes('quién es') || t.includes('quien es')) return 'descripcion';
  return 'explorar';
}

function detectarIntencionAudio(texto) {
  const t = texto.toLowerCase();
  if (t.includes('pon') || t.includes('play') || t.includes('escuchar') || t.includes('reproducir') || t.includes('ponme')) return 'play';
  if (t.includes('qué es') || t.includes('que es') || t.includes('cuéntame') || t.includes('info') || t.includes('quién es') || t.includes('quien es')) return 'descripcion';
  return 'explorar';
}

function detectarIntencionOraculo(texto) {
  const t = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (t.includes('horoscopo') || t.includes('signo') || t.includes('astral') || t.includes('sidereo')) return 'horoscopo';
  if (t.includes('luna') || t.includes('fase') || t.includes('lunar')) return 'luna';
  if (t.includes('hierba') || t.includes('planta') || t.includes('remedio') || t.includes('brebaje') || t.includes('natural')) return 'hierbas';
  // NUEVAS KEYWORDS PARA EL SEÑOR MISTERIO:
  if (t.includes('misterio') || t.includes('secreto') || t.includes('egipto') || t.includes('atlantida') || t.includes('lemuria') || t.includes('historia')) return 'misterio';
  return 'explorar';
}

function detectarIntencionReinos(texto) {
  const t = texto.toLowerCase();
  if (t.includes('lista') || t.includes('todos') || t.includes('qué hay') || t.includes('que hay')) return 'listar';
  if (t.includes('novedad') || t.includes('nuevo') || t.includes('última') || t.includes('ultima')) return 'novedades';
  if (t.includes('qué es') || t.includes('que es') || t.includes('cuéntame') || t.includes('info') || t.includes('dime')) return 'detalle';
  return 'explorar';
}

// ─── Bloques por mode ─────────────────────────────────────────────────────────

async function modoOsos({ textoUsuario, oso_id, sectorFinal, ciudadFinal, actoActual, ramaActual, supabase }) {
  const id     = (oso_id || 'lara').toLowerCase();
  const update= await cargarUpdate(supabase, id);
  const args   = { textoUsuario, sectorFinal, ciudadFinal, actoActual: actoActual || 'acto_1', ramaActual: ramaActual || null, update
 };
    
  if (id === 'tito')  return titoResponder(args);
  if (id === 'puffo') return puffoResponder(args);
  return laraResponder(args);
}

async function modoNova({ textoUsuario, entidad, hayTarjetas, supabase }) {
  const update = await cargarUpdate(supabase, 'nova');
  return novaResponder({
    textoUser:  textoUsuario,
    intencion:  detectarIntencionNova(textoUsuario),
    entidad,
    hayTarjetas,
    update,
  });
}

async function modoServicios({ textoUsuario, entidad, hayTarjetas, personaje, supabase }) {
  const id     = (personaje || 'isabella').toLowerCase();
  const update = await cargarUpdate(supabase, id);
  const args   = { textoUser: textoUsuario, intencion: detectarIntencionServicios(textoUsuario), entidad, hayTarjetas, update };
  if (id === 'prmaestro') return prmaestroResponder(args);
  return isabellaResponder(args);
}

async function modoAudio({ textoUsuario, entidad, hayTarjetas, personaje, supabase }) {
  const id     = (personaje || 'mapache').toLowerCase();
  const update = await cargarUpdate(supabase, id);
  const args   = { textoUser: textoUsuario, intencion: detectarIntencionAudio(textoUsuario), entidad, hayTarjetas, update};
  if (id === 'ami') return amiResponder(args);
  return mapacheResponder(args);
}

async function modoOraculo({ textoUsuario, personaje, supabase }) {
  const id       = (personaje || 'orumama').toLowerCase();
  const update   = await cargarUpdate(supabase, id);
  const intencion = detectarIntencionOraculo(textoUsuario);
  const args = {
    textoUser:         textoUsuario,
    intencion,
    faselunar:         getMoonSuffix(),
    bloqueConocimiento: getKnowledgeBlock(intencion),
    update,
  };
  
  if (id === 'jaguar') return jaguarResponder(args);
  if (id === 'smisterio') return smisterioResponder(args); // Agregamos al Señor Misterio
  return orumamaResponder(args);
}

async function modoReinos({ textoUsuario, reinos, reinoDetalle, supabase }) {
  const update = await cargarUpdate(supabase, 'rumores');
  return rumoresResponder({
    textoUser:   textoUsuario,
    intencion:   detectarIntencionReinos(textoUsuario),
    reinos:      reinos      || [],
    reinoDetalle: reinoDetalle || null,
    update,
  });
}

async function modoAvisos({
  textoUsuario, personaje, avisoEnConstruccion,
  genesis, ciudad, user_id, autor_alias,
  supabase, onAvisoPublicar,
}) {
  const p     = (personaje || 'evelyn').toLowerCase();
  const bot   = p === 'larry' ? larryResponder : evelynResponder;
  const f     = (intencion, aviso = null, codigoAvi = null) => bot({ intencion, aviso, codigoAvi }).mensaje;
  const t     = textoUsuario.toLowerCase().trim();
  const aviso = avisoEnConstruccion || { tipo: null, titulo: null, contenido: null };

  // Cancelar
  if (t.includes('cancelar') || t.includes('salir'))
    return { mensaje: f('cancelado'), handoff: false, avisoEnConstruccion: null };

  // Detectar código AVI
  const codigoMatch = textoUsuario.match(/AVI-([A-Z0-9]{4})/i);
  const codigoAvi   = codigoMatch ? `AVI-${codigoMatch[1].toUpperCase()}` : null;

  // DESCRIBE — código + D
  if (codigoAvi && /\bD\b/i.test(textoUsuario.replace(codigoAvi, ''))) {
    const avisos = await consultarAvisos(supabase, { codigoAvi });
    if (!avisos.length) return { mensaje: f('no_encontrado'), handoff: false };
    return { mensaje: f('describir', avisos[0], codigoAvi), handoff: false, avisoEnConstruccion: null };
  }

  // CONECTAR — código + A
  if (codigoAvi && /\bA\b/i.test(textoUsuario.replace(codigoAvi, ''))) {
    const avisos = await consultarAvisos(supabase, { codigoAvi });
    if (!avisos.length) return { mensaje: f('no_encontrado'), handoff: false };
    return { mensaje: f('conectar', avisos[0]), handoff: false, avisoConectar: avisos[0] };
  }

  // CONFIRMO conexión
  if (textoUsuario.trim().toUpperCase() === 'CONFIRMO' && aviso.conectar) {
    if ((genesis || 0) < 200) return { mensaje: f('sin_genesis'), handoff: false };
    return {
      mensaje:             f('conectado'),
      handoff:             true,
      handoffData: { agente: 'HANDOFF_AVISO_CONECTAR', user_id: aviso.conectar.user_id, aviso_id: aviso.conectar.id },
      avisoEnConstruccion: null,
    };
  }

  // Modificar campo ya rellenado
  if (aviso.tipo      && t.includes('cambiar') && t.includes('tipo'))
    return { mensaje: f('inicio'),    handoff: false, avisoEnConstruccion: { tipo: null, titulo: null, contenido: null } };
  if (aviso.titulo    && t.includes('cambiar') && (t.includes('título') || t.includes('titulo')))
    return { mensaje: f('titulo'),    handoff: false, avisoEnConstruccion: { ...aviso, titulo: null, contenido: null } };
  if (aviso.contenido && t.includes('cambiar') && (t.includes('descripción') || t.includes('descripcion')))
    return { mensaje: f('contenido'), handoff: false, avisoEnConstruccion: { ...aviso, contenido: null } };

  // CONFIRMO publicación
  if (textoUsuario.trim().toUpperCase() === 'CONFIRMO' && aviso.tipo && aviso.titulo && aviso.contenido) {
    if ((genesis || 0) < 200) return { mensaje: f('sin_genesis'), handoff: false };
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 7);
    await supabase.from('avisos').insert([{
      user_id:        user_id     || '',
      author_alias:   autor_alias || 'Ciudadano',
      type:           aviso.tipo,
      title:          aviso.titulo,
      content:        aviso.contenido,
      city:           ciudad      || 'global',
      cost_to_reveal: 200,
      expires_at:     expireDate.toISOString(),
    }]);
    onAvisoPublicar?.({ confirmado: true });
    return { mensaje: f('publicado'), handoff: false, avisoEnConstruccion: null };
  }

  // Campo: TIPO
  if (!aviso.tipo) {
    if (t.includes('ofrezco') || t.includes('oferta') || t.includes('ofrec'))
      return { mensaje: f('titulo'), handoff: false, avisoEnConstruccion: { ...aviso, tipo: 'OFREZCO' } };
    if (t.includes('necesito') || t.includes('busco') || t.includes('demanda'))
      return { mensaje: f('titulo'), handoff: false, avisoEnConstruccion: { ...aviso, tipo: 'NECESITO' } };
    return { mensaje: f('error_tipo'), handoff: false, avisoEnConstruccion: aviso };
  }

  // Campo: TÍTULO
  if (!aviso.titulo) {
    const titulo = textoUsuario.trim();
    if (titulo.length >= 3) return { mensaje: f('contenido'), handoff: false, avisoEnConstruccion: { ...aviso, titulo } };
    return { mensaje: f('titulo'), handoff: false, avisoEnConstruccion: aviso };
  }

  // Campo: CONTENIDO
  if (!aviso.contenido) {
    const contenido = textoUsuario.trim();
    if (contenido.length >= 10) return { mensaje: f('confirmar'), handoff: false, avisoEnConstruccion: { ...aviso, contenido } };
    return { mensaje: f('contenido'), handoff: false, avisoEnConstruccion: aviso };
  }

  // Todo relleno — esperando CONFIRMO
  return { mensaje: f('confirmar'), handoff: false, avisoEnConstruccion: aviso };
}

// ─── Orquestador principal ────────────────────────────────────────────────────

export async function botOrchestrator({
  mode,
  textoUsuario,
  // OSOS
  oso_id, sectorFinal, ciudadFinal, actoActual, ramaActual,
  // NOVA / SERVICIOS / AUDIO — entidad ya armada por el PS en el hook
  entidad, hayTarjetas,
  // Personajes activos por sector
  servicios_personaje,
  audio_personaje,
  oraculo_personaje,
  avisos_personaje,
  // REINOS
  reinos, reinoDetalle,
  // AVISOS
  avisoEnConstruccion, genesis, ciudad, user_id, autor_alias,
  // Callbacks
  onAvisoPublicar,
  // Infra
  supabase,
}) {
  switch (mode) {
    case 'osos': return modoOsos({ textoUsuario, oso_id, sectorFinal, ciudadFinal, actoActual, ramaActual, supabase });
    case 'novaExplora': return modoNova({ textoUsuario, entidad, hayTarjetas, supabase });
    case 'servicios':   return modoServicios({ textoUsuario, entidad, hayTarjetas, personaje: servicios_personaje, supabase });
    case 'mapache':     return modoAudio({ textoUsuario, entidad, hayTarjetas, personaje: audio_personaje, supabase });
    case 'oraculo':     return modoOraculo({ textoUsuario, personaje: oraculo_personaje, supabase });
    case 'reinos':      return modoReinos({ textoUsuario, reinos, reinoDetalle, supabase });
    case 'avisos':      return modoAvisos({ textoUsuario, personaje: avisos_personaje, avisoEnConstruccion, genesis, ciudad, user_id, autor_alias, supabase, onAvisoPublicar });
    default:            return { mensaje: '...', handoff: false };
  }
}
