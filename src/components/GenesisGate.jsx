import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const GenesisGate = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alias, setAlias] = useState('');
  const [mode, setMode] = useState('login'); 
  const [message, setMessage] = useState(null);
  const [isAdult, setIsAdult] = useState(false); // <--- NUEVO: CONTROL DE EDAD

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!isAdult) return; // Doble seguridad

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
    <div className="fixed inset-0 z-[999] bg-black flex items-center justify-center overflow-hidden font-mono">
      
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050510] to-black"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 border border-white/10 bg-black/80 backdrop-blur-xl rounded-2xl shadow-[0_0_100px_rgba(34,211,238,0.1)] animate-zoomIn">
        
        <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 animate-pulse">
                BRO7VISION
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.5em] mt-2">Genesis Access Point</p>
        </div>

        {message && (
            <div className={`mb-6 p-4 text-xs border rounded ${message.includes('Error') ? 'border-red-500 text-red-400 bg-red-900/10' : 'border-green-500 text-green-400 bg-green-900/10'}`}>
                {message}
            </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
            
            {mode === 'register' && (
                <div className="group">
                    <label className="text-[10px] text-cyan-500 uppercase tracking-widest mb-1 block">Alias (Nick)</label>
                    <input 
                        type="text" required placeholder="Cyber_User"
                        className="w-full bg-black border border-white/20 text-white px-4 py-3 rounded focus:border-cyan-500 focus:outline-none transition-all"
                        value={alias} onChange={(e) => setAlias(e.target.value)}
                    />
                </div>
            )}

            <div className="group">
                <label className="text-[10px] text-fuchsia-500 uppercase tracking-widest mb-1 block">Email</label>
                <input 
                    type="email" required placeholder="citizen@brovision.com"
                    className="w-full bg-black border border-white/20 text-white px-4 py-3 rounded focus:border-fuchsia-500 focus:outline-none transition-all"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="group">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">Password</label>
                <input 
                    type="password" required placeholder="••••••••"
                    className="w-full bg-black border border-white/20 text-white px-4 py-3 rounded focus:border-white focus:outline-none transition-all"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            {/* CHECKBOX LEGAL (NUEVO) */}
            <div className="flex items-start gap-3 mt-2 p-3 border border-white/5 rounded bg-white/5">
                <input 
                    type="checkbox" 
                    id="adultCheck"
                    checked={isAdult}
                    onChange={(e) => setIsAdult(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-fuchsia-500 cursor-pointer"
                />
                <label htmlFor="adultCheck" className="text-[10px] text-gray-400 leading-tight cursor-pointer select-none">
                    Certifico que soy <span className="text-white font-bold">mayor de 18 años</span> y acepto los <span className="underline decoration-dotted hover:text-cyan-400">Términos de Servicio</span> y la Política de Economía Gamificada de Bro7Vision.
                </label>
            </div>

            <button 
                disabled={loading || !isAdult} // BLOQUEADO SI NO ES ADULTO
                type="submit"
                className="mt-2 w-full py-4 bg-white text-black font-black uppercase tracking-[0.2em] hover:bg-cyan-400 hover:scale-105 transition-all rounded shadow-lg disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-gray-500"
            >
                {loading ? 'PROCESSING...' : (mode === 'login' ? 'INITIALIZE SYSTEM' : 'MINT IDENTITY')}
            </button>

        </form>

        <div className="mt-8 text-center">
            <button 
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage(null); }}
                className="text-xs text-gray-500 hover:text-white underline decoration-dashed underline-offset-4"
            >
                {mode === 'login' ? "¿Nuevo Ciudadano? Crear ID" : "Ya tengo ID. Acceder"}
            </button>
        </div>

      </div>
    </div>
  );
};

export default GenesisGate;