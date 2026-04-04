// src/hooks/useAgentChat.js
import { useState } from 'react';
import { askGroq } from '../services/groq';
import { armarSobreMapache, armarCatalogoTuner } from '../services/portSystem';
import { detectarSectorPS, detectarCiudadPS } from '../services/agents/ososPS';
import { detectarIntencionAviso, extraerCodigoAviso, generarCodigoAvi, armarSobreEvelynTexto } from '../services/agents/evelynExploraPS';
import { supabase } from '../supabaseClient';
import { getMoonSuffix } from '../utils/moonUtils';
import { getKnowledgeBlock } from '../data/SystemKnowledge';

const INTENCION_KEYWORDS = {
  ubicacion:   ['dónde', 'donde', 'queda', 'está', 'ubicación', 'ubicacion', 'dirección', 'direccion', 'llegar', 'barrio', 'zona', 'cerca'],
  descripcion: ['qué es', 'que es', 'quién es', 'quien es', 'qué vende', 'que vende', 'cuéntame', 'cuentame', 'háblame', 'hablame', 'info', 'información', 'informacion'],
  catalogo:    ['catálogo', 'catalogo', 'productos', 'qué tiene', 'que tiene', 'stock', 'ver más', 'ver mas', 'artículos', 'articulos'],
  precio:      ['precio', 'cuánto', 'cuanto', 'cuesta', 'vale', 'coste', 'tarifa'],
  contacto:    ['contacto', 'teléfono', 'telefono', 'llamar', 'whatsapp', 'horario', 'abierto'],
};

const INTENCION_KEYWORDS_SERVICIOS = {
  ...INTENCION_KEYWORDS,
  profesion: ['psicólogo', 'psicologo', 'abogado', 'médico', 'medico', 'terapeuta', 'coach', 'asesor', 'fisio', 'nutricionista', 'profesional', 'especialista', 'quién hace', 'quien hace', 'qué hace', 'que hace'],
  precio:    [...INTENCION_KEYWORDS.precio, 'consulta', 'sesión', 'sesion', 'reserva', 'cita', 'bono'],
};

const detectarIntencion = (texto, keywords = INTENCION_KEYWORDS) => {
  const t = texto.toLowerCase();
  for (const [intencion, kws] of Object.entries(keywords)) {
    if (kws.some(kw => t.includes(kw))) return intencion;
  }
  return null;
};

const escanearEcosistema = (textoUsuario, realItems) => {
  if (!realItems || realItems.length === 0) return [];
  const t = textoUsuario.toLowerCase();
  const coincidencias = realItems.filter(item => {
    const matchAlias = item.alias && t.includes(item.alias.toLowerCase());
    const matchBroId = item.bro_id && t.includes(item.bro_id.toLowerCase());
    return matchAlias || matchBroId;
  });
  return coincidencias.map(c => ({
    nombre:    c.alias,
    bro_id:    c.bro_id,
    ciudad:    c.city,
    categoria: c.biz_category || c.biz_profession,
  })).slice(0, 3);
};

