import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function ChapterGrid({ faseLunar, userId, onSelectChapter, onClose }) {
  const [capitulos, setCapitulos] = useState([]);
  const [vistos, setVistos] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      console.log('faseLunar recibida en ChapterGrid:', faseLunar, typeof faseLunar);

      const { data: capitulosData, error } = await supabase
        .from('bro7band_capitulos')
        .select('*')
        .eq('fase_lunar_activa', parseInt(faseLunar))
        .eq('activo', true)
        .order('orden');

      console.log('capitulos result:', capitulosData, 'error:', error);

      setCapitulos(capitulosData || []);

      if (userId) {
        const { data: vistasData } = await supabase
          .from('bro7band_vistas')
          .select('chapter_id')
          .eq('user_id', userId)
          .eq('fase_lunar', parseInt(faseLunar));

        setVistos(new Set((vistasData || []).map(v => v.chapter_id)));
      }

      setLoading(false);
    };

    fetchData();
  }, [faseLunar, userId]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <video
        src="https://media.bro7vision.com/default1_bro7band.mp4"
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      <div className="relative z-10 flex flex-col flex-1">
        <button
          onClick={onClose}
          className="fixed top-4 left-4 z-[110] px-6 py-3 rounded-full border-2 border-cyan-400/80 text-cyan-300 text-sm font-black uppercase tracking-widest hover:bg-cyan-400/20 hover:border-cyan-300 transition-all shadow-[0_0_25px_rgba(34,211,238,0.5)] backdrop-blur-md"
        >
          ← VOLVER
        </button>

        <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-8 py-20">
  
          <p className="text-white/30 text-xs uppercase tracking-[0.3em] font-mono mb-10">
            Capítulos activos esta fase
          </p>

          {loading ? (
            <div className="w-10 h-10 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />

          ) : capitulos.length === 0 ? (
            <p className="text-white/40 text-lg font-bold uppercase tracking-widest text-center">
              Próximo capítulo en la siguiente fase lunar 🌙
            </p>

          ) : (
            <div className="flex flex-col items-center gap-4 w-full max-w-xl">
              {capitulos.map(cap => {
                const yaVisto = vistos.has(cap.id);
                return (
                  <div key={cap.id} className="w-full flex flex-col items-center gap-1">
                    
                    <button
                        onClick={() => onSelectChapter(cap)}
                        className={`text-xl md:text-3xl font-black uppercase tracking-[0.15em] text-center transition-all ${
                          yaVisto
                            ? 'text-white/20 hover:text-cyan-300 hover:drop-shadow-[0_0_30px_rgba(34,211,238,0.8)]'
                            : 'text-white hover:text-cyan-300 hover:drop-shadow-[0_0_30px_rgba(34,211,238,0.8)]'
                        }`}
                      >
                        {cap.titulo}
                      </button>

                    <div className="flex items-center gap-4 text-white/20 text-[10px] font-mono uppercase tracking-widest">
                      {cap.duracion_seg && (
                        <span>⏱ {Math.floor(cap.duracion_seg / 60)}:{String(cap.duracion_seg % 60).padStart(2, '0')}</span>
                      )}
                      <span>🌙 +{cap.lunas_reward}</span>
                      {yaVisto && <span className="text-green-400/60">✓ ya canjeado</span>}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default ChapterGrid;