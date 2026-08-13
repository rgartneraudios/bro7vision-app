// src/hooks/useAgentIsabella.js
// Hook exclusivo de Isabella y Profesor Robles.
// personaje = 'isabella' | 'profesor'

import { useState } from 'react';
import { fetchContextoIsabella } from '../services/contexto/fetchContextoIsabella';
import { fetchContextoProfesor }  from '../services/contexto/fetchContextoProfesor';
import { promptIsabella }        from '../data/isabella_profesor/promptIsabella';
import { buscarNodosRelevantes } from '../services/contexto/fetchHistoriaNodos';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';

const norm = (str) =>
  str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const SERV_KEYWORDS_SALIDA = [
  'salir', 'volver', 'inicio', 'recepción', 'recepcion', 'osos', 'portero',
  'aviso', 'avisos', 'anuncio', 'anuncios', 'evelyn', 'larry',
  'audio', 'música', 'musica', 'podcast', 'mapache', 'ami',
  'oráculo', 'oraculo', 'orumama', 'jaguar', 'misterio',
   'rumores',
  'juego', 'juegos', 'games',
];
const SERV_KEYWORDS_PROFESOR   = ['robles', 'profesor robles', 'profesor', 'profe', 'el profesor', 'el profe'];
const SERV_KEYWORDS_ISABELLA   = ['isabella', 'la isabella', 'isa'];
const SERV_FRASES_SALIDA = [
  'Espera, que te paso con los Osos. Cuídate.',
  'Un momento, te llevo a recepción.',
  'Los Osos te atienden ahora. Hasta luego.',
  'Te paso con los Osos. Vuelvo a mis notas.',
];

const detectarSalidaIsabella = (texto) => {
  const t = norm(texto);
  if (!SERV_KEYWORDS_SALIDA.some(kw => t.includes(norm(kw)))) return null;
  return { salida: true, mensaje: SERV_FRASES_SALIDA[Math.floor(Math.random() * SERV_FRASES_SALIDA.length)] };
};

const detectarInternoIsabella = (texto, personajeActivo) => {
  const t = norm(texto);
  if (personajeActivo !== 'profesor' && SERV_KEYWORDS_PROFESOR.some(kw => t.includes(norm(kw))))
    return { interno: true, personaje_id: 'profesor' };
  if (personajeActivo !== 'isabella' && SERV_KEYWORDS_ISABELLA.some(kw => t.includes(norm(kw))))
    return { interno: true, personaje_id: 'isabella' };
  return null;
};

const limpiarRespuesta = (texto) =>
  texto
    .replace(/BUSCAR:.*$/im, '')
    .replace(/SISTEMA:.*$/im, '')
    .trim();

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAgentIsabella({
  personaje   = 'isabella',
  iaMode      = 'off',
  isAdmin     = false,
  onHandoff,
  ciudad      = null,
  onShowStoryList,
  onLaunchStory,
  storyEpisode = null,
}) {
  const [mensaje, setMensaje]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [esPatrocinado, setEsPatrocinado] = useState(false);

  const iaActiva   = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);
  const esProfesor = personaje === 'profesor';

  const pushHistory = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }].slice(-6));
  };

  const interpretarSistema = (intencion) => {
    const t = intencion.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (t.includes('interno_profesor')) { setTimeout(() => onHandoff?.({ agente: 'INTERNO', member_id: 'profesor' }), 1200); return; }
    if (t.includes('mostrar_lista_cuentos')) { setTimeout(() => onShowStoryList?.(), 1200); return; }
    const lanzarMatch = t.match(/lanzar_cuento[_\s:]+(\d+)/);
    if (lanzarMatch) { setTimeout(() => onLaunchStory?.(parseInt(lanzarMatch[1])), 1200); return; }
  };

  const fetchContexto = async () => {
    return esProfesor ? fetchContextoProfesor(ciudad) : fetchContextoIsabella(ciudad);
  };

  const enviarIA = async (textoUsuario) => {
    setLoading(true);
    try {
      const [contexto, nodo] = await Promise.all([
        fetchContexto(),
        buscarNodosRelevantes(textoUsuario),
      ]);
      if (contexto?.esPatrocinado) setEsPatrocinado(true);
      const baseSystem = promptIsabella(contexto || {});
      let system     = storyEpisode
        ? `${baseSystem}\n\nHISTORIA EN PANTALLA:\n${storyEpisode.texto?.slice(0, 800) || ''}`
        : baseSystem;

      if (nodo)
        system += `\n\nCONTEXTO RELEVANTE (úsalo si viene al caso, no lo menciones directamente): ${nodo}`;

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

      const data      = await res.json();
      const respuesta = data?.texto || '...';

      // Interceptar comandos SISTEMA antes de mostrar nada al usuario
      interpretarSistema(respuesta);

      const mensajeLimpio = limpiarRespuesta(respuesta);

      if (mensajeLimpio.trim().startsWith('HANDOFF:')) {
        const partes  = mensajeLimpio.replace('HANDOFF:', '').trim().split(':');
        const agente  = partes[0];
        const detalle = partes[1] || null;
        onHandoff?.({
          agente,
          ...(detalle && agente === 'SERVICIO_INTERNO' && { personaje_id: detalle }),
        });
        setLoading(false);
        return;
      }

      const canjeMatch   = mensajeLimpio.match(/\[CANJE_CONFIRMADO:([^:]+):(\d{3})\]/);
      const mensajeFinal = canjeMatch ? mensajeLimpio.replace(canjeMatch[0], '').trim() : mensajeLimpio;

      pushHistory('user', textoUsuario);
      pushHistory('assistant', mensajeFinal);
      setMensaje(mensajeFinal);

    } catch (err) {
      console.error('useAgentIsabella error:', err);
      setMensaje('...');
    } finally {
      setLoading(false);
    }
  };

  const enviar = (textoUsuario) => {
    if (!textoUsuario?.trim()) return;
    const t = textoUsuario.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

    if (t.includes('profesor') || t.includes('robles')) {
      setTimeout(() => onHandoff?.({ agente: 'INTERNO', member_id: 'profesor' }), 1200); return;
    }
    if (t.includes('555')) { onShowStoryList?.(); return; }

    const TRIGGER_STORIES = ['cuento', 'cuentos', 'episodio', 'episodios',
      'historia', 'historias', 'exclusiva', 'exclusivas', 'listado',
      'ver historias', 'ponme el', 'quiero escuchar'];
    if (TRIGGER_STORIES.some(kw => t.includes(kw))) {
      onShowStoryList?.();
      return;
    }

    const salida = detectarSalidaIsabella(textoUsuario);
    if (salida) {
      setMensaje(salida.mensaje);
      setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
      return;
    }

    const interno = detectarInternoIsabella(textoUsuario, personaje);
    if (interno) {
      setTimeout(() => onHandoff?.({ agente: 'SERVICIO_INTERNO', personaje_id: interno.personaje_id }), 1200);
      return;
    }

    if (iaActiva) {
      enviarIA(textoUsuario);
      return;
    }

    setMensaje('Cuéntame qué buscas y te ayudo a encontrarlo con mucho cariño 🧡');
  };

  const reset = () => {
    setMensaje(null);
    setChatHistory([]);
    setEsPatrocinado(false);
  };

  return { mensaje, loading, enviar, reset, iaActiva, esPatrocinado };
}