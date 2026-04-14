// src/components/WebLLMModal.jsx
// Modal de conversación con IA local (WebLLM).
// Ocupa el espacio del banner del personaje activo.
// Estética: neon/bioluminiscente consistente con BRO7VISION.

import { useState, useRef, useEffect } from 'react';

// ─── Mapa personaje → color neon ─────────────────────────────────────────────

const COLORES_PERSONAJE = {
  lara:            '#ff6b9d',
  tito:            '#6b9dff',
  puffo:           '#ffaa6b',
  nova:            '#c8a2ff',
  isabella:        '#ff9dc8',
  profesor_robles: '#a2d4ff',
  mapache:         '#ff6b6b',
  ami:             '#6bffb8',
  evelyn:          '#ffd700',
  larry:           '#ff8c42',
  rumores:         '#e040fb',
  orumama:         '#69f0ae',
  smisterio:       '#aa00ff',   // Señor Misterio — violeta oscuro
  jaguar:          '#ff6d00',
};

// ─── Emojis de avatar por personaje ──────────────────────────────────────────

const AVATARES = {
  lara: '🐻', tito: '🐻', puffo: '🐻',
  nova: '✨', isabella: '💙', profesor_robles: '📚',
  mapache: '🦝', ami: '🎵',
  evelyn: '💼', larry: '🏙️',
  rumores: '🎬',
  orumama: '🌿', smisterio: '📞', jaguar: '🐆',
};

// ─── Burbuja de mensaje ───────────────────────────────────────────────────────

const Burbuja = ({ rol, texto, color, avatar }) => {
  const esUser = rol === 'user';
  return (
    <div style={{
      display:       'flex',
      flexDirection: esUser ? 'row-reverse' : 'row',
      alignItems:    'flex-start',
      gap:           '0.5rem',
      marginBottom:  '0.75rem',
    }}>
      {/* Avatar */}
      <div style={{
        width:          '30px',
        height:         '30px',
        borderRadius:   '50%',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       '1rem',
        flexShrink:     0,
        background:     esUser ? 'rgba(255,255,255,0.1)' : `${color}22`,
        border:         `1px solid ${esUser ? 'rgba(255,255,255,0.2)' : color + '55'}`,
      }}>
        {esUser ? '👤' : avatar}
      </div>

      {/* Texto */}
      <div style={{
        maxWidth:     '78%',
        padding:      '0.6rem 0.85rem',
        borderRadius: esUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
        background:   esUser
          ? 'rgba(255,255,255,0.08)'
          : `linear-gradient(135deg, ${color}18, ${color}08)`,
        border:       `1px solid ${esUser ? 'rgba(255,255,255,0.12)' : color + '30'}`,
        color:        esUser ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.92)',
        fontSize:     '0.83rem',
        lineHeight:   '1.55',
        fontFamily:   "'Courier New', monospace",
        letterSpacing: '0.01em',
        boxShadow:    esUser ? 'none' : `0 0 15px ${color}10`,
        whiteSpace:   'pre-wrap',
        wordBreak:    'break-word',
      }}>
        {texto}
      </div>
    </div>
  );
};

// ─── Indicador "escribiendo" ──────────────────────────────────────────────────

