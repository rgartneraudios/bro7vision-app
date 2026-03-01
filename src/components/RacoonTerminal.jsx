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
        alert(`🔓 CONEXIÓN ESTABLECIDA.\nUsuario: ${aviso.author_alias}\nID Real: ${aviso.user_id}\n\n(Redirigiendo a Santuario...)`);
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
    
  return (
    <div className="w-full h-full flex items-center justify-center p-4 md:p-10 relative z-50">
        
        {/* BOTÓN CERRAR FLOTANTE (Para evitar Full Screen atrapado) */}
        <button onClick={onClose} className="absolute top-4 right-4 z-[60] bg-red-500 text-white w-8 h-8 rounded-full font-bold hover:scale-110 transition-transform">×</button>

        <div className="w-full max-w-5xl h-[85vh] bg-[#080808]/95 backdrop-blur-md border border-orange-500/30 rounded-3xl overflow-hidden flex flex-col font-mono shadow-[0_0_50px_rgba(249,115,22,0.2)] animate-zoomIn">
            
            {/* HEADER TABS */}
            <div className="flex border-b border-white/10 bg-black/80 shrink-0">
                <button onClick={() => setTab('avisos')} className={`flex-1 py-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-all ${tab === 'avisos' ? 'text-orange-400 bg-orange-900/20 border-b-2 border-orange-500' : 'text-gray-500 hover:text-white'}`}>📢 TABLÓN AVISOS</button>
                <button onClick={() => setTab('drops')} className={`flex-1 py-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-all ${tab === 'drops' ? 'text-orange-400 bg-orange-900/20 border-b-2 border-orange-500' : 'text-gray-500 hover:text-white'}`}>📦 DROPS</button>
                <button onClick={() => setTab('faq')} className={`flex-1 py-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-all ${tab === 'faq' ? 'text-orange-400 bg-orange-900/20 border-b-2 border-orange-500' : 'text-gray-500 hover:text-white'}`}>❓ FAQ / AYUDA</button>
            </div>

            {/* BODY */}
            <div className="flex-1 relative overflow-hidden bg-[url('/grid_bg.png')] bg-cover"> {/* Fondo sutil si quieres */}
                
                {/* --- TAB AVISOS --- */}
                {tab === 'avisos' && (
                    <div className="absolute inset-0 flex flex-col md:flex-row">
                        
                        {/* LEFT: LISTA DE AVISOS */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                            
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
                                                    📩 IR A SANTUARIO
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
                        <div className="w-full md:w-1/3 bg-black/40 border-l border-white/10 p-6 flex flex-col">
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

                {/* --- TAB FAQ (TU CÓDIGO ANTERIOR REUTILIZADO) --- */}
                {tab === 'faq' && (
                    <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-8">
                        {/* ... Aquí iría el contenido de las FAQ que me pasaste ... */}
                        {/* He simplificado esto para no ocupar todo el bloque, pero aquí pegas tu código de los <details> */}
                        <div className="max-w-3xl mx-auto space-y-6 pb-20">
                            <h3 className="text-3xl text-orange-500 font-black mb-8 border-b border-orange-500/30 pb-4">CENTRO DE AYUDA</h3>
                            {/* PEGAR CONTENIDO DE FAQ AQUÍ */}
                            <p className="text-gray-400">Consulta las preguntas frecuentes sobre Moon Coins, Halos y Normas...</p>
                        </div>
                    </div>
                )}

                {/* --- TAB DROPS/CLUSTERS (Placeholder) --- */}
                {(tab === 'drops' || tab === 'clusters') && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center animate-fadeIn p-8 border border-dashed border-white/20 rounded-xl">
                            <div className="text-5xl mb-4 grayscale opacity-50">🚧</div>
                            <p className="text-orange-400 font-bold uppercase tracking-widest text-lg mb-2">SECTOR CERRADO (FASE 0)</p>
                            <p className="text-gray-500 text-sm max-w-md mx-auto">
                                Estamos acumulando masa crítica. Estos servicios se activarán en la <strong>Fase 1</strong>.
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