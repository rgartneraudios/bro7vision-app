import React, { useState } from 'react';

const ESTUDIO_EMAIL = 'bro7vision@bro7vision.com';

function ContactoEstudioModal({ onClose }) {
  const [copiado, setCopiado] = useState(false);

  const copiar = () => {
    navigator.clipboard.writeText(ESTUDIO_EMAIL);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      <div
        className="relative w-full max-w-sm rounded-3xl border border-cyan-400/40 bg-[#020d10] p-8 flex flex-col items-center gap-5 text-center"
        style={{ boxShadow: '0 0 40px rgba(34,211,238,0.15), inset 0 0 40px rgba(34,211,238,0.03)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white text-xl leading-none"
        >
          ×
        </button>

        <div className="text-4xl">📡</div>

        <div>
          <p className="text-cyan-400 font-black uppercase tracking-widest text-xs mb-2">
            CONTACTAR CON EL ESTUDIO
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Escríbenos y te haremos un descuento especial en tus espacios publicitarios.
          </p>
        </div>

        <div
          className="w-full rounded-xl border border-cyan-500/30 bg-cyan-900/10 px-4 py-3"
          style={{ boxShadow: '0 0 12px rgba(34,211,238,0.08)' }}
        >
          <p className="text-cyan-300 font-mono font-bold text-sm tracking-wide break-all">
            {ESTUDIO_EMAIL}
          </p>
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={copiar}
            className="flex-1 py-2.5 rounded-xl border border-cyan-500/40 text-cyan-400 text-xs font-black uppercase tracking-widest hover:bg-cyan-500/10 transition-all"
          >
            {copiado ? '✓ COPIADO' : 'COPIAR'}
          </button>
          <a
            href={`mailto:${ESTUDIO_EMAIL}`}
            className="flex-1 py-2.5 rounded-xl bg-cyan-500 text-black text-xs font-black uppercase tracking-widest hover:bg-cyan-400 transition-all text-center"
          >
            ABRIR CORREO
          </a>
        </div>
      </div>
    </div>
  );
}

export default function MisCampanasTab({ isProductor }) {
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">

      {/* CARD BIOLUMINISCENTE — solo Productor */}
      {isProductor && (
        <div
          className="rounded-3xl border bg-transparent p-6 md:p-8 flex flex-col items-center gap-6 text-center"
          style={{
            borderColor: 'rgba(212,175,55,0.5)',
            boxShadow: '0 0 30px rgba(212,175,55,0.15), inset 0 0 40px rgba(212,175,55,0.04)',
          }}
        >
          {/* Título */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl md:text-3xl font-black text-white leading-tight">
              🎁 ¿TIENES SOUVENIRS,<br />CAMISETAS O ENTRADAS?
            </p>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-lg">
              Ofrécelos a nuestros Personajes para que los compartan con usuarios Modo IA. Puedes:
            </p>
          </div>

          {/* Opciones */}
          <ul className="flex flex-col items-center gap-3 w-full max-w-md">
            {[
              'Regalarlos sin condición a usuarios Modo IA',
              'Venderlos a precio módico a través del Personaje',
              'Incluirlos como cortesía en compras de tu comercio',
            ].map((item) => (
              <li key={item} className="flex items-center justify-center gap-3">
                <span
                  className="w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-black"
                  style={{
                    background: 'rgba(212,175,55,0.15)',
                    border: '1px solid rgba(212,175,55,0.5)',
                    color: '#d4af37',
                    boxShadow: '0 0 8px rgba(212,175,55,0.3)',
                  }}
                >
                  ✓
                </span>
                <span className="text-gray-200 text-base md:text-lg leading-snug">{item}</span>
              </li>
            ))}
          </ul>

          {/* Texto de cierre */}
          <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-lg border-t border-white/5 pt-5">
            Comunícalo al Estudio y te haremos un{' '}
            <span className="text-yellow-400 font-bold">descuento especial</span> en tus espacios
            publicitarios. Los Personajes tienen hambre de dárselo a tus clientes.
          </p>

          {/* CTA */}
          <button
            onClick={() => setModalAbierto(true)}
            className="px-8 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest text-black transition-all"
            style={{
              background: 'linear-gradient(135deg, #d4af37, #b8960c)',
              boxShadow: '0 0 24px rgba(212,175,55,0.4)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 0 36px rgba(212,175,55,0.65)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 0 24px rgba(212,175,55,0.4)')}
          >
            CONTACTAR CON EL ESTUDIO
          </button>
        </div>
      )}

      {/* PLACEHOLDER CAMPAÑAS */}
      <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
        <div className="text-3xl">📋</div>
        <p className="text-white text-sm font-bold uppercase tracking-widest">MIS CAMPAÑAS</p>
        <p className="text-gray-600 text-xs max-w-xs leading-relaxed">
          Gestiona tus campañas activas y su rendimiento.
        </p>
        <span className="text-[9px] text-gray-700 border border-white/5 px-3 py-1 rounded uppercase tracking-widest mt-1">
          FASE 0 · PRÓXIMAMENTE
        </span>
      </div>

      {modalAbierto && <ContactoEstudioModal onClose={() => setModalAbierto(false)} />}
    </div>
  );
}
