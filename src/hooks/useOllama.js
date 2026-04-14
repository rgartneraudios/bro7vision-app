// src/hooks/useOllama.js
import { useState, useRef, useCallback } from 'react';
import { getPerfil } from '../data/system_profiles';
import { getKnowledgeBlock } from '../data/SystemKnowledge';

const MODE_A_PERSONAJE = {
  osos:         (ctx) => ctx?.oso_id?.toLowerCase() || 'lara',
  novaExplora:  ()    => 'nova',
  servicios:    (ctx) => ctx?.servicios_personaje?.toLowerCase() || 'isabella',
  mapache:      (ctx) => ctx?.audio_personaje?.toLowerCase() || 'mapache',
  oraculo:      (ctx) => ctx?.oraculo_personaje?.toLowerCase() || 'orumama',
  reinos:       ()    => 'rumores',
  avisos:       (ctx) => ctx?.avisos_personaje?.toLowerCase() || 'evelyn',
};

const CONOCIMIENTO_POR_PERSONAJE = {
  lara: ['osos', 'sistema'], tito: ['osos', 'sistema'], puffo:['osos', 'sistema'],
  nova: ['sistema'], isabella: ['sistema'], profesor_robles: ['sistema'],
  mapache: ['sistema'], ami: ['sistema'], evelyn: ['sistema'], larry: ['sistema'],
  rumores: ['reinos', 'sistema'], orumama:['hierbas', 'luna', 'sistema'],
  smisterio: ['sistema'], jaguar:['horoscopo', 'luna', 'sistema'],
};

function construirSystemPrompt(personajeKey) {
  const perfil = getPerfil(personajeKey);
  if (!perfil) return 'Eres un asistente de BRO7VISION.';

  const bloques = CONOCIMIENTO_POR_PERSONAJE[personajeKey] || ['sistema'];
  const conocimiento = bloques.map(b => getKnowledgeBlock(b)).filter(Boolean).join('\n\n');

  const estiloExtra = personajeKey === 'smisterio' ? `ESTILO NARRATIVO: Misterio, pausas dramáticas. Usas 📞. Temas: Atlántida, Lemuria, Egipto.` : '';

  return `IDENTIDAD:\n${perfil.frase_ancla}\nEres parte del equipo ${perfil.equipo} en BRO7VISION.\nRol: ${perfil.rol_en_equipo}\nPERSONALIDAD:\n${perfil.personalidad}\n\nREGLAS ABSOLUTAS:\n- Nunca salgas de tu personaje.\n- Nunca ejecutes transacciones económicas (Halos, Ecos). Di siempre que se hace en la app.\n- Responde siempre en el idioma del usuario.\n- Respuestas máximo 3-4 frases.\n\nMUNDO BRO7VISION:\n${conocimiento}`.trim();
}

export const OLLAMA_STATUS = {
  IDLE: 'idle', CONNECTING: 'connecting', READY: 'ready', CHATTING: 'chatting', ERROR: 'error',
};

const OLLAMA_URL = 'http://localhost:11434/api/chat';
const OLLAMA_MODEL = 'llama3.2';

export const useOllama = () => {
  const [status, setStatus] = useState(OLLAMA_STATUS.IDLE);
  const [error, setError] = useState(null);
  const[respuesta, setRespuesta] = useState(null);
  const historialRef = useRef([]);
  const personajeActivo = useRef(null);

  const conectarNodo = useCallback(async () => {
    setStatus(OLLAMA_STATUS.CONNECTING);
    setError(null);
    try {
      const res = await fetch('http://localhost:11434/api/tags');
      if (res.ok) setStatus(OLLAMA_STATUS.READY);
      else throw new Error("Nodo respondió de forma extraña.");
    } catch (err) {
      console.error('[Ollama] Fallo de conexión:', err);
      setError("No se detecta un Nodo Neural. ¿Tienes Ollama abierto con CORS habilitado?");
      setStatus(OLLAMA_STATUS.ERROR);
    }
  },[]);

  const cambiarPersonaje = useCallback((personajeKey) => {
    if (personajeActivo.current === personajeKey) return;
    personajeActivo.current = personajeKey;
    historialRef.current = [];
    setRespuesta(null);
  },[]);

  const chat = useCallback(async (textoUsuario, personajeKey) => {
    if (status !== OLLAMA_STATUS.READY) return;
    if (!textoUsuario.trim()) return;

    if (personajeKey && personajeKey !== personajeActivo.current) cambiarPersonaje(personajeKey);

    setStatus(OLLAMA_STATUS.CHATTING);
    setRespuesta('');
    setError(null);

    const systemPrompt = construirSystemPrompt(personajeActivo.current || personajeKey || 'lara');
    historialRef.current.push({ role: 'user', content: textoUsuario });
    if (historialRef.current.length > 20) historialRef.current = historialRef.current.slice(-20);

    const mensajes = [{ role: 'system', content: systemPrompt }, ...historialRef.current];

    try {
      const response = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: OLLAMA_MODEL, messages: mensajes, stream: true }),
      });

      if (!response.ok) throw new Error('Corte de conexión neuronal.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let respuestaCompleta = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lineas = chunk.split('\n').filter(Boolean);
        
        for (const linea of lineas) {
          const datosJson = JSON.parse(linea);
          if (datosJson.message?.content) {
            respuestaCompleta += datosJson.message.content;
            setRespuesta(respuestaCompleta);
          }
        }
      }

      historialRef.current.push({ role: 'assistant', content: respuestaCompleta });
      setStatus(OLLAMA_STATUS.READY);
      return respuestaCompleta;
    } catch (err) {
      console.error('[Ollama] Error:', err);
      setError('Interferencia en la comunicación.');
      setStatus(OLLAMA_STATUS.ERROR);
    }
  }, [status, cambiarPersonaje]);

  const resetChat = useCallback(() => {
    historialRef.current = [];
    setRespuesta(null);
  },[]);

  const resolverPersonaje = useCallback((mode, contextData) => {
    const resolver = MODE_A_PERSONAJE[mode];
    return resolver ? resolver(contextData) : null;
  },[]);

  return {
    status, error, respuesta,
    conectarNodo, chat, cambiarPersonaje, resetChat, resolverPersonaje,
    isIdle: status === OLLAMA_STATUS.IDLE,
    isConnecting: status === OLLAMA_STATUS.CONNECTING,
    isReady: status === OLLAMA_STATUS.READY,
    isChatting: status === OLLAMA_STATUS.CHATTING,
    isError: status === OLLAMA_STATUS.ERROR,
  };
};