// ── Sobre Nova (productos) ────────────────────────────────────────────
const armarSobreNova = (textoUsuario, realItems, contextData) => {
  const intencion     = detectarIntencion(textoUsuario);
  const coincidencias = escanearEcosistema(textoUsuario, realItems);
  const entidad       = coincidencias[0] || null;

  let entidadEnriquecida = null;
  if (entidad) {
    const itemCompleto = realItems.find(i => i.bro_id === entidad.bro_id);
    if (itemCompleto) {
      switch (intencion) {
        case 'ubicacion':
          entidadEnriquecida = { bro_id: itemCompleto.bro_id, nombre: itemCompleto.alias, nearby_ref: itemCompleto.nearby_ref || '', neighborhood: itemCompleto.neighborhood || '', address: itemCompleto.address || '', city: itemCompleto.city || '' };
          break;
        case 'descripcion':
          entidadEnriquecida = { bro_id: itemCompleto.bro_id, nombre: itemCompleto.alias, description: itemCompleto.description || '', biz_category: itemCompleto.biz_category || '', biz_profession: itemCompleto.biz_profession || '' };
          break;
        case 'precio':
          entidadEnriquecida = { bro_id: itemCompleto.bro_id, nombre: itemCompleto.alias, ref_price: itemCompleto.ref_price || '', product_title: itemCompleto.product_title || '', product_price: itemCompleto.product_price || '', service_title: itemCompleto.service_title || '', service_price: itemCompleto.service_price || '' };
          break;
        case 'catalogo':
          entidadEnriquecida = { bro_id: itemCompleto.bro_id, nombre: itemCompleto.alias, catalog_items: contextData?.catalog_items || null, catalog_url: itemCompleto.catalog_url || '' };
          break;
        case 'contacto':
          entidadEnriquecida = { bro_id: itemCompleto.bro_id, nombre: itemCompleto.alias, address: itemCompleto.address || '', neighborhood: itemCompleto.neighborhood || '', nearby_ref: itemCompleto.nearby_ref || '' };
          break;
        default:
          entidadEnriquecida = { bro_id: itemCompleto.bro_id, nombre: itemCompleto.alias, ciudad: itemCompleto.city || '', categoria: itemCompleto.biz_category || itemCompleto.biz_profession || '' };
      }
    }
  }

  return {
    port_system_context: {
      entorno:             'NOVA_EXPLORA',
      hay_tarjetas:        (realItems?.length || 0) > 0,
      intencion_detectada: intencion,
      entidad_detectada:   entidadEnriquecida,
    },
  };
};

// ── Sobre Isabella (servicios) ────────────────────────────────────────
const armarSobreIsabella = (textoUsuario, realItems) => {
  const intencion     = detectarIntencion(textoUsuario, INTENCION_KEYWORDS_SERVICIOS);
  const coincidencias = escanearEcosistema(textoUsuario, realItems);
  const entidad       = coincidencias[0] || null;

  const itemsServicio = realItems.filter(i =>
    Array.isArray(i.role) ? i.role.includes('service') : i.role === 'service'
  );

  let entidadEnriquecida = null;
  if (entidad) {
    const itemCompleto = itemsServicio.find(i => i.bro_id === entidad.bro_id)
      || realItems.find(i => i.bro_id === entidad.bro_id);

    if (itemCompleto) {
      switch (intencion) {
        case 'profesion':
          entidadEnriquecida = { bro_id: itemCompleto.bro_id, nombre: itemCompleto.alias, biz_profession: itemCompleto.biz_profession || '', biz_category: itemCompleto.biz_category || '' };
          break;
        case 'descripcion':
          entidadEnriquecida = { bro_id: itemCompleto.bro_id, nombre: itemCompleto.alias, biz_profession: itemCompleto.biz_profession || '', description: itemCompleto.description || '' };
          break;
        case 'precio':
          entidadEnriquecida = { bro_id: itemCompleto.bro_id, nombre: itemCompleto.alias, service_title: itemCompleto.service_title || '', service_price: itemCompleto.service_price || '' };
          break;
        case 'ubicacion':
          entidadEnriquecida = { bro_id: itemCompleto.bro_id, nombre: itemCompleto.alias, nearby_ref: itemCompleto.nearby_ref || '', address: itemCompleto.address || '' };
          break;
        default:
          entidadEnriquecida = { bro_id: itemCompleto.bro_id, nombre: itemCompleto.alias, ciudad: itemCompleto.city || '', biz_profession: itemCompleto.biz_profession || '' };
      }
    }
  }

  return {
    port_system_context: {
      entorno:             'ISABELLA_EXPLORA',
      hay_tarjetas:        itemsServicio.length > 0,
      intencion_detectada: intencion,
      entidad_detectada:   entidadEnriquecida,
    },
  };
};

