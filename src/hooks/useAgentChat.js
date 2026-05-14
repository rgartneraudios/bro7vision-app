// src/hooks/useAgentChat.js
// Solo React. Estado + coordinacion + Bifurcacion API (Admin/Publico).
// Modos activos: osos, oraculo. Todos los demás tienen hooks propios.

import { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { botOrchestrator } from '../services/agents/botOrchestrator';
import { buildPrompt, PERFILES } from '../services/agents/promptBuilder';
import { KNOWLEDGE_SOURCES } from '../services/agents/knowledgeSources';

import { detectarSectorPS, detectarCiudadPS, detectarEntidadPS } from '../services/agents/ososPS';

// ─── Geo promo selector ───────────────────────────────────────────────────────
function seleccionarPromoGeo(data, userCity) {
  if (userCity && data.promo_ciudad)     return data.promo_ciudad;
  if (data.promo_regional)              return data.promo_regional;
  if (data.promo_gran_regional)         return data.promo_gran_regional;
  if (data.promo_metropolis)            return data.promo_metropolis;
  if (data.promo_nacional)              return data.promo_nacional;
  if (data.promo_mundial)               return data.promo_mundial;
  return null;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const PER_SIN_CIUDAD = ['ORACULO_ORUMAMA', 'ORACULO_SMISTERIO', 'ORACULO_JAGUAR', 'REINOS'];
const SECTORES_SIN_UBICACION = ['REINOS', 'ORACULO', 'ORACULO_ORUMAMA', 'ORACULO_SMISTERIO', 'ORACULO_JAGUAR', 'GAMES'];

const FRASES_PEDIR_CIUDAD = [
  'En que ciudad buscas? Asi te conecto bien.',
  'Dime la ciudad y te paso directamente.',
  'Donde buscas? Ciudad o pais, lo que tengas.',
];
const fraseCiudad = () => FRASES_PEDIR_CIUDAD[Math.floor(Math.random() * FRASES_PEDIR_CIUDAD.length)];

const FRASES_HANDOFF = {};
const FRASES_PER_INTERNO = {};
const FRASES_PER_EXTERNO = {};

// ─── Frases de despedida por oso ─────────────────────────────────────────────

const DESPEDIDAS_OSO = {
  tito: [
    'Lo tengo en la libreta. Te paso.',
    'Anoto que te vas. Buen viaje.',
    'Interesante eleccion. Anotado.',
    'Yo sigo aqui con mis notas. Suerte.',
  ],
  lara: [
    'Con mucho gusto te paso. Van a cuidarte bien.',
    'Intuyo que vas a encontrar lo que buscas. Te enlazo ahora.',
    'Que buena idea. Ya veras que bien.',
    'Te paso ahora. Cuidate mucho.',
  ],
  puffo: [
    'Ahi te van a resolver. Te paso ya.',
    'Bien pensado. Suerte.',
    'Directo al grano, me gusta. Ahi va el enlace.',
    'Estas en buenas manos. Suerte.',
  ],
};

const despedidaOso = (oso_id) => {
  const id = (oso_id || 'tito').toLowerCase();
  const frases = DESPEDIDAS_OSO[id] || DESPEDIDAS_OSO.tito;
  return frases[Math.floor(Math.random() * frases.length)];
};

// ─── Helper: llamada a Mistral ─────────────────────────────────────────────────

async function llamarMistral({ system, messages, userMessage, iaMode }) {
  const res = await fetch('https://brovision-ai.bro7vision.workers.dev', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, messages, userMessage, iaMode }),
  });

  const data = await res.json();

  const uso = data?.uso;
  if (uso) console.log(`Mistral tokens — prompt: ${uso.prompt_tokens} | output: ${uso.completion_tokens} | total: ${uso.total_tokens}`);

  return data?.texto || '...';
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export const useAgentChat = ({
  mode,
  contextData,
  onHandoff,
  iaMode = 'off',
  isAdmin = false,
  onAvisoConectar,
  onAvisoPublicar,
}) => {
  const [mensaje, setMensaje] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const [sectorMemoria, setSectorMemoria] = useState(null);
  const [ciudadMemoria, setCiudadMemoria] = useState(null);
  const [tipoMemoria, setTipoMemoria]     = useState(null);

  const [ramaActual, setRamaActual] = useState(null);
  const actoRef                     = useRef('acto_1');

  // ── Estados del sandwich ──────────────────────────────────────────────────
  const [esperandoConfirmacion, setEsperandoConfirmacion] = useState(null);
  const [botNarrando, setBotNarrando] = useState(false);
  const [fechaNacimiento, setFechaNacimiento] = useState(null);
  const [esPatrocinado, setEsPatrocinado] = useState(false);

  const pushHistory = (role, content) => {
    setChatHistory(prev => {
      const nuevo = [...prev, { role, content }];
      return nuevo.slice(-6);
    });
  };

const obtenerVivencia = async (personajeId, userCity = '') => {
  if (!personajeId) return {};
  try {
    const { data } = await supabase
      .from('personaje_update')
      .select(`vivencia_actual, estado_animo,
               promo_ciudad, promo_regional, promo_gran_regional,
               promo_metropolis, promo_nacional, promo_mundial,
               special_activo, special_stock, special_texto,
               special_codigo, special_productor_email`)
      .eq('personaje_id', personajeId.toLowerCase())
      .maybeSingle();
    if (!data) return {};
    const promoGeo = seleccionarPromoGeo(data, userCity);
    const specialData = (data.special_activo && (data.special_stock ?? 0) > 0)
      ? {
          texto:           data.special_texto,
          codigo:          data.special_codigo,
          stock:           data.special_stock,
          productor_email: data.special_productor_email,
        }
      : null;
    return {
      vivencia:      data.vivencia_actual || '',
      estadoAnimo:   data.estado_animo    || '',
      promoGeo:      promoGeo || '',
      esPatrocinado: !!promoGeo,
      specialData:   specialData,
    };
  } catch {
    return {};
  }
};

  const procesarCanje = async (codigo, codigoUsuario, personajeIdLocal, specialDataLocal) => {
    const userId = contextData?.user_id || null;
    try {
      await supabase.from('b_special_canjes').insert([{
        personaje_id:   personajeIdLocal,
        special_codigo: codigo,
        user_id:        userId,
        codigo_usuario: codigoUsuario,
        estado:         'RESERVADO',
      }]);
      const nuevoStock = (specialDataLocal?.stock ?? 1) - 1;
      await supabase
        .from('personaje_update')
        .update({ special_stock: nuevoStock, ...(nuevoStock <= 0 ? { special_activo: false } : {}) })
        .eq('personaje_id', personajeIdLocal.toLowerCase());
      if (specialDataLocal?.productor_email) {
        fetch('https://brovision-ai.bro7vision.workers.dev', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action:         'email_canje',
            to:             specialDataLocal.productor_email,
            personaje_id:   personajeIdLocal,
            special_codigo: codigo,
            codigo_usuario: codigoUsuario,
            user_id:        userId,
          }),
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Error procesando canje:', err);
    }
  };

  const resolverPersonajeId = () => {
    if (mode === 'osos')   return (contextData?.oso_id || 'lara').toLowerCase();
    if (mode === 'oraculo') return null;
    return null;
  };

  const detectarFecha = (texto) => {
    const regexes = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
      /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
    ]
    for (const r of regexes) {
      const m = texto.match(r)
      if (m) return m[0]
    }
    return null
  }

