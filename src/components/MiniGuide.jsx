// src/components/MiniGuide.jsx
// Ruta sugerida: /mini-guide
// Acceso desde: Puerta Lateral Izquierda → botón "Mini Bro7Vision"

import { useState, useEffect } from "react";

const PACKS = [
  {
    id: "minilite",
    icon: "⬡",
    nombre: "MiniLite",
    tag: "Creadores de Contenido",
    color: "#00f5ff",
    colorBg: "rgba(0,245,255,0.06)",
    colorBorder: "rgba(0,245,255,0.25)",
    desc: "Emite tus videos, audios y blog en Bro7Vision. Sin productos, sin comercio. Solo contenido.",
    features: [
      "Video horizontal 16:9 y vertical 9:16",
      "Audio — música o podcast",
      "BroBlog con artículos propios",
      "BroTweet para mensajes cortos a tu comunidad",
      "HoloPrisma — cubo 3D con tus imágenes",
      "Recibe mensajes de tus seguidores",
      "Redes sociales vinculadas",
    ],
  },
  {
    id: "minimax",
    icon: "◈",
    nombre: "MiniMax",
    tag: "Comercios y Profesionales",
    color: "#bf00ff",
    colorBg: "rgba(191,0,255,0.06)",
    colorBorder: "rgba(191,0,255,0.25)",
    desc: "Todo lo del MiniLite más la gestión completa de productos, servicios y descuentos lunares para atraer clientes.",
    features: [
      "Todo lo incluido en MiniLite",
      "Hasta 3 productos o servicios destacados en campaña",
      "Catálogo completo de referencias",
      "Semáforo de Moon Cupones — descuentos sincronizados con la luna",
      "Gestión de alcance: local, nacional o internacional",
      "Pagos directos via Stripe o PayPal — sin comisión para Bro7Vision",
      "Página de productos independiente",
    ],
  },
];

const PASOS = [
  {
    num: "01",
    titulo: "Descarga tu paquete",
    desc: "Elige el paquete que se adapta a tu perfil — MiniLite si eres creador de contenido, MiniMax si tienes comercio o servicios. Recibirás un archivo comprimido con todo lo necesario.",
    icon: "📦",
  },
  {
    num: "02",
    titulo: "Sube tu contenido",
    desc: "Sube tus videos e imágenes a Cloudflare R2 (gratuito, 10 GB para usar) o a cualquier servicio que prefieras — Catbox, Dropbox, Google Fotos, Imgur. Lo que importa es tener una URL pública.",
    icon: "☁️",
  },
  {
    num: "03",
    titulo: "Pega los enlaces en tu Studio html",
    desc: "Abre el archivo Studio de tu paquete, rellena tus datos y pega las URLs de tu contenido. Sin instalaciones, sin código — solo formulario.",
    icon: "🔗",
  },
  {
    num: "04",
    titulo: "Proyecta a Bro7Vision",
    desc: "Pulsa el botón Proyectar. Tus datos vuelan seguros a Bro7Vision, que los recibe, verifica y activa tu presencia en la plataforma automáticamente.",
    icon: "🚀",
  },
  {
    num: "05",
    titulo: "Publica tu web",
    desc: "Sube los archivos a Cloudflare Pages, Vercel o similares o con tu propio dominio. En menos de 5 minutos tienes una web propia activa. Si ya tienes web, simplemente añade los archivos a una subcarpeta.",
    icon: "🌐",
  },
];

