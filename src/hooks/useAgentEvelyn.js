// src/hooks/useAgentEvelyn.js
// Hook exclusivo del sector Avisos. Gestiona Evelyn y Larry.
// personaje = 'evelyn' | 'larry'
// Toda la lógica de publicación, consulta y conexión de avisos vive aquí.

import { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { fetchContextoEvelyn } from '../services/contexto/fetchContextoEvelyn';
import { fetchContextoLarry }  from '../services/contexto/fetchContextoLarry';
import { detectarSalidaAviso, detectarInternoAviso } from '../services/agents/bots/avisoUtils';
import { detectarBusquedaAviso, fraseBuscandoAviso, responder as evelynBot } from '../services/agents/bots/evelynBot';
import { responder as larryBot } from '../services/agents/bots/larryBot';
import {
  buildEvelynExploraPrompt,
  armarSobreEvelynTexto,
  extraerCampo,
  siguienteCampo,
  generarCodigoAvi,
} from '../services/agents/evelynExploraPS';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';

// ── Helpers ───────────────────────────────────────────────────────────────────

function esIntencionPublicar(texto) {
  const t = texto.trim();
  if (t.toUpperCase() === 'P') return true;
  return /\bpublicar\b|\bcrear aviso\b|\bnuevo aviso\b|\bponer aviso\b|\bañadir aviso\b/i.test(t);
}

function esIntencionConsultar(texto) {
  const t = texto.trim();
  if (t.toUpperCase() === 'C') return true;
  return /\bver avisos\b|\bconsultar avisos\b|\bque avisos hay\b|\bqué avisos hay\b/i.test(t);
}

async function consultarAvisosDB({ ciudad, codigoAvi }) {
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
  } catch { return []; }
}

// ── Hook principal ─────────────────────────────────────────────────────────────

