// src/hooks/useAgentNovaExplora.js
// Hook exclusivo de Nova Explora. Nadie más lo usa.

import { useState } from 'react';
import { buildNovaExploraPrompt }                    from '../services/agents/novaExploraPS';
import { fetchContextoNova }                         from '../services/contexto/fetchContextoNova';
import { detectarSalidaNova, detectarIntencionNova } from '../services/agents/bots/novaUtils';
import { detectarBusquedaProducto, fraseBuscando }   from '../services/agents/bots/novaBot';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';
const elegir = (arr) => arr[Math.floor(Math.random() * arr.length)];

const FRASES_SALIDA = [
  'Espera, que te paso con los Osos. 📷',
  'Un momento, te llevo a recepción.',
  'Los Osos te atienden ahora. Vuelvo al almacén.',
];

export function useAgentNovaExplora({ iaMode, isAdmin, onHandoff, ciudad = null, alias = 'Ciudadano' }) {
  const [mensaje, setMensaje]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [esPatrocinado, setEsPatrocinado] = useState(false);

  const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);

  const pushHistory = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }].slice(-6));
  };

  // ── Envío IA ──────────────────────────────────────────────────────────────
  const enviarIA = async (textoUsuario, contextExtra = {}) => {
    setLoading(true);
    try {
      const contexto = await fetchContextoNova(ciudad);
      if (contexto?.esPatrocinado) setEsPatrocinado(true);

      const system = buildNovaExploraPrompt({
        alias,
        ciudad,
        vivencia:    contexto?.vivencia,
        estadoAnimo: contexto?.estadoAnimo,
        port_system_context: {
          hay_tarjetas:        contextExtra?.hayTarjetas || false,
          intencion_detectada: detectarIntencionNova(textoUsuario),
          entidad_detectada:   contextExtra?.entidad || null,
        },
      });

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

        if (parsed.handoff && parsed.agente_destino) {
          setMensaje(parsed.mensaje_despedida || '...');
          setTimeout(() => onHandoff?.({
            agente:  parsed.agente_destino,
            bro_id:  parsed.bro_id_target || null,
          }), 1200);
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
      console.error('useAgentNovaExplora error:', err);
      setMensaje('...');
    } finally {
      setLoading(false);
    }
  };

  // ── Entrada principal — Bot e IA ──────────────────────────────────────────
  const enviar = (textoUsuario, contextExtra = {}) => {
    if (!textoUsuario?.trim()) return;

    // 1. Salida → Osos — siempre, Bot e IA
    const salida = detectarSalidaNova(textoUsuario);
    if (salida) {
      setMensaje(elegir(FRASES_SALIDA));
      setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
      return;
    }

    // 2. Modo IA → conversar con buildNovaExploraPrompt
    if (iaActiva) {
      enviarIA(textoUsuario, contextExtra);
      return;
    }

    // 3. Modo Bot — detectar búsqueda de producto
    const keyword = detectarBusquedaProducto(textoUsuario);
    if (keyword) {
      setMensaje(fraseBuscando());
      onHandoff?.({ agente: 'BUSCAR_STRIP', keyword, intencion: 'BROSHOP_PRODUCTO' });
      return;
    }

    // 4. Fallback Bot
    setMensaje('Dime qué producto buscas y te encuentro lo mejor del almacén 📦');
  };

  const reset = () => {
    setMensaje(null);
    setChatHistory([]);
    setEsPatrocinado(false);
  };

  return { mensaje, loading, enviar, reset, iaActiva, esPatrocinado };
}
