// src/hooks/useCanjearCupon.js
// ─────────────────────────────────────────────────────────────────────
// Gestiona el flujo de canje de cupones:
//   1. Popup de confirmación
//   2. Llamada al Worker
//   3. Muestra el código generado
//   4. Actualiza el balance de génesis en local
// ─────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';

const WORKER_URL = 'https://cupones.bro7vision.workers.dev';

export function useCanjearCupon({ userId, onLunasUpdate }) {

  const [estado,   setEstado]   = useState('idle');
  // idle | confirmando | cargando | exito | error

  const [cuponActivo, setCuponActivo] = useState(null);
  // { codigo, descuento_pct, comercio_nombre, web_url, caduca_legible }

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
    if (!cardPendiente || !userId) return;

    setEstado('cargando');

    try {
      const res = await fetch(`${WORKER_URL}/canjear-cupon`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id:         userId,
          comercio_id:     cardPendiente.id,
          tipo_tarjeta:    cardPendiente.tipo_tarjeta    || null,
          valor_euros:     cardPendiente.valor_euros     || null,
          comercio_nombre: cardPendiente.comercio_nombre || cardPendiente.nombre,
          web_url:         cardPendiente.web_url         || '',
          coste_lunas:   cardPendiente.coste_lunas,
        }),
      });
      

      const data = await res.json();
      
      onLunasUpdate?.(data.balance_nuevo);

      if (!res.ok || !data.ok) {
        // Cupón ya existente — mostrar el código que ya tenían
        if (res.status === 409) {
          setCuponActivo({
            tipo_tarjeta:    cardPendiente.tipo_tarjeta,
            valor_euros:     cardPendiente.valor_euros,
            palabra_clave_2: data.palabra_clave_2 || null,
            comercio_nombre: cardPendiente.nombre || cardPendiente.comercio_nombre,
            web_url:         cardPendiente.web_url || '',
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
        tipo_tarjeta:    data.tipo_tarjeta,
        valor_euros:     data.valor_euros,
        palabra_clave_2: data.palabra_clave_2,
        comercio_nombre: data.comercio_nombre,
        web_url:        data.web_url,
        caduca_legible:  data.caduca_legible,
        ya_existia:      false,
      });

      // Notificar al padre para actualizar el balance visible
      onLunasUpdate?.(data.balance_nuevo);

      setEstado('exito');

    } catch (err) {
      console.error('[useCanjearCupon]', err);
      setErrorMsg('Error de conexión. Inténtalo de nuevo.');
      setEstado('error');
    } finally {
      setCardPendiente(null);
    }
  }, [cardPendiente, userId, onLunasUpdate]);

  // ── Cerrar resultado ──────────────────────────────────────────────
const cerrar = useCallback(() => {
  setEstado('idle');
  setCuponActivo(null);
  setErrorMsg('');
  setCardPendiente(null); // ← añadir esto
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
