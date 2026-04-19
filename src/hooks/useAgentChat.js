// src/hooks/useAgentChat.js
// Solo React. Estado + coordinacion + Bifurcacion API (Admin/Publico).

import { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { botOrchestrator } from '../services/agents/botOrchestrator';
import { buildPrompt } from '../services/agents/promptBuilder';

import { detectarSectorPS, detectarCiudadPS, detectarEntidadPS } from '../services/agents/ososPS';
import { detectarRama } from '../services/agents/bots/ososUtils';

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

// ─── Frases de despedida por oso — sin IA, sin tokens ────────────────────────

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

  const [sectorMemoria, setSectorMemoria] = useState(null);
  const [ciudadMemoria, setCiudadMemoria] = useState(null);
  const [tipoMemoria, setTipoMemoria]     = useState(null);

  const [ramaActual, setRamaActual] = useState(null);
  const actoRef                     = useRef('acto_1');

  const [avisoEnConstruccion, setAvisoEnConstruccion] = useState(null);
  const avisoConectarRef = useRef(null);

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
    if (mode === 'servicios')   return contextData?.servicios_personaje || 'isabella';
    if (mode === 'mapache')     return contextData?.audio_personaje || 'mapache';
    if (mode === 'oraculo')     return contextData?.oraculo_personaje || 'orumama';
    if (mode === 'reinos')      return 'rumores';
    if (mode === 'avisos')      return contextData?.avisos_personaje || 'evelyn';
    return null;
  };

  const enviar = async (textoUsuario) => {
    if (!textoUsuario.trim()) return;
    setLoading(true);

    try {

      // ══════════════════════════════════════════════════════════════════
      // DETECCION TEMPRANA DE HANDOFF — solo mode osos, sin gastar tokens
      // ══════════════════════════════════════════════════════════════════

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
      const avisoEnProceso = mode === 'avisos' && avisoEnConstruccion?.tipo;

      if (iaActiva && !avisoEnProceso) {

        const personajeId = resolverPersonajeId();
        const vivencia    = await obtenerVivencia(personajeId);

        const prompt = buildPrompt({
          personajeId,
          vivencia,
          userMessage: textoUsuario,
          chatHistory,
        });

        if (!prompt) {
          setMensaje('...');
          setLoading(false);
          return;
        }

        const respuesta = await llamarGemini({
          system:      prompt.system,
          messages:    prompt.messages,
          userMessage: textoUsuario,
          iaMode,
        });

        if (respuesta.startsWith('HANDOFF:')) {
          const codigoHandoff = respuesta.replace('HANDOFF:', '').trim();
          onHandoff?.({ agente: codigoHandoff, ciudad: ciudadMemoria });
          setLoading(false);
          return;
        }

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
        const resultado = await botOrchestrator({
          mode: 'novaExplora', textoUsuario,
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
    actoRef.current = 'acto_1';
    avisoConectarRef.current = null;
  };

  return { mensaje, loading, enviar, reset, avisoEnConstruccion };
};