// ── Sobre Evelyn (avisos) ─────────────────────────────────────────────
const armarSobreEvelyn = async (textoUsuario, contextData) => {
  const intencion  = detectarIntencionAviso(textoUsuario);
  const codigoAvi  = extraerCodigoAviso(textoUsuario);

  let query = supabase
    .from('avisos')
    .select('id, type, title, content, author_alias, user_id, city, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  if (contextData?.ciudad) {
    query = query.ilike('city', `%${contextData.ciudad}%`);
  }

  const { data: avisos, error } = await query;
  if (error) console.error('[PS Evelyn] Error fetching avisos:', error);

  let avisosFinales = avisos || [];
  if (codigoAvi && avisosFinales.length > 0) {
    const encontrado = avisosFinales.find(av =>
      generarCodigoAvi(av.id) === codigoAvi
    );
    if (encontrado) avisosFinales = [encontrado];
  }

  const sobreTexto = armarSobreEvelynTexto({
    alias:      contextData?.alias    || 'Ciudadano',
    bro_id:     contextData?.bro_id   || '',
    ciudad:     contextData?.ciudad   || '',
    genesis:    contextData?.genesis  || 0,
    intencion,
    avisos:     avisosFinales,
    codigoAvi,
  });

  return {
    sobreTexto,
    intencion,
    codigoAvi,
    avisosRaw: avisosFinales,
  };
};

// ── Sobre Oráculo (Orumama + Jaguar) ─────────────────────────────────
// Sin async — solo inyecta el bloque de SystemKnowledge relevante + fase lunar.
const armarSobreOraculo = (textoUsuario, contextData) => {
  const faseActual = getMoonSuffix(); // 'crescens' | 'plena' | 'decrescens' | 'nova'
  const personaje  = (contextData?.oraculo_personaje || 'orumama').toLowerCase();

  // Detectar intención para elegir el bloque mínimo de conocimiento
  const t = textoUsuario.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const intencion =
    t.includes('horoscopo') || t.includes('signo') || t.includes('astral') || t.includes('ofiuco') || t.includes('sideral')
      ? 'horoscopo'
    : t.includes('luna') || t.includes('fase') || t.includes('lunar')
      ? 'luna'
    : t.includes('hierba') || t.includes('planta') || t.includes('remedio') || t.includes('brebaje') || t.includes('natural')
      ? 'hierbas'
    : t.includes('reino') || t.includes('fundador') || t.includes('titulo') || t.includes('noble')
      ? 'reinos'
    : t.includes('juego') || t.includes('genesis') || t.includes('puntos') || t.includes('ganar')
      ? 'juegos'
    : t.includes('brovision') || t.includes('bro7') || t.includes('plataforma') || t.includes('que es') || t.includes('como funciona')
      ? 'sistema'
    : 'exploracion';

  // getKnowledgeBlock devuelve solo el bloque relevante desde SystemKnowledge.js
  const bloqueConocimiento = getKnowledgeBlock(intencion);

  return {
    port_system_context: {
      entorno:             'ORACULO_EXPLORA',
      personaje,
      fase_lunar:          faseActual,
      intencion_detectada: intencion,
      system_knowledge:    bloqueConocimiento,
    },
  };
};

// ─────────────────────────────────────────────────────────────────────
const CIUDAD_INVALIDA = ['', 'null', 'no especificada', 'no especificado', 'undefined', 'desconocida'];
const ciudadEsValida = (ciudad) => {
  if (!ciudad) return false;
  return !CIUDAD_INVALIDA.includes(ciudad.toLowerCase().trim());
};

// Sectores que NO necesitan ubicación — handoff directo
const SECTORES_SIN_UBICACION = ['REINOS', 'ORACULO'];

const BOLAS_CIUDAD = [
  { texto: 'Madrid' },
  { texto: 'Barcelona' },
  { texto: 'Otra ciudad' },
];

