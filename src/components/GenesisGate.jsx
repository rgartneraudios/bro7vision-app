import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

// Aceptamos la prop 'onGuestAccess' para dejar pasar al visitante
const GenesisGate = ({ onGuestAccess }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alias, setAlias] = useState('');
  const [mode, setMode] = useState('login'); 
  const [message, setMessage] = useState(null);
  const [legalAccepted, setLegalAccepted] = useState(false); // Cambiado nombre para ser más genérico

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

  return (
    <div className="fixed inset-0 z-[999] bg-black flex items-center justify-center overflow-hidden font-mono text-white">
      
      {/* --- 1. FONDO DE VIDEO (CINE) --- */}
       <div className="absolute inset-0 z-0">
        <video 
            src="/genesisgate.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover" 
        />
       </div>
      
      {/* --- 2. TARJETA DE ACCESO --- */}
      <div className="relative z-10 w-full max-w-md p-8 border border-white/10 bg-black/60 backdrop-blur-xl rounded-2xl shadow-[0_0_100px_rgba(34,211,238,0.2)] animate-zoomIn">
        
        <div className="text-center mb-8">
            <h1 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 animate-pulse drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                BRO7VISION
            </h1>
            <p className="text-[10px] text-gray-300 uppercase tracking-[0.5em] mt-2 font-bold">Genesis Access Point</p>
        </div>

        {message && (
            <div className={`mb-6 p-4 text-xs border rounded ${message.includes('Error') ? 'border-red-500 text-red-400 bg-red-900/40' : 'border-green-500 text-green-400 bg-green-900/40'}`}>
                {message}
            </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
            
            {mode === 'register' && (
                <div className="group">
                    <label className="text-[10px] text-cyan-400 uppercase tracking-widest mb-1 block font-bold">Alias (Nick)</label>
                    <input 
                        type="text" required placeholder="Cyber_User"
                        className="w-full bg-black/50 border border-white/30 text-white px-4 py-3 rounded focus:border-cyan-500 focus:outline-none transition-all placeholder-gray-600"
                        value={alias} onChange={(e) => setAlias(e.target.value)}
                    />
                </div>
            )}

            <div className="group">
                <label className="text-[10px] text-fuchsia-400 uppercase tracking-widest mb-1 block font-bold">Email</label>
                <input 
                    type="email" required placeholder="citizen@brovision.com"
                    className="w-full bg-black/50 border border-white/30 text-white px-4 py-3 rounded focus:border-fuchsia-500 focus:outline-none transition-all placeholder-gray-600"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="group">
                <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 block font-bold">Password</label>
                <input 
                    type="password" required placeholder="••••••••"
                    className="w-full bg-black/50 border border-white/30 text-white px-4 py-3 rounded focus:border-white focus:outline-none transition-all placeholder-gray-600"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            {/* CHECKBOX LEGAL (PROFESIONAL) */}
            <div className="flex items-start gap-3 mt-2 p-3 border border-white/10 rounded bg-white/5 hover:bg-white/10 transition-colors">
                <input 
                    type="checkbox" 
                    id="legalCheck"
                    checked={legalAccepted}
                    onChange={(e) => setLegalAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-fuchsia-500 cursor-pointer"
                />
                <label htmlFor="legalCheck" className="text-[9px] text-gray-300 leading-tight cursor-pointer select-none text-left">
                    Acepto el <span className="text-cyan-400 font-bold">Protocolo de Ciudadanía Económica</span> (+18) y los Términos de Servicio de la Fase 1.
                </label>
            </div>

            <button 
                disabled={loading || !legalAccepted} 
                type="submit"
                className="mt-2 w-full py-4 bg-white text-black font-black uppercase tracking-[0.2em] hover:bg-cyan-400 hover:scale-105 transition-all rounded shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-500 disabled:shadow-none"
            >
                {loading ? 'SINTONIZANDO...' : (mode === 'login' ? 'INICIAR SESIÓN' : 'REGISTRAR ID')}
            </button>

        </form>

        {/* --- 3. BOTÓN VISITANTE (GUEST MODE) --- */}
        <div className="mt-4 pt-4 border-t border-white/10">
            <button 
                onClick={onGuestAccess}
                className="w-full py-3 border border-white/20 text-gray-400 text-[10px] font-bold uppercase tracking-widest hover:text-white hover:border-white hover:bg-white/5 transition-all rounded"
            >
                👁️ Explorar como Visitante (Solo Lectura)
            </button>
        </div>

        <div className="mt-6 text-center">
            <button 
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage(null); }}
                className="text-xs text-gray-400 hover:text-cyan-400 underline decoration-dotted underline-offset-4 transition-colors"
            >
                {mode === 'login' ? "¿Nuevo en la Red? Crear ID" : "Ya tengo ID. Acceder"}
            </button>
        </div>

      </div>
    </div>
  );
};

export default GenesisGate;