import React from 'react';

const SidebarManager = ({ 
  isLeftOpen, setIsLeftOpen, 
  isRightOpen, setIsRightOpen, 
  balances, setShowWalletModal, showRadar, setShowRadar, 
  radarQuery, setRadarQuery, realItems, setSelectedForestUser, 
  setStep, audioUser, setAudioUser, broTunerRef, navItems, 
  handleNavigation, setShowBooster, setShowStory, setShowLegal, 
  handleLogout, handleReportIssue 
}) => {
  return (
    <>
      {/* 1. PUERTA IZQUIERDA (Audio Hub) */}
      <aside className={`fixed top-0 left-0 w-64 h-full bg-slate-950 border-r border-cyan-900/50 z-50 transform transition-transform ${isLeftOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          <h2 className="text-cyan-400 font-bold mb-4">AUDIO HUB</h2>
          
          {/* Audio Controls */}
          <div className="flex justify-center gap-4 my-4">
             <button className="text-2xl">◀</button>
             <button className="text-2xl">▶</button>
          </div>

          <div className="flex-1 overflow-y-auto">
             {/* Aquí llamarías a tus componentes de audio */}
          </div>
          
          <button onClick={() => setIsLeftOpen(false)} className="w-full py-2 border border-cyan-500/20 text-xs">CERRAR</button>
        </div>
      </aside>

      {/* 2. PUERTA DERECHA (Menú Táctico + Acciones) */}
      <aside className={`fixed top-0 right-0 w-64 h-full bg-slate-950 border-l border-blue-900/50 z-50 transform transition-transform ${isRightOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 h-full flex flex-col overflow-y-auto">
          
          {/* ACCIONES SOCIALES / ECONOMICAS */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button className="p-2 bg-yellow-900/20 border border-yellow-500/30 text-[10px]">HALO LUZ</button>
            <button className="p-2 bg-green-900/20 border border-green-500/30 text-[10px]">ECO</button>
            <button className="p-2 bg-blue-900/20 border border-blue-500/30 text-[10px]">ZAP</button>
            <button className="p-2 bg-purple-900/20 border border-purple-500/30 text-[10px]">TEL. CASA</button>
          </div>

          <p className="text-[9px] text-gray-500 font-bold uppercase mb-2">Navegación Sectores</p>
          <div className="flex flex-col gap-2 mb-6">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => { handleNavigation(item.id); setIsRightOpen(false); }} className="p-3 bg-black/40 border border-slate-800 text-xs text-left">
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-auto space-y-2">
            <button onClick={() => setShowBooster(true)} className="w-full p-2 border border-cyan-500/30 text-[10px] text-cyan-400">BOOSTER STUDIO</button>
            <button onClick={handleLogout} className="w-full p-2 text-red-500 text-[10px]">DISCONNECT</button>
          </div>
        </div>
      </aside>

      {/* GATILLOS */}
      <button onClick={() => setIsLeftOpen(!isLeftOpen)} className="fixed top-1/2 left-0 z-[60] p-4 bg-black/80 border border-white/10 rounded-r-xl text-cyan-400">▶</button>
      <button onClick={() => setIsRightOpen(!isRightOpen)} className="fixed top-1/2 right-0 z-[60] p-4 bg-black/80 border border-white/10 rounded-l-xl text-fuchsia-400">◀</button>
    </>
  );
};

export default SidebarManager;