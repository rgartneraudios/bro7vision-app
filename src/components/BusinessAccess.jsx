import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const BusinessAccess = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [sector, setSector] = useState('');
  const [message, setMessage] = useState(null);

  const handleBusinessRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // 1. Crear Usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role: 'advertiser' } },
      });
      if (authError) throw authError;

      // 2. Crear Perfil en b_advertiser_profiles
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('b_advertiser_profiles')
          .insert([{
            id:           authData.user.id,
            razon_social: razonSocial,
            sector:       sector,
            estado:       'EN_CASTING',
          }]);
        if (profileError) throw profileError;
      }

      setMessage("💼 Cuenta corporativa creada. Bienvenido al ecosistema.");
    } catch (error) {
      setMessage(`❌ Error de registro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-4 font-mono">
      {/* Fondo Elegante */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-black"></div>
      
      <div className="relative z-10 w-full max-w-lg border border-purple-500/40 bg-[#0a0510] p-8 rounded-none shadow-[0_0_60px_rgba(168,85,247,0.15)]">
        
        <button onClick={onBack} className="absolute top-4 right-4 text-purple-400 hover:text-white">✕ CERRAR</button>

        <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">💼</span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
             BROVISION <span className="text-purple-400">BUSINESS</span>
            </h2>
        </div>
        <p className="text-xs text-gray-400 mb-8 border-l-2 border-purple-500 pl-3">
          Gestión de campañas, métricas en tiempo real y activos exclusivos.
        </p>

        {message && <div className="p-3 mb-4 text-xs bg-purple-900/30 border border-purple-500 text-purple-200">{message}</div>}

        <form onSubmit={handleBusinessRegister} className="space-y-5">
          
          <div>
            <label className="block text-[10px] text-purple-400 uppercase font-bold mb-1">Razón Social / Nombre Empresa</label>
            <input type="text" required placeholder="Coca-Cola Inc." value={razonSocial} onChange={e=>setRazonSocial(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white p-3 focus:border-purple-500 outline-none transition-colors" />
          </div>

          <div>
            <label className="block text-[10px] text-purple-400 uppercase font-bold mb-1">Sector Comercial</label>
            <select value={sector} onChange={e=>setSector(e.target.value)} className="w-full bg-white/5 border border-white/10 text-white p-3 focus:border-purple-500 outline-none">
                <option value="">Selecciona Sector...</option>
                <option value="alimentacion">Alimentación & Bebidas</option>
                <option value="moda">Moda & Retail</option>
                <option value="tecnologia">Tecnología & Servicios</option>
                <option value="local">Comercio Local</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-purple-400 uppercase font-bold mb-1">Email Corporativo</label>
              <input type="email" required placeholder="marketing@empresa.com" value={email} onChange={e=>setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white p-3 focus:border-purple-500 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-purple-400 uppercase font-bold mb-1">Password</label>
              <input type="password" required placeholder="******" value={password} onChange={e=>setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white p-3 focus:border-purple-500 outline-none" />
            </div>
          </div>

          <button disabled={loading} className="w-full py-4 mt-6 bg-white text-black font-bold uppercase tracking-widest hover:bg-purple-400 transition-all disabled:opacity-50">
            {loading ? 'REGISTRANDO...' : 'CREAR CUENTA BUSINESS'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BusinessAccess;