import React, { useState, useEffect } from 'react';

const getSegsHastaCambio = () => {
  const ahora    = new Date();
  const totalSeg = ahora.getHours() * 3600 + ahora.getMinutes() * 60 + ahora.getSeconds();
  const cambios  = [5, 11, 17, 23].map(h => h * 3600);

  for (const c of cambios) {
    if (c > totalSeg) return c - totalSeg;
  }
  return (24 * 3600 - totalSeg) + 5 * 3600;
};

const fmt = (s) => {
  const h   = Math.floor(s / 3600);
  const m   = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const TurnoCountdown = () => {
  const [segs, setSegs] = useState(getSegsHastaCambio);

  useEffect(() => {
    const iv = setInterval(() => setSegs(getSegsHastaCambio()), 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="flex flex-col items-center leading-none" title="Próximo cambio de turno">
      <span className="dr-label">Cambio de Turno</span>
      <span className="dr-clock" style={{ fontSize: 'clamp(24px, 3vw, 48px)', color: '#22d3ee' }}>{fmt(segs)}</span>
    </div>
  );
};

export default TurnoCountdown;