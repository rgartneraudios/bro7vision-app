// src/hooks/useCanjearCupon.js
import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export function useCanjearCupon({ userId, onLunasUpdate }) {

  const [estado,       setEstado]       = useState('idle');
  const [cuponActivo,  setCuponActivo]  = useState(null);
  const [cardPendiente,setCardPendiente]= useState(null);
  const [errorMsg,     setErrorMsg]     = useState('');

  const iniciarCanje = useCallback((card) => {
    setCardPendiente(card);
    setEstado('confirmando');
    setErrorMsg('');
  }, []);

  const cancelar = useCallback(() => {
    setEstado('idle');
    setCardPendiente(null);
    setErrorMsg('');
  }, []);

  const confirmar = useCallback(async () => {
    if (!cardPendiente || !userId) return;

    setEstado('cargando');

    const { data, error } = await supabase.rpc('procesar_canje', {
      p_user_id:     userId,
      p_comercio_id: cardPendiente.id,
      p_coste_lunas: cardPendiente.coste_lunas,
    });

    if (error || !data?.ok) {
      setErrorMsg(data?.error || error?.message || 'Error al canjear. Inténtalo de nuevo.');
      setEstado('error');
      setCardPendiente(null);
      return;
    }

    onLunasUpdate?.(data.balance_nuevo);

    setCuponActivo({
      tipo_tarjeta:    data.tipo_tarjeta,
      valor_euros:     data.valor_euros,
      palabra_clave_2: data.palabra_clave_2,
      comercio_nombre: data.comercio_nombre,
      web_url:         data.web_url,
      caduca_legible:  data.caduca_legible,
      ya_existia:      data.ya_existia,
    });

    setEstado('exito');
    setCardPendiente(null);

  }, [cardPendiente, userId, onLunasUpdate]);

  const cerrar = useCallback(() => {
    setEstado('idle');
    setCuponActivo(null);
    setErrorMsg('');
    setCardPendiente(null);
  }, []);

  return {
    estado, cuponActivo, cardPendiente,
    errorMsg, iniciarCanje, cancelar, confirmar, cerrar,
  };
}