const enviar = async (textoUsuario, extraContext = {}) => {
  if (!textoUsuario.trim()) return;
  setLoading(true);

  console.log('🔍 useAgentChat:', { mode, iaMode, isAdmin, iaActiva: (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin) });

    try {

      // ══════════════════════════════════════════════════════════════════
      // DETECCION TEMPRANA — por mode, sin gastar tokens
      // ══════════════════════════════════════════════════════════════════

      // ── OSOS ──────────────────────────────────────────────────────────
      if (mode === 'osos') {
        const sectorDetectTemprano = detectarSectorPS(textoUsuario);
        const ciudadDetectTemprana = detectarCiudadPS(textoUsuario);
        const sectorFinalTemp      = sectorDetectTemprano || sectorMemoria;
        const ciudadFinalTemp      = ciudadDetectTemprana?.valor || ciudadMemoria;

        if (sectorDetectTemprano) setSectorMemoria(sectorDetectTemprano);
        if (ciudadDetectTemprana?.valor) {
          setCiudadMemoria(ciudadDetectTemprana.valor);
          setTipoMemoria(ciudadDetectTemprana.tipo);
        }

        if (sectorFinalTemp && !SECTORES_SIN_UBICACION.includes(sectorFinalTemp)) {
          if (ciudadFinalTemp) {
            const frase = despedidaOso(contextData?.oso_id);
            setMensaje(frase);
            setSectorMemoria(null); setCiudadMemoria(null); setTipoMemoria(null);
            setTimeout(() => onHandoff?.({ agente: sectorFinalTemp, ciudad: ciudadFinalTemp, intencion: sectorFinalTemp }), 1200);
            setLoading(false);
            return;
          } else {
            setMensaje(fraseCiudad());
            setLoading(false);
            return;
          }
        }

        if (sectorFinalTemp && SECTORES_SIN_UBICACION.includes(sectorFinalTemp)) {
          const frase = despedidaOso(contextData?.oso_id);
          setMensaje(frase);
          setSectorMemoria(null);
          setTimeout(() => onHandoff?.({ agente: sectorFinalTemp, ciudad: null, intencion: sectorFinalTemp }), 1200);
          setLoading(false);
          return;
        }
      }

      // ══════════════════════════════════════════════════════════════════
      // BIFURCACION PRINCIPAL: API vs BOTS JS
      // ══════════════════════════════════════════════════════════════════

      const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);

      if (iaActiva) {
        const personajeId = resolverPersonajeId();

        // Oráculo migrado — usePersonajeChat lo gestiona
        if (mode === 'oraculo') {
          setLoading(false);
          return;
        }

        // ── Jaguar: detectar fecha de nacimiento ──────────────────────
        if (personajeId === 'jaguar') {
          const fechaDetectada = detectarFecha(textoUsuario)
          if (fechaDetectada) setFechaNacimiento(fechaDetectada)
        }

        // ── PASO 1: ¿Hay confirmación pendiente del bot? ──────────────
        if (esperandoConfirmacion) {
          const confirma = /^(sí|si|vale|claro|cuéntame|cuéntame|adelante|venga|sí por favor|si por favor|ok|okey|va|dale)$/i.test(textoUsuario.trim())
                        || /\b(sí|si|vale|claro|adelante|venga|cuéntame)\b/i.test(textoUsuario)
          const cancela  = /^(no|ahora no|paso|déjalo|dejalo|no gracias)$/i.test(textoUsuario.trim())

          if (confirma) {
            const fuentes = KNOWLEDGE_SOURCES[personajeId] || {}
            const dataBot = fuentes[esperandoConfirmacion.archivo]

            if (dataBot) {
              const bloque = iaActiva
                ? [dataBot.puente, dataBot.data, dataBot.continua].filter(Boolean).join('\n')
                : [dataBot.puente, dataBot.bot,  dataBot.continua].filter(Boolean).join('\n')
              pushHistory('user', textoUsuario)
              pushHistory('assistant', bloque)
              setMensaje(bloque)
              setEsperandoConfirmacion(null)
              setBotNarrando(true)
            } else {
              setEsperandoConfirmacion(null)
            }
            setLoading(false)
            return
          }

          if (cancela) {
            setEsperandoConfirmacion(null)
            setMensaje('Tranquilo, sin problema. ¿En qué más te puedo ayudar?')
            setLoading(false)
            return
          }

          setEsperandoConfirmacion(null)
        }

        // ── PASO 2: ¿El bot acaba de narrar? La IA retoma ────────────
        const esMC = botNarrando
        if (esMC) setBotNarrando(false)

        const { vivencia, estadoAnimo, promoGeo, esPatrocinado: esPromo, specialData } = await obtenerVivencia(personajeId, contextData?.ciudad);
        setEsPatrocinado(esPromo || false);

        const prompt = buildPrompt({
          personajeId,
          vivencia,
          estadoAnimo,
          promoGeo,
          specialData,
          userMessage: esMC ? '[MC] ' + textoUsuario : textoUsuario,
          chatHistory,
          fechaNacimiento,
        });

        if (!prompt) {
          setMensaje('...');
          setLoading(false);
          return;
        }

        const respuesta = await llamarMistral({
          system:      prompt.system,
          messages:    prompt.messages,
          userMessage: esMC ? '[MC] ' + textoUsuario : textoUsuario,
          iaMode,
        });

        // ── Detectar y procesar CANJE_CONFIRMADO ─────────────────────
        const canjeMatch = respuesta.match(/\[CANJE_CONFIRMADO:([^:]+):(\d{3})\]/);
        let respuestaFinal = respuesta;
        if (canjeMatch) {
          respuestaFinal = respuesta.replace(canjeMatch[0], '').trim();
          procesarCanje(canjeMatch[1], canjeMatch[2], personajeId, specialData).catch(console.error);
        }

        // ── PASO 3: ¿La IA emite señal BOT? ──────────────────────────
        if (respuestaFinal.startsWith('[BOT:')) {
          const match   = respuestaFinal.match(/\[BOT:(\w+)\]/)
          const archivo = match?.[1]
          const perfil  = PERFILES[personajeId]
          const temaDef = perfil?.temas_propios?.[archivo]
          if (temaDef) {
            pushHistory('user', textoUsuario)
            pushHistory('assistant', temaDef.pregunta)
            setMensaje(temaDef.pregunta)
            setEsperandoConfirmacion({ archivo })
            setLoading(false)
            return
          }
        }

        // ── HANDOFF directo de la IA ──────────────────────────────────
        if (respuestaFinal.startsWith('HANDOFF:')) {
          const partes = respuestaFinal.replace('HANDOFF:', '').trim().split(':');
          const codigoHandoff  = partes[0];
          const destinoHandoff = partes[1] || null;
          onHandoff?.({
            agente: codigoHandoff,
            ciudad: ciudadMemoria,
            ...(destinoHandoff && { personaje_id: destinoHandoff }),
            ...(destinoHandoff && codigoHandoff === 'OSOS_INTERNO' && { oso_id: destinoHandoff }),
          });
          setLoading(false);
          return;
        }

        pushHistory('user', textoUsuario);
        pushHistory('assistant', respuestaFinal);
        setMensaje(respuestaFinal);
        setLoading(false);
        return;
      }

      // ══════════════════════════════════════════════════════════════════
      // FALLBACK: BOTS JS
      // ══════════════════════════════════════════════════════════════════

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
        }

        const sectorDetect = detectarSectorPS(textoUsuario);
        const ciudadDetect = detectarCiudadPS(textoUsuario);
        const sectorFinal  = sectorDetect || sectorMemoria;
        const ciudadFinal  = ciudadDetect?.valor || ciudadMemoria;
        const tipoFinal    = ciudadDetect?.tipo  || tipoMemoria;

        if (sectorDetect)        setSectorMemoria(sectorDetect);
        if (ciudadDetect?.valor) { setCiudadMemoria(ciudadDetect.valor); setTipoMemoria(ciudadDetect.tipo); }

        if (sectorFinal && ciudadFinal && !SECTORES_SIN_UBICACION.includes(sectorFinal.replace('PER_PENDIENTE_', ''))) {
          const agenteDestino = sectorFinal.startsWith('PER_PENDIENTE_')
            ? sectorFinal.replace('PER_PENDIENTE_', '')
            : sectorFinal;
          setMensaje(FRASES_HANDOFF[agenteDestino]?.(ciudadFinal) || `Conectando con ${ciudadFinal}...`);
          setSectorMemoria(null); setCiudadMemoria(null); setTipoMemoria(null);
          setTimeout(() => onHandoff?.({ agente: agenteDestino, ciudad: ciudadFinal, intencion: agenteDestino, modalidad: tipoFinal === 'pais' ? 'ONLINE' : null }), 1500);
          return;
        }

        const resultado = await botOrchestrator({
          mode: 'osos', textoUsuario,
          oso_id:     contextData?.oso_id || 'lara',
          sectorFinal, ciudadFinal,
          actoActual: actoRef.current,
          ramaActual: null,
          supabase,
        });

        setMensaje(resultado.mensaje);
        if (resultado.siguienteActo) actoRef.current = resultado.siguienteActo;
        if (resultado.rama !== undefined) setRamaActual(resultado.rama);
        if (resultado.handoff) onHandoff?.(resultado.handoffData);
        return;
      }

    } catch (error) {
      console.error('Error en useAgentChat:', error);
      setMensaje('Error en el nucleo neon.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMensaje(null);
    setChatHistory([]);
    setSectorMemoria(null);
    setCiudadMemoria(null);
    setTipoMemoria(null);
    setRamaActual(null);
    setEsperandoConfirmacion(null);
    setBotNarrando(false);
    setFechaNacimiento(null);
    setEsPatrocinado(false);
    actoRef.current = 'acto_1';
  };

  return { mensaje, loading, enviar, reset, esPatrocinado };
};