export function useAgentEvelyn({
  personaje    = 'evelyn',
  iaMode       = 'off',
  isAdmin      = false,
  onHandoff,
  onAvisoConectar,
  onAvisoPublicar,
  ciudad       = null,
  genesis      = 0,
  userId       = null,
  autorAlias   = 'Ciudadano',
}) {
  const [mensaje, setMensaje]                         = useState(null);
  const [loading, setLoading]                         = useState(false);
  const [chatHistory, setChatHistory]                 = useState([]);
  const [avisoEnConstruccion, setAvisoEnConstruccion] = useState(null);
  const [esPatrocinado, setEsPatrocinado]             = useState(false);
  const avisoConectarRef                               = useRef(null);

  const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);
  const esLarry  = personaje === 'larry';

  const pushHistory = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }].slice(-6));
  };

  const bot = esLarry ? larryBot : evelynBot;

  const fetchContexto = async () => {
    return esLarry ? fetchContextoLarry(ciudad) : fetchContextoEvelyn(ciudad);
  };

  // ── Envío IA con sobre de datos ───────────────────────────────────────────
  const enviarIA = async (textoUsuario, avisoActual = null) => {
    setLoading(true);
    try {
      const contexto   = await fetchContexto();
      if (contexto?.esPatrocinado) setEsPatrocinado(true);

      const codigoAvi  = textoUsuario.match(/AVI-[A-Z0-9]{4}/i)?.[0]?.toUpperCase() || null;
      const avisos     = await consultarAvisosDB({ ciudad, codigoAvi });
      const campoActual = avisoActual ? siguienteCampo(avisoActual) : null;

      const sobre = armarSobreEvelynTexto({
        alias:               autorAlias,
        bro_id:              userId || '',
        ciudad,
        ciudad_usuario:      ciudad,
        genesis,
        intencion:           'explorar',
        avisos,
        codigoAvi,
        campoActual,
        avisoEnConstruccion: avisoActual,
      });

      const system = buildEvelynExploraPrompt({ personaje, sobre });

      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system,
          messages:    chatHistory.slice(-4),
          userMessage: textoUsuario,
          iaMode,
        }),
      });

      const data = await res.json();
      const rawText = data?.texto || '{}';

      try {
        const match  = rawText.match(/\{[\s\S]*\}/);
        if (!match) throw new Error('No JSON');
        const parsed = JSON.parse(match[0]);

        if (parsed.handoff === 'HANDOFF_OSOS') {
          setMensaje(parsed.mensaje || '...');
          setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
          setLoading(false);
          return;
        }

        if (parsed.handoff === 'HANDOFF_AVISO_CONECTAR') {
          setMensaje(parsed.mensaje || '...');
          onHandoff?.({
            agente:   'HANDOFF_AVISO_CONECTAR',
            user_id:  parsed.to_user_id,
            aviso_id: parsed.aviso_id,
          });
          setLoading(false);
          return;
        }

        pushHistory('user', textoUsuario);
        pushHistory('assistant', parsed.mensaje || '...');
        setMensaje(parsed.mensaje || '...');

      } catch {
        pushHistory('user', textoUsuario);
        pushHistory('assistant', rawText);
        setMensaje(rawText);
      }

    } catch (err) {
      console.error('useAgentEvelyn IA error:', err);
      setMensaje('...');
    } finally {
      setLoading(false);
    }
  };

  // ── Publicar aviso — flujo campo a campo ─────────────────────────────────
  const procesarPublicacion = async (textoUsuario) => {
    const aviso = avisoEnConstruccion || {};

    if (/\bcancelar\b/i.test(textoUsuario)) {
      setAvisoEnConstruccion(null);
      const r = bot({ intencion: 'cancelado', textoUser: textoUsuario });
      setMensaje(r.mensaje);
      return;
    }

    if (textoUsuario.trim().toUpperCase() === 'CONFIRMO' && aviso.tipo && aviso.titulo && aviso.contenido) {
      if (genesis < 200) {
        const r = bot({ intencion: 'sin_genesis', textoUser: textoUsuario });
        setMensaje(r.mensaje);
        return;
      }
      setLoading(true);
      try {
        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 7);
        await supabase.from('avisos').insert([{
          user_id:        userId     || '',
          author_alias:   autorAlias || 'Ciudadano',
          type:           aviso.tipo,
          title:          aviso.titulo,
          content:        aviso.contenido,
          cost_to_reveal: 200,
          is_active:      true,
          expires_at:     expireDate.toISOString(),
        }]);
        onAvisoPublicar?.({ confirmado: true });
        setAvisoEnConstruccion(null);
        const r = bot({ intencion: 'publicado', textoUser: textoUsuario });
        setMensaje(r.mensaje);
      } catch (err) {
        console.error('Error publicando aviso:', err);
        setMensaje('Error al publicar. Inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
      return;
    }

    const campoActual = siguienteCampo(aviso);
    if (campoActual) {
      const valor = extraerCampo(campoActual, textoUsuario);
      if (valor) {
        const avisoActualizado = { ...aviso, [campoActual]: valor };
        setAvisoEnConstruccion(avisoActualizado);
        const siguienteCampoNow = siguienteCampo(avisoActualizado);
        if (siguienteCampoNow) {
          if (iaActiva) {
            await enviarIA(textoUsuario, avisoActualizado);
          } else {
            const r = bot({ intencion: siguienteCampoNow, textoUser: textoUsuario });
            setMensaje(r.mensaje);
          }
        } else {
          const r = bot({ intencion: 'confirmar', textoUser: textoUsuario });
          setMensaje(r.mensaje);
        }
      } else {
        const r = bot({ intencion: campoActual === 'tipo' ? 'error_tipo' : campoActual, textoUser: textoUsuario });
        setMensaje(r.mensaje);
      }
    }
  };

  // ── Entrada principal ─────────────────────────────────────────────────────
  const enviar = async (textoUsuario) => {
    if (!textoUsuario?.trim()) return;

    const salida = detectarSalidaAviso(textoUsuario);
    if (salida) {
      setMensaje(salida.mensaje);
      setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
      return;
    }

    const interno = detectarInternoAviso(textoUsuario, personaje);
    if (interno) {
      setTimeout(() => onHandoff?.({ agente: 'AVISO_INTERNO', personaje_id: interno.personaje_id }), 1200);
      return;
    }

    const avisoEnProceso = avisoEnConstruccion !== null && avisoEnConstruccion !== undefined;
    if (avisoEnProceso) {
      await procesarPublicacion(textoUsuario);
      return;
    }

    if (esIntencionPublicar(textoUsuario)) {
      setAvisoEnConstruccion({});
      const r = bot({ intencion: 'inicio', textoUser: textoUsuario });
      setMensaje(r.mensaje);
      return;
    }

    if (esIntencionConsultar(textoUsuario)) {
      setMensaje('Déjame ver qué hay en el tablón...');
      onHandoff?.({ agente: 'BUSCAR_STRIP', keyword: textoUsuario, intencion: 'BROSHOP_AVISO' });
      return;
    }

    if (detectarBusquedaAviso(textoUsuario)) {
      setMensaje(fraseBuscandoAviso(textoUsuario));
      onHandoff?.({ agente: 'BUSCAR_STRIP', keyword: textoUsuario, intencion: 'BROSHOP_AVISO' });
      return;
    }

    if (iaActiva) {
      await enviarIA(textoUsuario, null);
      return;
    }

    const r = bot({ intencion: 'explorar', textoUser: textoUsuario });
    setMensaje(r.mensaje);
  };

  const reset = () => {
    setMensaje(null);
    setChatHistory([]);
    setAvisoEnConstruccion(null);
    setEsPatrocinado(false);
    avisoConectarRef.current = null;
  };

  return { mensaje, loading, enviar, reset, iaActiva, avisoEnConstruccion, esPatrocinado };
}
