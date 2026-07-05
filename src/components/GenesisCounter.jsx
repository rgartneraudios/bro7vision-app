import React from 'react';

function GenesisCounter({ balances, className = '', mobile = false }) {
  const genesis = balances?.genesis ?? 0;
  const formatted = genesis.toLocaleString('es-ES');

  const colorClass =
    genesis < 1000      ? 'text-red-400'
    : genesis < 5000    ? 'text-blue-400'
    : genesis < 10000   ? 'text-emerald-400'
    : genesis < 15000   ? 'text-yellow-400'
    :                     'text-fuchsia-400';

  const neonColor =
    genesis < 1000      ? 'rgba(248,113,113,0.6)'
    : genesis < 5000    ? 'rgba(96,165,250,0.6)'
    : genesis < 10000   ? 'rgba(52,211,153,0.6)'
    : genesis < 15000   ? 'rgba(250,204,21,0.6)'
    :                     'rgba(217,70,239,0.6)';

  if (mobile) {
    return (
      <div
        className={`fixed top-4 right-32 z-[110] flex items-center gap-1.5 px-3 py-1 bg-black/60 border backdrop-blur-md rounded-full select-none ${className}`}
        style={{
          borderColor: neonColor,
          boxShadow: `0 0 12px ${neonColor}`,
        }}
      >
        <span className={`font-black text-2xl tracking-widest ${colorClass}`}
          style={{ textShadow: `0 0 8px ${neonColor}` }}>
          {formatted}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-3 px-5 py-3 bg-black/60 border backdrop-blur-md rounded-full select-none ${className}`}
      style={{
        borderColor: neonColor,
        boxShadow: `0 0 20px ${neonColor}`,
      }}
    >
      <span className={`font-black text-2xl tracking-widest ${colorClass}`}
        style={{ textShadow: `0 0 12px ${neonColor}` }}>
        {formatted}
      </span>
      <span className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] leading-none">
        PUNTOS<br />GÉNESIS
      </span>
    </div>
  );
}

export default GenesisCounter;