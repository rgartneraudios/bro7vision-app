// src/hooks/useAgentChat.js
// Solo React. Estado + coordinacion + Bifurcacion API (Admin/Publico).

import { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { botOrchestrator } from '../services/agents/botOrchestrator';
import { buildPrompt, PERFILES } from '../services/agents/promptBuilder';
import { KNOWLEDGE_SOURCES } from '../services/agents/knowledgeSources';
import { buildNovaExploraPrompt } from '../services/agents/novaExploraPS';
import { detectarBusquedaProducto, fraseBuscando } from '../services/agents/bots/novaBot';

import { detectarSectorPS, detectarCiudadPS, detectarEntidadPS } from '../services/agents/ososPS';
import { detectarRama } from '../services/agents/bots/ososUtils';
import { detectarCodigoMapache } from '../services/agents/mapachePS';

import { detectarSalidaNova,     detectarIntencionNova     } from '../services/agents/bots/novaUtils';
import { detectarSalidaIsabella, detectarInternoIsabella, detectarIntencionIsabella } from '../services/agents/bots/isabellaUtils';
import { detectarSalidaMapache,  detectarInternoMapache,  detectarIntencionMapache  } from '../services/agents/bots/mapacheUtils';
import { detectarSalidaAviso,    detectarInternoAviso                                } from '../services/agents/bots/avisoUtils';
import { detectarSalidaOraculo,  detectarInternoOraculo,  detectarIntencionOraculo  } from '../services/agents/bots/oraculoUtils';
import { detectarSalidaReinos,   detectarIntencionReinos                             } from '../services/agents/bots/reinosUtils';

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

// ─── Helper: llamada a Gemini ─────────────────────────────────────────────────

async function llamarGemini({ system, messages, userMessage, iaMode }) {
  const apiKey = iaMode === 'admin'
    ? import.meta.env.VITE_GEMINI_ADMIN_KEY
    : import.meta.env.VITE_GEMINI_PUBLIC_KEY;

  const modelo = 'gemini-2.5-flash-lite';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`;

  const historialFormateado = [
    { role: 'user', parts: [{ text: system }] },
    { role: 'model', parts: [{ text: 'Entendido. Estoy listo.' }] },
    ...messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: historialFormateado }),
  });

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '...';
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
  const realItems = contextData?.realItems || []

  const [sectorMemoria, setSectorMemoria] = useState(null);
  const [ciudadMemoria, setCiudadMemoria] = useState(null);
  const [tipoMemoria, setTipoMemoria]     = useState(null);

  const [ramaActual, setRamaActual] = useState(null);
  const actoRef                     = useRef('acto_1');

  const [avisoEnConstruccion, setAvisoEnConstruccion] = useState(null);
  const avisoConectarRef = useRef(null);

  // ── Estados del sandwich ──────────────────────────────────────────────────
  // esperandoConfirmacion: { archivo: 'ia_prepago' } | null
  const [esperandoConfirmacion, setEsperandoConfirmacion] = useState(null);
  // botNarrando: true mientras el bot narró y la IA espera para cerrar
  const [botNarrando, setBotNarrando] = useState(false);
  // fechaNacimiento: para Jaguar — se guarda cuando el user la escribe
  const [fechaNacimiento, setFechaNacimiento] = useState(null);

  const pushHistory = (role, content) => {
    setChatHistory(prev => {
      const nuevo = [...prev, { role, content }];
      return nuevo.slice(-6);
    });
  };

  const obtenerVivencia = async (personajeId) => {
    if (!personajeId) return '';
    try {
      const { data } = await supabase
        .from('personaje_update')
        .select('vivencia_actual')
        .eq('personaje_id', personajeId.toLowerCase())
        .maybeSingle();
      return data?.vivencia_actual || '';
    } catch {
      return '';
    }
  };

  const resolverPersonajeId = () => {
    if (mode === 'osos')        return (contextData?.oso_id || 'lara').toLowerCase();
    if (mode === 'novaExplora') return 'nova';
    if (mode === 'novaCierre')  return 'nova_cierre';
    if (mode === 'servicios')   return contextData?.servicios_personaje || 'isabella';
    if (mode === 'mapache')     return contextData?.audio_personaje || 'mapache';
    if (mode === 'oraculo')     return contextData?.oraculo_personaje || 'orumama';
    if (mode === 'reinos')      return 'rumores';
    if (mode === 'avisos')      return contextData?.avisos_personaje || 'evelyn';
    return null;
  };

  // ── Helper: detectar fecha de nacimiento en texto libre ──────────────────
  const detectarFecha = (texto) => {
    // Formatos: DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY
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

const enviar = async (textoUsuario) => {
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

      // ── NOVA EXPLORA ──────────────────────────────────────────────────
      if (mode === 'novaExplora') {
        const salida = detectarSalidaNova(textoUsuario);
        if (salida) {
          setMensaje(salida.mensaje);
          setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
          setLoading(false);
          return;
        }
      }

      // ── NOVA CIERRE ───────────────────────────────────────────────────
      if (mode === 'novaCierre') {
        const salida = detectarSalidaNova(textoUsuario);
        if (salida) {
          setMensaje(salida.mensaje);
          setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
          setLoading(false);
          return;
        }
      }

      // ── SERVICIOS (Isabella + Profesor) ───────────────────────────────
      if (mode === 'servicios') {
        const salida   = detectarSalidaIsabella(textoUsuario);
        if (salida) {
          setMensaje(salida.mensaje);
          setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
          setLoading(false);
          return;
        }
        const personajeActivo = contextData?.servicios_personaje || 'isabella';
        const interno = detectarInternoIsabella(textoUsuario, personajeActivo);
        if (interno) {
          setMensaje(interno.mensaje || '...');
          onHandoff?.({ agente: 'SERVICIO_INTERNO', personaje_id: interno.personaje_id });
          setLoading(false);
          return;
        }
      }

      // ── MAPACHE (Mapache + Ami) ────────────────────────────────────────
if (mode === 'mapache') {
  const salida = detectarSalidaMapache(textoUsuario);
  if (salida) {
    setMensaje(salida.mensaje);
    setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
    setLoading(false);
    return;
  }
  const personajeActivo = contextData?.audio_personaje || 'mapache';
  const interno = detectarInternoMapache(textoUsuario, personajeActivo);
  if (interno) {
    setMensaje(interno.mensaje || '...');
    onHandoff?.({ agente: 'AUDIO_INTERNO', personaje_id: interno.personaje_id });
    setLoading(false);
    return;
  }
  
if (/\b(stop|para|detén|frena|detener|frenar)\b/i.test(textoUsuario)) {
  onHandoff?.({ agente: 'AUDIO_STOP' })
  setMensaje('Parado. 🎵')
  setLoading(false)
  return
}

  // ── NUEVO: detector de códigos AUD/POD ──────────────────────────
  const codigoAudio = detectarCodigoMapache(textoUsuario);
  if (codigoAudio) {
    if (codigoAudio.accion === 'PLAY') {
      const canal = (contextData?.realItems || []).find(c =>
        String(c.bro_aud) === String(codigoAudio.codigo) ||
        String(c.bro_pod) === String(codigoAudio.codigo)
      );
      if (canal) {
        setMensaje('Dale. 🎵');
        onHandoff?.({ agente: 'AUDIO_PLAY', codigo: codigoAudio.codigo, canal });
      } else {
        setMensaje('No encuentro ese canal. ¿El código es correcto?');
      }
      setLoading(false);
      return;
    }
    if (codigoAudio.accion === 'BOLAS') {
      setMensaje(`¿Qué hacemos con ${codigoAudio.codigo}?`);
      setLoading(false);
      return;
    }
    // DESCRIBE — deja que la IA lo narre si está activa, o el bot
  }
}
      // ── AVISOS (Evelyn + Larry) ────────────────────────────────────────
      if (mode === 'avisos') {
        const avisoEnProceso = avisoEnConstruccion?.tipo;
        if (!avisoEnProceso) {
          const salida = detectarSalidaAviso(textoUsuario);
          if (salida) {
            setMensaje(salida.mensaje);
            setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
            setLoading(false);
            return;
          }
          const personajeActivo = contextData?.avisos_personaje || 'evelyn';
          const interno = detectarInternoAviso(textoUsuario, personajeActivo);
          if (interno) {
            setMensaje(interno.mensaje || '...');
            onHandoff?.({ agente: 'AVISO_INTERNO', personaje_id: interno.personaje_id });
            setLoading(false);
            return;
          }
        }
      }

      // ── ORACULO (Orumama + Jaguar + SMisterio) ────────────────────────
      if (mode === 'oraculo') {
        const salida = detectarSalidaOraculo(textoUsuario);
        if (salida) {
          setMensaje(salida.mensaje);
          setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
          setLoading(false);
          return;
        }
        const personajeActivo = contextData?.oraculo_personaje || 'orumama';
        const interno = detectarInternoOraculo(textoUsuario, personajeActivo);
        if (interno) {
          setMensaje(interno.mensaje || '...');
          onHandoff?.({ agente: 'ORACULO_INTERNO', personaje_id: interno.personaje_id });
          setLoading(false);
          return;
        }
      }

      // ── REINOS ────────────────────────────────────────────────────────
      if (mode === 'reinos') {
        const salida = detectarSalidaReinos(textoUsuario);
        if (salida) {
          setMensaje(salida.mensaje);
          setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
          setLoading(false);
          return;
        }
      }

      // ══════════════════════════════════════════════════════════════════
      // BIFURCACION PRINCIPAL: API vs BOTS JS
      // ══════════════════════════════════════════════════════════════════

      const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);
      const avisoEnProceso = mode === 'avisos' && avisoEnConstruccion?.tipo;

      if (iaActiva && !avisoEnProceso) {
        const personajeId = resolverPersonajeId();

        // ── Nova tiene su propio prompt builder ────────────────────────
        if (mode === 'novaExplora') {
          const systemNova = buildNovaExploraPrompt({
            alias:  contextData?.alias,
            ciudad: contextData?.ciudad,
            port_system_context: {
              hay_tarjetas:        contextData?.hayTarjetas,
              intencion_detectada: detectarIntencionNova(textoUsuario),
              entidad_detectada:   contextData?.entidad || null,
            },
          });
          const respuesta = await llamarGemini({
            system:      systemNova,
            messages:    chatHistory.slice(-4),
            userMessage: textoUsuario,
            iaMode,
          });
          try {
            const match = respuesta.match(/\{[\s\S]*\}/);
            if (!match) throw new Error('No JSON found');
            const parsed = JSON.parse(match[0]);
            if (parsed.handoff && parsed.agente_destino) {
              onHandoff?.({ agente: parsed.agente_destino, bro_id: parsed.bro_id_target || null });
              setLoading(false);
              return;
            }
            pushHistory('user', textoUsuario);
            pushHistory('assistant', parsed.mensaje || '...');
            setMensaje(parsed.mensaje || '...');
          } catch {
            pushHistory('user', textoUsuario);
            pushHistory('assistant', respuesta);
            setMensaje(respuesta);
          }
          setLoading(false);
          return;
        }

        // ══════════════════════════════════════════════════════════════
        // FLUJO SANDWICH — resto de personajes
        // ══════════════════════════════════════════════════════════════

        // ── Jaguar: detectar fecha de nacimiento en el mensaje ─────────
        if (personajeId === 'jaguar') {
          const fechaDetectada = detectarFecha(textoUsuario)
          if (fechaDetectada) setFechaNacimiento(fechaDetectada)
        }

        // ── PASO 1: ¿Hay confirmación pendiente del bot? ───────────────
        if (esperandoConfirmacion) {
          const confirma = /^(sí|si|vale|claro|cuéntame|cuéntame|adelante|venga|sí por favor|si por favor|ok|okey|va|dale)$/i.test(textoUsuario.trim())
                        || /\b(sí|si|vale|claro|adelante|venga|cuéntame)\b/i.test(textoUsuario)

          const cancela  = /^(no|ahora no|paso|déjalo|dejalo|no gracias)$/i.test(textoUsuario.trim())

          if (confirma) {
            const fuentes = KNOWLEDGE_SOURCES[personajeId] || {}
            const dataBot = fuentes[esperandoConfirmacion.archivo]

            if (dataBot) {
              const bloque = [dataBot.puente, dataBot.data, dataBot.continua]
                .filter(Boolean)
                .join('\n')
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

          // Si no confirma ni cancela, borra la espera y sigue normal
          setEsperandoConfirmacion(null)
        }

        // ── PASO 2: ¿El bot acaba de narrar? La IA retoma ─────────────
        // botNarrando=true significa que el último mensaje fue del bot
        // La IA recibe el continua en el historial y cierra con su voz
        const esMC = botNarrando
        if (esMC) setBotNarrando(false)
        // No hace return — deja que la IA responda normal con el historial

        // ── Construir prompt y llamar a Gemini ────────────────────────
        const vivencia = await obtenerVivencia(personajeId);
        const prompt = buildPrompt({
          personajeId,
          vivencia,
          userMessage: esMC ? '[MC] ' + textoUsuario : textoUsuario,
          chatHistory,
          fechaNacimiento,
        });

        if (!prompt) {
          setMensaje('...');
          setLoading(false);
          return;
        }

        const respuesta = await llamarGemini({
          system:      prompt.system,
          messages:    prompt.messages,
          userMessage: esMC ? '[MC] ' + textoUsuario : textoUsuario,
          iaMode,
        });

        // ── PASO 3: ¿La IA emite señal BOT? ──────────────────────────
        if (respuesta.startsWith('[BOT:')) {
          const match   = respuesta.match(/\[BOT:(\w+)\]/)
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
        if (respuesta.startsWith('HANDOFF:')) {
          const partes = respuesta.replace('HANDOFF:', '').trim().split(':');
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

        // ── Respuesta normal ──────────────────────────────────────────
        pushHistory('user', textoUsuario);
        pushHistory('assistant', respuesta);
        setMensaje(respuesta);
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

        const rama = detectarRama(textoUsuario);
        if (rama) setRamaActual(rama);

        const resultado = await botOrchestrator({
          mode: 'osos', textoUsuario,
          oso_id:     contextData?.oso_id || 'lara',
          sectorFinal, ciudadFinal,
          actoActual: actoRef.current,
          ramaActual: rama || ramaActual,
          supabase,
        });

        setMensaje(resultado.mensaje);
        if (resultado.siguienteActo) actoRef.current = resultado.siguienteActo;
        if (resultado.rama !== undefined) setRamaActual(resultado.rama);
        if (resultado.handoff) onHandoff?.(resultado.handoffData);
        return;
      }

      if (mode === 'novaExplora') {
        // Detectar búsqueda de producto PRIMERO — sin IA
        const keyword = detectarBusquedaProducto(textoUsuario);
        if (keyword) {
          setMensaje(fraseBuscando());
          onHandoff?.({ agente: 'BUSCAR_STRIP', keyword, intencion: 'BROSHOP_PRODUCTO' });
          return;
        }

        const resultado = await botOrchestrator({
          mode: 'novaExplora', textoUsuario,
          entidad:     contextData?.entidad,
          hayTarjetas: contextData?.hayTarjetas,
          intencion:   detectarIntencionNova(textoUsuario),
          supabase,
        });
        setMensaje(resultado.mensaje);
        if (resultado.handoff) onHandoff?.(resultado.handoffData);
        return;
      }

      if (mode === 'novaCierre') {
        const resultado = await botOrchestrator({
          mode: 'novaCierre', textoUsuario,
          entidad:     contextData?.entidad,
          hayTarjetas: contextData?.hayTarjetas,
          supabase,
        });
        setMensaje(resultado.mensaje);
        if (resultado.handoff) onHandoff?.(resultado.handoffData);
        return;
      }

      if (mode === 'servicios') {
        const resultado = await botOrchestrator({
          mode: 'servicios', textoUsuario,
          entidad:             contextData?.entidad,
          hayTarjetas:         contextData?.hayTarjetas,
          servicios_personaje: contextData?.servicios_personaje || 'isabella',
          intencion:           detectarIntencionIsabella(textoUsuario),
          supabase,
        });
        setMensaje(resultado.mensaje);
        if (resultado.handoff) onHandoff?.(resultado.handoffData);
        return;
      }

      if (mode === 'mapache') {
        const resultado = await botOrchestrator({
          mode: 'mapache', textoUsuario,
          entidad:         contextData?.entidad,
          hayTarjetas:     contextData?.hayTarjetas,
          audio_personaje: contextData?.audio_personaje || 'mapache',
          intencion:       detectarIntencionMapache(textoUsuario),
          supabase,
        });
        setMensaje(resultado.mensaje);
        if (resultado.handoff) onHandoff?.(resultado.handoffData);
        return;
      }

      if (mode === 'oraculo') {
        const resultado = await botOrchestrator({
          mode: 'oraculo', textoUsuario,
          oraculo_personaje: contextData?.oraculo_personaje || 'orumama',
          intencion:         detectarIntencionOraculo(textoUsuario),
          supabase,
        });
        setMensaje(resultado.mensaje);
        if (resultado.handoff) onHandoff?.(resultado.handoffData);
        return;
      }

      if (mode === 'reinos') {
        const resultado = await botOrchestrator({
          mode: 'reinos', textoUsuario,
          reinos:       contextData?.reinos,
          reinoDetalle: contextData?.reinoDetalle,
          intencion:    detectarIntencionReinos(textoUsuario),
          supabase,
        });
        setMensaje(resultado.mensaje);
        return;
      }

      if (mode === 'avisos') {
        const resultado = await botOrchestrator({
          mode: 'avisos', textoUsuario,
          avisos_personaje:    contextData?.avisos_personaje || 'evelyn',
          avisoEnConstruccion,
          genesis:     contextData?.genesis,
          ciudad:      contextData?.ciudad,
          user_id:     contextData?.user_id,
          autor_alias: contextData?.autor_alias,
          supabase,
          onAvisoPublicar,
        });
        setMensaje(resultado.mensaje);
        if (resultado.avisoEnConstruccion !== undefined) setAvisoEnConstruccion(resultado.avisoEnConstruccion);
        if (resultado.handoff) onHandoff?.(resultado.handoffData);
        if (resultado.avisoConectar) { avisoConectarRef.current = resultado.avisoConectar; onAvisoConectar?.(resultado.avisoConectar); }
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
    setAvisoEnConstruccion(null);
    setRamaActual(null);
    setEsperandoConfirmacion(null);
    setBotNarrando(false);
    setFechaNacimiento(null);
    actoRef.current = 'acto_1';
    avisoConectarRef.current = null;
  };

  return { mensaje, loading, enviar, reset, avisoEnConstruccion };
};