const Escribiendo = ({ color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0' }}>
    {[0, 0.2, 0.4].map((delay, i) => (
      <div key={i} style={{
        width:            '6px',
        height:           '6px',
        borderRadius:     '50%',
        background:       color,
        animation:        `bounce 1s ease-in-out ${delay}s infinite`,
        opacity:          0.7,
      }} />
    ))}
  </div>
);

// ─── Modal principal ──────────────────────────────────────────────────────────

export const WebLLMModal = ({ webLLM, personajeKey, nombrePersonaje, onCerrar }) => {
  const [historial, setHistorial] = useState([
    // Mensaje de bienvenida inicial del personaje
    {
      rol:   'assistant',
      texto: mensajeBienvenida(personajeKey, nombrePersonaje),
    },
  ]);
  const [inputTexto, setInputTexto] = useState('');
  const [streamActual, setStreamActual] = useState('');

  const scrollRef   = useRef(null);
  const inputRef    = useRef(null);

  const color  = COLORES_PERSONAJE[personajeKey] || '#00ffc8';
  const avatar = AVATARES[personajeKey] || '🤖';

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [historial, streamActual]);

  // Focus en input al abrir
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Actualizar stream en tiempo real
  useEffect(() => {
    if (webLLM.respuesta && webLLM.isChatting) {
      setStreamActual(webLLM.respuesta);
    }
    if (!webLLM.isChatting && webLLM.respuesta) {
      // Finalizado — mover de stream a historial
      setHistorial(prev => [...prev, { rol: 'assistant', texto: webLLM.respuesta }]);
      setStreamActual('');
    }
  }, [webLLM.respuesta, webLLM.isChatting]);

  const handleEnviar = async () => {
    const texto = inputTexto.trim();
    if (!texto || webLLM.isChatting) return;

    setInputTexto('');
    setHistorial(prev => [...prev, { rol: 'user', texto }]);
    setStreamActual('');

    await webLLM.chat(texto, personajeKey);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  return (
    <>
      {/* ── Overlay de fondo ── */}
      <div
        onClick={onCerrar}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* ── Modal ── */}
      <div style={{
        position:   'fixed',
        top:        '50%',
        left:       '50%',
        transform:  'translate(-50%, -50%)',
        zIndex:     9999,
        width:      'min(520px, calc(100vw - 2rem))',
        height:     'min(600px, calc(100vh - 4rem))',
        background: 'linear-gradient(160deg, #060612 0%, #0a1020 60%, #0d0a20 100%)',
        border:     `1px solid ${color}40`,
        borderRadius: '20px',
        display:    'flex',
        flexDirection: 'column',
        overflow:   'hidden',
        boxShadow:  `0 0 60px ${color}20, 0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 ${color}20`,
        fontFamily: "'Courier New', monospace",
        animation:  'entrarModal 0.25s ease-out',
      }}>

        {/* ── Header ── */}
        <div style={{
          padding:    '1rem 1.25rem',
          borderBottom: `1px solid ${color}20`,
          display:    'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: `linear-gradient(90deg, ${color}10, transparent)`,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.4rem' }}>{avatar}</span>
            <div>
              <div style={{
                color: color, fontSize: '0.85rem',
                fontWeight: 'bold', letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                {nombrePersonaje}
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.35)', fontSize: '0.65rem',
                letterSpacing: '0.06em',
              }}>
                MODO IA · LOCAL · BROVISION
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Indicador estado */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              fontSize: '0.65rem', color: color, letterSpacing: '0.05em',
            }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: color,
                animation: 'pulso 2s ease-in-out infinite',
              }} />
              ONLINE
            </div>

            {/* Botón cerrar */}
            <button onClick={onCerrar} style={{
              background: 'rgba(255,255,255,0.05)',
              border:     '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color:      'rgba(255,255,255,0.5)',
              cursor:     'pointer',
              width:      '28px', height: '28px',
              display:    'flex', alignItems: 'center', justifyContent: 'center',
              fontSize:   '0.9rem', fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.borderColor = 'rgba(255,255,255,0.3)'; }}
            onMouseLeave={e => { e.target.style.color = 'rgba(255,255,255,0.5)'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Área de mensajes ── */}
        <div
          ref={scrollRef}
          style={{
            flex:       1,
            overflowY:  'auto',
            padding:    '1rem 1.25rem',
            scrollbarWidth: 'thin',
            scrollbarColor: `${color}30 transparent`,
          }}
        >
          {historial.map((msg, i) => (
            <Burbuja
              key={i}
              rol={msg.rol}
              texto={msg.texto}
              color={color}
              avatar={avatar}
            />
          ))}

          {/* Stream en tiempo real */}
          {streamActual && (
            <Burbuja
              rol="assistant"
              texto={streamActual + '▌'}
              color={color}
              avatar={avatar}
            />
          )}

          {/* "Escribiendo" cuando está generando pero sin stream aún */}
          {webLLM.isChatting && !streamActual && (
            <div style={{ paddingLeft: '2.5rem' }}>
              <Escribiendo color={color} />
            </div>
          )}
        </div>

        {/* ── Input ── */}
        <div style={{
          padding:      '0.85rem 1.25rem',
          borderTop:    `1px solid ${color}20`,
          display:      'flex',
          gap:          '0.6rem',
          alignItems:   'flex-end',
          background:   'rgba(0,0,0,0.3)',
          flexShrink:   0,
        }}>
          <textarea
            ref={inputRef}
            value={inputTexto}
            onChange={e => setInputTexto(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Habla con ${nombrePersonaje}...`}
            rows={1}
            disabled={webLLM.isChatting}
            style={{
              flex:        1,
              background:  'rgba(255,255,255,0.05)',
              border:      `1px solid ${webLLM.isChatting ? 'rgba(255,255,255,0.1)' : color + '30'}`,
              borderRadius: '10px',
              color:       'rgba(255,255,255,0.9)',
              padding:     '0.6rem 0.85rem',
              fontSize:    '0.82rem',
              fontFamily:  "'Courier New', monospace",
              resize:      'none',
              outline:     'none',
              lineHeight:  '1.4',
              maxHeight:   '100px',
              overflowY:   'auto',
              transition:  'border-color 0.2s',
              scrollbarWidth: 'none',
            }}
            onFocus={e => e.target.style.borderColor = color + '70'}
            onBlur={e  => e.target.style.borderColor = color + '30'}
          />

          <button
            onClick={handleEnviar}
            disabled={webLLM.isChatting || !inputTexto.trim()}
            style={{
              width:      '38px',
              height:     '38px',
              borderRadius: '10px',
              background:  webLLM.isChatting || !inputTexto.trim()
                ? 'rgba(255,255,255,0.05)'
                : `linear-gradient(135deg, ${color}40, ${color}20)`,
              border:      `1px solid ${webLLM.isChatting || !inputTexto.trim() ? 'rgba(255,255,255,0.1)' : color + '60'}`,
              color:       webLLM.isChatting || !inputTexto.trim()
                ? 'rgba(255,255,255,0.2)'
                : color,
              cursor:      webLLM.isChatting || !inputTexto.trim() ? 'not-allowed' : 'pointer',
              display:     'flex',
              alignItems:  'center',
              justifyContent: 'center',
              fontSize:    '1rem',
              transition:  'all 0.2s',
              flexShrink:  0,
            }}
          >
            {webLLM.isChatting ? '⏳' : '➤'}
          </button>
        </div>

        {/* ── Nota pie ── */}
        <div style={{
          padding:    '0.4rem 1.25rem 0.65rem',
          textAlign:  'center',
          fontSize:   '0.6rem',
          color:      'rgba(255,255,255,0.2)',
          letterSpacing: '0.04em',
          flexShrink: 0,
        }}>
          IA LOCAL · TU DISPOSITIVO · NO SE ENVÍAN DATOS
        </div>
      </div>

      {/* ── Estilos globales ── */}
      <style>{`
        @keyframes entrarModal {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes pulso {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.7; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </>
  );
};

// ─── Mensaje de bienvenida por personaje ──────────────────────────────────────

function mensajeBienvenida(key, nombre) {
  const mensajes = {
    smisterio: '📞 *señal estática* ... ¿Me escuchas? El Señor Misterio está en línea. Hay secretos que los libros de historia borraron... ¿qué quieres descubrir?',
    jaguar:    'El umbral está abierto. Las estrellas llevan tiempo observándote. ¿Qué buscas en sus patrones?',
    orumama:   'Las velas están encendidas, el brebaje listo. Cuéntame qué te pesa, que la naturaleza tiene respuesta para todo.',
    lara:      '¡Al habla! Pregunta sin rodeos, que no me gustan los vende-humos.',
    tito:      '...\n\nCuéntame. Escucho.',
    puffo:     '¿Qué tienes ahí? Sea lo que sea, lo vemos juntos.',
    nova:      '¡Hola! ✨ Lista para explorar. ¿Qué buscas hoy?',
    mapache:   'Ey ey ey 🦝 ¡El modo IA está ON! ¿Qué necesitas?',
    rumores:   '¡Y aquí estamos! Los focos encendidos, el micrófono caliente. ¿Sobre qué reino quieres saber?',
  };
  return mensajes[key] || `${nombre} al habla. ¿En qué te ayudo?`;
}
