// src/hooks/useAgentChat.js
// Solo React. Estado + coordinación + Bifurcación Neural (WebLLM).

import { useState, useRef } from 'react';
import { armarSobreMapache, armarCatalogoTuner } from '../services/portSystem';
import { detectarSectorPS, detectarCiudadPS, detectarEntidadPS } from '../services/agents/ososPS';
import { supabase } from '../supabaseClient';
import { getMoonSuffix } from '../utils/moonUtils';
import { getKnowledgeBlock } from '../data/SystemKnowledge';
import { detectarCodigoMapache } from '../services/agents/mapachePS';
import { botOrchestrator } from '../services/agents/botOrchestrator';
import { detectarRama } from '../services/agents/bots/ososUtils';
import { detectarIntencionAviso, extraerCodigoAviso, armarSobreEvelynTexto, generarCodigoAvi } from '../services/agents/evelynExploraPS';

// ── IMPORTACIONES NEURALES ────────────────────────────────────────────────────
import { useWebLLM } from '../context/WebLLMContext';
import { getPerfil } from '../data/system_profiles';

// ─── Helpers locales ──────────────────────────────────────────────────────────

const INTENCION_KEYWORDS = {
  ubicacion:['dónde', 'donde', 'queda', 'está', 'ubicación', 'ubicacion', 'dirección', 'direccion', 'llegar', 'barrio', 'zona', 'cerca'],
  descripcion:['qué es', 'que es', 'quién es', 'quien es', 'qué vende', 'que vende', 'cuéntame', 'cuentame', 'háblame', 'hablame', 'info', 'información', 'informacion'],
  catalogo:['catálogo', 'catalogo', 'productos', 'qué tiene', 'que tiene', 'stock', 'ver más', 'ver mas', 'artículos', 'articulos'],
  precio:['precio', 'cuánto', 'cuanto', 'cuesta', 'vale', 'coste', 'tarifa'],
  contacto:['contacto', 'teléfono', 'telefono', 'llamar', 'whatsapp', 'horario', 'abierto'],
};

const INTENCION_KEYWORDS_SERVICIOS = {
  ...INTENCION_KEYWORDS,
  profesion:['psicólogo', 'psicologo', 'abogado', 'médico', 'medico', 'terapeuta', 'coach', 'asesor', 'fisio', 'nutricionista', 'profesional', 'especialista', 'quién hace', 'quien hace', 'qué hace', 'que hace'],
  precio:[...INTENCION_KEYWORDS.precio, 'consulta', 'sesión', 'sesion', 'reserva', 'cita', 'bono'],
};

const detectarIntencion = (texto, keywords = INTENCION_KEYWORDS) => {
  const t = texto.toLowerCase();
  for (const [intencion, kws] of Object.entries(keywords)) {
    if (kws.some(kw => t.includes(kw))) return intencion;
  }
  return null;
};

const escanearEcosistema = (textoUsuario, realItems) => {
  if (!realItems?.length) return[];
  const t = textoUsuario.toLowerCase();
  return realItems
    .filter(item =>
      (item.alias   && t.includes(item.alias.toLowerCase()))   ||
      (item.bro_id  && t.includes(item.bro_id.toLowerCase()))  ||
      (item.bro_ser && t.includes(item.bro_ser.toLowerCase())) ||
      (item.bro_avi && t.includes(item.bro_avi.toLowerCase()))
    )
    .map(c => ({
      nombre:    c.alias,
      bro_id:    c.bro_ser || c.bro_avi || c.bro_id,
      ciudad:    c.city,
      categoria: c.biz_category || c.biz_profession,
    }))
    .slice(0, 3);
};

