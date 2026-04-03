import React, { useState } from 'react';
import { useHonorRoll } from '../hooks/useHonorRoll';

// Componente auxiliar para las tarjetas
function TarjetaNoble({ item, num, colorTexto, colorBg, colorBorder, colorHover }) {
  return (
    <div className={`flex items-center gap-4 ${colorBg} border ${colorBorder} rounded-xl px-5 py-4 ${colorHover} transition-all`}>
      <span
        className={`${colorTexto} text-xl font-black w-10 shrink-0 text-center`}
        style={{ fontFamily: "'Georgia', serif" }}
      >
        {String(num).padStart(2, '0')}
      </span>
      <div>
        <p className={`${colorTexto} opacity-70 text-[10px] uppercase tracking-[0.3em] leading-none mb-1`}>
          {item.titulo}
        </p>
        <p className="text-white text-xl font-bold" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
          {item.tratamiento}{' '}
          <span className={colorTexto}>{item.alias}</span>
        </p>
      </div>
    </div>
  );
}

const Reinos = () => {
  // Estado para controlar si el acordeón está abierto o cerrado
  const [isOpen, setIsOpen] = useState(false);
  
  // Hook exclusivo para traer los datos del reino
  const { porRank, loading: loadingHonor, error: errorHonor } = useHonorRoll();

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl z-[60] flex flex-col items-center font-mono">
      {/* Contenedor principal fijado en la parte inferior central */}
        
      {/* ── ÁREA DE CONTENIDO EXPANDIBLE (Acordeón) ── */}
      <div 
        className={`w-full bg-[#080808]/90 backdrop-blur-md border-t border-x border-orange-500/50 rounded-t-3xl overflow-hidden shadow-[0_-10px_40px_rgba(249,115,22,0.15)] transition-all duration-500 ease-in-out flex flex-col ${
          isOpen ? 'max-h-[85vh] opacity-100 border-b-0' : 'max-h-0 opacity-0 border-transparent'
        }`}
      >
        {/* Scroll interno para el listado */}
        <div className="overflow-y-auto custom-scrollbar w-full px-6 pb-12 pt-8 flex-1">
          
          {/* CABECERA */}
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

          {/* ESTADO DE CARGA / ERROR */}
          {loadingHonor && (
            <p className="text-center text-gray-400 text-xs uppercase tracking-widest py-10 animate-pulse">
              Convocando al Reino…
            </p>
          )}
          {errorHonor && (
            <p className="text-center text-red-500 text-xs uppercase tracking-widest py-6">
              ⚠️ Error cargando el listado: {errorHonor}
            </p>
          )}

          {/* LISTADOS */}
          {!loadingHonor && !errorHonor && porRank && (
            <div className="max-w-4xl mx-auto">
              
              {/* REYES & REINAS */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">👑</span>
                  <p className="text-orange-400 text-sm font-bold uppercase tracking-[0.25em]" style={{ fontFamily: "'Georgia', serif" }}>
                    Alta Corte · Reyes &amp; Reinas
                  </p>
                  <span className="text-orange-700 text-xs ml-1">{porRank.rey?.length || 0}/100</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-orange-600/50 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {!porRank.rey || porRank.rey.length === 0 ? (
                    <p className="text-gray-600 text-xs uppercase tracking-widest col-span-2 py-4 text-center border border-dashed border-gray-800 rounded-xl">
                      Aún no hay Reyes ni Reinas — sé el primero
                    </p>
                  ) : (
                    porRank.rey.map((item, i) => (
                      <TarjetaNoble key={i} item={item} num={i + 1} colorTexto="text-orange-400" colorBg="bg-orange-950/20" colorBorder="border-orange-800/30" colorHover="hover:border-orange-600/50" />
                    ))
                  )}
                </div>
              </section>

              {/* PRÍNCIPES & PRINCESAS */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">⚔️</span>
                  <p className="text-blue-400 text-sm font-bold uppercase tracking-[0.25em]" style={{ fontFamily: "'Georgia', serif" }}>
                    Guardia Real · Príncipes &amp; Princesas
                  </p>
                  <span className="text-blue-700 text-xs ml-1">{porRank.principe?.length || 0}/100</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-blue-600/50 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {!porRank.principe || porRank.principe.length === 0 ? (
                    <p className="text-gray-600 text-xs uppercase tracking-widest col-span-2 py-4 text-center border border-dashed border-gray-800 rounded-xl">
                      Cupo disponible — abre tras completar la Alta Corte
                    </p>
                  ) : (
                    porRank.principe.map((item, i) => (
                      <TarjetaNoble key={i} item={item} num={101 + i} colorTexto="text-blue-300" colorBg="bg-blue-950/20" colorBorder="border-blue-800/30" colorHover="hover:border-blue-600/50" />
                    ))
                  )}
                </div>
              </section>

              {/* DUQUES */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">🏰</span>
                  <p className="text-purple-400 text-sm font-bold uppercase tracking-[0.25em]" style={{ fontFamily: "'Georgia', serif" }}>
                    Nobleza Mayor · Duques &amp; Duquesas
                  </p>
                  <span className="text-purple-700 text-xs ml-1">{porRank.duque?.length || 0}/100</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-purple-600/50 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {!porRank.duque || porRank.duque.length === 0 ? (
                    <p className="text-gray-600 text-xs uppercase tracking-widest col-span-2 py-4 text-center border border-dashed border-gray-800 rounded-xl">
                      Cupo disponible — abre tras completar la Guardia Real
                    </p>
                  ) : (
                    porRank.duque.map((item, i) => (
                      <TarjetaNoble key={i} item={item} num={201 + i} colorTexto="text-purple-300" colorBg="bg-purple-950/20" colorBorder="border-purple-800/30" colorHover="hover:border-purple-600/50" />
                    ))
                  )}
                </div>
              </section>

              {/* MARQUESES */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">📜</span>
                  <p className="text-cyan-400 text-sm font-bold uppercase tracking-[0.25em]" style={{ fontFamily: "'Georgia', serif" }}>
                    Nobleza · Marqueses &amp; Marquesas
                  </p>
                  <span className="text-cyan-700 text-xs ml-1">{porRank.marques?.length || 0}/100</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-cyan-600/50 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {!porRank.marques || porRank.marques.length === 0 ? (
                    <p className="text-gray-600 text-xs uppercase tracking-widest col-span-2 py-4 text-center border border-dashed border-gray-800 rounded-xl">
                      Cupo disponible — abre tras completar los Ducados
                    </p>
                  ) : (
                    porRank.marques.map((item, i) => (
                      <TarjetaNoble key={i} item={item} num={301 + i} colorTexto="text-cyan-300" colorBg="bg-cyan-950/20" colorBorder="border-cyan-800/30" colorHover="hover:border-cyan-600/50" />
                    ))
                  )}
                </div>
              </section>

              {/* CONDES */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">🌿</span>
                  <p className="text-green-400 text-sm font-bold uppercase tracking-[0.25em]" style={{ fontFamily: "'Georgia', serif" }}>
                    Nobleza · Condes &amp; Condesas
                  </p>
                  <span className="text-green-700 text-xs ml-1">{porRank.conde?.length || 0}/100</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-green-600/50 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {!porRank.conde || porRank.conde.length === 0 ? (
                    <p className="text-gray-600 text-xs uppercase tracking-widest col-span-2 py-4 text-center border border-dashed border-gray-800 rounded-xl">
                      Cupo disponible — abre tras completar los Marquesados
                    </p>
                  ) : (
                    porRank.conde.map((item, i) => (
                      <TarjetaNoble key={i} item={item} num={401 + i} colorTexto="text-green-300" colorBg="bg-green-950/20" colorBorder="border-green-800/30" colorHover="hover:border-green-600/50" />
                    ))
                  )}
                </div>
              </section>

              {/* LORDS & LADIES */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">✦</span>
                  <p className="text-yellow-400 text-sm font-bold uppercase tracking-[0.25em]" style={{ fontFamily: "'Georgia', serif" }}>
                    Honor del Reino · Lord &amp; Lady
                  </p>
                  <div className="flex-1 h-px bg-gradient-to-r from-yellow-600/50 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {!porRank.lord || porRank.lord.length === 0 ? (
                    <p className="text-gray-600 text-xs uppercase tracking-widest col-span-2 py-4 text-center border border-dashed border-gray-800 rounded-xl">
                      Sin Lords ni Ladies aún — el mérito abre este cupo
                    </p>
                  ) : (
                    porRank.lord.map((item, i) => (
                      <div key={i} className="flex items-center gap-4 bg-yellow-950/10 border border-yellow-800/20 rounded-xl px-5 py-4 hover:border-yellow-600/40 transition-all">
                        <span className="text-yellow-600 text-xl w-10 shrink-0 text-center">✦</span>
                        <div>
                          <p className="text-yellow-700/70 text-[10px] uppercase tracking-[0.3em] leading-none mb-1">
                            {item.titulo}
                          </p>
                          <p className="text-white/80 text-xl font-bold" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                            {item.tratamiento} <span className="text-yellow-300">{item.alias}</span>
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

            </div>
          )}
        </div>
      </div>

      {/* ── BOTÓN / RANURA (Siempre visible en el centro del footer) ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-black/90 backdrop-blur-md border border-orange-500/50 ${
          isOpen ? 'rounded-b-2xl border-t-0 border-orange-500/10 text-gray-400' : 'rounded-t-2xl border-b-0 text-orange-400'
        } px-8 py-3 font-black uppercase tracking-widest hover:text-orange-300 transition-all flex items-center justify-center gap-2 w-64 shadow-[0_0_20px_rgba(249,115,22,0.2)] group`}
      >
        <span className={`text-lg transition-transform duration-300 ${isOpen ? 'rotate-180' : 'group-hover:-translate-y-1'}`}>
          {isOpen ? '▼' : '👑'}
        </span>
        <span className="text-xs md:text-sm">
          {isOpen ? 'Cerrar Listado' : 'Listado de Honor'}
        </span>
        <span className={`text-lg transition-transform duration-300 ${isOpen ? 'rotate-180' : 'group-hover:-translate-y-1'}`}>
          {isOpen ? '▼' : '👑'}
        </span>
      </button>

    </div>
  );
};

export default Reinos;