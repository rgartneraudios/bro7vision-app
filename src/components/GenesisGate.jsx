import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import DirectorAccess from './DirectorAccess';
import BusinessAccess from './BusinessAccess';

// Aceptamos la prop 'onGuestAccess' para dejar pasar al visitante
const GenesisGate = ({ onGuestAccess }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alias, setAlias] = useState('');
  const [mode, setMode] = useState('login'); 
  const [message, setMessage] = useState(null);
  const [legalAccepted, setLegalAccepted] = useState(false);
  
  // ... otros estados ...
const [showDirector, setShowDirector] = useState(false);
const [showBusiness, setShowBusiness] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!legalAccepted) return; 

    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { alias: alias, role: 'citizen' },
          },
        });
        if (error) throw error;
        setMessage("✅ Identidad creada. Revisa tu email para activar el enlace neural.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
      }
    } catch (error) {
      setMessage(`❌ Error de acceso: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProAccess = (rol) => {
  if (rol === 'DIRECTOR') setShowDirector(true);
  if (rol === 'ANUNCIANTE') setShowBusiness(true);
};


  return (
    <div className="fixed inset-0 z-[999] bg-black flex items-center justify-center overflow-hidden font-mono text-white">
      
      {/* --- 1. FONDO DE VIDEO (CINE) --- */}
       <div className="absolute inset-0 z-0">
        <video 
            src="https://pub-57f2bfe6389542fe895a61b50b727921.r2.dev/genesisgate.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover opacity-60" 
        />
        {/* Capa extra de oscurecimiento para leer mejor */}
        <div className="absolute inset-0 bg-black/40"></div>
       </div>
      
      {/* --- 2. TARJETA DE ACCESO --- */}
      <div className="relative z-10 w-full max-w-md p-8 border border-white/10 bg-black/70 backdrop-blur-xl rounded-2xl shadow-[0_0_100px_rgba(34,211,238,0.15)] animate-zoomIn">
        
        <div className="text-center mb-6">
            <h1 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                BRO7VISION
            </h1>
            <p className="text-[10px] text-gray-300 uppercase tracking-[0.5em] mt-2 font-bold">Genesis Access Point</p>
        </div>

        {message && (
            <div className={`mb-6 p-4 text-xs border rounded ${message.includes('Error') ? 'border-red-500 text-red-400 bg-red-900/40' : 'border-green-500 text-green-400 bg-green-900/40'}`}>
                {message}
            </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-3">
            
            {mode === 'register' && (
                <div className="group">
                    <label className="text-[9px] text-cyan-400 uppercase tracking-widest mb-1 block font-bold">Alias (Nick)</label>
                    <input 
                        type="text" required placeholder="Cyber_User"
                        className="w-full bg-black/50 border border-white/20 text-white text-sm px-4 py-3 rounded focus:border-cyan-500 focus:outline-none transition-all placeholder-gray-600 focus:bg-black/80"
                        value={alias} onChange={(e) => setAlias(e.target.value)}
                    />
                </div>
            )}

            <div className="group">
                <label className="text-[9px] text-fuchsia-400 uppercase tracking-widest mb-1 block font-bold">Email</label>
                <input 
                    type="email" required placeholder="citizen@brovision.com"
                    className="w-full bg-black/50 border border-white/20 text-white text-sm px-4 py-3 rounded focus:border-fuchsia-500 focus:outline-none transition-all placeholder-gray-600 focus:bg-black/80"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="group">
                <label className="text-[9px] text-gray-400 uppercase tracking-widest mb-1 block font-bold">Password</label>
                <input 
                    type="password" required placeholder="••••••••"
                    className="w-full bg-black/50 border border-white/20 text-white text-sm px-4 py-3 rounded focus:border-white focus:outline-none transition-all placeholder-gray-600 focus:bg-black/80"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            {/* CHECKBOX LEGAL */}
            <div className="flex items-start gap-3 mt-1 p-2 border border-white/5 rounded bg-white/5 hover:bg-white/10 transition-colors">
                <input 
                    type="checkbox" 
                    id="legalCheck"
                    checked={legalAccepted}
                    onChange={(e) => setLegalAccepted(e.target.checked)}
                    className="mt-1 w-3 h-3 accent-fuchsia-500 cursor-pointer"
                />
                <label htmlFor="legalCheck" className="text-[9px] text-gray-400 leading-tight cursor-pointer select-none text-left">
                    Acepto el <span className="text-cyan-400 font-bold hover:underline">Protocolo de Ciudadanía</span> y <span className="text-cyan-400 font-bold hover:underline">Términos Fase 1</span>.
                </label>
            </div>

            <button 
                disabled={loading || !legalAccepted} 
                type="submit"
                className="mt-2 w-full py-3 bg-white text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-cyan-400 hover:scale-[1.02] transition-all rounded shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-500 disabled:shadow-none"
            >
                {loading ? 'SINTONIZANDO...' : (mode === 'login' ? 'INICIAR SESIÓN' : 'REGISTRAR ID')}
            </button>

        </form>

        {/* --- 3. BOTÓN VISITANTE --- */}
        <div className="mt-3">
            <button 
                onClick={onGuestAccess}
                className="w-full py-2 border border-white/10 text-gray-500 text-[9px] font-bold uppercase tracking-widest hover:text-white hover:border-white/40 hover:bg-white/5 transition-all rounded"
            >
                👁️ Explorar como Visitante (Solo Lectura)
            </button>
        </div>

        <div className="mt-4 text-center pb-4 border-b border-white/10">
            <button 
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage(null); }}
                className="text-[10px] text-gray-500 hover:text-cyan-400 transition-colors"
            >
                {mode === 'login' ? "¿Nuevo en la Red? Crear ID" : "Volver a Iniciar Sesión"}
            </button>
        </div>

        {/* --- 4. NUEVA ZONA PROFESIONAL (Fase 0.9) --- */}
        <div className="mt-4">
            <p className="text-[8px] text-center text-gray-600 uppercase tracking-[0.2em] mb-3">
                Acceso Partners & Creators
            </p>
            <div className="flex gap-3">
                {/* Botón ANUNCIANTE (Estilo Negocio/Purple) */}
                <button 
                    onClick={() => handleProAccess('ANUNCIANTE')}
                    className="flex-1 py-2 border border-purple-500/30 text-purple-400/80 hover:text-purple-300 hover:border-purple-400 hover:bg-purple-900/20 text-[9px] font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 group"
                >
                    <span className="group-hover:scale-110 transition-transform">💼</span> Soy Anunciante
                </button>

                {/* Botón DIRECTOR (Estilo Arte/Green) */}
                <button 
                    onClick={() => handleProAccess('DIRECTOR')}
                    className="flex-1 py-2 border border-emerald-500/30 text-emerald-400/80 hover:text-emerald-300 hover:border-emerald-400 hover:bg-emerald-900/20 text-[9px] font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 group"
                >
                    <span className="group-hover:scale-110 transition-transform">🎬</span> Soy Director
                </button>
            </div>
        </div>

      </div>
      
      {showDirector && <DirectorAccess onBack={() => setShowDirector(false)} />}
  {showBusiness && <BusinessAccess onBack={() => setShowBusiness(false)} />}
      
    </div>
  );
};

export default GenesisGate;