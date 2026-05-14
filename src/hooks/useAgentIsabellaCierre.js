// src/hooks/useAgentIsabellaCierre.js
// Hook exclusivo de Isabella/Profesor Cierre. Mismo patrón que useAgentNovaCierre.
// El carrito vive en IsabellaCierre.jsx — el hook solo llama a la IA y devuelve acciones.

import { useState } from 'react';
import { armarnovaCierre, parsearRespuestaNova } from '../services/agents/novaCierrePS';
import { detectarSalidaIsabella } from '../services/agents/bots/isabellaUtils';

const WORKER_URL = 'https://brovision-ai.bro7vision.workers.dev';

export function useAgentIsabellaCierre({ personaje = 'isabella', iaMode, isAdmin, onHandoff, ciudad = null }) {
  const [mensaje, setMensaje]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [bolas, setBolas]             = useState([]);

  const iaActiva = (iaMode === 'admin' && isAdmin) || (iaMode === 'public' && !isAdmin);

  const pushHistory = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }].slice(-6));
  };

  const enviar = async (textoUsuario, carritoContext = {}) => {
    if (!textoUsuario?.trim()) return null;

    // Salida → Osos
    const salida = detectarSalidaIsabella(textoUsuario);
    if (salida) {
      setMensaje(salida.mensaje);
      setTimeout(() => onHandoff?.({ agente: 'OSOS' }), 1200);
      return null;
    }

    setLoading(true);
    try {
      // Reutiliza armarnovaCierre — mismo formato de carrito/vales/catalogo
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

      if (parsed.accion?.tipo === 'HANDOFF_FINANZAS') {
        setTimeout(() => onHandoff?.({ agente: 'BROSHOP_AVISO' }), 1200);
        return null;
      }

      return parsed.accion || null;

    } catch (err) {
      console.error('useAgentIsabellaCierre error:', err);
      setMensaje('¿Me lo repites, cielo? Creo que me perdí. 🧡');
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
