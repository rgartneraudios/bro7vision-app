// src/hooks/useAgentChat.js
import { useState } from 'react';
import { askGroq } from '../services/groq';
import { armarSobreMapache, armarCatalogoTuner } from '../services/portSystem';
import { detectarSectorPS, detectarCiudadPS } from '../services/agents/ososPS';
import { detectarIntencionAviso, extraerCodigoAviso, generarCodigoAvi, armarSobreEvelynTexto } from '../services/agents/evelynExploraPS';
import { supabase } from '../supabaseClient';

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

  // Query a tabla avisos — filtra por ciudad si la tenemos
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

  // Si busca un AVI específico, buscamos también sin filtro de ciudad
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

const CIUDAD_INVALIDA = ['', 'null', 'no especificada', 'no especificado', 'undefined', 'desconocida'];
const ciudadEsValida = (ciudad) => {
  if (!ciudad) return false;
  return !CIUDAD_INVALIDA.includes(ciudad.toLowerCase().trim());
};

const BOLAS_CIUDAD = [
  { texto: 'Madrid' },
  { texto: 'Barcelona' },
  { texto: 'Otra ciudad' },
];

const FRASES_HANDOFF = {
  AUDIO:            (lugar) => `¡Música en ${lugar}! Mapache te está esperando. 🎧`,
  BROSHOP_PRODUCTO: (lugar) => `${lugar}, vamos al escaparate. Nova tiene todo listo. 🛒`,
  BROSHOP_SERVICIO: (lugar) => `Buscando profesionales en ${lugar}. Te conecto ahora. 🔧`,
  AVISOS:           (lugar) => `El tablón de ${lugar} está abierto. ¡Vamos! 📋`,
};

// ── Hook principal ────────────────────────────────────────────────────
export const useAgentChat = ({ mode, contextData, onHandoff, onEntityFocus, onAvisoConectar, onAvisoPublicar, realItems = [] }) => {
  const [mensaje,  setMensaje]  = useState(null);
  const [bolas,    setBolas]    = useState([]);
  const [loading,  setLoading]  = useState(false);

  // ── MEMORIA INTERNA DEL PS ────────────────────────────────────────
  const [sectorMemoria, setSectorMemoria] = useState(null);
  const [ciudadMemoria,  setCiudadMemoria]  = useState(null);
  const [tipoMemoria,    setTipoMemoria]    = useState(null);

  // ── Memoria Evelyn — aviso pendiente de confirmar ─────────────────
  const [avisoPendiente, setAvisoPendiente] = useState(null);

  const enviar = async (textoUsuario) => {
    if (!textoUsuario.trim()) return;
    setLoading(true);

    try {
      let paqueteContexto;

      if (mode === 'novaExplora') {
        paqueteContexto = {
          ...contextData,
          ...armarSobreNova(textoUsuario, realItems, contextData),
        };

      } else if (mode === 'servicios') {
        paqueteContexto = {
          ...contextData,
          ...armarSobreIsabella(textoUsuario, realItems),
        };

      } else if (mode === 'mapache') {
        const catalogoLives = armarSobreMapache(realItems);
        const catalogoTuner = armarCatalogoTuner();
        paqueteContexto = {
          ...contextData,
          catalogo_audio: catalogoLives,
          canales_tuner:  catalogoTuner,
        };

      } else if (mode === 'avisos') {
        // ── EVELYN / LARRY ────────────────────────────────────────────
        const { sobreTexto, intencion, avisosRaw } = await armarSobreEvelyn(textoUsuario, contextData);

        paqueteContexto = {
          ...contextData,
          sobre_evelyn: sobreTexto,
          intencion_avisos: intencion,
          avisos_raw: avisosRaw,
        };

      } else {
        // ── OSOS ──────────────────────────────────────────────────────
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

        if (sectorFinal && ciudadFinal) {
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

      // ── Procesar respuesta según modo ─────────────────────────────
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
        // ── EVELYN / LARRY ────────────────────────────────────────────
        setMensaje(data.mensaje || '...');

        // Bolas dinámicas — las manda Groq en data.bolas
        setBolas(Array.isArray(data.bolas) ? data.bolas : []);

        // Handoff CONECTAR — el user confirmó con bola
        if (data.handoff === 'HANDOFF_AVISO_CONECTAR' && data.aviso_id) {
          const avisoTarget = paqueteContexto.avisos_raw?.find(av =>
            generarCodigoAvi(av.id) === data.aviso_id || av.id === data.aviso_id
          );
          if (avisoTarget) {
            setAvisoPendiente(avisoTarget);
            onAvisoConectar?.(avisoTarget);
          }
        }

        // Handoff PUBLICAR — el user confirmó con bola
        if (data.handoff === 'HANDOFF_AVISO_PUBLICAR' && data.titulo) {
          onAvisoPublicar?.({
            titulo:    data.titulo,
            contenido: data.contenido,
            tipo:      data.tipo || 'DEMANDA',
          });
        }

        // Handoff OSOS — volver a navegación
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

      } else {
        // ── Nova / Osos ───────────────────────────────────────────────
        if (data.handoff) {
          const agente         = data.agente_destino || '';
          const necesitaCiudad = ['BROSHOP_PRODUCTO', 'BROSHOP_SERVICIO', 'AUDIO', 'AVISOS'].includes(agente);
          const ciudadDestino  = data.contexto?.ciudad;

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
          setBolas(data.bolas || []);
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
