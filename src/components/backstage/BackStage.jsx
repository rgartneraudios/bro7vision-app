import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import MarketplaceTab from './MarketplaceTab';

const BackStage = ({ session, onLogout }) => {
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('marketplace');

  useEffect(() => {
    supabase
      .from('b_advertiser_profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        setProfile(data);
        setLoading(false);
      });
  }, [session]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center font-mono">
        <span className="text-gray-500 text-xs animate-pulse tracking-widest">CONECTANDO CON EL ESTUDIO...</span>
      </div>
    );
  }

  // Pantalla de espera: perfil no existe o pendiente de aprobación
  if (!profile || profile.estado === 'EN_CASTING') {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center font-mono text-white p-8">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-5">🎬</div>
          <h2 className="text-base font-bold text-white mb-2 tracking-tight">SOLICITUD EN REVISIÓN</h2>
          <p className="text-gray-500 text-xs leading-relaxed mb-6">
            El Estudio está evaluando tu cuenta. Una vez aprobada tendrás acceso completo al BackStage y podrás contratar tus primeras butacas.
          </p>
          <div className="inline-flex items-center gap-2 text-[9px] text-amber-400 border border-amber-900/40 bg-amber-950/20 px-4 py-2 rounded">
            <span className="animate-pulse">●</span>
            ESTADO: EN CASTING
          </div>
          <div className="mt-8 border-t border-white/5 pt-6">
            <button
              onClick={onLogout}
              className="text-[9px] text-gray-600 hover:text-white uppercase tracking-widest transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Perfil suspendido
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

  const tabs = [
    { id: 'campanas',    label: 'MIS CAMPAÑAS',  soon: true  },
    { id: 'marketplace', label: 'MARKETPLACE',   soon: false },
    { id: 'comunidad',   label: 'COMUNIDAD',     soon: true  },
  ];

  return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col font-mono text-white overflow-hidden">

      {/* Topbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-black/40 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold tracking-tight">
            BRO7VISION <span className="text-purple-400">BACKSTAGE</span>
          </span>
          <span className="hidden sm:inline text-[8px] text-gray-600 uppercase tracking-[0.2em] border border-white/5 px-2 py-0.5 rounded">
            PRODUCTOR
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-[10px] text-gray-400 truncate max-w-[200px]">
            {profile.razon_social || session.user.email}
          </span>
          <button
            onClick={onLogout}
            className="text-[9px] text-gray-500 hover:text-white border border-white/8 hover:border-white/25 px-2.5 py-1 rounded transition-all uppercase tracking-wider"
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
            className={`relative px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === tab.id
                ? 'text-white border-b-2 border-purple-500'
                : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            {tab.label}
            {tab.soon && activeTab !== tab.id && (
              <span className="ml-1.5 text-[7px] text-gray-700 normal-case font-normal">pronto</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {activeTab === 'marketplace' && (
          <MarketplaceTab session={session} profile={profile} />
        )}
        {activeTab === 'campanas' && (
          <div className="flex flex-col items-center justify-center h-64 text-center px-6">
            <div className="text-2xl mb-3">📋</div>
            <p className="text-gray-600 text-xs">MIS CAMPAÑAS — Disponible próximamente</p>
          </div>
        )}
        {activeTab === 'comunidad' && (
          <div className="flex flex-col items-center justify-center h-64 text-center px-6">
            <div className="text-2xl mb-3">📢</div>
            <p className="text-gray-600 text-xs">COMUNIDAD — Disponible próximamente</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackStage;
