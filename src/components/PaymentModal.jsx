// src/components/PaymentModal.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import NovaCierre from './NovaCierre';
import NovaCierreMobile from './NovaCierreMobile';
import IsabellaCierre from './IsabellaCierre';
import IsabellaCierreMobile from './IsabellaCierreMobile';
import CarroGeneral from './CarroGeneral';
import { useCarrito } from '../hooks/useCarrito';
import { useAgentChat } from '../hooks/useAgentChat';

const isMobile = () => window.innerWidth < 768;

const parsePrice = (input) => {
  if (input === null || input === undefined) return 0;
  if (typeof input === 'number') return input;
  const s = String(input).replace('€','').replace(',','.').trim();
  return isNaN(parseFloat(s)) ? 0 : parseFloat(s);
};

const PaymentModal = ({
  card,
  balances,
  setBalances,
  ventasMode   = 'novaCierre',
  currentUser  = null,
  onClose,
  onHandoff,
  onConfirmPayment,
}) => {
  if (!card) return null;

  const [pantalla, setPantalla] = useState(ventasMode);
  const mobile = isMobile();

  const personaje = pantalla === 'isabellaCierre'
    ? (currentUser?.servicios_personaje || 'isabella')
    : 'nova';

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

        const { data: profileData } = await supabase
          .from('profiles')
          .select('video_file_219')
          .eq('id', card.id)
          .maybeSingle();

        if (profileData?.video_file_219) {
          setComercioPerfil(prev => ({ ...(prev || {}), video_file_219: profileData.video_file_219 }));
        }

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

  const {
    items, vale_activo, delivery, precios,
    procesarAccion, vaciarCarrito, buildPedidoSnapshot,
  } = useCarrito({
    user_id:     currentUser?.id,
    comercio_id: card?.id,
    iva_pct:     comercioPerfil?.iva_pct || 21,
  });

  const valesUsuario = useMemo(() => ({
    nova:       balances?.vales?.nova       || 0,
    crescens:   balances?.vales?.crescens   || 0,
    plena:      balances?.vales?.plena      || 0,
    decrescens: balances?.vales?.decrescens || 0,
  }), [balances]);

  const agentContext = useMemo(() => ({
    comercio:  comercioPerfil || {},
    carrito:   items,
    vales:     valesUsuario,
    catalogo:  catalogoItems,
    personaje,
  }), [comercioPerfil, items, valesUsuario, catalogoItems, personaje]);

  const handleAccionIA = useCallback(async (accion) => {
    await procesarAccion(accion);
    if (accion?.tipo === 'IR_A_PAGAR')       setPantalla('carro');
    if (accion?.tipo === 'HANDOFF_FINANZAS') onHandoff?.({ agente: 'BROSHOP_AVISO' });
  }, [procesarAccion, onHandoff]);

  const modeChat = pantalla === 'isabellaCierre' ? 'isabellaCierre' : 'novaCierre';

  const { mensaje, bolas, loading, enviar } = useAgentChat({
    mode:         modeChat,
    contextData:  agentContext,
    onHandoff: (data) => {
      if (data.agente === 'CARRO_GENERAL') setPantalla('carro');
      if (data.agente === 'BROSHOP_AVISO') onHandoff?.({ agente: 'BROSHOP_AVISO' });
    },
    onAccionNova: handleAccionIA,
  });

  const handleConfirmarPedido = useCallback(async () => {
    if (!currentUser?.id) return;
    const snapshot = buildPedidoSnapshot();
    try {
      const { data: pedido, error } = await supabase
        .from('pedidos').insert(snapshot).select().single();
      if (error) throw error;

      if (vale_activo) {
        await supabase.rpc('decrementar_vale', {
          p_user_id: currentUser.id,
          p_campo:   `vales_${vale_activo}`,
        });
        setBalances(prev => ({
          ...prev,
          vales: { ...prev.vales, [vale_activo]: Math.max((prev.vales?.[vale_activo] || 1) - 1, 0) },
        }));
      }
      await vaciarCarrito();
      onConfirmPayment?.('stripe', snapshot.total_final, card, pedido.id);
      onClose?.();
    } catch (err) {
      console.error('[PaymentModal] Error confirmando pedido:', err);
    }
  }, [buildPedidoSnapshot, vale_activo, currentUser, vaciarCarrito, onConfirmPayment, card, onClose, setBalances]);

  // Props comunes para ambas variantes (PC y móvil)
  const propsNova = {
    comercio:     comercioPerfil || { nombre_comercio: card?.alias || card?.name },
    mensaje, bolas: bolas || [], carrito: items, precios,
    vale_activo, delivery, valesUsuario, loading,
    onSend:     enviar,
    onIrAPagar: () => setPantalla('carro'),
    onClose,
  };

  const propsIsabella = {
    ...propsNova,
    personaje,
  };

  // ── NOVA CIERRE ───────────────────────────────────────────────────────────
  if (pantalla === 'novaCierre') {
    return mobile
      ? <NovaCierreMobile {...propsNova} />
      : <NovaCierre {...propsNova} />;
  }

  // ── ISABELLA CIERRE ───────────────────────────────────────────────────────
  if (pantalla === 'isabellaCierre') {
    return mobile
      ? <IsabellaCierreMobile {...propsIsabella} />
      : <IsabellaCierre {...propsIsabella} />;
  }

  // ── CARRO GENERAL — mismo componente, detecta móvil internamente ──────────
  if (pantalla === 'carro') {
    return (
      <CarroGeneral
        items            = {items}
        vale_activo      = {vale_activo}
        delivery         = {delivery}
        precios          = {precios}
        regalo_precio    = {comercioPerfil?.regalo_precio || 0}
        onConfirmar      = {handleConfirmarPedido}
        onVolverNova     = {() => setPantalla('novaCierre')}
        onVolverIsabella = {() => setPantalla('isabellaCierre')}
        usuario_nombre   = {currentUser?.osos_nombre || currentUser?.alias || 'ciudadano'}
        videoUrl         = "/videos/CerrarCarrito.mp4"
      />
    );
  }

  return null;
};

export default PaymentModal;