const HOSTING = [
  {
    nombre: "Cloudflare Pages",
    nivel: "Recomendado",
    url: "tunombre.pages.dev",
    coste: "Gratis",
    color: "#f97316",
    desc: "La misma infraestructura que usa Bro7Vision. 10 GB en R2 para tus archivos. La guía oficial está preparada para este entorno.",
  },
  {
    nombre: "Vercel",
    nivel: "Alternativa",
    url: "tunombre.vercel.app",
    coste: "Gratis",
    color: "#ffffff",
    desc: "Muy sencillo de usar. Ideal si ya tienes cuenta en GitHub. Sube tus archivos y en segundos tienes la web activa.",
  },
  {
    nombre: "Tu web propia",
    nivel: "Integración",
    url: "tuweb.com/brovision",
    coste: "Tu dominio actual",
    color: "#00f5ff",
    desc: "Si ya tienes web, añade los archivos del paquete en una subcarpeta y coloca un botón de acceso. Sin conflictos con tu sitio existente.",
  },
  {
    nombre: "Dominio Fundador",
    nivel: "Primeros 500",
    url: "tunombre.bro7vision.com",
    coste: "Gratis — beneficio exclusivo",
    color: "#fbbf24",
    desc: "Los primeros 500 Fundadores de Bro7Vision reciben un subdominio propio dentro de la plataforma sin coste adicional.",
  },
];

