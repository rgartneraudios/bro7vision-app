// src/components/MoonMatrixCircle.jsx

import React from 'react';

const MoonMatrixCircle = () => {
  const calcDay = () => {
    const now = new Date();
    const ref = new Date('2024-05-08T15:22:00Z');
    const lunation = 2551442.8;
    const s = (now.getTime() - ref.getTime()) / 1000;
    return (((s % lunation) + lunation) % lunation / lunation) * 29.53;
  };

  const getPhase = (day) => {
    if (day < 2 || day > 27.5) return 'NOVA';
    if (day < 13.5)             return 'CRESCENS';
    if (day <= 16.5)            return 'PLENA';
    return 'DECRESCENS';
  };

  const getShadow = (day) => {
    const R = 38;
    if (day < 2 || day > 27.5) return { rx: R, cx: 50 };
    if (day < 13.5) {
      const t = day / 13.5;
      return { rx: R * (1 - t), cx: 50 - R * t * 0.9 };
    }
    if (day <= 16.5) return { rx: 0, cx: 50 };
    const t = (day - 16.5) / 11;
    return { rx: Math.min(R, R * t), cx: 50 + R * t * 0.9 };
  };

  const getGlow = (day) => {
    if (day < 2 || day > 27.5) return { g1: 0.04, g2: 0.06 };
    if (day < 13.5) { const t = day / 13.5; const g = 0.18 + t * 0.25; return { g1: g * 0.6, g2: g }; }
    if (day <= 16.5) return { g1: 0.55, g2: 0.7 };
    const t = (day - 16.5) / 11; const g = 0.45 - t * 0.25; return { g1: g * 0.6, g2: g };
  };

  const day = calcDay();
  const phase = getPhase(day);
  const { rx, cx } = getShadow(day);
  const { g1, g2 } = getGlow(day);
  const isNova = phase === 'NOVA';
  const litOpacity = isNova ? 0 : 1;

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <svg width="96" height="96" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="novaGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a2030"/>
            <stop offset="100%" stopColor="#080c14"/>
          </radialGradient>
          <radialGradient id="litGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff"/>
            <stop offset="60%" stopColor="#e8eef8"/>
            <stop offset="100%" stopColor="#b0c4d8"/>
          </radialGradient>
          <clipPath id="diskClip"><circle cx="50" cy="50" r="38"/></clipPath>
          <filter id="glowSoft"><feGaussianBlur stdDeviation="10"/></filter>
          <filter id="glowHard"><feGaussianBlur stdDeviation="16"/></filter>
        </defs>

        {/* Glow exterior */}
        <circle cx="50" cy="50" r="38" fill="white" opacity={g1} filter="url(#glowHard)"/>
        <circle cx="50" cy="50" r="38" fill="white" opacity={g2} filter="url(#glowSoft)"/>

        {/* Base */}
        <circle cx="50" cy="50" r="38" fill={isNova ? 'url(#novaGrad)' : '#080c14'}/>

        {/* Superficie + sombra */}
        <g clipPath="url(#diskClip)">
          <circle cx="50" cy="50" r="38" fill="url(#litGrad)" opacity={litOpacity}/>
          <ellipse cx={cx} cy="50" rx={rx} ry="38" fill="#080c14"/>
        </g>

        {/* Borde */}
        <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8"/>
        {/* Reflejo */}
        {!isNova && <ellipse cx="42" cy="40" rx="9" ry="5" fill="rgba(255,255,255,0.1)" transform="rotate(-25,42,40)"/>}
      </svg>

      <span style={{ fontFamily: 'monospace', fontSize: '10px', fontWeight: 700, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase' }}>
        {phase}
      </span>
    </div>
  );
};

export default MoonMatrixCircle ;