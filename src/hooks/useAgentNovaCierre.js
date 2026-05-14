// src/hooks/useAgentNovaCierre.js
// Hook exclusivo de Nova Cierre. Gestiona IA + acciones del carrito.
// El estado del carrito vive en NovaCierre.jsx — el hook solo llama a la IA
// y devuelve la acción parseada para que el Banner la aplique.

import { useState } from 'react';
import { armarnovaCierre, parsearRespuestaNova } from '../services/agents/novaCierrePS';
import { fetchContextoNova }                     from '../services/contexto/fetchContextoNova';
import { detectarSalidaNova }                    from '../services/agents/bots/novaUtils';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';

export function useAgentNovaCierre({ iaMode, isAdmin, onHandoff, ciudad = null }) {
  const [mensaje, setMensaje]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [bolas, setBolas]             = useState([]);

  const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);

  const pushHistory = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }].slice(-6));
  };

  // ── Envío principal — siempre IA en NovaCierre ────────────────────────────
  const enviar = async (textoUsuario, carritoContext = {}) => {
    if (!textoUsuario?.trim()) return null;

    // Salida → Osos — siempre
    const salida = detectarSalidaNova(textoUsuario);
    if (salida) {
      setMensaje(salida.mensaje);
      setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
      return null;
    }

    setLoading(true);
    try {
      // carritoContext: { comercio, carrito, precios, vale_activo, valesUsuario, catalogo, perfilUsuario }
      const system = armarnovaCierre({
        perfil_usuario: carritoContext.perfilUsuario || {},
        comercio:       carritoContext.comercio       || {},
        carrito:        carritoContext.carrito        || [],
        vales_usuario:  carritoContext.valesUsuario   || {},
        catalogo:       carritoContext.catalogo       || [],
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

      const data   = await res.json();
      const parsed = parsearRespuestaNova(data?.texto || '{}');

      pushHistory('user', textoUsuario);
      pushHistory('assistant', parsed.mensaje || '...');
      setMensaje(parsed.mensaje || '...');
      setBolas(parsed.bolas || []);

      // Handoff especial de la IA
      if (parsed.accion?.tipo === 'HANDOFF_FINANZAS') {
        setTimeout(() => onHandoff?.({ agente: 'BROSHOP_AVISO' }), 1200);
        return null;
      }

      // Devuelve la acción al Banner para que actualice el carrito
      return parsed.accion || null;

    } catch (err) {
      console.error('useAgentNovaCierre error:', err);
      setMensaje('¿Me repites eso? Creo que me perdí un momento. 🌟');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMensaje(null);
    setChatHistory([]);
    setBolas([]);
  };

  return { mensaje, loading, enviar, reset, iaActiva, bolas };
}
