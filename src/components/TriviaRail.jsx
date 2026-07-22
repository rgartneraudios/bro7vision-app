import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";

const STORAGE_PREFIX = "triviaRail_";

const NEON_CYAN = "#00f2ff";
const NEON_GREEN = "#00ff64";
const NEON_RED = "#ff0044";

export default function TriviaRail({ sector, userId, onGenesisUpdate }) {
  const [preguntas, setPreguntas] = useState([]);
  const [pestanhaActiva, setPestanhaActiva] = useState(null);
  const [respondidas, setRespondidas] = useState(new Set());
  const [resultado, setResultado] = useState(null);
  const [cooldown, setCooldown] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const storageKey = `${STORAGE_PREFIX}${sector}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setRespondidas(new Set(JSON.parse(saved)));
      } catch {}
    }
  }, [storageKey]);

  useEffect(() => {
    supabase
      .from("trivia_rail")
      .select("slot_numero, pregunta, respuesta_correcta, lunas_bonus, es_brovision")
      .eq("sector", sector)
      .eq("activo", true)
      .then(({ data }) => {
        setPreguntas(data || []);
      });
  }, [sector]);

  const getPreguntaForSlot = useCallback(
    (slot) => preguntas.find((p) => p.slot_numero === slot),
    [preguntas]
  );

  const handleResponder = useCallback(
    async (respuesta) => {
      if (cooldown || resultado) return;
      const p = getPreguntaForSlot(pestanhaActiva);
      if (!p) return;

      const esAcierto = respuesta === p.respuesta_correcta;
      setResultado(esAcierto ? "acierto" : "fallo");
      setCooldown(true);

      if (userId) {
        const delta = esAcierto ? p.lunas_bonus : -5;
        await supabase.rpc("incrementar_lunas", { uid: userId, delta });
        const { data: perfil } = await supabase
          .from('profiles')
          .select('lunas')
          .eq('id', userId)
          .single();
        if (perfil?.lunas !== undefined) onGenesisUpdate?.(perfil.lunas);
      }

      setTimeout(() => {
        const nuevas = new Set(respondidas);
        nuevas.add(pestanhaActiva);
        setRespondidas(nuevas);
        localStorage.setItem(storageKey, JSON.stringify([...nuevas]));
        setResultado(null);
        setCooldown(false);
        setPestanhaActiva(null);
      }, 3000);
    },
    [cooldown, resultado, pestanhaActiva, getPreguntaForSlot, userId, respondidas, storageKey, onGenesisUpdate]
  );

  const slotCount = 8;
  const slots = Array.from({ length: slotCount }, (_, i) => i + 1);

  const preguntaActiva = pestanhaActiva ? getPreguntaForSlot(pestanhaActiva) : null;

  const imgVerdadero = resultado === null
    ? "/assets/pregunta_a.webp"
    : preguntaActiva?.respuesta_correcta === true
      ? (resultado === "acierto" ? "/assets/acierto1.webp" : "/assets/fallo1.webp")
      : "/assets/pregunta_a.webp";

  const imgFalso = resultado === null
    ? "/assets/pregunta_b.webp"
    : preguntaActiva?.respuesta_correcta === false
      ? (resultado === "acierto" ? "/assets/acierto2.webp" : "/assets/fallo2.webp")
      : "/assets/pregunta_b.webp";

  const getSlotStyle = (num) => {
    const p = getPreguntaForSlot(num);
    const respondida = respondidas.has(num);
    const activa = pestanhaActiva === num;
    const hovered = hoveredSlot === num;

    if (!p) {
      return {
        border: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(0,0,0,0.2)",
        color: "rgba(255,255,255,0.15)",
        boxShadow: "none",
        cursor: "default",
      };
    }

    if (respondida) {
      return {
        border: `1px solid ${NEON_GREEN}80`,
        boxShadow: hovered ? `0 0 12px ${NEON_GREEN}80, 0 0 24px ${NEON_GREEN}40` : `0 0 6px ${NEON_GREEN}40`,
        background: `rgba(0,255,100,0.08)`,
        color: NEON_GREEN,
        textShadow: `0 0 8px ${NEON_GREEN}`,
        cursor: "default",
        transform: hovered ? "scale(1.2)" : "scale(1)",
      };
    }

    if (activa) {
      return {
        border: `1px solid ${NEON_CYAN}`,
        boxShadow: hovered
          ? `0 0 12px ${NEON_CYAN}, 0 0 30px ${NEON_CYAN}80`
          : `0 0 8px ${NEON_CYAN}, 0 0 20px ${NEON_CYAN}60`,
        background: `rgba(0,242,255,0.1)`,
        color: NEON_CYAN,
        textShadow: `0 0 10px ${NEON_CYAN}`,
        cursor: "pointer",
        transform: hovered ? "scale(1.2)" : "scale(1)",
      };
    }

    return {
      border: `1px solid ${NEON_CYAN}40`,
      boxShadow: hovered ? `0 0 10px ${NEON_CYAN}60, 0 0 20px ${NEON_CYAN}30` : `0 0 4px ${NEON_CYAN}20`,
      background: hovered ? "rgba(0,242,255,0.08)" : "rgba(0,0,0,0.4)",
      color: hovered ? NEON_CYAN : `${NEON_CYAN}90`,
      textShadow: hovered ? `0 0 8px ${NEON_CYAN}` : "none",
      cursor: "pointer",
      transform: hovered ? "scale(1.2)" : "scale(1)",
    };
  };

  return (
    <div
      className="hidden lg:block fixed right-[6%] top-[55%] -translate-y-1/2 z-30 pointer-events-auto"
      style={{
        width: "280px",
        height: "720px",
      }}
    >
      <div
        className="rounded-xl px-2 pt-2 pb-0 flex flex-col"
        style={{
          height: "100%",
          background: "rgba(10,10,30,0.5)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(0,242,255,0.2)",
          boxShadow: "0 0 15px rgba(0,242,255,0.1)",
        }}
      >
        <div className="grid grid-cols-4 gap-1 px-0.5">
          {slots.map((num) => (
            <button
              key={num}
              className="w-full aspect-square rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                ...getSlotStyle(num),
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.8rem",
                fontWeight: 700,
                letterSpacing: "0.5px",
              }}
              onMouseEnter={() => setHoveredSlot(num)}
              onMouseLeave={() => setHoveredSlot(null)}
              onClick={() => {
                if (!respondidas.has(num) && getPreguntaForSlot(num) && !cooldown) {
                  setPestanhaActiva(pestanhaActiva === num ? null : num);
                  setResultado(null);
                }
              }}
              disabled={!getPreguntaForSlot(num) || respondidas.has(num) || cooldown}
            >
              {respondidas.has(num) ? (
                <span style={{ color: NEON_GREEN, textShadow: `0 0 8px ${NEON_GREEN}`, fontSize: "1.2rem" }}>
                  &#10003;
                </span>
              ) : (
                num
              )}
            </button>
          ))}
        </div>

        {pestanhaActiva && preguntaActiva && (
          <div
            style={{
              padding: '8px 12px',
              overflowY: 'auto',
            }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <span
                className="text-xs font-bold"
                style={{
                  color: NEON_CYAN,
                  fontFamily: "'Space Grotesk', sans-serif",
                  textShadow: `0 0 8px ${NEON_CYAN}`,
                  letterSpacing: "1px",
                }}
              >
                SLOT {pestanhaActiva}
              </span>
              {!preguntaActiva.es_brovision && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{
                    color: "#fbc900",
                    border: "1px solid #fbc900",
                    background: "rgba(251,201,0,0.1)",
                    textShadow: "0 0 6px #fbc900",
                    letterSpacing: "0.5px",
                  }}
                >
                  PUBLICIDAD
                </span>
              )}
            </div>

            <p
              className="leading-relaxed text-center"
              style={{
                color: "#ffffff",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "1.2rem",
                fontWeight: 500,
                textShadow: "0 0 10px rgba(0,242,255,0.4), 0 0 20px rgba(0,242,255,0.2)",
                letterSpacing: "0.3px",
              }}
            >
              {preguntaActiva.pregunta}
            </p>

            <div className="flex flex-col items-center gap-2 mt-3">
              <div style={{
                color: '#facc15',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                textAlign: 'center',
                marginBottom: 2,
              }}>
                A · VERDADERO
              </div>
              <button
                onClick={() => handleResponder(true)}
                disabled={cooldown}
                style={{ width: "50%", cursor: cooldown ? "default" : "pointer" }}
                onMouseEnter={() => setHoveredBtn('a')}
                onMouseLeave={() => setHoveredBtn(null)}
              >
                <img
                  src={imgVerdadero}
                  alt="Verdadero"
                  className="w-full rounded-lg"
                  style={{
                    transform: hoveredBtn === 'a' ? 'scale(1.12)' : 'scale(1)',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </button>
              <div style={{
                color: '#39FF14',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                textAlign: 'center',
                marginBottom: 2,
              }}>
                B · FALSO
              </div>
              <button
                onClick={() => handleResponder(false)}
                disabled={cooldown}
                style={{ width: "50%", cursor: cooldown ? "default" : "pointer" }}
                onMouseEnter={() => setHoveredBtn('b')}
                onMouseLeave={() => setHoveredBtn(null)}
              >
                <img
                  src={imgFalso}
                  alt="Falso"
                  className="w-full rounded-lg"
                  style={{
                    transform: hoveredBtn === 'b' ? 'scale(1.12)' : 'scale(1)',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </button>
            </div>

            {resultado === "acierto" && (
              <div
                className="text-center text-sm font-bold animate-pulse mt-3"
                style={{
                  color: NEON_GREEN,
                  textShadow: `0 0 10px ${NEON_GREEN}`,
                  marginBottom: 0,
                  paddingBottom: 0,
                }}
              >
                +&#x1F48E; Acierto
              </div>
            )}
            {resultado === "fallo" && (
              <div
                className="text-center text-sm font-bold animate-pulse mt-3"
                style={{
                  color: NEON_RED,
                  textShadow: `0 0 10px ${NEON_RED}`,
                  marginBottom: 0,
                  paddingBottom: 0,
                }}
              >
                &#x1F9F9; Fallo
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}