// src/hooks/useCanjearCupon.js
// ─────────────────────────────────────────────────────────────────────
// Gestiona el flujo de canje de cupones:
//   1. Popup de confirmación
//   2. Llamada al Worker
//   3. Muestra el código generado
//   4. Actualiza el balance de génesis en local
// ─────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';

const WORKER_URL = 'https://mini-sync.bro7vision.workers.dev';

export function useCanjearCupon({ userId, onGenesisUpdate }) {

  const [estado,   setEstado]   = useState('idle');
  // idle | confirmando | cargando | exito | error

  const [cuponActivo, setCuponActivo] = useState(null);
  // { codigo, descuento_pct, comercio_nombre, mini_url, caduca_legible }

  const [cardPendiente, setCardPendiente] = useState(null);
  const [errorMsg,      setErrorMsg]      = useState('');

  // ── Inicia el flujo — muestra popup de confirmación ──────────────
  const iniciarCanje = useCallback((card) => {
    setCardPendiente(card);
    setEstado('confirmando');
    setErrorMsg('');
  }, []);

  // ── Usuario cancela ───────────────────────────────────────────────
  const cancelar = useCallback(() => {
    setEstado('idle');
    setCardPendiente(null);
    setErrorMsg('');
  }, []);

  // ── Usuario confirma — llama al Worker ───────────────────────────
  const confirmar = useCallback(async () => {
    console.log('userId:', userId);
  console.log('cardPendiente:', cardPendiente);
    if (!cardPendiente || !userId) return;

    setEstado('cargando');

    try {
      const res = await fetch(`${WORKER_URL}/canjear-cupon`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id:         userId,
          comercio_id:     cardPendiente.id,
          descuento_pct:   cardPendiente.descuento_pct,
          comercio_nombre: cardPendiente.nombre,
          mini_url:        cardPendiente.mini_url  || '',
          coste_genesis:   cardPendiente.coste_genesis,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        // Cupón ya existente — mostrar el código que ya tenían
        if (res.status === 409) {
          setCuponActivo({
            codigo:          data.codigo,
            descuento_pct:   cardPendiente.descuento_pct,
            comercio_nombre: cardPendiente.nombre,
            mini_url:        cardPendiente.mini_url || '',
            caduca_legible:  '—',
            ya_existia:      true,
          });
          setEstado('exito');
          return;
        }
        setErrorMsg(data.error || 'Error al canjear. Inténtalo de nuevo.');
        setEstado('error');
        return;
      }

      // ── Éxito ─────────────────────────────────────────────────
      setCuponActivo({
        codigo:          data.codigo,
        descuento_pct:   data.descuento_pct,
        comercio_nombre: data.comercio_nombre,
        mini_url:        data.mini_url,
        caduca_legible:  data.caduca_legible,
        ya_existia:      false,
      });

      // Notificar al padre para actualizar el balance visible
      onGenesisUpdate?.(data.balance_nuevo);

      setEstado('exito');

    } catch (err) {
      console.error('[useCanjearCupon]', err);
      setErrorMsg('Error de conexión. Inténtalo de nuevo.');
      setEstado('error');
    } finally {
      setCardPendiente(null);
    }
  }, [cardPendiente, userId, onGenesisUpdate]);

  // ── Cerrar resultado ──────────────────────────────────────────────
  const cerrar = useCallback(() => {
    setEstado('idle');
    setCuponActivo(null);
    setErrorMsg('');
  }, []);

  return {
    estado,
    cuponActivo,
    cardPendiente,
    errorMsg,
    iniciarCanje,
    cancelar,
    confirmar,
    cerrar,
  };
}
