// src/components/PaymentModal.jsx
// ═══════════════════════════════════════════════════
// Orquestador principal de la experiencia de compra.
// Pantallas:
//   'novaVentas'     → VentasBanner[nova]
//   'isabellaVentas' → VentasBanner[isabella]
//   'carro'          → CarroGeneral
//
// Flujo:
//   novaVentas ──→ carro
//   isabellaVentas → carro
//   carro ──← Volver Productos  → novaVentas
//   carro ──← Volver Servicios  → isabellaVentas
// ═══════════════════════════════════════════════════

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import NovaCierre from './NovaCierre';
import IsabellaCierre from './IsabellaCierre';
import CarroGeneral from './CarroGeneral';
import { useCarrito } from '../hooks/useCarrito';
import { useAgentChat } from '../hooks/useAgentChat';

// ── Helper precio ─────────────────────────────────────
const parsePrice = (input) => {
  if (input === null || input === undefined) return 0;
  if (typeof input === 'number') return input;
  const s = String(input).replace('€','').replace(',','.').trim();
  return isNaN(parseFloat(s)) ? 0 : parseFloat(s);
};

// ── PaymentModal ──────────────────────────────────────
const PaymentModal = ({
  card,
  balances,
  setBalances,
  ventasMode   = 'novaVentas',   // 'novaVentas' | 'isabellaVentas'
  currentUser  = null,
  onClose,
  onHandoff,
  onConfirmPayment,
}) => {
  if (!card) return null;

  // ── Pantalla activa ───────────────────────────────
  // Arranca en la zona de entrada según ventasMode
  const [pantalla, setPantalla] = useState(ventasMode); // 'novaVentas'|'isabellaVentas'|'carro'

  // ── Personaje activo según pantalla ──────────────
  const personaje = pantalla === 'isabellaVentas'
    ? (currentUser?.servicios_personaje || 'isabella')
    : 'nova';

  // ── Datos del comercio ────────────────────────────
  const [comercioPerfil, setComercioPerfil] = useState(null);
  const [catalogoItems,  setCatalogoItems]  = useState([]);
  const [cargando,       setCargando]       = useState(true);

  useEffect(() => {
    const cargar = async () => {
      if (!card?.id) return;
      setCargando(true);
      try {
        const { data: perfil } = await supabase
  	.from('comercio_perfil')
  	.select('*')
  	.eq('bro_id', card.id)
  	.maybeSingle();
  
        if (perfil) setComercioPerfil(perfil);

        const { data: assets } = await supabase
          .from('assets')
          .select('id, title, price_fiat, asset_type, description, sizes, colors')
          .eq('owner_id', card.id);

        if (assets) {
          setCatalogoItems(assets.map(a => ({
            id:          a.id,
            item_codigo: a.id.slice(0, 6).toUpperCase(),
            nombre:      a.title,
            precio_base: parsePrice(a.price_fiat),
            tallas:      a.sizes        || '',
            colores:     a.colors       || '',
            desc_corta:  (a.description || '').slice(0, 80),
          })));
        }
      } catch (err) {
        console.error('[PaymentModal] Error cargando comercio:', err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [card?.id]);

  // ── useCarrito ────────────────────────────────────
  const {
    items,
    vale_activo,
    delivery,
    precios,
    procesarAccion,
    vaciarCarrito,
    buildPedidoSnapshot,
  } = useCarrito({
    user_id:     currentUser?.id,
    comercio_id: card?.id,
    iva_pct:     comercioPerfil?.iva_pct || 21,
  });

  // ── Vales del usuario ─────────────────────────────
  const valesUsuario = useMemo(() => ({
    nova:       balances?.vales?.nova       || 0,
    crescens:   balances?.vales?.crescens   || 0,
    plena:      balances?.vales?.plena      || 0,
    decrescens: balances?.vales?.decrescens || 0,
  }), [balances]);

  // ── Contexto para useAgentChat ────────────────────
  const agentContext = useMemo(() => ({
    comercio:  comercioPerfil || {},
    carrito:   items,
    vales:     valesUsuario,
    catalogo:  catalogoItems,
    personaje,
  }), [comercioPerfil, items, valesUsuario, catalogoItems, personaje]);

  // ── Callback: acción de la IA → useCarrito ────────
  const handleAccionIA = useCallback(async (accion) => {
    await procesarAccion(accion);
    if (accion?.tipo === 'IR_A_PAGAR')       setPantalla('carro');
    if (accion?.tipo === 'HANDOFF_FINANZAS') onHandoff?.({ agente: 'BROSHOP_AVISO' });
  }, [procesarAccion, onHandoff]);

  // ── useAgentChat ──────────────────────────────────
  const modeChat = pantalla === 'isabellaVentas' ? 'isabellaVentas' : 'novaVentas';

  const { mensaje, bolas, loading, enviar } = useAgentChat({
    mode:         modeChat,
    contextData:  agentContext,
    onHandoff: (data) => {
      if (data.agente === 'CARRO_GENERAL')  setPantalla('carro');
      if (data.agente === 'BROSHOP_AVISO')  onHandoff?.({ agente: 'BROSHOP_AVISO' });
    },
    onAccionNova: handleAccionIA,
  });

  // ── Confirmar pedido → Stripe ─────────────────────
  const handleConfirmarPedido = useCallback(async () => {
    if (!currentUser?.id) return;
    const snapshot = buildPedidoSnapshot();

    try {
      const { data: pedido, error } = await supabase
        .from('pedidos')
        .insert(snapshot)
        .select()
        .single();

      if (error) throw error;

      if (vale_activo) {
        await supabase.rpc('decrementar_vale', {
          p_user_id: currentUser.id,
          p_campo:   `vales_${vale_activo}`,
        });
        setBalances(prev => ({
          ...prev,
          vales: {
            ...prev.vales,
            [vale_activo]: Math.max((prev.vales?.[vale_activo] || 1) - 1, 0),
          },
        }));
      }

      await vaciarCarrito();
      onConfirmPayment?.('stripe', snapshot.total_final, card, pedido.id);
      onClose?.();
    } catch (err) {
      console.error('[PaymentModal] Error confirmando pedido:', err);
    }
  }, [buildPedidoSnapshot, vale_activo, currentUser, vaciarCarrito, onConfirmPayment, card, onClose, setBalances]);

  // ── Render ────────────────────────────────────────

  // VentasBanner (Nova o Isabella)
if (pantalla === 'novaVentas') {
    return (
      <NovaCierre
        comercio     = {comercioPerfil || { nombre_comercio: card?.alias || card?.name }}
        mensaje      = {mensaje}
        bolas        = {bolas || []}
        carrito      = {items}
        precios      = {precios}
        vale_activo  = {vale_activo}
        delivery     = {delivery}
        valesUsuario = {valesUsuario}
        loading      = {loading}
        onSend       = {enviar}
        onIrAPagar   = {() => setPantalla('carro')}
        onClose      = {onClose}  // 👈 Esto hace que funcione el botón Cerrar
      />
    );
  }

  // Ruta 2: Servicios (Isabella o PRMaestro)
  if (pantalla === 'isabellaVentas') {
    return (
      <IsabellaCierre
        personaje    = {personaje} 
        comercio     = {comercioPerfil || { nombre_comercio: card?.alias || card?.name }}
        mensaje      = {mensaje}
        bolas        = {bolas || []}
        carrito      = {items}
        precios      = {precios}
        vale_activo  = {vale_activo}
        delivery     = {delivery}
        valesUsuario = {valesUsuario} // 👈 Esto enciende los vales de Isabella
        loading      = {loading}
        onSend       = {enviar}
        onIrAPagar   = {() => setPantalla('carro')}
        onClose      = {onClose}      // 👈 Esto hace que funcione el botón Cerrar
      />
    );
  }

  // Ruta 3: Carro General
  if (pantalla === 'carro') {
    return (
      <CarroGeneral
        items            = {items}
        vale_activo      = {vale_activo}
        delivery         = {delivery}
        precios          = {precios}
        regalo_precio    = {comercioPerfil?.regalo_precio || 0}
        onConfirmar      = {handleConfirmarPedido}
        onVolverNova     = {() => setPantalla('novaVentas')}
        onVolverIsabella = {() => setPantalla('isabellaVentas')}
        usuario_nombre   = {currentUser?.osos_nombre || currentUser?.alias || 'ciudadano'}
        videoUrl         = "/videos/CerrarCarrito.mp4"
      />
    );
  }

  return null;
};

export default PaymentModal;