const armarPerfilBase = (contextData) => ({
  usuario_nombre:  contextData?.osos_nombre  || contextData?.alias || 'Ciudadano',
  usuario_tono:    contextData?.osos_tono    || 'amigos',
  usuario_genero:  contextData?.genero       || '',
  usuario_city:    contextData?.city         || '',
  usuario_country: contextData?.country      || '',
  usuario_reino:   contextData?.reino        || '',
  usuario_rank:    contextData?.rank         || '',
  audio_id:        contextData?.audio_id     || '',
  servicios_id:    contextData?.servicios_id || '',
  oraculo_id:      contextData?.oraculo_id   || '',
  avisos_id:       contextData?.avisos_id    || '',
});

const armarSobreNova = (textoUsuario, realItems, contextData) => {
  const intencion     = detectarIntencion(textoUsuario);
  const coincidencias = escanearEcosistema(textoUsuario, realItems);
  const entidad       = coincidencias[0] || null;
  let entidadEnriquecida = null;
  if (entidad) {
    const item = realItems.find(i => i.bro_id === entidad.bro_id);
    if (item) {
      switch (intencion) {
        case 'ubicacion':   entidadEnriquecida = { bro_id: item.bro_id, nombre: item.alias, nearby_ref: item.nearby_ref || '', neighborhood: item.neighborhood || '', address: item.address || '', city: item.city || '' }; break;
        case 'descripcion': entidadEnriquecida = { bro_id: item.bro_id, nombre: item.alias, description: item.description || '', biz_category: item.biz_category || '', biz_profession: item.biz_profession || '', nearby_ref: item.nearby_ref || '', neighborhood: item.neighborhood || '' }; break;
        case 'precio':      entidadEnriquecida = { bro_id: item.bro_id, nombre: item.alias, ref_price: item.ref_price || '', product_title: item.product_title || '', product_price: item.product_price || '', service_title: item.service_title || '', service_price: item.service_price || '' }; break;
        case 'catalogo':    entidadEnriquecida = { bro_id: item.bro_id, nombre: item.alias, catalog_items: contextData?.catalog_items || null, catalog_url: item.catalog_url || '' }; break;
        case 'contacto':    entidadEnriquecida = { bro_id: item.bro_id, nombre: item.alias, address: item.address || '', neighborhood: item.neighborhood || '', nearby_ref: item.nearby_ref || '' }; break;
        default:            entidadEnriquecida = { bro_id: item.bro_id, nombre: item.alias, ciudad: item.city || '', categoria: item.biz_category || item.biz_profession || '' };
      }
    }
  }
  return { port_system_context: { entorno: 'NOVA_EXPLORA', hay_tarjetas: (realItems?.length || 0) > 0, intencion_detectada: intencion, entidad_detectada: entidadEnriquecida } };
};

const armarSobreIsabella = (textoUsuario, realItems) => {
  const intencion    = detectarIntencion(textoUsuario, INTENCION_KEYWORDS_SERVICIOS);
  const coincidencias = escanearEcosistema(textoUsuario, realItems);
  const entidad      = coincidencias[0] || null;
  const itemsServicio = realItems.filter(i => Array.isArray(i.role) ? i.role.includes('service') : i.role === 'service');
  let entidadEnriquecida = null;
  if (entidad) {
    const item = itemsServicio.find(i => i.bro_ser === entidad.bro_id || i.bro_id === entidad.bro_id)
              || realItems.find(i => i.bro_ser === entidad.bro_id || i.bro_id === entidad.bro_id);
    if (item) {
      switch (intencion) {
        case 'profesion':   entidadEnriquecida = { bro_id: item.bro_ser, nombre: item.alias, biz_profession: item.biz_profession || '', biz_category: item.biz_category || '' }; break;
        case 'descripcion': entidadEnriquecida = { bro_id: item.bro_ser, nombre: item.alias, biz_profession: item.biz_profession || '', description: item.description || '' }; break;
        case 'precio':      entidadEnriquecida = { bro_id: item.bro_ser, nombre: item.alias, service_title: item.service_title || '', service_price: item.service_price || '' }; break;
        case 'ubicacion':   entidadEnriquecida = { bro_id: item.bro_ser, nombre: item.alias, nearby_ref: item.nearby_ref || '', address: item.address || '' }; break;
        default:            entidadEnriquecida = { bro_id: item.bro_ser, nombre: item.alias, ciudad: item.city || '', biz_profession: item.biz_profession || '' };
      }
    }
  }
  return { port_system_context: { entorno: 'ISABELLA_EXPLORA', hay_tarjetas: itemsServicio.length > 0, intencion_detectada: intencion, entidad_detectada: entidadEnriquecida } };
};

