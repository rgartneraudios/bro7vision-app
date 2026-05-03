import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const DirectorAccess = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alias, setAlias] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [message, setMessage] = useState(null);

  const handleDirectorRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role:          'director',
            alias:         alias,
            portfolio_url: portfolio,
          },
        },
      });
      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('b_creator_profiles')
          .insert([{
            id:            authData.user.id,
            alias:         alias,
            portfolio_url: portfolio,
            nivel:         'estandar',
          }]);
        if (profileError) throw profileError;
      }

      setMessage(
        authData.session
          ? '🎬 ¡Corte! Estás dentro.'
          : '📧 Revisa tu email y confirma la cuenta para activar tu perfil de Director.'
      );
    } catch (error) {
      setMessage(`❌ Error de casting: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center p-4 font-mono">
      {/* Fondo Matrix Sutil */}
      <div className="absolute inset-0 bg-[url('/assets/noise.svg')] opacity-20"></div>
      
      <div className="relative z-10 w-full max-w-lg border border-emerald-500/30 bg-black/80 backdrop-blur-md p-8 rounded-xl shadow-[0_0_50px_rgba(16,185,129,0.2)]">
        
        <button onClick={onBack} className="absolute top-4 right-4 text-emerald-500 hover:text-white">✕ CERRAR</button>

        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
          DIRECTOR STUDIO
        </h2>
        <p className="text-xs text-emerald-600 uppercase tracking-widest mb-6">Sube tus atmósferas. Monetiza tu arte.</p>

        {message && <div className="p-3 mb-4 text-xs bg-emerald-900/30 border border-emerald-500 text-emerald-200 rounded">{message}</div>}

        <form onSubmit={handleDirectorRegister} className="space-y-4">
          <div>
            <label className="block text-[10px] text-emerald-500 uppercase font-bold mb-1">Nombre Artístico (Alias)</label>
            <input type="text" required placeholder="Neon_Rider" value={alias} onChange={e=>setAlias(e.target.value)}
              className="w-full bg-black border border-emerald-500/30 text-emerald-100 p-3 rounded focus:border-emerald-400 outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-emerald-500 uppercase font-bold mb-1">Email Profesional</label>
              <input type="email" required placeholder="arte@studio.com" value={email} onChange={e=>setEmail(e.target.value)}
                className="w-full bg-black border border-emerald-500/30 text-emerald-100 p-3 rounded focus:border-emerald-400 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-emerald-500 uppercase font-bold mb-1">Password</label>
              <input type="password" required placeholder="******" value={password} onChange={e=>setPassword(e.target.value)}
                className="w-full bg-black border border-emerald-500/30 text-emerald-100 p-3 rounded focus:border-emerald-400 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-emerald-500 uppercase font-bold mb-1">
              Muestra tu Visión (Link a Drive, Discord, Instagram, Behance...)
            </label>
            <input 
              type="url" 
              required 
              placeholder="https://..." 
              value={portfolio} 
              onChange={e=>setPortfolio(e.target.value)}
              className="w-full bg-black border border-emerald-500/30 text-emerald-100 p-3 rounded focus:border-emerald-400 outline-none placeholder-emerald-900/50" 
            />
            {/* NUEVO MENSAJE DE AYUDA INCLUSIVO */}
            <p className="mt-2 text-[9px] text-gray-400 flex items-center gap-2">
              <span>🦝</span> 
              <span>
                ¿No tienes web? No pasa nada. Si usas AI, sube tus muestras a una carpeta de Drive o pásanos tu usuario de Discord. 
                <span className="text-emerald-400 cursor-pointer hover:underline ml-1">Pregúntale a Mapache en GUIA si tienes dudas.</span>
              </span>
            </p>
          </div>
          <button disabled={loading} className="w-full py-4 mt-4 bg-emerald-600 hover:bg-emerald-500 text-black font-black uppercase tracking-widest transition-all rounded shadow-lg shadow-emerald-500/20 disabled:opacity-50">
            {loading ? 'PROCESANDO...' : 'SOLICITAR CLAQUETA'}
          </button>
        </form>

        <p className="mt-4 text-[9px] text-gray-500 text-center">
          Al registrarte aceptas ceder derechos de emisión no exclusivos a BRO7VISION.
          <br/>Split de beneficios: 70% (Ads) / 40% (Backgrounds).
        </p>
      </div>
    </div>
  );
};

export default DirectorAccess;