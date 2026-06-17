import React, { useState, useEffect, useRef } from 'react';
import AgentChatInput from '../AgentChatInput';
import { useAgentEvelyn } from '../../hooks/useAgentEvelyn';
import WikiBroAcordeon from './WikiBroAcordeon';

const GREETINGS_EVELYN = [
  "Soy Evelyn 🧡 Básicamente, ¿qué aviso te trae por aquí?",
  "Evelyn comunica. Qué necesitas y lo resolvemos rápido.",
  "Soy Evelyn 🧡 A ver — ¿buscas algo o tienes algo que ofrecer?",
  "Evelyn aquí. En resumen — ¿qué aviso te trae por aquí?",
];

const GREETINGS_LARRY = [
  "Larry al aparato. La sesión de Tokyo acaba de cerrar — ¿qué movimiento traes? ☕",
  "Soy Larry. He visto subir y caer mercados enteros... ¿qué aviso buscas, amigo mío?",
  "Larry aquí, con el café y las gráficas abiertas. ¿Qué posición traes hoy? 🐕",
  "Soy Larry. El tablón siempre cotiza. ¿Qué aviso te trae por aquí?",
];

export default function EvelynBanner({
  personaje    = 'evelyn',
  avisos_personaje,
  sessionCity,
  genesis      = 0,
  userId       = null,
  autorAlias   = 'Ciudadano',
  onHandoff,
  iaMode  = 'off',
  isAdmin = false,
}) {
  const personajeActivo = (avisos_personaje || personaje || 'evelyn').toLowerCase();

  const { mensaje, loading, enviar, resultadosWiki, acordeonAbierto, setAcordeonAbierto } = useAgentEvelyn({
    personaje:   personajeActivo,
    iaMode,
    isAdmin,
    onHandoff,
    ciudad:      sessionCity,
    genesis,
    userId,
    autorAlias,
  });

  const [display, setDisplay]       = useState('');
  const [cursor, setCursor]         = useState(true);
  const [currentMsg, setCurrentMsg] = useState('');
  const [isMobile, setIsMobile]     = useState(false);
  const charIdx = useRef(0);

  const esLarry         = personajeActivo === 'larry';
  const GREETINGS       = esLarry ? GREETINGS_LARRY : GREETINGS_EVELYN;

  const colorPrimario   = esLarry ? '#0C21C2' : '#161AF9';
  const colorSecundario = esLarry ? '#1E2D94' : '#3552B8';
  const colorTexto      = esLarry ? '#AAB9FE' : '#748BFD';
  const glowColor       = esLarry ? 'rgba(12,14,194,0.5)' : 'rgba(22,25,250,0.5)';

  const INFO = {
    evelyn: { nombre: 'EVELYN', icono: '🐺' },
    larry:  { nombre: 'LARRY',  icono: '🐶' },
  };
  const { nombre: nombrePersonaje, icono: iconoPersonaje } = INFO[personajeActivo] || INFO.evelyn;

  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setCurrentMsg(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
  }, [personaje]);

  useEffect(() => {
    if (mensaje) {
      setCurrentMsg(mensaje);
    }
  }, [mensaje]);

  useEffect(() => {
    if (!currentMsg) return;
    charIdx.current = 0;
    setDisplay('');
    const t = setInterval(() => {
      charIdx.current++;
      setDisplay(currentMsg.slice(0, charIdx.current));
      if (charIdx.current >= currentMsg.length) clearInterval(t);
    }, 28);
    return () => clearInterval(t);
  }, [currentMsg]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleEnviar = (texto) => {
    enviar(texto);
  };

  return (
    <div className="absolute inset-0 z-[50] flex flex-col items-center justify-end pb-0 px-4 pointer-events-none">
      <style>{`
        @keyframes neonPulseAvisos {
          0%, 100% { text-shadow: 0 0 8px ${colorPrimario}, 0 0 22px ${colorSecundario}, 0 0 45px ${colorSecundario}; }
          50%       { text-shadow: 0 0 4px ${colorSecundario}, 0 0 10px ${colorSecundario}; }
        }
        @keyframes avDot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1.2); }
        }
        .av-loading { display: inline-flex; gap: 4px; align-items: center; }
        .av-loading span {
          width: 6px; height: 6px; border-radius: 50%; background: ${colorPrimario};
          animation: avDot 1.2s ease-in-out infinite;
        }
        .av-loading span:nth-child(2) { animation-delay: 0.2s; }
        .av-loading span:nth-child(3) { animation-delay: 0.4s; }
        .av-texto {
          color: ${colorTexto};
          font-style: italic; font-weight: 900; text-transform: uppercase;
          font-size: clamp(13px, 2.2vw, 18px); line-height: 1.5;
          animation: neonPulseAvisos 3s ease-in-out infinite;
        }
      `}</style>

      {/* WikiBroAcordeon overlay */}
      {acordeonAbierto && (
        <WikiBroAcordeon
          resultados={resultadosWiki}
          onClose={() => setAcordeonAbierto(false)}
          isMobile={isMobile}
        />
      )}

      {/* BANNER */}
      <div className="w-full max-w-2xl mb-3 pointer-events-auto">
        <div
          className="w-full flex flex-col items-center justify-center text-center"
          style={{
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${colorPrimario}55`,
            borderRadius: '1.5rem',
            padding: '18px 32px 20px',
            boxShadow: `0 0 24px ${glowColor}, inset 0 0 12px rgba(0,0,0,0.4)`,
            minHeight: '90px',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Sin mensaje */}
          {!currentMsg && !loading && (
            <div className="flex items-center gap-2">
              <p style={{ color: `${colorPrimario}99`, fontSize: 10, fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
                ◈ {nombrePersonaje} · AVISOS
              </p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="av-loading"><span /><span /><span /></div>
          )}

          {/* Mensaje del bot */}
          {!loading && currentMsg && (
            <p className="av-texto">
              {display}<span style={{ opacity: cursor ? 1 : 0 }}>_</span>
            </p>
          )}
        </div>
      </div>

      {/* INPUT */}
      <div className="w-full max-w-2xl pointer-events-auto mb-4">
        <AgentChatInput agent="evelyn" onSend={handleEnviar} isLoading={loading} />
      </div>
    </div>
  );
}