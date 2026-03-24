import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Asegúrate que la ruta sea correcta
import { askGemini } from '../services/gemini'; 

const RacoonTerminal = ({ onClose, session, balances, setBalances, onNavigateToSantuario }) => {
  const [tab, setTab] = useState('avisos'); // Por defecto vamos al negocio
  const [avisos, setAvisos] = useState([]);
  const [newAviso, setNewAviso] = useState({ type: 'DEMANDA', title: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState(null); // Guardará el texto del Mapache
  const [isAiLoading, setIsAiLoading] = useState(false); // Para mostrar "Cargando..."
  const [mobileView, setMobileView] = useState('lista'); // 'lista' o 'publicar'
  const [postulacion, setPostulacion] = useState({ nombre: '', alias: '', edad: '', motivo: '' });
  const [postulacionEstado, setPostulacionEstado] = useState('idle'); // 'idle' | 'enviando' | 'ok' | 'error'
  const [beneficioAbierto, setBeneficioAbierto] = useState(null);

  
  // Estado para controlar qué avisos ha desbloqueado este usuario (para no cobrarle doble)
  const [unlockedAvisos, setUnlockedAvisos] = useState([]);

  // Cargar avisos al inicio
  useEffect(() => {
    fetchAvisos();
  }, []);

  // --- 1. REPARACIÓN DE FETCH AVISOS ---
  const fetchAvisos = async () => {
    const { data, error } = await supabase
      .from('avisos')
      .select('*')
      // .gt('expires_at', new Date().toISOString()) // <-- TE RECOMIENDO COMENTAR ESTO TEMPORALMENTE hasta estar seguro de que funciona
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error al descargar avisos:", error);
    } else if (data) {
      setAvisos(data); // ¡ESTA ES LA LÍNEA CLAVE QUE FALTABA!
    }
  };
  
  // --- LÓGICA DE PUBLICAR (COBRAR 200) ---
    const handlePublish = async () => {
    if (balances.genesis < 200) {
      alert("⚠️ SALDO INSUFICIENTE. Necesitas 200 Génesis.");
      return;
    }
    
    if (!newAviso.title || !newAviso.content) return;

    setLoading(true);

    // 1. Obtener alias del usuario
    const { data: profile } = await supabase.from('profiles').select('alias').eq('id', session.user.id).single();

    // CREAMOS UNA FECHA DE CADUCIDAD (Ej: 7 días a partir de hoy)
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 7);

    // 2. Insertar Aviso en Supabase
    const { error } = await supabase.from('avisos').insert([{
      user_id: session.user.id,
      author_alias: profile?.alias || 'Anon',
      type: newAviso.type,
      title: newAviso.title,
      content: newAviso.content,
      tags: [], 
      cost_to_reveal: 200,
      expires_at: expireDate.toISOString() // <-- AÑADIMOS LA FECHA AQUÍ
    }]);

    if (error) {
      console.error("Error al publicar en Supabase:", error);
      alert("Hubo un error al publicar el aviso.");
    } else {
      // 3. Cobrar solo si no hubo error
      const newBalance = balances.genesis - 200;
      setBalances({ ...balances, genesis: newBalance });
      await supabase.from('profiles').update({ genesis: newBalance }).eq('id', session.user.id);
      
      setNewAviso({ type: 'DEMANDA', title: '', content: '' });
      fetchAvisos(); // Volvemos a descargar la lista para que aparezca el nuevo
      alert("✅ AVISO PUBLICADO (-200 GEN)");
    }
    
    setLoading(false);
  };
  // --- LÓGICA DE DESBLOQUEAR CONTACTO (COBRAR 200) ---
  const handleUnlock = async (aviso) => {
    if (balances.genesis < 200) {
      alert("⚠️ NO TIENES SUFICIENTES GÉNESIS PARA CONTACTAR.");
      return;
    }

    if (window.confirm(`¿Gastar 200 GEN para conectar con ${aviso.author_alias}?`)) {
        // 1. Cobrar
        const newBalance = balances.genesis - 200;
        setBalances({ ...balances, genesis: newBalance });
        await supabase.from('profiles').update({ genesis: newBalance }).eq('id', session.user.id);

        // 2. Registrar desbloqueo visualmente (en DB real deberíamos guardar en 'aviso_unlocks')
        setUnlockedAvisos([...unlockedAvisos, aviso.id]);

        // 3. Acción de "Ir al Santuario"
        // Aquí deberíamos llamar a una función del padre para cambiar de vista
        alert(`🔓 CONEXIÓN ESTABLECIDA.\nUsuario: ${aviso.author_alias}\nID Real: ${aviso.user_id}\n\n(Redirigiendo a Teléfono Casa...)`);
        onNavigateToSantuario(aviso.user_id); // <--- Ejecuta el viaje
    }
  };

  // --- LÓGICA IA BROKER (Conectada a la UI) ---
  const handleAiBroker = async () => {
      if (!aiQuery.trim()) return;

      setIsAiLoading(true); // Encendemos el "Cargando"
      setAiResponse(null); // Limpiamos la respuesta anterior por si acaso

      try {
          const respuesta = await askGemini(aiQuery, 'broker', avisos);
          setAiResponse(respuesta); // Guardamos la respuesta de Gemini
      } catch (error) {
          console.error("Error en Broker:", error);
          setAiResponse("⚠️ ERROR: Conexión con el núcleo del Broker interrumpida.");
      } finally {
          setIsAiLoading(false); // Apagamos el "Cargando"
      }
  };
  
  const handlePostulacion = async () => {
         if (!postulacion.nombre || !postulacion.alias || !postulacion.edad || !postulacion.motivo) return;
         setPostulacionEstado('enviando');
         try {
           // Opción A: Guardar en Supabase (tabla 'postulaciones')
           const { error } = await supabase.from('postulaciones').insert([{
             nombre:   postulacion.nombre,
             alias:    postulacion.alias,
             edad:     parseInt(postulacion.edad),
             motivo:   postulacion.motivo,
             user_id:  session?.user?.id || null,
             created_at: new Date().toISOString(),
           }]);
           if (error) throw error;
           setPostulacionEstado('ok');
         } catch (e) {
           console.error(e);
           setPostulacionEstado('error');
         }
       };

    
  return (
   <div className="w-full h-full flex items-center justify-center relative">
        
        {/* BOTÓN CERRAR FLOTANTE (Para evitar Full Screen atrapado) */}
        <button onClick={onClose} className="absolute top-4 right-4 z-[60] bg-red-500 text-white w-8 h-8 rounded-full font-bold hover:scale-110 transition-transform">×</button>

        <div className="w-full max-w-5xl h-full bg-[#080808]/95 backdrop-blur-md border border-orange-500/30 rounded-3xl overflow-hidden flex flex-col font-mono shadow-[0_0_50px_rgba(249,115,22,0.2)] animate-zoomIn">
            
            {/* HEADER TABS */}
            <div className="flex flex-wrap border-b border-white/10 bg-black/80 shrink-0">
              <button onClick={() => setTab('avisos')} className={`flex-1 py-4 text-[10px] md:text-sm font-bold uppercase tracking-widest transition-all ${tab === 'avisos' ? 'text-orange-400 bg-orange-900/20 border-b-2 border-orange-500' : 'text-gray-500 hover:text-white'}`}>📢 TABLÓN AVISOS</button>
                <button onClick={() => setTab('drops')} className={`flex-1 py-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-all ${tab === 'drops' ? 'text-orange-400 bg-orange-900/20 border-b-2 border-orange-500' : 'text-gray-500 hover:text-white'}`}>📦 DROPS</button>
                <button onClick={() => setTab('faq')} className={`flex-1 py-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-all ${tab === 'faq' ? 'text-orange-400 bg-orange-900/20 border-b-2 border-orange-500' : 'text-gray-500 hover:text-white'}`}>👑 LISTADO DE HONOR</button>
            </div>

            {/* BODY */}
            <div className="flex-1 relative overflow-hidden bg-[url('/grid_bg.png')] bg-cover"> {/* Fondo sutil si quieres */}
                
                {/* --- TAB AVISOS --- */}
                {tab === 'avisos' && (
                    <div className="absolute inset-0 flex flex-col md:flex-row">
                    
                    {/* TOGGLE SOLO EN MÓVIL */}
    <div className="flex md:hidden border-b border-white/10 shrink-0">
        <button onClick={() => setMobileView('lista')} className={`flex-1 py-2 text-[10px] font-bold uppercase ${mobileView === 'lista' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-gray-500'}`}>📢 Ver Avisos</button>
        <button onClick={() => setMobileView('publicar')} className={`flex-1 py-2 text-[10px] font-bold uppercase ${mobileView === 'publicar' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-gray-500'}`}>✏️ Publicar</button>
    </div>
                        
                        {/* LEFT: LISTA DE AVISOS */}
                        <div className={`${mobileView === 'lista' ? 'flex' : 'hidden'} md:flex flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 flex-col`}>
                            
                            {/* BARRA BÚSQUEDA IA */}
                            <div className="flex gap-2 mb-6 sticky top-0 z-10">
                                <input 
                                    type="text" 
                                    value={aiQuery}
                                    onChange={(e) => setAiQuery(e.target.value)}
                                    // Añadimos el onKeyDown para poder buscar pulsando "Enter"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAiBroker()}
                                    placeholder="Pregunta al Broker Mapache (Ej: Busco Ingeniero...)" 
                                    className="flex-1 bg-black border border-orange-500/50 rounded-xl px-4 py-3 text-orange-200 placeholder-gray-600 focus:outline-none focus:shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                                />
                                <button 
                                    onClick={handleAiBroker} 
                                    disabled={isAiLoading}
                                    className="bg-orange-600 text-black font-black px-4 rounded-xl hover:bg-orange-500 transition-colors uppercase text-xs disabled:opacity-50"
                                >
                                    {isAiLoading ? '⏳' : '🤖 Buscar'}
                                </button>
                            </div>

                            {/* --- NUEVO: PANEL DE RESPUESTA DE LA IA --- */}
                            {(isAiLoading || aiResponse) && (
                                <div className="mb-6 p-4 rounded-xl border border-orange-500/50 bg-[#1a0b02] backdrop-blur-sm relative animate-fadeIn shadow-[0_0_15px_rgba(249,115,22,0.15)]">
                                    {/* Botón para cerrar la respuesta */}
                                    {!isAiLoading && (
                                        <button 
                                            onClick={() => setAiResponse(null)} 
                                            className="absolute top-2 right-3 text-gray-500 hover:text-orange-500 font-bold"
                                        >
                                            ✕
                                        </button>
                                    )}
                                    
                                    <div className="flex items-start gap-4">
                                        <div className="text-3xl mt-1">🦝</div>
                                        <div className="flex-1">
                                            <h4 className="text-orange-500 font-bold text-xs uppercase mb-1 tracking-wider">Broker Mapache</h4>
                                            {isAiLoading ? (
                                                <p className="text-gray-400 text-sm animate-pulse font-mono">
                                                    Analizando base de datos de avisos...
                                                </p>
                                            ) : (
                                                <p className="text-gray-200 text-sm font-mono whitespace-pre-line leading-relaxed">
                                                    {aiResponse}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* LISTADO */}
                            {avisos.length === 0 ? (
                                <div className="text-center text-gray-600 mt-20">No hay avisos aún. Sé el primero.</div>
                            ) : (
                                avisos.map(aviso => (
                                    <div key={aviso.id} className="bg-white/5 border border-white/10 p-4 rounded-xl hover:border-orange-500/50 transition-all group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${aviso.type === 'OFERTA' ? 'bg-green-900 text-green-400' : 'bg-blue-900 text-blue-400'}`}>
                                                {aviso.type}
                                            </span>
                                            <span className="text-[10px] text-gray-500">{new Date(aviso.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <h4 className="text-white font-bold text-lg leading-tight mb-2">{aviso.title}</h4>
                                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{aviso.content}</p>
                                        
                                        <div className="flex justify-between items-center border-t border-white/10 pt-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-500"></div>
                                                <span className="text-xs text-gray-300 font-bold">{aviso.author_alias}</span>
                                            </div>
                                            
                                            {/* BOTÓN DE ACCIÓN */}
                                            {aviso.user_id === session?.user?.id ? (
                                                <span className="text-xs text-orange-500 font-bold">[ ES TUYO ]</span>
                                            ) : unlockedAvisos.includes(aviso.id) ? (
                                                <button className="bg-green-500 text-black text-xs font-black px-4 py-2 rounded-lg hover:scale-105 transition-transform">
                                                    📩 IR A TELEFONO CASA
                                                </button>
                                            ) : (
                                                <button onClick={() => handleUnlock(aviso)} className="bg-white/10 text-orange-400 border border-orange-500/30 text-xs font-black px-4 py-2 rounded-lg hover:bg-orange-500 hover:text-black transition-all flex items-center gap-2">
                                                    🔒 CONECTAR <span className="text-[9px] opacity-70">(-200 GEN)</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* RIGHT: PANEL CREAR (Solo Desktop o Toggle en Mobile) */}
                        <div className={`${mobileView === 'publicar' ? 'flex' : 'hidden'} md:flex w-full md:w-1/3 bg-black/40 border-l border-white/10 p-6 flex-col`}>
                            <h3 className="text-orange-500 font-black text-xl mb-4 uppercase">Publicar Aviso</h3>
                            <div className="flex gap-2 mb-4">
                                <button onClick={() => setNewAviso({...newAviso, type: 'DEMANDA'})} className={`flex-1 py-2 text-xs font-bold rounded ${newAviso.type === 'DEMANDA' ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-500'}`}>BUSCO (Demanda)</button>
                                <button onClick={() => setNewAviso({...newAviso, type: 'OFERTA'})} className={`flex-1 py-2 text-xs font-bold rounded ${newAviso.type === 'OFERTA' ? 'bg-green-600 text-white' : 'bg-white/10 text-gray-500'}`}>OFREZCO (Oferta)</button>
                            </div>
                            
                            <input 
                                type="text" 
                                placeholder="Título corto y pegadizo..." 
                                value={newAviso.title}
                                onChange={(e) => setNewAviso({...newAviso, title: e.target.value})}
                                className="bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm mb-3 focus:border-orange-500 outline-none"
                            />
                            
                            <textarea 
                                rows="6"
                                placeholder="Describe lo que necesitas o lo que ofreces con detalle..."
                                value={newAviso.content}
                                onChange={(e) => setNewAviso({...newAviso, content: e.target.value})}
                                className="bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm mb-4 focus:border-orange-500 outline-none custom-scrollbar resize-none"
                            ></textarea>

                            <div className="mt-auto">
                                <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                                    <span>Coste publicación:</span>
                                    <span className="text-orange-400 font-bold">200 GÉNESIS</span>
                                </div>
                                <button 
                                    onClick={handlePublish}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white font-black py-4 rounded-xl text-sm uppercase tracking-widest hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-900/20"
                                >
                                    {loading ? 'PROCESANDO...' : '📢 PUBLICAR AHORA'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

    {/* --- BOTÓN TAB --- */}
<button
  onClick={() => setTab('faq')}
  className={`flex-1 py-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-all ${
    tab === 'faq'
      ? 'text-orange-400 bg-orange-900/20 border-b-2 border-orange-500'
      : 'text-gray-500 hover:text-white'
  }`}
>
  👑 LISTADO DE HONOR
</button>

{/* --- TAB REINADOS v4 --- */}
{tab === 'faq' && (
  <div className="absolute inset-0 overflow-y-auto custom-scrollbar bg-black/20">
    <div className="w-full px-6 pb-20 pt-6">

      {/* ── CABECERA ── */}
      <div className="text-center mb-10 animate-fadeIn">
        <p className="text-[10px] text-gray-500 uppercase tracking-[0.35em] mb-3">
          Crónicas del Reino Interior
        </p>
        <h2
          className="text-5xl md:text-6xl font-black uppercase tracking-wide"
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            background: 'linear-gradient(135deg, #f97316, #fbbf24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Reinados
        </h2>
        <p className="text-gray-500 text-sm uppercase tracking-[0.25em] mt-2">
          Listado de Honor · Bro7vision
        </p>
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-orange-500/70 to-transparent mx-auto mt-5" />
      </div>

      {/* ── REYES & REINAS — DOS COLUMNAS ── */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">👑</span>
          <p className="text-orange-400 text-sm font-bold uppercase tracking-[0.25em]"
            style={{ fontFamily: "'Georgia', serif" }}>
            Alta Corte · Reyes &amp; Reinas
          </p>
          <div className="flex-1 h-px bg-gradient-to-r from-orange-600/50 to-transparent" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mapear desde Supabase filtrando rank = 'rey' */}
          {[
            { num: '01', titulo: 'Rey de Solaris',         tratamiento: 'Don',  alias: 'Marcos7520' },
            { num: '02', titulo: 'Reina del Alba Carmesí', tratamiento: 'Doña', alias: 'LunaEterna' },
          ].map((item) => (
            <div key={item.num} className="flex items-center gap-4 bg-orange-950/20 border border-orange-800/30 rounded-xl px-5 py-4 hover:border-orange-600/50 transition-all">
              <span className="text-orange-600 text-xl font-black w-10 shrink-0 text-center"
                style={{ fontFamily: "'Georgia', serif" }}>{item.num}</span>
              <div>
                <p className="text-orange-500/70 text-[10px] uppercase tracking-[0.3em] leading-none mb-1">{item.titulo}</p>
                <p className="text-white text-xl font-bold" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                  {item.tratamiento} <span className="text-orange-300">{item.alias}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRÍNCIPES & PRINCESAS — DOS COLUMNAS ── */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">⚔️</span>
          <p className="text-blue-400 text-sm font-bold uppercase tracking-[0.25em]"
            style={{ fontFamily: "'Georgia', serif" }}>
            Guardia Real · Príncipes &amp; Princesas
          </p>
          <div className="flex-1 h-px bg-gradient-to-r from-blue-600/50 to-transparent" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mapear desde Supabase filtrando rank = 'principe' */}
          {[
            { num: '101', titulo: 'Príncipe de Luminaria',  tratamiento: 'Excelentísimo', alias: 'JavierBlue' },
            { num: '102', titulo: 'Princesa de Luminaria',  tratamiento: 'Excelentísima', alias: 'SilviaRed'  },
          ].map((item) => (
            <div key={item.num} className="flex items-center gap-4 bg-blue-950/20 border border-blue-800/30 rounded-xl px-5 py-4 hover:border-blue-600/50 transition-all">
              <span className="text-blue-500 text-xl font-black w-10 shrink-0 text-center"
                style={{ fontFamily: "'Georgia', serif" }}>{item.num}</span>
              <div>
                <p className="text-blue-400/60 text-[10px] uppercase tracking-[0.3em] leading-none mb-1">{item.titulo}</p>
                <p className="text-white text-xl font-bold" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                  {item.tratamiento} <span className="text-blue-300">{item.alias}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DUQUES ── */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🏰</span>
          <p className="text-purple-400 text-sm font-bold uppercase tracking-[0.25em]"
            style={{ fontFamily: "'Georgia', serif" }}>
            Nobleza Mayor · Duques &amp; Duquesas
          </p>
          <div className="flex-1 h-px bg-gradient-to-r from-purple-600/50 to-transparent" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mapear desde Supabase filtrando rank = 'duque' */}
          {[].length === 0 && (
            <p className="text-gray-700 text-xs uppercase tracking-widest col-span-2 py-4 text-center">
              Cupo disponible — abre tras completar la Guardia Real
            </p>
          )}
        </div>
      </section>

      {/* ── MARQUESES ── */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📜</span>
          <p className="text-cyan-400 text-sm font-bold uppercase tracking-[0.25em]"
            style={{ fontFamily: "'Georgia', serif" }}>
            Nobleza · Marqueses &amp; Marquesas
          </p>
          <div className="flex-1 h-px bg-gradient-to-r from-cyan-600/50 to-transparent" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mapear desde Supabase filtrando rank = 'marques' */}
          {[].length === 0 && (
            <p className="text-gray-700 text-xs uppercase tracking-widest col-span-2 py-4 text-center">
              Cupo disponible — abre tras completar los Ducados
            </p>
          )}
        </div>
      </section>

      {/* ── CONDES ── */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🌿</span>
          <p className="text-green-400 text-sm font-bold uppercase tracking-[0.25em]"
            style={{ fontFamily: "'Georgia', serif" }}>
            Nobleza · Condes &amp; Condesas
          </p>
          <div className="flex-1 h-px bg-gradient-to-r from-green-600/50 to-transparent" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mapear desde Supabase filtrando rank = 'conde' */}
          {[].length === 0 && (
            <p className="text-gray-700 text-xs uppercase tracking-widest col-span-2 py-4 text-center">
              Cupo disponible — abre tras completar los Marquesados
            </p>
          )}
        </div>
      </section>

      {/* ── LORDS & LADIES ── */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">✦</span>
          <p className="text-yellow-400 text-sm font-bold uppercase tracking-[0.25em]"
            style={{ fontFamily: "'Georgia', serif" }}>
            Honor del Reino · Lord &amp; Lady
          </p>
          <div className="flex-1 h-px bg-gradient-to-r from-yellow-600/50 to-transparent" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mapear desde Supabase filtrando rank = 'lord' */}
          {[
            { tratamiento: 'Ilustrísimo', rango: 'Duque del Eco Perdido',      prefijo: 'Lord', alias: 'ShadowWave' },
            { tratamiento: 'Honorable',   rango: 'Marqués del Horizonte Azul', prefijo: 'Lady', alias: 'NeoSky'     },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 bg-yellow-950/10 border border-yellow-800/20 rounded-xl px-5 py-4 hover:border-yellow-600/40 transition-all">
              <span className="text-yellow-600 text-xl w-10 shrink-0 text-center">✦</span>
              <div>
                <p className="text-yellow-700/70 text-[10px] uppercase tracking-[0.3em] leading-none mb-1">
                  {item.tratamiento} · {item.rango}
                </p>
                <p className="text-white/80 text-xl font-bold" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                  {item.prefijo} <span className="text-yellow-300">{item.alias}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SEPARADOR ── */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10" />

      {/* ── BLOQUE INFERIOR ── */}
      <div className="w-full space-y-8">

        {/* ACORDEÓN PRIVILEGIOS */}
        <div className="w-full space-y-3">
          <p className="text-center text-gray-500 text-xs uppercase tracking-[0.3em] mb-5"
            style={{ fontFamily: "'Georgia', serif" }}>
            — Privilegios del Linaje —
          </p>

          {[
            {
              key: 'reyes',
              emoji: '👑', titulo: 'Reyes & Reinas', subtitulo: 'Alta Corte · 100 cupos · Postulación',
              border: 'border-orange-800/40', bg: 'bg-orange-950/30', hover: 'hover:bg-orange-950/50',
              borderInner: 'border-orange-900/30', tc: 'text-orange-400', ts: 'text-orange-700',
              ta: 'text-orange-500', td: 'text-orange-800',
              descripcion: <>Los <span className="text-orange-400 font-bold">100 primeros pilares del Reino</span>. El rango más alto al que un ciudadano puede aspirar en Bro7vision.</>,
              beneficios: [
                <><span className="text-white font-bold">2.000 Puntos Génesis cada mes</span> mientras mantengas actividad: sube contenido, lanza <span className="text-orange-300">Halos</span>, <span className="text-orange-300">Ecos</span> o <span className="text-orange-300">Zaps</span>, juega en Games o disfruta de BroStories.</>,
                <><span className="text-white font-bold">Círculo interno exclusivo</span> — serás el primero en conocer las novedades que se están gestando.</>,
                <><span className="text-white font-bold">Encuestas colaborativas</span> — tu voz da forma al futuro de Bro7vision antes que nadie.</>,
              ],
              aviso: '⚠️ La inactividad sin justificación cede el trono al siguiente aspirante',
            },
            {
              key: 'principes',
              emoji: '⚔️', titulo: 'Príncipes & Princesas', subtitulo: 'Guardia Real · 100 cupos · Abre tras llenar Reyes',
              border: 'border-blue-800/40', bg: 'bg-blue-950/30', hover: 'hover:bg-blue-950/50',
              borderInner: 'border-blue-900/30', tc: 'text-blue-400', ts: 'text-blue-800',
              ta: 'text-blue-500', td: 'text-blue-900',
              descripcion: <>Los <span className="text-blue-400 font-bold">custodios del linaje</span>. Mismo acceso privilegiado que la Alta Corte. La diferencia está en el rango, no en el compromiso.</>,
              beneficios: [
                <><span className="text-white font-bold">1.000 Puntos Génesis cada mes</span> mientras mantengas actividad: sube contenido, lanza <span className="text-blue-300">Halos</span>, <span className="text-blue-300">Ecos</span> o <span className="text-blue-300">Zaps</span>, juega en Games o disfruta de BroStories.</>,
                <><span className="text-white font-bold">Círculo interno exclusivo</span> — mismo acceso que la Alta Corte a novedades y decisiones en curso.</>,
                <><span className="text-white font-bold">Encuestas colaborativas</span> — tu opinión cuenta en la construcción del Reino.</>,
              ],
              aviso: '⚠️ La inactividad sin justificación cede el título al siguiente aspirante',
            },
            {
              key: 'duques',
              emoji: '🏰', titulo: 'Duques & Duquesas', subtitulo: 'Nobleza Mayor · 100 cupos · Abre tras llenar Príncipes',
              border: 'border-purple-800/40', bg: 'bg-purple-950/20', hover: 'hover:bg-purple-950/40',
              borderInner: 'border-purple-900/30', tc: 'text-purple-400', ts: 'text-purple-800',
              ta: 'text-purple-500', td: 'text-purple-900',
              descripcion: <>El primer escalón de la nobleza digital. <span className="text-purple-400 font-bold">100 cupos</span> que se abren cuando la Guardia Real esté completa.</>,
              beneficios: [
                <><span className="text-white font-bold">500 Puntos Génesis cada mes</span> manteniendo actividad en la red.</>,
                <><span className="text-white font-bold">Reconocimiento público</span> en el Listado de Honor con título grabado en las Crónicas.</>,
                <><span className="text-white font-bold">Acceso a encuestas</span> colaborativas del Reino.</>,
              ],
              aviso: '⚠️ La inactividad sin justificación cede el ducado al siguiente aspirante',
            },
            {
              key: 'marqueses',
              emoji: '📜', titulo: 'Marqueses & Marquesas', subtitulo: 'Nobleza · 100 cupos · Abre tras llenar Duques',
              border: 'border-cyan-800/40', bg: 'bg-cyan-950/20', hover: 'hover:bg-cyan-950/40',
              borderInner: 'border-cyan-900/30', tc: 'text-cyan-400', ts: 'text-cyan-900',
              ta: 'text-cyan-600', td: 'text-cyan-900',
              descripcion: <>Custodios de las fronteras del Reino. <span className="text-cyan-400 font-bold">100 cupos</span> para quienes demuestran dedicación constante.</>,
              beneficios: [
                <><span className="text-white font-bold">300 Puntos Génesis cada mes</span> manteniendo actividad en la red.</>,
                <><span className="text-white font-bold">Título y nombre</span> en el Listado de Honor de las Crónicas.</>,
              ],
              aviso: '⚠️ La inactividad sin justificación cede el marquesado al siguiente aspirante',
            },
            {
              key: 'condes',
              emoji: '🌿', titulo: 'Condes & Condesas', subtitulo: 'Nobleza · 100 cupos · Abre tras llenar Marqueses',
              border: 'border-green-800/40', bg: 'bg-green-950/20', hover: 'hover:bg-green-950/40',
              borderInner: 'border-green-900/30', tc: 'text-green-400', ts: 'text-green-900',
              ta: 'text-green-600', td: 'text-green-900',
              descripcion: <>La puerta de entrada a la nobleza digital. <span className="text-green-400 font-bold">100 cupos</span> para ciudadanos comprometidos con la red.</>,
              beneficios: [
                <><span className="text-white font-bold">200 Puntos Génesis cada mes</span> manteniendo actividad en la red.</>,
                <><span className="text-white font-bold">Título y nombre</span> en el Listado de Honor de las Crónicas.</>,
              ],
              aviso: '⚠️ La inactividad sin justificación cede el condado al siguiente aspirante',
            },
            {
              key: 'lords',
              emoji: '✦', titulo: 'Lord & Lady', subtitulo: 'Honor del Reino · Sin límite de cupos · Premio al mérito',
              border: 'border-yellow-800/30', bg: 'bg-yellow-950/10', hover: 'hover:bg-yellow-950/20',
              borderInner: 'border-yellow-900/20', tc: 'text-yellow-400', ts: 'text-yellow-800',
              ta: 'text-yellow-600', td: 'text-yellow-900',
              descripcion: <>El título de Lord o Lady <span className="text-yellow-400 font-bold">no se solicita, se otorga</span>. Es el reconocimiento más personal del Reino — concedido directamente a quienes demuestran buen comportamiento, apoyo a la comunidad y dedicación genuina.</>,
              beneficios: [
                <><span className="text-white font-bold">100 Puntos Génesis cada mes</span> como reconocimiento a su dedicación continua.</>,
                <><span className="text-white font-bold">Nombre grabado en las Crónicas</span> del Reino Interior con tratamiento honorífico.</>,
                <><span className="text-white font-bold">Beneficios evolutivos</span> — sus privilegios crecerán con la plataforma.</>,
              ],
              aviso: '✦ La nobleza no se hereda — se gana con presencia y dedicación',
            },
          ].map((rango) => (
            <div key={rango.key} className={`rounded-2xl border ${rango.border} overflow-hidden`}>
              <button
                onClick={() => setBeneficioAbierto(beneficioAbierto === rango.key ? null : rango.key)}
                className={`w-full flex items-center justify-between px-6 py-5 ${rango.bg} ${rango.hover} transition-all text-left`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{rango.emoji}</span>
                  <div>
                    <p className={`${rango.tc} font-black text-base uppercase tracking-widest`}
                      style={{ fontFamily: "'Georgia', serif" }}>
                      {rango.titulo}
                    </p>
                    <p className={`${rango.ts} text-xs uppercase tracking-widest`}>{rango.subtitulo}</p>
                  </div>
                </div>
                <span className={`${rango.ta} text-xl transition-transform duration-300`}
                  style={{ transform: beneficioAbierto === rango.key ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  ▾
                </span>
              </button>
              {beneficioAbierto === rango.key && (
                <div className={`px-6 py-6 bg-black/40 border-t ${rango.borderInner} animate-fadeIn space-y-4`}>
                  <p className="text-gray-300 text-sm leading-relaxed">{rango.descripcion}</p>
                  <ul className="space-y-3">
                    {rango.beneficios.map((b, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className={`${rango.ta} mt-0.5`}>✦</span>
                        <p className="text-gray-300 text-sm leading-relaxed">{b}</p>
                      </li>
                    ))}
                  </ul>
                  <p className={`${rango.td} text-xs uppercase tracking-widest pt-2 border-t ${rango.borderInner}`}>
                    {rango.aviso}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
        {/* FIN ACORDEÓN */}

        {/* MENSAJE ¿TU NOMBRE AÚN NO FIGURA? */}
        <div className="w-full p-8 rounded-2xl border border-white/10 bg-white/3 text-center">
          <span className="text-4xl mb-4 block">🌙</span>
          <p className="text-white text-2xl font-bold mb-3" style={{ fontFamily: "'Georgia', serif" }}>
            ¿Tu nombre aún no figura en el Listado?
          </p>
          <p className="text-gray-300 text-base leading-relaxed max-w-2xl mx-auto">
            Primero se completan los <span className="text-orange-400 font-bold">100 Reyes y Reinas</span>,
            después los <span className="text-blue-400 font-bold">100 Príncipes y Princesas</span>,
            los <span className="text-purple-400 font-bold">100 Duques</span>,
            los <span className="text-cyan-400 font-bold">100 Marqueses</span>
            y los <span className="text-green-400 font-bold">100 Condes</span> —
            <strong> 500 cupos en total</strong>.
            Si el cupo ya está cubierto, mantente activo — los ciudadanos más destacados
            reciben un <span className="text-yellow-400 font-bold">título de Lord o Lady</span>{' '}
            como reconocimiento a su dedicación. La nobleza no se hereda, se gana.
          </p>
        </div>

        {/* FORMULARIO DE POSTULACIÓN */}
        <div className="w-full p-8 border border-dashed border-orange-800/40 rounded-2xl bg-black/50">
          {postulacionEstado === 'ok' ? (
            <div className="text-center py-8 animate-fadeIn">
              <span className="text-5xl mb-5 block">📜</span>
              <p className="text-orange-400 text-2xl font-black uppercase mb-3"
                style={{ fontFamily: "'Georgia', serif" }}>
                Tu postulación ha sido recibida
              </p>
              <p className="text-gray-300 text-base leading-relaxed max-w-lg mx-auto mb-6">
                Los Guardianes del Reino estudiarán tu candidatura. Si eres digno,
                tu nombre será grabado en las Crónicas del Reino Interior.
                Recibirás respuesta por los canales oficiales.
              </p>
              <p className="text-gray-600 text-xs uppercase tracking-widest">
                — La Orden Real de Bro7vision —
              </p>
            </div>
          ) : (
            <>
              <p className="text-orange-400 text-xl font-black uppercase tracking-widest mb-2 text-center"
                style={{ fontFamily: "'Georgia', serif" }}>
                Aspirar al Título
              </p>
              <p className="text-gray-400 text-sm text-center mb-8 leading-relaxed">
                Los cupos se cubren en cascada. Tu candidatura se asignará al rango disponible en el momento de ser aceptada.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="text-gray-500 text-xs uppercase tracking-widest block mb-2">Nombre completo</label>
                  <input type="text" placeholder="Tu nombre real..."
                    value={postulacion.nombre}
                    onChange={(e) => setPostulacion({ ...postulacion, nombre: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-base focus:border-orange-500 focus:outline-none placeholder-gray-700 transition-colors" />
                </div>
                <div>
                  <label className="text-gray-500 text-xs uppercase tracking-widest block mb-2">Alias en Bro7vision</label>
                  <input type="text" placeholder="Tu alias..."
                    value={postulacion.alias}
                    onChange={(e) => setPostulacion({ ...postulacion, alias: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-base focus:border-orange-500 focus:outline-none placeholder-gray-700 transition-colors" />
                </div>
              </div>
              <div className="mb-5">
                <label className="text-gray-500 text-xs uppercase tracking-widest block mb-2">Edad</label>
                <input type="number" placeholder="Tu edad..." min="1" max="120"
                  value={postulacion.edad}
                  onChange={(e) => setPostulacion({ ...postulacion, edad: e.target.value })}
                  className="w-full md:w-1/3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-base focus:border-orange-500 focus:outline-none placeholder-gray-700 transition-colors" />
              </div>
              <div className="mb-6">
                <label className="text-gray-500 text-xs uppercase tracking-widest block mb-2">
                  ¿Por qué mereces un lugar en el Listado?
                </label>
                <textarea rows="4" placeholder="Cuéntanos qué aportarás al Reino..."
                  value={postulacion.motivo}
                  onChange={(e) => setPostulacion({ ...postulacion, motivo: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-base focus:border-orange-500 focus:outline-none placeholder-gray-700 transition-colors resize-none custom-scrollbar" />
              </div>
              <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-gray-400 leading-relaxed">
                  <span className="text-orange-400 font-bold uppercase">Si eres menor de 16 años —</span>{' '}
                  una persona adulta debe realizar esta candidatura en tu nombre y ser responsable
                  de tu actividad. Ese adulto ocupa el puesto formalmente hasta que alcances la mayoría de edad.
                </p>
              </div>
              {postulacionEstado === 'error' && (
                <p className="text-red-400 text-sm text-center mb-4">
                  ⚠️ Hubo un error al enviar tu candidatura. Inténtalo de nuevo.
                </p>
              )}
              <button
                onClick={handlePostulacion}
                disabled={postulacionEstado === 'enviando' || !postulacion.nombre || !postulacion.alias || !postulacion.edad || !postulacion.motivo}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-black font-black py-4 rounded-xl text-base uppercase tracking-widest hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-900/30"
              >
                {postulacionEstado === 'enviando' ? '⏳ Enviando candidatura...' : '📜 Presentar Candidatura al Reino'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── PIE ── */}
      <p className="text-center text-xs text-gray-600 uppercase tracking-[0.3em] mt-12"
        style={{ fontFamily: "'Georgia', serif" }}>
        La grandeza se sostiene con presencia y dedicación.
      </p>

    </div>
  </div>
)}


            </div>
        </div>
    </div>
  );
};

export default RacoonTerminal;