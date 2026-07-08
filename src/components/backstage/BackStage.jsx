import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import MarketplaceTab from './MarketplaceTab';
import MencionesTab from './MencionesTab';
import SlideRailTab from './SlideRailTab';
import GamesTab from './GamesTab';
import EstudioMarketingTab from './EstudioMarketing';
import BlogTab from './BlogTab';
import MisCampanasTab from './MisCampanasTab';
import PromoEcoTab from './PromoEcoTab';
import TarjetasRegaloTab from './TarjetasRegaloTab';
import ShopAmigosTab from './ShopAmigosTab';

const SYNE = "'Exo 2', sans-serif";

const BackStage = ({ session, onLogout }) => {
  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('fondos');
  const [activeBlock, setActiveBlock] = useState('anuncios');
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!session) { setLoading(false); return; }
    const role  = session.user.user_metadata?.role;
    const table = role === 'director' ? 'b_creator_profiles' : 'b_advertiser_profiles';
    const { data } = await supabase
      .from(table)
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();
    setProfile(data);
    setLoading(false);
  }, [session]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // Re-fetch cada 10 s mientras el perfil sigue EN_CASTING
  useEffect(() => {
    if (profile?.estado !== 'EN_CASTING') return;
    const id = setInterval(fetchProfile, 10000);
    return () => clearInterval(id);
  }, [profile?.estado, fetchProfile]);

  if (!isDesktop) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center font-mono text-white p-8">
        <div className="text-center max-w-xs">
          <div className="text-5xl mb-6">🖥️</div>
          <h2 className="text-xl font-bold text-white mb-3 tracking-tight">BACKSTAGE SOLO EN PC</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            El panel de producción requiere pantalla de escritorio.<br />
            Accede desde un ordenador para gestionar tus espacios.
          </p>
          <button onClick={onLogout} className="text-[9px] text-gray-600 hover:text-white uppercase tracking-widest transition-colors">
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center font-mono">
        <span className="text-gray-500 text-xs animate-pulse tracking-widest">CONECTANDO CON EL ESTUDIO...</span>
      </div>
    );
  }

  // ── Pantalla de espera: EN CASTING ──────────────────────────────────────
  if (!profile || profile.estado === 'EN_CASTING') {
    return (
      <div className="fixed inset-0 overflow-hidden flex flex-col items-center" style={{ background: '#000' }}>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap');

          @keyframes sw-crawl {
            from { transform: rotateX(28deg) translateY(85vh); }
            to   { transform: rotateX(28deg) translateY(-380%); }
          }
          @keyframes bio-pulse {
            0%,100% { text-shadow: 0 0 14px #00ffc8, 0 0 40px #00ffc870, 0 0 80px #00ffc840; }
            50%      { text-shadow: 0 0 24px #00ffc8, 0 0 65px #00ffc8a0, 0 0 130px #00ffc860; }
          }
          @keyframes dot-blink {
            0%,100% { opacity: 1; } 50% { opacity: 0.3; }
          }
        `}</style>

        {/* Campo de estrellas */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `
            radial-gradient(1px 1px at 8%  12%, rgba(255,255,255,.55) 0%, transparent 100%),
            radial-gradient(1px 1px at 22% 7%,  rgba(255,255,255,.35) 0%, transparent 100%),
            radial-gradient(1px 1px at 38% 28%, rgba(255,255,255,.45) 0%, transparent 100%),
            radial-gradient(1px 1px at 53% 5%,  rgba(255,255,255,.30) 0%, transparent 100%),
            radial-gradient(1px 1px at 68% 18%, rgba(255,255,255,.50) 0%, transparent 100%),
            radial-gradient(1px 1px at 80% 42%, rgba(255,255,255,.40) 0%, transparent 100%),
            radial-gradient(1px 1px at 92% 9%,  rgba(255,255,255,.30) 0%, transparent 100%),
            radial-gradient(1px 1px at 5%  58%, rgba(255,255,255,.35) 0%, transparent 100%),
            radial-gradient(1px 1px at 30% 72%, rgba(255,255,255,.40) 0%, transparent 100%),
            radial-gradient(1px 1px at 60% 60%, rgba(255,255,255,.45) 0%, transparent 100%),
            radial-gradient(1px 1px at 75% 80%, rgba(255,255,255,.30) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 68%, rgba(255,255,255,.50) 0%, transparent 100%),
            radial-gradient(1px 1px at 14% 88%, rgba(0,255,200,.25)   0%, transparent 100%),
            radial-gradient(1px 1px at 47% 93%, rgba(0,255,200,.20)   0%, transparent 100%),
            radial-gradient(1px 1px at 83% 55%, rgba(0,255,200,.18)   0%, transparent 100%)
          `,
          backgroundColor: '#000',
        }} />

        {/* Logo BRO7VISION */}
        <div className="relative z-10 mt-12 text-center select-none">
          <h1 style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: 'clamp(1.6rem, 5vw, 3rem)',
            fontWeight: 900,
            color: '#00ffc8',
            letterSpacing: '0.45em',
            animation: 'bio-pulse 3s ease-in-out infinite',
          }}>
            BRO7VISION
          </h1>
          <p style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '0.5rem',
            color: 'rgba(0,255,200,0.4)',
            letterSpacing: '0.7em',
            marginTop: '0.5rem',
          }}>
            BACKSTAGE STUDIO
          </p>
        </div>

        {/* Contenedor perspectiva — crawl */}
        <div
          className="relative z-10 flex-1 w-full"
          style={{
            perspective: '380px',
            perspectiveOrigin: '50% 0%',
            overflow: 'hidden',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 78%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 78%, transparent 100%)',
          }}
        >
          <div style={{
            width: '72%',
            maxWidth: '480px',
            margin: '0 auto',
            textAlign: 'center',
            animation: 'sw-crawl 30s linear infinite',
            transform: 'rotateX(28deg) translateY(85vh)',
            paddingBottom: '5rem',
          }}>

            <p style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 'clamp(1.5rem, 4.5vw, 2.4rem)',
              fontWeight: 900,
              color: '#00ffc8',
              textShadow: '0 0 12px #00ffc8, 0 0 35px rgba(0,255,200,.55)',
              lineHeight: 1.35,
              letterSpacing: '0.08em',
              marginBottom: '2rem',
            }}>
              SOLICITUD<br />EN REVISIÓN
            </p>

            <p style={{
              fontSize: 'clamp(0.9rem, 2.8vw, 1.2rem)',
              color: '#80fff0',
              lineHeight: 2,
              textShadow: '0 0 8px rgba(0,255,200,.35)',
              marginBottom: '1.6rem',
            }}>
              El Estudio está evaluando<br />tu expediente de candidatura.
            </p>

            <p style={{
              fontSize: 'clamp(0.8rem, 2.2vw, 1.05rem)',
              color: '#4dccb8',
              lineHeight: 2.1,
              textShadow: '0 0 6px rgba(0,255,200,.25)',
              marginBottom: '2.2rem',
            }}>
              Una vez aprobada tu candidatura,<br />
              tendrás acceso completo al BackStage<br />
              y podrás contratar tus primeras butacas.
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.55rem 1.6rem',
              border: '1px solid rgba(0,255,200,.3)',
              color: '#00ffc8',
              fontSize: '0.72rem',
              letterSpacing: '0.28em',
              textShadow: '0 0 8px #00ffc8',
              fontFamily: "'Orbitron', monospace",
              fontWeight: 700,
            }}>
              <span style={{ animation: 'dot-blink 1.4s ease-in-out infinite' }}>●</span>
              ESTADO: EN CASTING
            </div>
          </div>
        </div>

        {/* Cerrar sesión */}
        <div className="relative z-10 pb-8">
          <button
            onClick={onLogout}
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '0.6rem',
              color: 'rgba(0,255,200,.3)',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#00ffc8'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,255,200,.3)'}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  // ── Perfil suspendido ────────────────────────────────────────────────────
  if (profile.estado === 'SUSPENDIDO') {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center font-mono text-white p-8">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-5">🚫</div>
          <h2 className="text-base font-bold text-red-400 mb-2">CUENTA SUSPENDIDA</h2>
          <p className="text-gray-500 text-xs leading-relaxed mb-6">
            Tu cuenta ha sido suspendida. Contacta con el Estudio para más información.
          </p>
          <button onClick={onLogout} className="text-[9px] text-gray-600 hover:text-white uppercase tracking-widest transition-colors">
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  // ── BackStage principal ──────────────────────────────────────────────────
  const rolUsuario  = session?.user?.user_metadata?.role;

  const TABS_ANUNCIOS = [
    { id: 'fondos',          label: 'FONDOS REALITY'       },
    { id: 'promo_eco',       label: 'PROMO ECO'            },
    { id: 'bro7band',        label: 'BRO7BAND'             },
    { id: 'slide_rail',      label: 'SLIDE RAIL'           },
    { id: 'games',           label: 'GAMES'                },
    { id: 'campanas',        label: 'MIS CAMPAÑAS'         },
    { id: 'estudio',         label: 'ESTUDIO MARKETING'    },
    { id: 'blog',            label: 'BLOG / DOCS'          },
  ];

  const TABS_COMERCIO = [
    { id: 'tarjetas_regalo', label: 'TARJETAS REGALO'      },
    { id: 'shop_amigos',     label: 'SHOP AMIGOS'          },
  ];

  const tabs = activeBlock === 'anuncios' ? TABS_ANUNCIOS : TABS_COMERCIO;

  return (
    <div
      className="fixed inset-0 flex flex-col font-mono text-white overflow-hidden"
      style={{
        background: `linear-gradient(rgba(0,0,0,0.78), rgba(0,0,0,0.78)), url('/images/productor.webp') center/cover no-repeat`,
      }}
    >

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&display=swap');`}</style>

      {/* Topbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/40 shrink-0">
        <div className="flex items-center gap-4">
          <span style={{ fontFamily: SYNE }} className="text-2xl font-black tracking-tight">
            BRO7VISION <span className="text-purple-400">BACKSTAGE</span>
          </span>
          {session?.user?.user_metadata?.role && (
            <span className="hidden sm:inline text-base font-black uppercase tracking-[0.2em] px-3 py-1 rounded border"
              style={{ color: '#ff00ff', borderColor: 'rgba(255,0,255,0.3)', textShadow: '0 0 8px rgba(255,0,255,0.5)' }}>
              PRODUCTOR
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setActiveBlock('anuncios'); setActiveTab(TABS_ANUNCIOS[0].id); }}
            className={`text-sm font-black uppercase tracking-[0.25em] px-6 py-2.5 rounded-lg border-2 transition-all shadow-lg ${
              activeBlock === 'anuncios'
                ? 'text-cyan-300 border-cyan-400 bg-cyan-900/30 shadow-cyan-400/30'
                : 'text-gray-600 border-gray-700 hover:text-gray-300 hover:border-gray-500'
            }`}
          >
            ANUNCIOS
          </button>
          <button
            onClick={() => { setActiveBlock('comercio'); setActiveTab(TABS_COMERCIO[0].id); }}
            className={`text-sm font-black uppercase tracking-[0.25em] px-6 py-2.5 rounded-lg border-2 transition-all shadow-lg ${
              activeBlock === 'comercio'
                ? 'text-pink-300 border-pink-400 bg-pink-900/30 shadow-pink-400/30'
                : 'text-gray-600 border-gray-700 hover:text-gray-300 hover:border-gray-500'
            }`}
          >
            COMERCIO
          </button>
        </div>
        <div className="flex items-center gap-5">
          <span className="hidden sm:block text-sm text-gray-300 font-semibold truncate max-w-[240px]" style={{ fontFamily: SYNE }}>
            {profile.razon_social || profile.alias || session?.user?.email}
          </span>
          <button
            onClick={onLogout}
            className="text-sm font-semibold text-gray-400 hover:text-white border border-white/10 hover:border-white/30 px-4 py-2 rounded transition-all uppercase tracking-wider"
            style={{ fontFamily: SYNE }}
          >
            Salir
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex shrink-0 border-b border-white/5 bg-black/20">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ fontFamily: SYNE }}
            className={`relative px-4 py-4 text-sm font-bold uppercase tracking-widest transition-all ${
              activeTab === tab.id
                ? 'text-white border-b-2 border-purple-500'
                : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            {tab.label}
            {tab.soon && activeTab !== tab.id && (
              <span className="ml-1.5 text-[8px] text-gray-700 normal-case font-normal">pronto</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">

        {activeTab === 'fondos' && (
          <MarketplaceTab session={session} profile={profile} />
        )}

        {activeTab === 'campanas' && (
          <MisCampanasTab />
        )}

        {activeTab === 'bro7band' && (
          <MencionesTab />
        )}

        {activeTab === 'slide_rail' && (
          <SlideRailTab role={rolUsuario} />
        )}

        {activeTab === 'shop_amigos' && (
          <ShopAmigosTab />
        )}

        {activeTab === 'games' && (
          <GamesTab />
        )}

        {activeTab === 'promo_eco' && (
          <PromoEcoTab userId={session?.user?.id} />
        )}

        {activeTab === 'tarjetas_regalo' && (
          <TarjetasRegaloTab userId={session?.user?.id} />
        )}

        {activeTab === 'estudio' && (
          <EstudioMarketingTab />
        )}

        {activeTab === 'blog' && (
          <BlogTab />
        )}

      </div>
    </div>
  );
};

export default BackStage;
