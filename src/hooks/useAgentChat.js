// src/hooks/useAgentChat.js
// Solo React. Estado + coordinación + Bifurcación API (Admin/Público).

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
  '¿En qué ciudad buscas? Así te conecto bien.',
  'Dime la ciudad y te paso directamente.',
  '¿Dónde buscas? Ciudad o país, lo que tengas.',
];
const fraseCiudad = () => FRASES_PEDIR_CIUDAD[Math.floor(Math.random() * FRASES_PEDIR_CIUDAD.length)];

const FRASES_HANDOFF = {};
const FRASES_PER_INTERNO = {};
const FRASES_PER_EXTERNO = {};

// ─── Helper: llamada a Gemini ─────────────────────────────────────────────────

async function llamarGemini({ system, messages, userMessage }) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  // Gemini no tiene campo "system" separado — lo metemos como primer turno de usuario
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
  iaMode = 'off',     // 'off' | 'admin' | 'public'
  isAdmin = false,
  onAvisoConectar,
  onAvisoPublicar,
}) => {
  const [mensaje, setMensaje] = useState(null);
  const [loading, setLoading] = useState(false);

  // Historial para la IA — últimos 6 mensajes
  const [chatHistory, setChatHistory] = useState([]);

  // Memoria de navegación OSOS
  const [sectorMemoria, setSectorMemoria]   = useState(null);
  const [ciudadMemoria, setCiudadMemoria]   = useState(null);
  const [tipoMemoria, setTipoMemoria]       = useState(null);

  // Estado narrativo — 3 actos
  const [ramaActual, setRamaActual]         = useState(null);
  const actoRef                             = useRef('acto_1');

  // Estado aviso en construcción
  const [avisoEnConstruccion, setAvisoEnConstruccion] = useState(null);
  const avisoConectarRef = useRef(null);

  // ─── Helper: añadir al historial ────────────────────────────────────────────
  const pushHistory = (role, content) => {
    setChatHistory(prev => {
      const nuevo = [...prev, { role, content }];
      return nuevo.slice(-6); // máximo 6 mensajes
    });
  };

  // ─── Helper: obtener vivencia actual del personaje ───────────────────────────
  const obtenerVivencia = async (personajeId) => {
    if (!personajeId) return '';
    try {
      const { data } = await supabase
        .from('personaje_update')
        .select('vivencias_actuales')
        .eq('personaje_id', personajeId.toLowerCase())
        .maybeSingle();
      return data?.vivencias_actuales || '';
    } catch {
      return '';
    }
  };

  // ─── Helper: resolver personajeId según mode ────────────────────────────────
  const resolverPersonajeId = () => {
  if (mode === 'osos')        return contextData?.oso_id || 'lara';
  if (mode === 'novaExplora') return 'nova';
  if (mode === 'servicios')   return contextData?.servicios_personaje || 'isabella';
  if (mode === 'mapache')     return contextData?.audio_personaje || 'mapache';
  if (mode === 'oraculo')     return contextData?.oraculo_personaje || 'orumama';
  if (mode === 'reinos')      return 'rumores';
  if (mode === 'avisos')      return contextData?.avisos_personaje || 'evelyn'; // ← añadir
  return null;
};

  const enviar = async (textoUsuario) => {
    if (!textoUsuario.trim()) return;
    setLoading(true);

    try {
      // ════════════════════════════════════════════════════════════════════
      // BIFURCACIÓN PRINCIPAL: API vs BOTS JS
      // ════════════════════════════════════════════════════════════════════

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
          // personaje no encontrado — fallback a bot JS
          setMensaje('...');
          setLoading(false);
          return;
        }

        const respuesta = await llamarGemini({
          system:      prompt.system,
          messages:    prompt.messages,
          userMessage: textoUsuario,
        });

        // Detectar handoff declarado por la IA
        if (respuesta.startsWith('HANDOFF:')) {
          const codigoHandoff = respuesta.replace('HANDOFF:', '').trim();
          onHandoff?.({ agente: codigoHandoff, ciudad: ciudadMemoria });
          setLoading(false);
          return;
        }

        // Guardar en historial y mostrar respuesta
        pushHistory('user', textoUsuario);
        pushHistory('assistant', respuesta);
        setMensaje(respuesta);
        setLoading(false);
        return;
      }

      // ════════════════════════════════════════════════════════════════════
      // FALLBACK: BOTS JS (lógica clásica — sin cambios)
      // ════════════════════════════════════════════════════════════════════

      // ── OSOS ──────────────────────────────────────────────────────────────
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

        const sectorDetect  = detectarSectorPS(textoUsuario);
        const ciudadDetect  = detectarCiudadPS(textoUsuario);
        const sectorFinal   = sectorDetect || sectorMemoria;
        const ciudadFinal   = ciudadDetect?.valor || ciudadMemoria;
        const tipoFinal     = ciudadDetect?.tipo  || tipoMemoria;

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
        return;
      }

      // ── NOVA ──────────────────────────────────────────────────────────────
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

      // ── SERVICIOS ─────────────────────────────────────────────────────────
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

      // ── AUDIO ─────────────────────────────────────────────────────────────
      if (mode === 'mapache') {
        const resultado = await botOrchestrator({
          mode: 'mapache', textoUsuario,
          entidad:        contextData?.entidad,
          hayTarjetas:    contextData?.hayTarjetas,
          audio_personaje: contextData?.audio_personaje || 'mapache',
          supabase,
        });
        setMensaje(resultado.mensaje);
        if (resultado.handoff) onHandoff?.(resultado.handoffData);
        return;
      }

      // ── ORÁCULO ───────────────────────────────────────────────────────────
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

      // ── REINOS ────────────────────────────────────────────────────────────
      if (mode === 'reinos') {
        const resultado = await botOrchestrator({
          mode: 'reinos', textoUsuario,
          reinos:      contextData?.reinos,
          reinoDetalle: contextData?.reinoDetalle,
          supabase,
        });
        setMensaje(resultado.mensaje);
        return;
      }

      // ── AVISOS — nunca va por IA ──────────────────────────────────────────
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
        if (resultado.avisoConectar) { avisoConectarRef.current = resultado.avisoConectar; onAvisoConectar?.(resultado.avisoConectar); }
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