export default function MiniGuide({ onClose }) {
  const [seccionActiva, setSeccionActiva] = useState("que-es");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 30);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const secciones = [
    { id: "que-es",   label: "¿Qué es?" },
    { id: "paquetes", label: "Paquetes" },
    { id: "pasos",    label: "Paso a paso" },
    { id: "hosting",  label: "Dónde publicar" },
    { id: "ia",       label: "Ayuda con IA" },
  ];

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{
        background: "transparent",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      {/* ── VIDEO DE FONDO ── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        src="https://media.bro7vision.com/miniguide.mp4"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* ── FONDO DECORATIVO ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,245,255,0.07) 0%, transparent 70%)",
        zIndex: 2,
      }} />
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        zIndex: 2,
      }} />

      {/* ── HEADER ── */}
      <div style={{
        borderBottom: "1px solid rgba(0,245,255,0.1)",
        padding: "16px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "transparent",
        backdropFilter: "blur(20px)",
        position: "relative",
        zIndex: 10,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ fontSize: "22px" }}>⬡</span>
          <div>
             <div style={{
               fontFamily: FONT_STACK,
               fontSize: "20px",
               fontWeight: 700,
               color: "#00f5ff",
               letterSpacing: "2px",
               textShadow: "0 0 6px rgba(0,245,255,0.5)",
             }}>
               Mini Bro7Vision
             </div>
             <div style={{
               fontFamily: FONT_STACK,
               fontSize: "12px",
               color: "rgba(232,244,255,0.6)",
               letterSpacing: "1px",
             }}>
              Guía de paquetes y publicación
            </div>
          </div>
        </div>
        <button
          onClick={handleClose}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            color: "rgba(232,244,255,0.6)",
            padding: "8px 16px",
            fontSize: "12px",
            fontFamily: FONT_STACK,
            cursor: "pointer",
            letterSpacing: "1px",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.1)"; e.target.style.color = "#fff"; }}
          onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.05)"; e.target.style.color = "rgba(232,244,255,0.6)"; }}
        >
          Cerrar
        </button>
      </div>

      {/* ── NAV SECCIONES ── */}
      <div style={{
        display: "flex",
        gap: "4px",
        padding: "12px 28px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "transparent",
        backdropFilter: "blur(12px)",
        flexShrink: 0,
        overflowX: "auto",
        position: "relative",
        zIndex: 10,
      }}>
        {secciones.map(s => (
          <button
             key={s.id}
             onClick={() => setSeccionActiva(s.id)}
             style={{
               padding: "8px 16px",
               borderRadius: "20px",
               border: seccionActiva === s.id
                 ? "1px solid rgba(0,245,255,0.5)"
                 : "1px solid rgba(255,255,255,0.07)",
               background: seccionActiva === s.id
                 ? "rgba(0,245,255,0.08)"
                 : "transparent",
               color: seccionActiva === s.id
                 ? "#00f5ff"
                 : "rgba(232,244,255,0.4)",
               fontFamily: FONT_STACK,
               fontSize: "13px",
               cursor: "pointer",
               transition: "all 0.2s",
               whiteSpace: "nowrap",
               letterSpacing: "0.5px",
             }}
           >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── CONTENIDO ── */}
      <div className="mini-guide-content" style={{
        flex: 1,
        overflowY: "auto",
        padding: "40px 28px 80px",
        position: "relative",
        zIndex: 5,
        width: "100%",
      }}>

        {/* ══ ¿QUÉ ES? ══ */}
        {seccionActiva === "que-es" && (
          <div style={{ animation: "fadeUp 0.4s ease both" }}>

            <h1 style={{
              fontFamily: FONT_STACK,
              fontSize: "clamp(28px, 5vw, 40px)",
              fontWeight: 700,
              color: "#e8f4ff",
              marginBottom: "12px",
              lineHeight: 1.3,
              textShadow: "0 0 8px rgba(232,244,255,0.4)",
            }}>
              Tu contenido, tu infraestructura.
              <br />
              <span style={{ color: "#00f5ff" }}>Bro7Vision solo lo emite.</span>
            </h1>

            <p style={bodyStyle}>
              Bro7Vision ha tomado una decisión estratégica: <strong style={{ color: "#e8f4ff" }}>no alojar el contenido de sus usuarios</strong>. 
              Esto no es una limitación — es una filosofía. Al no depender de los servidores de Bro7Vision para tus archivos, 
              tienes libertad total para elegir dónde viven tus videos, imágenes y audios. 
              Puedes cambiar de proveedor en cualquier momento sin perder tu presencia en la plataforma.
            </p>

            <p style={bodyStyle}>
              El resultado es un sistema más ligero, más barato de mantener y <strong style={{ color: "#e8f4ff" }}>más soberano para ti</strong>. 
              Bro7Vision actúa como orquestador: recibe la señal de tu contenido a través de tus enlaces 
              y lo emite junto al de los demás usuarios en los sectores correspondientes.
            </p>

            {/* CALLOUT — qué significa embeber */}
            <div style={{
              background: "rgba(0,245,255,0.04)",
              border: "1px solid rgba(0,245,255,0.2)",
              borderLeft: "3px solid #00f5ff",
              borderRadius: "0 12px 12px 0",
              padding: "18px 22px",
              margin: "28px 0",
            }}>
              <div style={{
                fontFamily: "'Georgia', serif",
                fontSize: "11px",
                color: "#00f5ff",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}>
                ¿Qué significa embeber?
              </div>
              <p style={{ ...bodyStyle, marginBottom: 0 }}>
                Embeber significa que Bro7Vision <strong style={{ color: "#e8f4ff" }}>lee el enlace de tu contenido</strong> y 
                lo muestra dentro de la plataforma como si fuera propio, 
                sin descargarlo ni almacenarlo. Tu video sigue viviendo en tu servidor — 
                Bro7Vision simplemente lo proyecta para tus visitantes.
              </p>
            </div>

            <p style={bodyStyle}>
              Para hacer esto posible, Bro7Vision te entrega dos paquetes de descarga — 
              archivos HTML estáticos que funcionan como tu panel de control personal y como tu página web pública. 
              Sin bases de datos propias, sin servidores que mantener. 
              Una migración completa te lleva menos de 5 minutos.
            </p>

            <div style={{
              display: "flex",
              gap: "12px",
              marginTop: "32px",
              flexWrap: "wrap",
            }}>
              {[
                { icon: "🔒", texto: "Tus archivos, tu propiedad" },
                { icon: "🔄", texto: "Cambia de proveedor sin perder nada" },
                { icon: "⚡", texto: "Sin servidores propios que mantener" },
                { icon: "🌐", texto: "Tu propio dominio si quieres" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "10px",
                  fontFamily: "'Georgia', serif",
                  fontSize: "12px",
                  color: "rgba(232,244,255,0.7)",
                }}>
                  <span>{item.icon}</span>
                  {item.texto}
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ══ PAQUETES ══ */}
        {seccionActiva === "paquetes" && (
          <div style={{ animation: "fadeUp 0.4s ease both" }}>

            <h2 style={h2Style}>Elige tu paquete</h2>
            <p style={bodyStyle}>
              Bro7Vision ofrece dos paquetes de descarga según tu perfil. 
              Ambos son gratuitos, de código abierto y completamente tuyos una vez descargados.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "28px" }}>
              {PACKS.map(pack => (
                <div key={pack.id} style={{
                  background: pack.colorBg,
                  border: `1px solid ${pack.colorBorder}`,
                  borderRadius: "16px",
                  padding: "28px",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: "2px",
                    background: `linear-gradient(90deg, transparent, ${pack.color}, transparent)`,
                  }} />
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "16px" }}>
                    <span style={{ fontSize: "28px", lineHeight: 1 }}>{pack.icon}</span>
                    <div>
                      <div style={{
                        fontFamily: "'Georgia', serif",
                        fontSize: "20px",
                        fontWeight: 700,
                        color: pack.color,
                        marginBottom: "4px",
                      }}>
                        {pack.nombre}
                      </div>
                      <div style={{
                        fontFamily: "'Georgia', serif",
                        fontSize: "11px",
                        color: "rgba(232,244,255,0.4)",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                      }}>
                        {pack.tag}
                      </div>
                    </div>
                  </div>

                  <p style={{ ...bodyStyle, marginBottom: "20px" }}>{pack.desc}</p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {pack.features.map((f, i) => (
                      <div key={i} style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        fontFamily: "'Georgia', serif",
                        fontSize: "15px",
                        color: "rgba(232,244,255,0.75)",
                        lineHeight: 1.5,
                      }}>
                        <span style={{ color: pack.color, flexShrink: 0, marginTop: "2px" }}>✦</span>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* FUNCIONES COMUNES */}
            <div style={{
              marginTop: "28px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "14px",
              padding: "22px 24px",
            }}>
              <div style={{
                fontFamily: "'Georgia', serif",
                fontSize: "11px",
                color: "rgba(232,244,255,0.4)",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "14px",
              }}>
                Ambos paquetes incluyen además
              </div>
              {[
                "Señales en directo si configuras OBS u otro software compatible",
                "Bucle de múltiples videos por visor — próximamente disponible",
                "Página web estática lista para publicar con tu dominio",
                "Prompt de IA incluido para ayudarte en la configuración técnica",
                "Botón de vuelta a Bro7Vision integrado",
              ].map((f, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  fontFamily: "'Georgia', serif",
                  fontSize: "15px",
                  color: "rgba(232,244,255,0.6)",
                  lineHeight: 1.6,
                  marginBottom: "6px",
                }}>
                  <span style={{ color: "rgba(232,244,255,0.3)", flexShrink: 0 }}>—</span>
                  {f}
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ══ PASO A PASO ══ */}
        {seccionActiva === "pasos" && (
          <div style={{ animation: "fadeUp 0.4s ease both" }}>

            <h2 style={h2Style}>Cómo empezar</h2>
            <p style={bodyStyle}>
              El proceso completo desde cero hasta tener tu presencia activa en Bro7Vision 
              con tu propio dominio toma menos de una hora la primera vez.
            </p>

            <div style={{ marginTop: "32px", position: "relative" }}>

              {/* Línea vertical conectora */}
              <div style={{
                position: "absolute",
                left: "28px",
                top: "40px",
                bottom: "40px",
                width: "1px",
                background: "linear-gradient(180deg, rgba(0,245,255,0.4), rgba(0,245,255,0.05))",
              }} />

              {PASOS.map((paso, i) => (
                <div key={i} style={{
                  display: "flex",
                  gap: "24px",
                  marginBottom: "32px",
                  position: "relative",
                }}>
                  {/* Número */}
                  <div style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "rgba(0,245,255,0.06)",
                    border: "1px solid rgba(0,245,255,0.3)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    position: "relative",
                    zIndex: 2,
                  }}>
                    <span style={{ fontSize: "18px", lineHeight: 1 }}>{paso.icon}</span>
                    <span style={{
                      fontFamily: "'Georgia', serif",
                      fontSize: "9px",
                      color: "rgba(0,245,255,0.6)",
                      letterSpacing: "1px",
                      marginTop: "2px",
                    }}>
                      {paso.num}
                    </span>
                  </div>

                  {/* Contenido */}
                  <div style={{ paddingTop: "8px" }}>
                    <div style={{
                      fontFamily: "'Georgia', serif",
fontSize: "18px",
                      fontWeight: 700,
                      color: "#e8f4ff",
                      marginBottom: "8px",
                      letterSpacing: "0.5px",
                    }}>
                      {paso.titulo}
                    </div>
                    <p style={{ ...bodyStyle, marginBottom: 0 }}>{paso.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* NOTA SOBRE SUBIDA DE ARCHIVOS */}
            <div style={{
              background: "rgba(191,0,255,0.04)",
              border: "1px solid rgba(191,0,255,0.2)",
              borderLeft: "3px solid #bf00ff",
              borderRadius: "0 12px 12px 0",
              padding: "18px 22px",
              marginTop: "12px",
            }}>
              <div style={{
                fontFamily: "'Georgia', serif",
                fontSize: "11px",
                color: "#bf00ff",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}>
                Sobre la subida de archivos
              </div>
              <p style={{ ...bodyStyle, marginBottom: 0 }}>
                El Studio de tu paquete <strong style={{ color: "#e8f4ff" }}>no sube archivos directamente</strong> — 
                trabaja solo con URLs públicas. Esto es intencional: tú controlas dónde viven tus archivos. 
                Sube primero a R2 de Cloudflare o a cualquier servicio público, 
                obtén la URL y pégala en el Studio. Si mañana cambias de proveedor, 
                cambias la URL en el Studio y vuelves a proyectar. 
                Tu contenido en Bro7Vision se actualizará luego de la revisión.
              </p>
            </div>

          </div>
        )}

        {/* ══ DÓNDE PUBLICAR ══ */}
        {seccionActiva === "hosting" && (
          <div style={{ animation: "fadeUp 0.4s ease both" }}>

            <h2 style={h2Style}>Dónde publicar tu paquete</h2>
            <p style={bodyStyle}>
              Tu paquete es un conjunto de archivos HTML estáticos — 
              no necesita servidor, no necesita base de datos propia. 
              Cualquier servicio de hosting estático lo puede alojar. 
              Estas son las opciones recomendadas:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "28px" }}>
              {HOSTING.map((h, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid rgba(255,255,255,0.07)`,
                  borderLeft: `3px solid ${h.color}`,
                  borderRadius: "0 14px 14px 0",
                  padding: "20px 22px",
                  display: "flex",
                  gap: "20px",
                  alignItems: "flex-start",
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
                      <span style={{
                        fontFamily: "'Georgia', serif",
                        fontSize: "15px",
                        fontWeight: 700,
                        color: h.color,
                      }}>
                        {h.nombre}
                      </span>
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: "20px",
                        background: `${h.color}15`,
                        border: `1px solid ${h.color}40`,
                        fontFamily: "'Georgia', serif",
                        fontSize: "10px",
                        color: h.color,
                        letterSpacing: "0.5px",
                      }}>
                        {h.nivel}
                      </span>
                    </div>
                    <div style={{
                      fontFamily: "monospace",
fontSize: "15px",
                      color: "rgba(232,244,255,0.35)",
                      marginBottom: "8px",
                      letterSpacing: "0.5px",
                    }}>
                      {h.url}
                    </div>
                    <p style={{ ...bodyStyle, marginBottom: "8px" }}>{h.desc}</p>
                    <div style={{
                      fontFamily: "'Georgia', serif",
                      fontSize: "11px",
                      color: "rgba(232,244,255,0.35)",
                      letterSpacing: "0.5px",
                    }}>
                      Coste: <span style={{ color: h.color }}>{h.coste}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* NOTA CLOUDFLARE R2 */}
            <div style={{
              background: "rgba(249,115,22,0.04)",
              border: "1px solid rgba(249,115,22,0.2)",
              borderRadius: "14px",
              padding: "20px 22px",
              marginTop: "24px",
            }}>
              <div style={{
                fontFamily: "'Georgia', serif",
                fontSize: "11px",
                color: "#f97316",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}>
                Cloudflare R2 — almacenamiento de archivos
              </div>
              <p style={{ ...bodyStyle, marginBottom: 0 }}>
                Bro7Vision usa Cloudflare para sus propios archivos y lo recomienda por su generosidad — 
                <strong style={{ color: "#e8f4ff" }}> 10 GB gratuitos</strong>, sin costes por ancho de banda 
                y con URLs públicas inmediatas. No es obligatorio: cualquier servicio con URL pública funciona. 
                Sin embargo, la guía paso a paso que ofrecemos está preparada específicamente para Cloudflare Pages + R2, 
                por lo que el proceso será más fluido si lo usas.
              </p>
            </div>

          </div>
        )}

        {/* ══ AYUDA CON IA ══ */}
        {seccionActiva === "ia" && (
          <div style={{ animation: "fadeUp 0.4s ease both" }}>

            <h2 style={h2Style}>Instala tu paquete con ayuda de IA</h2>
            <p style={bodyStyle}>
              Cada paquete de Bro7Vision incluye un prompt especialmente diseñado para que puedas 
              copiarlo y pegarlo en Claude, Gemini o cualquier IA conversacional. 
              La IA te guiará paso a paso en tu idioma y según tu nivel técnico.
            </p>

            {/* PROMPT MINILITE */}
            <div style={{
              background: "rgba(0,245,255,0.03)",
              border: "1px solid rgba(0,245,255,0.15)",
              borderRadius: "14px",
              padding: "24px",
              marginTop: "28px",
              marginBottom: "20px",
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
                flexWrap: "wrap",
                gap: "10px",
              }}>
                <div style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: "15px",
                  color: "#00f5ff",
                  fontWeight: 700,
                  letterSpacing: "1px",
                }}>
                  ⬡ Prompt para MiniLite
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(PROMPT_MINILITE);
                    alert("¡Prompt copiado! Pégalo en Claude, Gemini o tu IA favorita.");
                  }}
                  style={{
                    padding: "7px 14px",
                    background: "rgba(0,245,255,0.08)",
                    border: "1px solid rgba(0,245,255,0.3)",
                    borderRadius: "8px",
                    color: "#00f5ff",
                    fontFamily: "'Georgia', serif",
                    fontSize: "11px",
                    cursor: "pointer",
                    letterSpacing: "1px",
                    transition: "all 0.2s",
                  }}
                >
                  Copiar prompt
                 </button>
               </div>
               <pre style={{
                 fontFamily: "monospace",
                 fontSize: "12px",
                 color: "rgba(232,244,255,0.7)",
                 lineHeight: 1.7,
                 whiteSpace: "pre-wrap",
                 wordBreak: "break-word",
                 margin: 0,
               }}>
                 {PROMPT_MINILITE}
               </pre>
             </div>

             {/* PROMPT MINIMAX */}
            <div style={{
              background: "rgba(191,0,255,0.03)",
              border: "1px solid rgba(191,0,255,0.15)",
              borderRadius: "14px",
              padding: "24px",
              marginBottom: "28px",
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
                flexWrap: "wrap",
                gap: "10px",
              }}>
                <div style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: "15px",
                  color: "#bf00ff",
                  fontWeight: 700,
                  letterSpacing: "1px",
                }}>
                  ◈ Prompt para MiniMax
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(PROMPT_MINI);
                    alert("¡Prompt copiado! Pégalo en Claude, Gemini o tu IA favorita.");
                  }}
                  style={{
                    padding: "7px 14px",
                    background: "rgba(191,0,255,0.08)",
                    border: "1px solid rgba(191,0,255,0.3)",
                    borderRadius: "8px",
                    color: "#bf00ff",
                    fontFamily: "'Georgia', serif",
                    fontSize: "11px",
                    cursor: "pointer",
                    letterSpacing: "1px",
                    transition: "all 0.2s",
                  }}
                >
                   Copiar prompt
                 </button>
               </div>
               <pre style={{
                 fontFamily: "monospace",
                 fontSize: "12px",
                 color: "rgba(232,244,255,0.7)",
                 lineHeight: 1.7,
                 whiteSpace: "pre-wrap",
                 wordBreak: "break-word",
                 margin: 0,
               }}>
                 {PROMPT_MINI}
               </pre>
             </div>

            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
              padding: "18px 20px",
            }}>
              <p style={{ ...bodyStyle, marginBottom: 0 }}>
                <strong style={{ color: "#e8f4ff" }}>Consejo:</strong> antes de pegar el prompt, 
                descarga tu paquete y abre los archivos para que puedas seguir las instrucciones 
                en tiempo real. La IA puede ver los errores que te aparezcan en pantalla 
                si los copias en el chat.
              </p>
            </div>

          </div>
        )}

      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mini-guide-content {
          scrollbar-width: thin;
          scrollbar-color: #ff6b00 #333332;
        }
        .mini-guide-content::-webkit-scrollbar {
          width: 8px;
        }
        .mini-guide-content::-webkit-scrollbar-track {
          background: #333332;
          border-radius: 4px;
        }
        .mini-guide-content::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #ff6b00, #ffd700, #ff00ff, #00ffff);
          border-radius: 4px;
          box-shadow: 0 0 8px rgba(0,245,255,0.5), 0 0 4px rgba(255,0,255,0.5);
        }
      `}</style>
    </div>
  );
}

/* ── ESTILOS COMPARTIDOS ── */
const FONT_STACK = "'Inter', -apple-system, 'SF Pro Display', 'San Francisco', 'Segoe UI', 'Roboto', sans-serif";

const bodyStyle = {
  fontFamily: FONT_STACK,
  fontSize: "17px",
  color: "rgba(232,244,255,0.9)",
  lineHeight: 1.8,
  marginBottom: "16px",
};

const h2Style = {
  fontFamily: FONT_STACK,
  fontSize: "28px",
  fontWeight: 700,
  color: "#e8f4ff",
  marginBottom: "14px",
  letterSpacing: "0.5px",
  textShadow: "0 0 8px rgba(232,244,255,0.4)",
};

/* ── PROMPTS ── */
const PROMPT_MINILITE = `Hola, soy creador de contenido en la red Bro7Vision y necesito ayuda para configurar mi MiniLite.

Mi MiniLite es un paquete de archivos HTML estáticos para emitir mis videos, audios y blog en Bro7Vision. No tiene productos ni servicios.

Necesito ayuda con:
1. Subir mis imágenes (avatar, banner, HoloPrisma) a Cloudflare R2 y obtener las URLs públicas
2. Configurar mis videos y cómo obtener la URL de embed.
3. Subir mi audio a R2 o SoundCloud y obtener la URL directa del archivo
4. Desplegar el MiniLite en Cloudflare Pages y vincular mi dominio si tengo uno
5. Entender cómo funciona el botón Proyectar y qué hace exactamente

Por favor guíame paso a paso según mi nivel. Puedo ir copiándote los errores que me aparezcan.`;

const PROMPT_MINI = `Hola, soy comercio o profesional en la red Bro7Vision y necesito ayuda para configurar mi MiniMax.

Mi MiniMax es el paquete completo con productos, servicios y descuentos lunares (Moon Cupones).

Necesito ayuda con:
1. Subir imágenes de productos y el banner a Cloudflare R2 y obtener URLs públicas
2. Configurar mis videos embed R2 directo.
3. Conectar Stripe o PayPal para los links de pago de cada producto o servicio
4. Configurar el semáforo de Moon Cupones — qué fases activar para cada producto
5. Desplegar en Cloudflare Pages con mi dominio de comercio
6. Entender el flujo completo: Studio → Proyectar → Bro7Vision → cliente

Por favor guíame paso a paso. Puedo ir copiándote los errores que me aparezcan.`;