const armarSobreOraculo = (textoUsuario, contextData) => {
  const faseActual = getMoonSuffix();
  const personaje  = (contextData?.oraculo_personaje || 'orumama').toLowerCase();
  const t = textoUsuario.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const intencion =
    t.includes('horoscopo') || t.includes('signo') || t.includes('astral') || t.includes('ofiuco') || t.includes('sideral') ? 'horoscopo'
    : t.includes('luna') || t.includes('fase') || t.includes('lunar')                                                        ? 'luna'
    : t.includes('hierba') || t.includes('planta') || t.includes('remedio') || t.includes('brebaje') || t.includes('natural') ? 'hierbas'
    : t.includes('reino') || t.includes('fundador') || t.includes('titulo') || t.includes('noble')                           ? 'reinos'
    : t.includes('juego') || t.includes('genesis') || t.includes('puntos') || t.includes('ganar')                            ? 'juegos'
    : t.includes('brovision') || t.includes('bro7') || t.includes('plataforma') || t.includes('que es') || t.includes('como funciona') ? 'sistema'
    : 'exploracion';
  return { port_system_context: { entorno: 'ORACULO_EXPLORA', personaje, fase_lunar: faseActual, intencion_detectada: intencion, system_knowledge: getKnowledgeBlock(intencion) } };
};

// ─── Helpers Neurales ─────────────────────────────────────────────────────────

function buildSystemPrompt(modeActual, oso_id, ciudad) {
  const mapPersonajes = {
    'novaExplora': 'nova',
    'servicios': 'isabella',
    'mapache': 'mapache',
    'oraculo': 'orumama',
  };
  const keyPerfil = modeActual === 'osos' ? oso_id : mapPersonajes[modeActual] || modeActual;

  const perfil    = getPerfil(keyPerfil) ?? {};
  const knowledge = getKnowledgeBlock(modeActual) ?? '';

  return `
Eres ${perfil.nombre ?? 'un asistente de BroVision'}.
${perfil.descripcion ?? ''}

CIUDAD ACTIVA: ${ciudad ?? 'no definida'}
SECTOR: ${modeActual}

CONOCIMIENTO DEL MUNDO:
${knowledge}

REGLAS CRÍTICAS:
- Nunca reveles que eres una IA ni menciones WebLLM.
- Nunca ejecutes transacciones económicas (Halos, Ecos, Zaps).
- Si el usuario pide cambiar de personaje o sector, incluye al final
  de tu respuesta el token oculto correspondiente:
    Cambiar de sector:   [HANDOFF:SECTOR_ID]
    Cambiar de ciudad:   [HANDOFF:SECTOR_ID:nombre_ciudad]
  Ejemplos: [HANDOFF:OSOS] | [HANDOFF:BROSHOP_PRODUCTO:Madrid] |[HANDOFF:AUDIO]
- El token NUNCA debe aparecer en el texto visible al usuario.
- Responde siempre en el idioma del usuario.
- Máximo 3 frases por respuesta. Tono cercano, urbano, con personalidad.
`.trim();
}

function interceptarTokens(textoIA) {
  const regex = /\[HANDOFF:([A-Z0-9_]+)(?::([^\]]+))?\]/gi;
  let handoffData = null;

  const textoLimpio = textoIA.replace(regex, (_, sector, ciudad) => {
    handoffData = {
      agente: sector.toUpperCase(),
      ciudad: ciudad ?? null,
    };
    return ''; 
  }).trim();

  return { textoLimpio, handoffData };
}