const FRASES_HANDOFF = {
  AUDIO:            (lugar) => `¡Música en ${lugar}! Mapache te está esperando. 🎧`,
  BROSHOP_PRODUCTO: (lugar) => `${lugar}, vamos al escaparate. Nova tiene todo listo. 🛒`,
  BROSHOP_SERVICIO: (lugar) => `Buscando profesionales en ${lugar}. Te conecto ahora. 🔧`,
  BROSHOP_AVISO:    (lugar) => `El tablón de ${lugar} está abierto. ¡Vamos! 📋`,
  REINOS:           ()       => `Los reinos te esperan. Que empiece el recuento. 👑`,
  ORACULO:          ()       => `El Oráculo está despierto. Pasa con cuidado. 🌿`,
};

// ── Hook principal ────────────────────────────────────────────────────
export const useAgentChat = ({ mode, contextData, onHandoff, onEntityFocus, onAvisoConectar, onAvisoPublicar, realItems = [] }) => {
  const [mensaje,  setMensaje]  = useState(null);
  const [bolas,    setBolas]    = useState([]);
  const [loading,  setLoading]  = useState(false);

  const [sectorMemoria, setSectorMemoria] = useState(null);
  const [ciudadMemoria,  setCiudadMemoria]  = useState(null);
  const [tipoMemoria,    setTipoMemoria]    = useState(null);

  const [avisoPendiente, setAvisoPendiente] = useState(null);

  const enviar = async (textoUsuario) => {
    if (!textoUsuario.trim()) return;
    setLoading(true);

    try {
      let paqueteContexto;

      // ── NOVA ──────────────────────────────────────────────────────
      if (mode === 'novaExplora') {
        paqueteContexto = {
          ...contextData,
          ...armarSobreNova(textoUsuario, realItems, contextData),
        };

      // ── ISABELLA ──────────────────────────────────────────────────
      } else if (mode === 'servicios') {
        paqueteContexto = {
          ...contextData,
          ...armarSobreIsabella(textoUsuario, realItems),
        };

      // ── MAPACHE ───────────────────────────────────────────────────
      } else if (mode === 'mapache') {
        const catalogoLives = armarSobreMapache(realItems);
        const catalogoTuner = armarCatalogoTuner();
        paqueteContexto = {
          ...contextData,
          catalogo_audio: catalogoLives,
          canales_tuner:  catalogoTuner,
        };

      // ── EVELYN / LARRY ────────────────────────────────────────────
      } else if (mode === 'avisos') {
        const { sobreTexto, intencion, avisosRaw } = await armarSobreEvelyn(textoUsuario, contextData);
        paqueteContexto = {
          ...contextData,
          sobre_evelyn:     sobreTexto,
          intencion_avisos: intencion,
          avisos_raw:       avisosRaw,
        };

      // ── ORÁCULO ───────────────────────────────────────────────────
      } else if (mode === 'oraculo') {
        paqueteContexto = {
          ...contextData,
          ...armarSobreOraculo(textoUsuario, contextData),
        };

      // ── OSOS ──────────────────────────────────────────────────────
      } else {
        const infoChivada  = escanearEcosistema(textoUsuario, realItems);
        const sectorDetect = detectarSectorPS(textoUsuario);
        const ciudadDetect = detectarCiudadPS(textoUsuario);

        const sectorFinal = sectorDetect || sectorMemoria;
        const ciudadFinal = ciudadDetect?.valor || ciudadMemoria;
        const tipoFinal   = ciudadDetect?.tipo  || tipoMemoria;

        if (sectorDetect) setSectorMemoria(sectorDetect);
        if (ciudadDetect?.valor) {
          setCiudadMemoria(ciudadDetect.valor);
          setTipoMemoria(ciudadDetect.tipo);
        }

        // Sectores sin ubicación — handoff rápido del PS sin pasar por Groq
        if (sectorFinal && SECTORES_SIN_UBICACION.includes(sectorFinal)) {
          const frase = FRASES_HANDOFF[sectorFinal]?.() || 'Conectando...';
          // Aún así pasamos por Groq para que el Oso haga la confirmación SI/NO
          // El PS solo acelera si el sector ya fue confirmado (sectorMemoria ya estaba)
          // Si es detección nueva, dejamos que Groq pregunte con bolas SI/NO
          if (sectorMemoria === sectorFinal) {
            // Segunda vez — el user ya confirmó (llegó aquí de nuevo con el mismo sector)
            setMensaje(frase);
            setBolas([]);
            setSectorMemoria(null);
            setCiudadMemoria(null);
            setTipoMemoria(null);
            setTimeout(() => {
              onHandoff?.({
                agente:    sectorFinal,
                ciudad:    null,
                cp:        null,
                intencion: sectorFinal,
                comercio_especifico: null,
                modalidad: null,
              });
            }, 1500);
            return;
          }
          // Primera vez — dejamos que Groq confirme con bolas SI/NO
        }

        // Handoff rápido PS para sectores CON ubicación
        if (sectorFinal && ciudadFinal && !SECTORES_SIN_UBICACION.includes(sectorFinal)) {
          const frase = FRASES_HANDOFF[sectorFinal]?.(ciudadFinal) || `Conectando con ${ciudadFinal}...`;
          setMensaje(frase);
          setBolas([]);
          setSectorMemoria(null);
          setCiudadMemoria(null);
          setTipoMemoria(null);
          setTimeout(() => {
            onHandoff?.({
              agente:              sectorFinal,
              ciudad:              ciudadFinal,
              cp:                  '',
              intencion:           sectorFinal,
              comercio_especifico: null,
              modalidad:           tipoFinal === 'pais' ? 'ONLINE' : null,
            });
          }, 1500);
          return;
        }

        paqueteContexto = {
          ...contextData,
          port_system_informa: infoChivada,
          sector_detectado:    sectorFinal,
          ciudad_detectada:    ciudadFinal,
          tipo_ubicacion:      tipoFinal,
        };
      }

      const rawResponse = await askGroq(textoUsuario, mode, paqueteContexto);
      const jsonStr     = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const data        = JSON.parse(jsonStr);

      // ── Procesar respuesta ─────────────────────────────────────────

      if (mode === 'mapache') {
        setMensaje(data.mensaje || 'Sintonizando frecuencias...');
        setBolas(Array.isArray(data.bolas_sugerencia)
          ? data.bolas_sugerencia.map(b => ({ texto: typeof b === 'string' ? b : b.texto || '' }))
          : []);

        if (data.handoff && data.handoff.accion !== 'NINGUNA' && onHandoff) {
          onHandoff({
            accion:   data.handoff.accion,
            objetivo: data.handoff.objetivo       || '',
            tipo:     data.handoff.tipo            || 'NINGUNA',
            agente:   data.handoff.destino_agente  || 'MAPACHE',
          });
        }

      } else if (mode === 'avisos') {
        setMensaje(data.mensaje || '...');
        setBolas(Array.isArray(data.bolas) ? data.bolas : []);

        if (data.handoff === 'HANDOFF_AVISO_CONECTAR' && data.aviso_id) {
          const avisoTarget = paqueteContexto.avisos_raw?.find(av =>
            generarCodigoAvi(av.id) === data.aviso_id || av.id === data.aviso_id
          );
          if (avisoTarget) {
            setAvisoPendiente(avisoTarget);
            onAvisoConectar?.(avisoTarget);
          }
        }

        if (data.handoff === 'HANDOFF_AVISO_PUBLICAR' && data.titulo) {
          onAvisoPublicar?.({
            titulo:    data.titulo,
            contenido: data.contenido,
            tipo:      data.tipo || 'DEMANDA',
          });
        }

        if (data.handoff === 'HANDOFF_OSOS') {
          onHandoff?.({ agente: 'OSOS' });
        }

      } else if (mode === 'servicios') {
        if (data.handoff) {
          setMensaje(data.mensaje_despedida || 'Un momento, te conecto...');
          setBolas([]);
          if (onHandoff) {
            if (data.agente_destino === 'ISABELLA_VENTAS') {
              onHandoff({ agente: 'ISABELLA_VENTAS', bro_id: data.bro_id_target });
            } else {
              onHandoff({ agente: data.agente_destino });
            }
          }
        } else {
          setMensaje(data.mensaje);
          if (paqueteContexto?.port_system_context?.entidad_detectada) {
            const entidad = paqueteContexto.port_system_context.entidad_detectada;
            const itemCompleto = realItems.find(i => i.bro_id === entidad.bro_id);
            if (itemCompleto) onEntityFocus?.(itemCompleto);
          }
          setBolas(data.bolas || []);
        }

      } else if (mode === 'oraculo') {
        // ── ORÁCULO ───────────────────────────────────────────────────
        setMensaje(data.mensaje || '...');
        // Sin bolas — el Oráculo no tiene sugerencias clickables
        setBolas([]);

        // Si el Oráculo quiere invocar a los Osos
        if (data.handoff === 'HANDOFF_OSOS') {
          onHandoff?.({ agente: 'OSOS' });
        }

      } else {
        // ── NOVA / OSOS ───────────────────────────────────────────────
        if (data.handoff) {
          const agente         = data.agente_destino || '';
          const esSinUbicacion = SECTORES_SIN_UBICACION.includes(agente);
          const necesitaCiudad = ['BROSHOP_PRODUCTO', 'BROSHOP_SERVICIO', 'AUDIO', 'BROSHOP_AVISO'].includes(agente);
          const ciudadDestino  = data.contexto?.ciudad;

          // Sectores sin ubicación — handoff directo
          if (esSinUbicacion) {
            setMensaje(data.mensaje_despedida || 'Iniciando transferencia...');
            setBolas([]);
            setSectorMemoria(null);
            setCiudadMemoria(null);
            setTipoMemoria(null);
            setTimeout(() => {
              onHandoff?.({
                agente:    agente,
                ciudad:    null,
                cp:        null,
                intencion: agente,
                comercio_especifico: null,
                modalidad: null,
              });
            }, 1500);
            return;
          }

          // Sectores con ubicación — validar ciudad
          if (necesitaCiudad && !ciudadEsValida(ciudadDestino)) {
            setMensaje('¿En qué país o ciudad necesitas buscar?');
            setBolas(BOLAS_CIUDAD);
            return;
          }

          setMensaje(data.mensaje_despedida || 'Iniciando transferencia...');
          setBolas([]);

          if (onHandoff) {
            if (mode === 'novaExplora' && data.agente_destino === 'NOVA_VENTAS') {
              onHandoff({ agente: 'NOVA_VENTAS', bro_id: data.bro_id_target });
            } else if (data.contexto) {
              onHandoff({ agente: data.agente_destino, ...data.contexto });
            } else {
              onHandoff({ agente: data.agente_destino });
            }
          }

        } else {
          setMensaje(data.mensaje);
          if (paqueteContexto?.port_system_context?.entidad_detectada) {
            const entidad = paqueteContexto.port_system_context.entidad_detectada;
            const itemCompleto = realItems.find(i => i.bro_id === entidad.bro_id);
            if (itemCompleto) onEntityFocus?.(itemCompleto);
          }
          // Bolas vienen del prompt — SI/NO o vacías según contexto
          setBolas(Array.isArray(data.bolas) ? data.bolas : []);
        }
      }

    } catch (error) {
      console.error('Error en Agentes Groq:', error);
      setMensaje('⚠️ Error en el núcleo neón.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMensaje(null);
    setBolas([]);
    setSectorMemoria(null);
    setCiudadMemoria(null);
    setTipoMemoria(null);
    setAvisoPendiente(null);
  };

  return { mensaje, bolas, loading, enviar, reset, avisoPendiente };
};
