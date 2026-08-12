import { useState } from 'react';
import { fetchContextoEvelyn } from '../services/contexto/fetchContextoEvelyn';
import { fetchContextoLarry }  from '../services/contexto/fetchContextoLarry';
import { promptEvelyn }        from '../data/evelyn_larry/promptEvelyn';
import { fetchHistoriaNodos } from '../services/contexto/fetchHistoriaNodos';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';

const norm = (str) =>
  str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const KEYWORDS_SALIDA = [
  'salir', 'volver', 'inicio', 'recepción', 'recepcion', 'osos', 'portero',
  'audio', 'música', 'musica', 'podcast', 'mapache', 'ami',
  'oráculo', 'oraculo', 'orumama', 'jaguar', 'misterio',
   'rumores',
  'juego', 'juegos', 'games',
];

const KEYWORDS_LARRY  = ['larry', 'el larry'];
const KEYWORDS_EVELYN = ['evelyn', 'la evelyn'];

const FRASES_SALIDA = [
  'Espera, que te paso con los Osos.',
  'Un momento, te llevo a recepción.',
  'Los Osos te atienden ahora. Hasta luego.',
  'Te paso con los Osos. Vuelvo al tablón.',
];

const detectarSalida = (texto) => {
  const t = norm(texto);
  const quiereSalir = KEYWORDS_SALIDA.some(kw => t.includes(norm(kw)));
  if (!quiereSalir) return null;
  return {
    salida: true,
    mensaje: FRASES_SALIDA[Math.floor(Math.random() * FRASES_SALIDA.length)],
  };
};

const detectarInterno = (texto, personajeActivo) => {
  const t = norm(texto);
  if (personajeActivo !== 'larry' && KEYWORDS_LARRY.some(kw => t.includes(norm(kw)))) {
    return { interno: true, personaje_id: 'larry' };
  }
  if (personajeActivo !== 'evelyn' && KEYWORDS_EVELYN.some(kw => t.includes(norm(kw)))) {
    return { interno: true, personaje_id: 'evelyn' };
  }
  return null;
};

export function useAgentEvelyn({
  personaje    = 'evelyn',
  iaMode       = 'off',
  isAdmin      = false,
  onHandoff,
  ciudad       = null,
  onShowStoryList,
  onLaunchStory,
  storyEpisode = null,
}) {
  const [mensaje, setMensaje]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);
  const esLarry  = personaje === 'larry';

  const pushHistory = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }].slice(-6));
  };

  const interpretarSistema = (intencion) => {
    const t = intencion.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (t.includes('interno_larry')) { setTimeout(() => onHandoff?.({ agente: 'INTERNO', member_id: 'larry' }), 1200); return; }
    if (t.includes('mostrar_lista_cuentos')) { setTimeout(() => onShowStoryList?.(), 1200); return; }
    const lanzarMatch = t.match(/lanzar_cuento[_\s:]+(\d+)/);
    if (lanzarMatch) { setTimeout(() => onLaunchStory?.(parseInt(lanzarMatch[1])), 1200); return; }
  };

  const fetchContexto = async () => {
    return esLarry ? fetchContextoLarry(ciudad) : fetchContextoEvelyn(ciudad);
  };

  const enviarIA = async (textoUsuario) => {
    setLoading(true);
    try {
      const contexto   = await fetchContexto();
      const baseSystem = promptEvelyn(contexto || {});
      const system     = storyEpisode
        ? `${baseSystem}\n\nHISTORIA EN PANTALLA:\n${storyEpisode.texto?.slice(0, 800) || ''}`
        : baseSystem;

      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system,
          messages: chatHistory.slice(-4),
          userMessage: textoUsuario,
          iaMode,
        }),
      });

      const data = await res.json();
      let respuesta = data?.texto || '...';

      if (respuesta.startsWith('BUSCAR:')) {
        const terminos = respuesta.replace('BUSCAR:', '').split(',').map(t => t.trim());
        const nodo = await fetchHistoriaNodos(terminos);
        const contextoBuscado = nodo
          ? `[MEMORIA RECUPERADA: ${nodo}]`
          : '[No encontré información en la memoria. Responde con naturalidad sin inventar.]';
        const segundaRes = await fetch(WORKER_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system,
            messages: [...chatHistory.slice(-4), { role: 'user', content: textoUsuario }],
            userMessage: contextoBuscado,
            iaMode,
          }),
        });
        const segundaData = await segundaRes.json();
        respuesta = segundaData?.texto || '...';
      }

      if (respuesta.trim().startsWith('HANDOFF:')) {
        const partes  = respuesta.replace('HANDOFF:', '').trim().split(':');
        const agente  = partes[0];
        const detalle = partes[1] || null;
        onHandoff?.({
          agente,
          ...(detalle && agente === 'AVISO_INTERNO' && { personaje_id: detalle }),
        });
        setLoading(false);
        return;
      }

      const lineaSistema = respuesta.split('\n').find(l => l.trim().startsWith('SISTEMA:'));
      const mensajeFinal = respuesta.replace(lineaSistema || '', '').replace(/\*\*/g, '').trim();
      const intencion    = lineaSistema ? lineaSistema.replace('SISTEMA:', '').trim() : 'CONTINUA';
      if (intencion && intencion !== 'CONTINUA') interpretarSistema(intencion);

      pushHistory('user', textoUsuario);
      pushHistory('assistant', mensajeFinal);
      setMensaje(mensajeFinal);

    } catch (err) {
      console.error('useAgentEvelyn IA error:', err);
      setMensaje('...');
    } finally {
      setLoading(false);
    }
  };

  const enviar = async (textoUsuario) => {
    if (!textoUsuario?.trim()) return;
    const t = textoUsuario.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

    if (t.includes('larry')) { setTimeout(() => onHandoff?.({ agente: 'INTERNO', member_id: 'larry' }), 1200); return; }
    if (t.includes('555'))   { onShowStoryList?.(); return; }

    const salida = detectarSalida(textoUsuario);
    if (salida) {
      setMensaje(salida.mensaje);
      setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
      return;
    }

    const interno = detectarInterno(textoUsuario, personaje);
    if (interno) {
      setTimeout(() => onHandoff?.({ agente: 'AVISO_INTERNO', personaje_id: interno.personaje_id }), 1200);
      return;
    }

    if (iaActiva) {
      await enviarIA(textoUsuario);
      return;
    }

    setMensaje('Cuéntame qué necesitas y lo vemos juntos.');
  };

  const reset = () => {
    setMensaje(null);
    setChatHistory([]);
  };

  return { mensaje, loading, enviar, reset, iaActiva };
}