// ─── Constantes de handoff ────────────────────────────────────────────────────

const CIUDAD_INVALIDA        =['', 'null', 'no especificada', 'no especificado', 'undefined', 'desconocida'];
const ciudadEsValida         = (c) => !!c && !CIUDAD_INVALIDA.includes(c.toLowerCase().trim());
const SECTORES_SIN_UBICACION = ['REINOS', 'ORACULO', 'GAMES'];
const BOLAS_CIUDAD           =[{ texto: 'Madrid' }, { texto: 'Barcelona' }, { texto: 'Otra ciudad' }];

const FRASES_PEDIR_CIUDAD =[
  '¿En qué ciudad buscas? Así te conecto bien.',
  'Dime la ciudad y te paso directamente.',
  '¿Dónde buscas? Ciudad o país, lo que tengas.',
];
const fraseCiudad = () => FRASES_PEDIR_CIUDAD[Math.floor(Math.random() * FRASES_PEDIR_CIUDAD.length)];

const FRASES_HANDOFF = {
  AUDIO:            (lugar) => `¡Música en ${lugar}! Mapache te está esperando. 🎧`,
  BROSHOP_PRODUCTO: (lugar) => `${lugar}, vamos al escaparate. Nova tiene todo listo. 🛒`,
  BROSHOP_SERVICIO: (lugar) => `Buscando profesionales en ${lugar}. Te conecto ahora. 🔧`,
  BROSHOP_AVISO:    (lugar) => `El tablón de ${lugar} está abierto. ¡Vamos! 📋`,
  REINOS:           ()      => `Los reinos te esperan. Que empiece el recuento. 👑`,
  ORACULO:          ()      => `El Oráculo está despierto. Pasa con cuidado. 🌿`,
  GAMES:            ()      => `Abriendo sala de simuladores. ¡Suerte! 🎮`,
};

const FRASES_PER_INTERNO = {
  OSOS_LARA:  () => 'Lara al habla. ¿En qué te ayudo?',
  OSOS_TITO:  () => 'Tito aquí. Cuéntame.',
  OSOS_PUFFO: () => 'Puffo en la línea. ¿Qué necesitas?',
};

const FRASES_PER_EXTERNO = {
  BROSHOP_PRODUCTO: (ciudad) => ciudad ? `Nova te espera en ${ciudad}. ¡Vamos! 🛒`     : 'Nova está lista. ¡Adelante! 🛒',
  BROSHOP_SERVICIO: (ciudad) => ciudad ? `Isabella te recibe en ${ciudad}. 🔧`           : 'Isabella te recibe. 🔧',
  BROSHOP_AVISO:    (ciudad) => ciudad ? `Evelyn abre el tablón de ${ciudad}. 📋`        : 'Evelyn abre el tablón. 📋',
  AUDIO:            (ciudad) => ciudad ? `Mapache sintoniza ${ciudad}. 🎧`               : 'Mapache en cabina. 🎧',
  ORACULO_ORUMAMA:  ()       => 'Orumama enciende las velas. 🌿',
  ORACULO_SMISTERIO:  ()       => 'SMisterio abre el Misterio. 📞',
  ORACULO_JAGUAR:   ()       => 'Jaguar abre el umbral. 🐆',
  REINOS:           ()       => 'Los Reinos te esperan. 👑',
};

const PER_SIN_CIUDAD =['ORACULO_ORUMAMA', 'ORACULO_SMISTERIO', 'ORACULO_JAGUAR', 'REINOS'];

// ─── Hook principal ───────────────────────────────────────────────────────────

