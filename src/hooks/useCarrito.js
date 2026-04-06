// src/hooks/useCarrito.js
// ═══════════════════════════════════════════════════
// Hook maestro del carrito conversacional.
// Lee/escribe carrito_temp en Supabase.
// Procesa acciones emitidas por NovaVentas e IsabellaCloses.
// TTL 15 minutos, renovable mientras el usuario está activo.
// ═══════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { calcularPrecio, REGLAS_VALES } from '../services/agents/novaVentasPS';

// ── Constantes ───────────────────────────────────────
const TTL_MINUTOS = 15;

// ── Helper: construir objeto de precio completo ──────
const buildPrecios = (items, vale_activo, iva_pct) =>
  calcularPrecio({ items, vale: vale_activo, iva_pct });

export const useCarrito = ({ user_id, comercio_id, iva_pct = 21 }) => {

  const [items,       setItems]       = useState([]);   // array de rows de carrito_temp
  const [vale_activo, setValeActivo]  = useState(null); // 'nova'|'crescens'|'plena'|'decrescens'
  const [delivery,    setDelivery]    = useState('pickup');
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  // Ref para el renovador de TTL
  const renovarTimer = useRef(null);

  // ── Precios calculados (derivados, sin estado extra) ──
  const precios = buildPrecios(items, vale_activo, iva_pct);
  const total_items = items.reduce((sum, i) => sum + i.qty, 0);

  // ── 1. CARGAR carrito activo desde Supabase ──────────
  const cargarCarrito = useCallback(async () => {
    if (!user_id || !comercio_id) return;
    setLoading(true);
    try {
      // Limpiamos expirados primero
      await supabase.rpc('limpiar_carritos_expirados');

      const { data, error } = await supabase
        .from('carrito_temp')
        .select('*')
        .eq('user_id', user_id)
        .eq('comercio_id', comercio_id)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      setItems(data || []);

      // Recuperar vale activo (todos los items del carrito comparten el mismo vale)
      if (data && data.length > 0 && data[0].vale_activo) {
        setValeActivo(data[0].vale_activo);
      }

      // Recuperar modo entrega
      if (data && data.length > 0 && data[0].delivery_mode) {
        setDelivery(data[0].delivery_mode);
      }

    } catch (err) {
      console.error('[useCarrito] cargarCarrito:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user_id, comercio_id]);

  // Cargar al montar
  useEffect(() => {
    cargarCarrito();
  }, [cargarCarrito]);

  // ── 2. RENOVAR TTL ───────────────────────────────────
  const renovarTTL = useCallback(async () => {
    if (!user_id || !comercio_id) return;
    await supabase.rpc('renovar_carrito', {
      p_user_id:     user_id,
      p_comercio_id: comercio_id,
    });
  }, [user_id, comercio_id]);

  // Auto-renovar cada 10 minutos si hay items
  useEffect(() => {
    if (items.length === 0) return;
    renovarTimer.current = setInterval(renovarTTL, 10 * 60 * 1000);
    return () => clearInterval(renovarTimer.current);
  }, [items.length, renovarTTL]);

  // ── 3. HELPERS internos ──────────────────────────────

  // Actualizar vale_activo en TODOS los items del carrito
  const _actualizarValeEnDB = async (nuevo_vale) => {
    if (!user_id || !comercio_id) return;
    const descuento = nuevo_vale ? REGLAS_VALES[nuevo_vale].pct : 0;
    await supabase
      .from('carrito_temp')
      .update({
        vale_activo:    nuevo_vale,
        vale_descuento: descuento,
        expires_at:     new Date(Date.now() + TTL_MINUTOS * 60 * 1000).toISOString(),
      })
      .eq('user_id', user_id)
      .eq('comercio_id', comercio_id);
  };

  // Actualizar delivery_mode en TODOS los items
  const _actualizarDeliveryEnDB = async (modo) => {
    if (!user_id || !comercio_id) return;
    await supabase
      .from('carrito_temp')
      .update({ delivery_mode: modo })
      .eq('user_id', user_id)
      .eq('comercio_id', comercio_id);
  };

  // ── 4. PROCESADOR DE ACCIONES DE NOVA ───────────────
  // Recibe la accion del JSON de novaVentasPS y la ejecuta
  const procesarAccion = useCallback(async (accion) => {
    if (!accion) return;

    switch (accion.tipo) {

      // ── AÑADIR_ITEM ──────────────────────────────────
      case 'AÑADIR_ITEM':
case 'AÑADIR_SERVICIO': {
  const esServicio = accion.tipo === 'AÑADIR_SERVICIO';
  const cartId = esServicio
    ? `${accion.item_id}-${accion.fecha_reserva||'sf'}-${accion.hora_reserva||'sh'}`
    : `${accion.item_id}-${accion.talla||'ns'}-${accion.color||'nc'}`;
    
     // AGREGA ESTA LÍNEA PARA DEFINIR 'existe'
  const existe = items.find(i => i.id === cartId); 
    
        if (existe) {
          // Si ya existe, suma 1
          const { error } = await supabase
            .from('carrito_temp')
            .update({
              qty:        existe.qty + 1,
              expires_at: new Date(Date.now() + TTL_MINUTOS * 60 * 1000).toISOString(),
            })
            .eq('id', cartId);
          if (error) throw error;
        } else {
          // Si no existe, inserta
          const { error } = await supabase
            .from('carrito_temp')
            .insert({
              id:               cartId,
              user_id,
              comercio_id,
              tipo:          esServicio ? 'servicio' : (accion.tipo_item || 'producto'),
             fecha_reserva: accion.fecha_reserva || null,
	    hora_reserva:  accion.hora_reserva  || null,
              item_id:          accion.item_id,
              item_codigo:      accion.item_codigo || null,
              item_nombre:      accion.item_nombre,
              item_precio_base: accion.item_precio_base,
              item_iva_pct:     iva_pct,
              qty:              1,
              talla:            accion.talla  || null,
              color:            accion.color  || null,
              delivery_mode: esServicio ? (accion.modo_sesion || 'presencial') : delivery,
              vale_activo:      vale_activo,
              vale_descuento:   vale_activo ? REGLAS_VALES[vale_activo].pct : 0,
              expires_at:       new Date(Date.now() + TTL_MINUTOS * 60 * 1000).toISOString(),
            });
          if (error) throw error;
        }
        await cargarCarrito();
        break;
      }

      // ── CAMBIAR_CANTIDAD ─────────────────────────────
      case 'CAMBIAR_CANTIDAD': {
        const item = items.find(i => i.item_id === accion.item_id);
        if (!item) break;
        if (accion.qty <= 0) {
          // Si qty es 0 o menos, quitamos el item
          await supabase.from('carrito_temp').delete().eq('id', item.id);
        } else {
          await supabase
            .from('carrito_temp')
            .update({ qty: accion.qty })
            .eq('id', item.id);
        }
        await cargarCarrito();
        break;
      }

      // ── RESTAR_ITEM ──────────────────────────────────
      case 'RESTAR_ITEM': {
        const item = items.find(i => i.item_id === accion.item_id);
        if (!item) break;
        if (item.qty <= 1) {
          await supabase.from('carrito_temp').delete().eq('id', item.id);
        } else {
          await supabase
            .from('carrito_temp')
            .update({ qty: item.qty - 1 })
            .eq('id', item.id);
        }
        await cargarCarrito();
        break;
      }
      
      case 'RESTAR_SERVICIO': {  // alias Isabella
	const item = items.find(i => i.item_id === accion.item_id);
        if (!item) break;
        if (item.qty <= 1) {
          await supabase.from('carrito_temp').delete().eq('id', item.id);
        } else {
          await supabase
            .from('carrito_temp')
            .update({ qty: item.qty - 1 })
            .eq('id', item.id);
        }
        await cargarCarrito();
        break;
      }

      // ── QUITAR_ITEM ──────────────────────────────────
      case 'QUITAR_ITEM': {
        const item = items.find(i => i.item_id === accion.item_id);
        if (!item) break;
        await supabase.from('carrito_temp').delete().eq('id', item.id);
        await cargarCarrito();
        break;
      }
      
      case 'QUITAR_SERVICIO':
        const item = items.find(i => i.item_id === accion.item_id);
        if (!item) break;
        await supabase.from('carrito_temp').delete().eq('id', item.id);
        await cargarCarrito();
        break;



      // ── ACTIVAR_VALE ─────────────────────────────────
      case 'ACTIVAR_VALE': {
        // Verificación en cliente (doble seguridad además del PS)
        const regla = REGLAS_VALES[accion.vale];
        if (!regla) break;
        if (total_items < regla.min_items) break; // condición no cumplida
        setValeActivo(accion.vale);
        await _actualizarValeEnDB(accion.vale);
        break;
      }

      // ── VALE_BLOQUEADO / VALE_SIN_SALDO ─────────────
      // No modifican el carrito — Nova ya informó al usuario
      case 'VALE_BLOQUEADO':
      case 'VALE_SIN_SALDO':
        break;

      // ── CAMBIAR_VALE ─────────────────────────────────
      case 'CAMBIAR_VALE': {
        const regla = REGLAS_VALES[accion.a];
        if (!regla) break;
        if (total_items < regla.min_items) break;
        setValeActivo(accion.a);
        await _actualizarValeEnDB(accion.a);
        break;
      }

      // ── MODO_ENTREGA ─────────────────────────────────
      case 'MODO_ENTREGA': {
        setDelivery(accion.modo);
        await _actualizarDeliveryEnDB(accion.modo);
        break;
      }
      
      case 'MODO_SESION': {  // Isabella — presencial/online/domicilio
  	setDelivery(accion.modo);
  	await _actualizarDeliveryEnDB(accion.modo);
  	break;
	}
	
	case 'MARCAR_SLOT_CALENDARIO':
  // El componente VentasBanner escucha esto para marcar el slot
  // No modifica carrito_temp
  break;
  

      // ── IR_A_PAGAR ───────────────────────────────────
      // Solo señal — el componente escucha este tipo y abre CarroGeneral
      case 'IR_A_PAGAR':
        break;

      // ── HANDOFF_FINANZAS ─────────────────────────────
      // Solo señal — el componente redirige a Evelyn/Larry
      case 'HANDOFF_FINANZAS':
        break;

      default:
        console.warn('[useCarrito] Acción desconocida:', accion.tipo);
    }
  }, [items, vale_activo, delivery, user_id, comercio_id, iva_pct, total_items, cargarCarrito]);

  // ── 5. VACIAR carrito ────────────────────────────────
  const vaciarCarrito = useCallback(async () => {
    if (!user_id || !comercio_id) return;
    await supabase
      .from('carrito_temp')
      .delete()
      .eq('user_id', user_id)
      .eq('comercio_id', comercio_id);
    setItems([]);
    setValeActivo(null);
    setDelivery('pickup');
  }, [user_id, comercio_id]);

  // ── 6. QUITAR vale manualmente ───────────────────────
  const quitarVale = useCallback(async () => {
    setValeActivo(null);
    await _actualizarValeEnDB(null);
  }, [user_id, comercio_id]);

  // ── 7. CONFIRMAR pedido ──────────────────────────────
  // Construye el snapshot para la tabla pedidos
  // El componente de pago llama esto antes de ir a Stripe
  const buildPedidoSnapshot = useCallback(() => {
    const delivery_precio =
      delivery === 'delivery' ? 2.00 :
      delivery === 'regalo'   ? 0    : // el comercio define regalo_precio
      0;

    return {
      user_id,
      comercio_id,
      items_json:          items,
      subtotal_base:       precios.base,
      vale_usado:          vale_activo,
      descuento_importe:   precios.descuento_importe,
      base_con_descuento:  precios.base_con_descuento,
      iva_importe:         precios.iva_importe,
      total_final:         parseFloat((precios.total_final + delivery_precio).toFixed(2)),
      delivery_mode:       delivery,
      delivery_precio,
      estado:              'pendiente',
      escrow_liberado:     false,
    };
  }, [items, vale_activo, delivery, precios, user_id, comercio_id]);

  // ── Return ───────────────────────────────────────────
  return {
    // Estado
    items,
    vale_activo,
    delivery,
    loading,
    error,
    total_items,

    // Precios calculados
    precios,          // { base, descuento_importe, base_con_descuento, iva_importe, total_final }

    // Acciones
    procesarAccion,   // ← lo llama useAgentChat cuando Nova emite una acción
    vaciarCarrito,
    quitarVale,
    buildPedidoSnapshot,

    // Utilidades
    cargarCarrito,
    renovarTTL,
    REGLAS_VALES,     // exportado para que la UI pinte las condiciones de cada vale
  };
};
