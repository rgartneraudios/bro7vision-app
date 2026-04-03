// src/components/BroShopAcordeon.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const BroShopAcordeon = ({
  sessionCP,
  sessionCity,
  sessionRef,
  onTuneIn,
  onOpenTelefono,
  onOpenTerminal,
  onVLChange,
  onHoverComercio,
  ososHandoffContext,
  onHandoffConsumed
}) => {
  const [search, setSearch] = useState('');
  const [comercios, setComercios] = useState([]);
  const [resultados, setResultados] = useState({});
  const [loading, setLoading] = useState(false);
  const [vlActivo, setVlActivo] = useState(null);
  const [puertasCerradas, setPuertasCerradas] = useState(false);

  useEffect(() => {
    if (ososHandoffContext?.intencion) {
      setSearch(ososHandoffContext.intencion);
      onHandoffConsumed?.();
    }
  }, [ososHandoffContext]);

  useEffect(() => {
    const fetchComercios = async () => {
    setLoading(true);
      setPuertasCerradas(true);
      let query = supabase
        .from('profiles')
        .select('id, alias, avatar_url, banner_url, card_banner_url, neighborhood, nearby_ref, description, audio_file, video_file, zip_code, card_color')
        .not('biz_category', 'is', null)
        .order('alias');
      if (sessionCP) query = query.eq('zip_code', sessionCP);
      const { data, error } = await query;
      if (!error && data) setComercios(data);
      setLoading(false);
      setTimeout(() => setPuertasCerradas(false), 400);
    };
    fetchComercios();
  }, [sessionCP]);

  const buscar = useCallback(async (q) => {
    if (!q.trim() || comercios.length === 0) {
      setResultados({});
      setTimeout(() => setPuertasCerradas(false), 300);
      return;
    }
    const ownerIds = comercios.map(c => c.id);
    const { data, error } = await supabase
      .from('catalog_items')
      .select('id, owner_id, title, price_fiat')
      .in('owner_id', ownerIds)
      .ilike('title', `%${q.trim()}%`)
      .limit(100);
    if (!error && data) {
      const agrupado = {};
      data.forEach(item => {
        if (!agrupado[item.owner_id]) agrupado[item.owner_id] = [];
        agrupado[item.owner_id].push(item);
      });
      setResultados(agrupado);
    }
    setTimeout(() => setPuertasCerradas(false), 300);
  }, [comercios]);

  useEffect(() => {
    setPuertasCerradas(true);
    const timer = setTimeout(() => buscar(search), 500);
    return () => clearTimeout(timer);
  }, [search, buscar]);

  const activarVL = (comercio) => {
    const vl = { alias: comercio.alias, nearbyRef: comercio.nearby_ref, cp: comercio.zip_code, avatar_url: comercio.avatar_url };
    setVlActivo(vl);
    onVLChange?.(vl);
  };

  const desactivarVL = () => {
    setVlActivo(null);
    onVLChange?.(null);
  };

  const getNeon = (cardColor) => {
    const map = {
      cyan: '#00E1FF', fuchsia: '#FF007D', yellow: '#FFD700',
      green: '#00FF48', blue: '#1E40AF', red: '#FF1A1A',
      orange: '#FF8000', white: '#FFFFFF'
    };
    return map[cardColor?.split('-')[0]] || '#00E1FF';
  };

  const LADRILLOS = [
    { color: '#FFD700', label: 'BroShop',          textColor: '#000000', active: true  },
    { color: '#00FF48', label: 'Teléfono Casa',    textColor: '#000000', active: false },
    { color: '#1E40AF', label: 'Audio & Lives',    textColor: '#FFFFFF', active: false },
    { color: '#FF8000', label: 'Virtual Location', textColor: '#FFFFFF', active: false },
  ];

  return (
    <div
      className="flex flex-col h-full w-full relative rounded-2xl overflow-hidden font-outfit"
      style={{
        backgroundImage: 'url(/images/galaxys_bg.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        .neon-text-shadow { text-shadow: 0 0 8px currentColor; }
        .card-hover { transition: transform 0.15s ease; }
        .card-hover:hover { transform: translateY(-1px); }
        .broshop-pill:hover { filter: brightness(1.15); transform: scale(1.04); }
        .broshop-pill { transition: filter 0.15s ease, transform 0.15s ease; }
      `}</style>

      <div className="absolute inset-0 bg-black/60 pointer-events-none z-0" />

      {/* ══ LADRILLOS — Amarillo primero, azul y naranja en blanco ══ */}
      <div className="relative z-10 grid grid-cols-4 gap-3 px-4 pt-4 pb-2 shrink-0">
        {LADRILLOS.map((b) => (
          <div
            key={b.label}
            className="rounded-xl h-14 sm:h-16 flex items-center justify-center border-2 transition-all"
            style={{
              backgroundColor: b.color,
              color: b.textColor,
              borderColor: b.active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
              boxShadow: b.active
                ? `0 0 25px ${b.color}, 0 0 50px ${b.color}60, inset 0 0 15px rgba(255,255,255,0.7)`
                : `0 0 18px ${b.color}99, inset 0 0 10px rgba(255,255,255,0.3)`,
            }}
          >
            <span className="text-[11px] sm:text-[13px] font-black uppercase tracking-tighter text-center leading-none px-1">
              {b.label}
            </span>
          </div>
        ))}
      </div>

      {/* ══ BUSCADOR ══ */}
      <div className="relative z-10 px-4 pt-1 pb-2 shrink-0">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400 pointer-events-none">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="SINTONIZAR INTENCIÓN..."
            className="w-full bg-black/50 border-2 border-white/10 focus:border-yellow-400/80 rounded-full pl-12 pr-10 py-3 text-sm font-semibold tracking-wide text-white placeholder-gray-500 outline-none transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400 text-xl transition-colors">✕</button>
          )}
        </div>
        <p className="text-sm text-yellow-300 font-black mt-2 px-2 tracking-widest uppercase drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]">
          📍 {sessionCity || 'Red Global'}{sessionCP ? ` · CP ${sessionCP}` : ''}{sessionRef ? ` · ${sessionRef}` : ''} · {comercios.length} comercios
        </p>
      </div>

      {/* ══ LISTA ══ */}
      <div className="relative flex-1 overflow-hidden px-4 pb-4">

        {/* Puertas animadas */}
        <div
          className="absolute inset-y-0 left-0 w-1/2 z-30 transition-transform duration-500 ease-in-out border-r-2 border-yellow-400/80 flex items-center justify-end pr-3"
          style={{
            background: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(4px)',
            boxShadow: '15px 0 30px rgba(255,215,0,0.1)',
            transform: puertasCerradas ? 'translateX(0)' : 'translateX(-100%)'
          }}
        >
          {puertasCerradas && <span className="text-yellow-400 text-sm font-black tracking-widest neon-text-shadow">SINTONIZANDO</span>}
        </div>
        <div
          className="absolute inset-y-0 right-0 w-1/2 z-30 transition-transform duration-500 ease-in-out border-l-2 border-yellow-400/80 flex items-center justify-start pl-3"
          style={{
            background: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(4px)',
            boxShadow: '-15px 0 30px rgba(255,215,0,0.1)',
            transform: puertasCerradas ? 'translateX(0)' : 'translateX(100%)'
          }}
        >
          {puertasCerradas && <span className="text-yellow-400 text-sm font-black tracking-widest neon-text-shadow">SECTOR...</span>}
        </div>

        <div className="h-full overflow-y-auto space-y-3 custom-scrollbar relative z-20 pr-1">

          {!loading && comercios.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-yellow-400 text-base font-bold tracking-widest uppercase">
              <span className="text-5xl mb-3">📭</span>
              Vacío de señal.
            </div>
          )}

          {!loading && comercios.map((comercio) => {
            const neon      = getNeon(comercio.card_color);
            const isVL      = vlActivo?.alias === comercio.alias;
            const hasAudio  = !!comercio.audio_file;
            const hasVideo  = !!comercio.video_file;
            const items     = resultados[comercio.id] || [];
            const borderCol = isVL ? '#f97316' : neon;

            return (
              <div
                key={comercio.id}
                onClick={() => onOpenTerminal?.(comercio)}
                onMouseEnter={() => onHoverComercio?.(comercio)}
                onMouseLeave={() => onHoverComercio?.(null)}
                className="rounded-2xl overflow-hidden card-hover cursor-pointer"
                style={{
                  border: `2px solid ${borderCol}`,
                  background: 'rgba(97,78,11,0.25)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: `0 0 14px ${isVL ? 'rgba(249,115,22,0.4)' : neon + '25'}, inset 0 0 20px rgba(0,0,0,0.8)`,
                }}
              >
                {/* ══ LAYOUT PRINCIPAL: banner izq + contenido der ══ */}
                <div className="flex items-stretch">

                  {/* BANNER VERTICAL — cubre los 3 renglones */}
                  <div
                    className="shrink-0 w-[68px] self-stretch overflow-hidden rounded-tl-[14px] rounded-bl-[14px]"
                    style={{ borderRight: `1px solid ${borderCol}40` }}
                  >
                    <img
                      src={comercio.banner_url || comercio.card_banner_url || comercio.avatar_url || 'https://placehold.co/68x160'}
                      alt={comercio.alias}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* CONTENIDO: 3 renglones */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center py-2.5 px-3 gap-2">

                    {/* ── RENGLÓN 1: Título + pill BroShop + 3 bolas + piruleta ── */}
                    <div
                      className="flex items-center gap-2 flex-wrap"
                      onClick={e => e.stopPropagation()}
                    >
                      {/* Título */}
                      <span
                        className="text-[13px] font-black uppercase tracking-wider neon-text-shadow leading-none"
                        style={{ color: neon }}
                      >
                        {comercio.alias}
                      </span>

                      {/* Pill BroShop — diferenciado, horizontal */}
                      <button
                        onClick={() => onOpenTerminal?.(comercio)}
                        className="broshop-pill flex items-center gap-1 px-2.5 py-0.5 rounded-full font-black uppercase text-black"
                        style={{
                          fontSize: '10px',
                          letterSpacing: '0.05em',
                          backgroundColor: '#FFD700',
                          boxShadow: '0 0 8px rgba(255,215,0,0.6)',
                        }}
                      >
                        <span style={{ fontSize: '10px' }}>🛒</span>
                        <span>BroShop</span>
                      </button>

                      {/* 3 bolas: Audio, Teléfono, VL */}
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => hasAudio && onTuneIn?.(comercio)}
                          title="Audio & Lives"
                          className={`w-6 h-6 rounded-full flex items-center justify-center border border-white/20 transition-all
                            ${hasAudio ? 'cursor-pointer hover:scale-110' : 'opacity-25 cursor-not-allowed grayscale'}`}
                          style={{ backgroundColor: '#1E40AF', boxShadow: '0 0 5px #1E40AF', fontSize: '10px' }}
                        >🎧</button>

                        <button
                          onClick={() => hasVideo && onOpenTelefono?.(comercio)}
                          title="Teléfono Casa"
                          className={`w-6 h-6 rounded-full flex items-center justify-center border border-white/20 transition-all
                            ${hasVideo ? 'cursor-pointer hover:scale-110' : 'opacity-25 cursor-not-allowed grayscale'}`}
                          style={{ backgroundColor: '#00FF48', boxShadow: '0 0 5px #00FF48', fontSize: '10px' }}
                        >☝️</button>

                        <button
                          onClick={(e) => { e.stopPropagation(); isVL ? desactivarVL() : activarVL(comercio); }}
                          title="Virtual Location"
                          className={`w-6 h-6 rounded-full flex items-center justify-center border border-white/20 transition-all cursor-pointer hover:scale-110
                            ${isVL ? 'border-2 border-white' : ''}`}
                          style={{ backgroundColor: '#FF8000', boxShadow: isVL ? '0 0 10px #FF8000' : '0 0 5px #FF8000', fontSize: '10px' }}
                        >📍</button>
                      </div>

                      {/* Piruleta ubicación */}
                      {comercio.nearby_ref && (
                        <div className="flex items-center gap-1 bg-white/10 border border-white/20 rounded-full px-2 py-0.5">
                          <span style={{ fontSize: '9px' }}>📍</span>
                          <span className="text-[10px] font-bold text-gray-300 leading-none">{comercio.nearby_ref}</span>
                        </div>
                      )}

                      {isVL && (
                        <span className="text-[9px] font-black text-[#FF8000] border border-[#FF8000] px-1.5 py-0.5 rounded-full">VL</span>
                      )}
                    </div>

                    {/* ── RENGLONES 2 y 3: Frase de presentación ── */}
                    <div>
                      {comercio.description ? (
                        <p className="text-xl font-light text-white leading-snug line-clamp-2 italic">
                          "{comercio.description}"
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 italic">Sin mensaje del comercio.</p>
                      )}
                    </div>

                    {/* Resultados búsqueda — solo si hay */}
                    {items.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-white/10">
                        {items.slice(0, 3).map(item => (
                          <span
                            key={item.id}
                            className="text-[11px] font-extrabold px-2 py-0.5 rounded-lg bg-black/80 border"
                            style={{ color: neon, borderColor: neon, boxShadow: `0 0 4px ${neon}` }}
                          >
                            {item.title} · {item.price_fiat}€
                          </span>
                        ))}
                        {items.length > 3 && (
                          <span className="text-[11px] font-bold text-gray-400 flex items-center">+{items.length - 3} más</span>
                        )}
                      </div>
                    )}

                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* ══ BANNER FOOTER VL ══ */}
      <div className={`relative z-10 shrink-0 px-4 py-3 border-t-2 transition-all duration-500 ${
        vlActivo
          ? 'border-[#FF8000] bg-black/80 shadow-[0_-5px_25px_rgba(255,128,0,0.3)]'
          : 'border-white/10 bg-black/80'
      }`}>
        {vlActivo ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={vlActivo.avatar_url || 'https://placehold.co/40'}
                alt=""
                className="w-10 h-10 rounded-xl border-2 border-[#FF8000] shrink-0 object-cover shadow-[0_0_10px_#FF8000]"
              />
              <div className="min-w-0">
                <p className="text-[10px] text-[#FF8000] font-black uppercase tracking-widest neon-text-shadow">🟠 Virtual Location Activo</p>
                <p className="text-base text-white font-extrabold truncate">
                  {vlActivo.alias}
                  {vlActivo.nearbyRef && <span className="text-gray-400 font-semibold text-sm"> · {vlActivo.nearbyRef}</span>}
                </p>
              </div>
            </div>
            <button
              onClick={desactivarVL}
              className="shrink-0 text-xs font-black text-[#FF8000] border-2 border-[#FF8000] hover:bg-[#FF8000]/20 px-4 py-2 rounded-xl transition-all uppercase tracking-widest shadow-[0_0_10px_#FF8000]"
            >
              ✕ Apagar VL
            </button>
          </div>
        ) : (
          <p className="text-[11px] text-yellow-300 font-bold uppercase tracking-widest">
            STATUS: <span className="text-white/60">SIN VIRTUAL LOCATION ACTIVO</span>
          </p>
        )}
      </div>

    </div>
  );
};

export default BroShopAcordeon;