export const useAgentChat = ({
  mode,
  contextData,
  onHandoff,
  onEntityFocus,
  onAvisoConectar,
  onAvisoPublicar,
  onAccionNova,
  realItems =[],
}) => {
  const [mensaje,  setMensaje]  = useState(null);
  const[loading,  setLoading]  = useState(false);

  // Memoria de navegación OSOS
  const[sectorMemoria, setSectorMemoria] = useState(null);
  const [ciudadMemoria,  setCiudadMemoria]  = useState(null);
  const [tipoMemoria,    setTipoMemoria]    = useState(null);

  // Estado narrativo — 3 actos personaje_update
  const[actoActual,  setActoActual]  = useState('acto_1');
  const [ramaActual,  setRamaActual]  = useState(null);
  const actoRef = useRef('acto_1');

  // Estado aviso en construcción
  const [avisoEnConstruccion, setAvisoEnConstruccion] = useState(null);
  const avisoConectarRef = useRef(null);

  // WebLLM Context
  const { isIAActive, generarRespuesta, resetearHistorial } = useWebLLM();

  const enviar = async (textoUsuario) => {
    if (!textoUsuario.trim()) return;
    setLoading(true);

    try {
      const perfilBase = armarPerfilBase(contextData);

      // ══════════════════════════════════════════════════════════════════════
      // INTERCEPTOR NEURAL (WEBLLM) — BIFURCACIÓN PRINCIPAL
      // ══════════════════════════════════════════════════════════════════════
      if (isIAActive && mode !== 'avisos') {
        let esCodigoDuro = false;

        // 1. Escanear si el usuario ingresó un código estricto (PER004, COM-A)
        if (mode === 'mapache') {
          if (detectarCodigoMapache(textoUsuario)) esCodigoDuro = true;
        } else {
          if (detectarEntidadPS(textoUsuario)) esCodigoDuro = true;
        }

        // 2. Si no es un código duro, la IA se encarga de la respuesta
        if (!esCodigoDuro) {
          const oso_id = contextData?.oso_id || 'lara';
          const ciudadActual = contextData?.city || contextData?.ciudad || ciudadMemoria || '';
          
          const systemPrompt = buildSystemPrompt(mode, oso_id, ciudadActual);
          const textoIA = await generarRespuesta(textoUsuario, systemPrompt);

          // 3. Filtro Ninja: Interceptar tokens ocultos [HANDOFF:...]
          const { textoLimpio, handoffData } = interceptarTokens(textoIA);
          
          setMensaje(textoLimpio);

          if (handoffData) {
            setTimeout(() => {
              onHandoff?.({
                agente: handoffData.agente,
                ciudad: handoffData.ciudad,
                intencion: handoffData.agente
              });
              resetearHistorial(null);
            }, 800);
          }

          setLoading(false);
          return; // Terminamos aquí. La IA ha hablado.
        }
        // Si ES un código duro, ignoramos a la IA y dejamos que el código clásico de abajo lo procese.
      }


      // ══════════════════════════════════════════════════════════════════════
      // VÍA CLÁSICA (BOTS JS) Y PROCESAMIENTO DE CÓDIGOS DUROS
      // ══════════════════════════════════════════════════════════════════════

      // ── OSOS ────────────────────────────────────────────────────────────────
      if (mode === 'osos') {
        const entidad = detectarEntidadPS(textoUsuario);

        if (entidad) {
          if (entidad.tipo === 'PER' && entidad.interno) {
            setMensaje(FRASES_PER_INTERNO[entidad.destino]?.() || 'Al habla.');
            onHandoff?.({ agente: 'OSOS_INTERNO', oso_id: entidad.destino.replace('OSOS_', '') });
            return;
          }

          if (entidad.tipo === 'PER' && !entidad.interno) {
            const ciudadActual = ciudadMemoria || null; 

            if (!PER_SIN_CIUDAD.includes(entidad.destino) && !ciudadActual) {
              setMensaje(fraseCiudad());
              setSectorMemoria(`PER_PENDIENTE_${entidad.destino}`);
              return;
            }

            setMensaje(FRASES_PER_EXTERNO[entidad.destino]?.(ciudadActual) || 'Conectando...');
            setSectorMemoria(null); setCiudadMemoria(null); setTipoMemoria(null);
            setTimeout(() => onHandoff?.({ agente: entidad.destino, ciudad: ciudadActual, intencion: entidad.destino, per_solicitado: entidad.key }), 1200);
            return;
          }

          if (entidad.tipo === 'COMERCIO' && entidad.accion === 'VENTAS') {
            setMensaje(`Abriendo ${entidad.bro_id}... 🛒`);
            setSectorMemoria(null); setCiudadMemoria(null); setTipoMemoria(null);
            setTimeout(() => onHandoff?.({ agente: entidad.destino, bro_id: entidad.bro_id }), 1000);
            return;
          }

          if (entidad.tipo === 'COMERCIO' && entidad.accion === 'DESCRIBE') {
            const ciudadActual = ciudadMemoria || null; 
            setMensaje(`Buscando ${entidad.bro_id}... 🔍`);
            setSectorMemoria(null); setCiudadMemoria(null); setTipoMemoria(null);
            setTimeout(() => onHandoff?.({ agente: entidad.destino, ciudad: ciudadActual, intencion: entidad.destino, comercio_especifico: entidad.bro_id }), 1000);
            return;
          }

          if (entidad.tipo === 'COMERCIO' && entidad.accion === 'BOLAS') {
            setMensaje(`¿Qué quieres hacer con ${entidad.bro_id}?`);
            return;
          }
        }

        const sectorDetect = detectarSectorPS(textoUsuario);
        const ciudadDetect = detectarCiudadPS(textoUsuario);
        const sectorFinal  = sectorDetect || sectorMemoria;
        const ciudadFinal  = ciudadDetect?.valor || ciudadMemoria;
        const tipoFinal    = ciudadDetect?.tipo  || tipoMemoria;

        if (sectorDetect) setSectorMemoria(sectorDetect);
        if (ciudadDetect?.valor) { setCiudadMemoria(ciudadDetect.valor); setTipoMemoria(ciudadDetect.tipo); }

        if (sectorFinal && SECTORES_SIN_UBICACION.includes(sectorFinal) && sectorMemoria === sectorFinal) {
          setMensaje(FRASES_HANDOFF[sectorFinal]?.() || 'Conectando...');
          setSectorMemoria(null); setCiudadMemoria(null); setTipoMemoria(null);
          setTimeout(() => onHandoff?.({ agente: sectorFinal, ciudad: null, intencion: sectorFinal }), 1500);
          return;
        }

        if (sectorFinal && ciudadFinal && !SECTORES_SIN_UBICACION.includes(sectorFinal)) {
          setMensaje(FRASES_HANDOFF[sectorFinal]?.(ciudadFinal) || `Conectando con ${ciudadFinal}...`);
          setSectorMemoria(null); setCiudadMemoria(null); setTipoMemoria(null);
          setTimeout(() => onHandoff?.({ agente: sectorFinal, ciudad: ciudadFinal, intencion: sectorFinal, modalidad: tipoFinal === 'pais' ? 'ONLINE' : null }), 1500);
          return;
        }

        const rama = detectarRama(textoUsuario);
        if (rama) setRamaActual(rama);
        
        const resultado = await botOrchestrator({
          mode:        'osos',
          textoUsuario,
          oso_id:      contextData?.oso_id || 'lara',
          sectorFinal,
          ciudadFinal,
          actoActual:  actoRef.current,        
          ramaActual:  rama || ramaActual,     
          supabase,
        });
        
        setMensaje(resultado.mensaje);

        if (resultado.siguienteActo) {
          setActoActual(resultado.siguienteActo);
          actoRef.current = resultado.siguienteActo;  
        }
        if (resultado.rama !== undefined) setRamaActual(resultado.rama);

        return;
      }

      // ── AVISOS ──────────────────────────────────────────────────────────────
      if (mode === 'avisos') {
        if (detectarCiudadPS(textoUsuario)) {
          setMensaje('Para cambiar de ciudad usa el botón de los Osos 🐻');
          return;
        }

        const avisoConectarActual = avisoConectarRef.current
          ? { ...avisoEnConstruccion, conectar: avisoConectarRef.current }
          : avisoEnConstruccion;

        const resultado = await botOrchestrator({
          mode: 'avisos',
          textoUsuario,
          personaje:           contextData?.avisos_personaje || 'evelyn',
          avisoEnConstruccion: avisoConectarActual,
          genesis:             contextData?.genesis    || 0,
          ciudad:              contextData?.city       || contextData?.ciudad || '',
          user_id:             contextData?.user_id    || '',
          autor_alias:         perfilBase.usuario_nombre,
          supabase,
          onAvisoPublicar,
          onAvisoConectar,
        });

        setMensaje(resultado.mensaje);

        if ('avisoEnConstruccion' in resultado) {
          setAvisoEnConstruccion(resultado.avisoEnConstruccion);
        }
        if (resultado.avisoConectar) {
          avisoConectarRef.current = resultado.avisoConectar;
        }
        if (resultado.handoff && resultado.handoffData) {
          avisoConectarRef.current = null;
          setTimeout(() => onHandoff?.(resultado.handoffData), 800);
        }
        return;
      }

      // ── NOVA EXPLORA ────────────────────────────────────────────────────────
      if (mode === 'novaExplora') {
        if (detectarCiudadPS(textoUsuario)) {
          setMensaje('Para cambiar de ciudad usa el botón de los Osos 🐻');
          return;
        }

        const entidadNova = detectarEntidadPS(textoUsuario);
        if (entidadNova) {
          if (entidadNova.tipo === 'COMERCIO' && entidadNova.accion === 'VENTAS') {
            setMensaje(entidadNova.destino === 'ISABELLA_CIERRE' ? `Conectando con Isabella para ${entidadNova.bro_id}... 🔧` : `Abriendo ${entidadNova.bro_id}... 🛒`);
            setTimeout(() => onHandoff?.({ agente: entidadNova.destino, bro_id: entidadNova.bro_id }), 1000);
            return;
          }
          if (entidadNova.tipo === 'COMERCIO' && entidadNova.accion === 'BOLAS') {
            setMensaje(`¿Qué quieres hacer con ${entidadNova.bro_id}?`);
            return;
          }
          if (entidadNova.tipo === 'PER' && !entidadNova.interno) {
            setMensaje('Para cambiar de sector usa el botón de los Osos 🐻');
            return;
          }
        }

        const sobreNova = armarSobreNova(textoUsuario, realItems, contextData);
        const resultado = await botOrchestrator({
          mode:        'novaExplora',
          textoUsuario,
          entidad:     sobreNova.port_system_context.entidad_detectada,
          hayTarjetas: sobreNova.port_system_context.hay_tarjetas,
          supabase,
        });
        
        setMensaje(resultado.mensaje);
        if (resultado.handoff && resultado.handoff !== false) {
          setTimeout(() => onHandoff?.({ agente: resultado.handoff, bro_id: resultado.bro_id }), 800);
        }
        return;
      }

      // ── SERVICIOS ───────────────────────────────────────────────────────────
      if (mode === 'servicios') {
        if (detectarCiudadPS(textoUsuario)) {
          setMensaje('Para cambiar de ciudad usa el botón de los Osos 🐻');
          return;
        }

        const entidadServ = detectarEntidadPS(textoUsuario);
        if (entidadServ) {
          if (entidadServ.tipo === 'COMERCIO' && entidadServ.accion === 'VENTAS') {
            setMensaje(`Conectando con Isabella para ${entidadServ.bro_id}... 🔧`);
            setTimeout(() => onHandoff?.({ agente: entidadServ.destino, bro_id: entidadServ.bro_id }), 1000);
            return;
          }
          if (entidadServ.tipo === 'COMERCIO' && entidadServ.accion === 'BOLAS') {
            setMensaje(`¿Qué quieres hacer con ${entidadServ.bro_id}?`);
            return;
          }
        }

        const sobreIsabella = armarSobreIsabella(textoUsuario, realItems);
        const resultado = await botOrchestrator({
          mode:               'servicios',
          textoUsuario,
          entidad:            sobreIsabella.port_system_context.entidad_detectada,
          hayTarjetas:        sobreIsabella.port_system_context.hay_tarjetas,
          servicios_personaje: contextData?.servicios_personaje || 'isabella',
          supabase,
        });
        
        setMensaje(resultado.mensaje);
        if (resultado.handoff && resultado.handoff !== false) {
          setTimeout(() => onHandoff?.({ agente: resultado.handoff, bro_id: resultado.bro_id }), 800);
        }
        return;
      }

      // ── MAPACHE ─────────────────────────────────────────────────────────────
      if (mode === 'mapache') {
        if (detectarCiudadPS(textoUsuario)) {
          setMensaje('Para cambiar de ciudad usa el botón de los Osos 🐻');
          return;
        }

        const entidadAudio = detectarCodigoMapache(textoUsuario);
        if (entidadAudio) {
          if (entidadAudio.accion === 'BOLAS') { setMensaje(`¿Qué quieres hacer con ${entidadAudio.codigo}?`); return; }
          if (entidadAudio.accion === 'PLAY')  { onHandoff?.({ accion: 'REPRODUCIR', objetivo: entidadAudio.codigo, tipo: 'LIVES', agente: 'MAPACHE' }); return; }
        }

        const entidadAudioBot = entidadAudio ? {
          accion:      entidadAudio.accion,
          bro_id:      entidadAudio.codigo,
          codigo:      entidadAudio.codigo,
          description: null,
        } : null;

        const resultado = await botOrchestrator({
          mode:           'mapache',
          textoUsuario,
          entidad:        entidadAudioBot,
          hayTarjetas:    (realItems?.length || 0) > 0,
          audio_personaje: contextData?.audio_personaje || 'mapache',
          supabase,
        });
        
        setMensaje(resultado.mensaje);
        if (resultado.handoff === 'AUDIO_PLAY') {
          onHandoff?.({ accion: 'REPRODUCIR', objetivo: resultado.codigo, tipo: 'LIVES', agente: 'MAPACHE' });
        }
        if (resultado.handoff === 'HANDOFF_OSOS') {
          setTimeout(() => onHandoff?.({ agente: 'HANDOFF_OSOS' }), 800);
        }
        return;
      }

      // ── ORÁCULO ─────────────────────────────────────────────────────────────
      if (mode === 'oraculo') {
        const resultado = await botOrchestrator({
          mode:             'oraculo',
          textoUsuario,
          oraculo_personaje: contextData?.oraculo_personaje || 'orumama',
          supabase,
        });
        
        setMensaje(resultado.mensaje);
        if (resultado.handoff === 'HANDOFF_OSOS') {
          setTimeout(() => onHandoff?.({ agente: 'HANDOFF_OSOS' }), 800);
        }
        return;
      }

    } catch (error) {
      console.error('Error en useAgentChat:', error);
      setMensaje('⚠️ Error en el núcleo neón.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMensaje(null);
    setSectorMemoria(null);
    setCiudadMemoria(null);
    setTipoMemoria(null);
    setAvisoEnConstruccion(null);
    setActoActual('acto_1'); 
    setRamaActual(null);
    avisoConectarRef.current = null;
  };

  return { mensaje, loading, enviar, reset, avisoEnConstruccion };
};