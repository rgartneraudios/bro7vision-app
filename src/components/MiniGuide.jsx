import { useState } from "react";

const C = {
  bg:        "#262524",
  bgCard:    "rgba(86,84,102,0.25)",
  bgInner:   "rgba(86,84,102,0.15)",
  border:    "rgba(217,193,202,0.12)",
  borderAcc: "rgba(217,193,202,0.35)",
  rosa:      "#D9C1CA",
  rosaAlpha: "rgba(202,176,193,0.8)",
  crema:     "#E3DCD3",
  cremaAlpha:"rgba(204,196,182,0.8)",
  muted:     "rgba(204,196,182,0.45)",
  green:     "#22c55e",
  amber:     "#f59e0b",
  red:       "#ef4444",
  accent:    "rgba(217,193,202,0.15)",
  accentHov: "rgba(217,193,202,0.25)",
  codeBg:    "rgba(20,18,17,0.98)",
};

const TABS = [
  { id: "r2",       label: "Cloudflare R2",     icon: "☁️" },
  { id: "enlaces",  label: "Sistema de enlaces", icon: "🔗" },
  { id: "audio",    label: "Audio Móvil",        icon: "📻" },
  { id: "semaforo", label: "Semáforo de emisión",icon: "🚦" },
];

const STEPS_R2 = [
  {
    n: 1,
    title: "Crea tu cuenta gratuita",
    body: <>Ve a <a href="https://dash.cloudflare.com/sign-up" target="_blank" rel="noreferrer" style={{color: C.rosa}}>dash.cloudflare.com/sign-up</a> y regístrate solo con tu email. La cuenta base es completamente gratuita.</>,
  },
  {
    n: 2,
    title: "Activa R2 Object Storage",
    body: "En el panel lateral izquierdo busca «R2 Object Storage». La primera vez te pedirá aceptar los términos. El plan gratuito incluye 10 GB de almacenamiento. Sin tarjeta.",
  },
  {
    n: 3,
    title: "Crea tu Bucket",
    body: "Pulsa «Create bucket» y dale un nombre (ej: mi-contenido-brovision). Deja la región en automático. El bucket es como una carpeta raíz donde vivirán todos tus archivos.",
  },
  {
    n: 4,
    title: "Activa el acceso público",
    body: "Dentro del bucket ve a Settings → Public access y activa «Allow Access». Sin esto Brovision no puede cargar tus archivos.",
  },
  {
    n: 5,
    title: "Obtén tu dominio público",
    body: "Cloudflare te asigna automáticamente un dominio tipo pub-xxxx.r2.dev. Ese prefijo más el nombre del archivo forma tu URL pública. También puedes conectar un dominio propio.",
  },
  {
    n: 6,
    title: "Sube un archivo y copia la URL",
    body: "Arrastra tu archivo al bucket. Haz clic sobre él → copia la URL pública. Esa URL es exactamente la que pegas en Booster Studio.",
  },
  {
    n: 7,
    title: "Configura CORS",
    body: <>En Settings → CORS Policy añade esta regla para que Brovision cargue tus archivos sin bloqueos:
      <pre style={{background:C.codeBg,border:`1px solid ${C.border}`,borderRadius:6,padding:"0.75rem 1rem",fontFamily:"monospace",fontSize:"1rem",color:C.rosa,marginTop:"0.75rem",overflowX:"auto",whiteSpace:"pre"}}>
{`AllowedOrigins: https://bro7vision.com
AllowedMethods: GET, HEAD
AllowedHeaders: *
MaxAgeSeconds: 86400`}
      </pre>
    </>,
  },
];

const ALTERNATIVES = [
  {
    name: "Bunny CDN",
    tag: "De pago · muy recomendable",
    tagColor: C.amber,
    desc: "Panel sencillo, muy rápido y con CDN global. Prueba gratuita de 14 días sin tarjeta. Tras el periodo de prueba el coste mínimo es 1$/mes (~1€). Almacenamiento 0,01$/GB por región y transferencia 0,01$/GB en Europa y Norteamérica. Ideal para creadores con volumen que buscan una alternativa profesional.",
    url: "https://bunny.net",
  },
  {
    name: "Postimages",
    tag: "Gratis · solo imágenes",
    tagColor: C.green,
    desc: "Válido para imágenes estáticas (banners, HoloPrisma) mientras configuras tu R2. No sirve para video ni audio.",
    url: "https://postimages.org",
  },
  {
    name: "Catbox.moe",
    tag: "Gratis · archivos generales",
    tagColor: C.green,
    desc: "Acepta imágenes, audio y video. Válido como alternativa temporal. Los archivos pueden desaparecer sin aviso si no tienes cuenta registrada.",
    url: "https://catbox.moe",
  },
];

const SEMA_STATES = [
  {
    color: C.green,
    label: "Verde",
    horario: "Todo el día · sin restricción",
    desc: "Contenido apto para todos los públicos: entretenimiento familiar, cultura, naturaleza, humor blanco, música instrumental, divulgación, arte. Es el estado por defecto al que aspira toda la plataforma.",
  },
  {
    color: C.amber,
    label: "Amarillo",
    horario: "Desde las 19:00 h",
    desc: "Contenido que puede afectar la sensibilidad de algunos usuarios o que no es recomendable para menores: temáticas adultas sin ser explícitas, humor satírico, crítica social, entretenimiento nocturno, estética oscura.",
  },
  {
    color: C.red,
    label: "Rojo",
    horario: "Desde las 22:00 h",
    desc: "Contenido para adultos con temáticas sensibles, lenguaje explícito o estética muy intensa. No está prohibido, pero se emite únicamente en franja nocturna para respetar a todos los públicos.",
  },
];

const SEMA_STEPS = [
  "Al proyectar por primera vez, Brovision revisa tu contenido y asigna el estado inicial del semáforo.",
  "Ves tu estado actual en Booster Studio → tu perfil. Aparece como un indicador de color junto a tu canal.",
  "Si consideras que tu contenido merece una clasificación distinta, pulsa «Solicitar revisión» en Booster Studio. El equipo lo evalúa y te notifica por email.",
  "Si cambias de tipo de contenido —por ejemplo, pasas de familiar a adulto— comunícalo antes de proyectar para que el semáforo se actualice correctamente.",
];

export default function MiniGuide({ onClose }) {
  const [tab, setTab] = useState("r2");

  return (
    <div style={{position:"fixed", inset:0, zIndex:9999, fontFamily:"'Exo 2', sans-serif", background:"transparent", color:C.crema, width:"100vw", height:"100vh", overflow:"hidden"}}>

      <video
        src="https://media.bro7vision.com/miniguide1.mp4"
        autoPlay loop muted playsInline
        style={{position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", zIndex:0}}
      />

      <button onClick={onClose} style={{
        position:"fixed", top:"1.25rem", right:"1.5rem", zIndex:3,
        background:"rgba(0,0,0,0.6)", border:"1px solid rgba(217,193,202,0.3)",
        borderRadius:"50%", width:"2.8rem", height:"2.8rem",
        display:"flex", alignItems:"center", justifyContent:"center",
        color:C.rosa, fontSize:"1.5rem", cursor:"pointer",
        transition:"all 0.2s", lineHeight:1,
      }}
        onMouseEnter={e => {e.currentTarget.style.background="rgba(217,193,202,0.2)"; e.currentTarget.style.borderColor=C.rosa}}
        onMouseLeave={e => {e.currentTarget.style.background="rgba(0,0,0,0.6)"; e.currentTarget.style.borderColor="rgba(217,193,202,0.3)"}}
      >✕</button>

      <div style={{
        position:"relative", zIndex:2,
        width:"100%", height:"100%",
        display:"flex", flexDirection:"column",
        padding:"2rem 3rem",
      }}>
        <div style={{textAlign:"center", marginBottom:"1rem", flexShrink:0}}>
          <h1 style={{fontSize:"2.2rem", fontWeight:700, color:C.rosa, letterSpacing:"0.06em", margin:"0 0 0.25rem", textTransform:"uppercase"}}>
             Guía del Creador
          </h1>
          <p style={{color:C.muted, fontSize:"1.1rem", margin:0}}>Todo lo que necesitas para proyectar en Brovision</p>
        </div>

        <div style={{display:"flex", gap:"0.75rem", marginBottom:"1.25rem", borderBottom:`1px solid ${C.border}`, flexWrap:"wrap", flexShrink:0}}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                background: "none", border: "none",
                borderBottom: tab === t.id ? `2px solid ${C.rosa}` : "2px solid transparent",
                color: tab === t.id ? C.rosa : C.muted,
                fontFamily: "'Exo 2', sans-serif", fontSize:"1.1rem", fontWeight:600,
                padding:"0.6rem 1.2rem", cursor:"pointer", marginBottom:"-1px",
                letterSpacing:"0.03em", transition:"color 0.2s, border-color 0.2s",
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="mini-guide-scroll" style={{flex:1, overflowY:"auto", paddingRight:"1rem"}}>
          {tab === "r2" && (
            <div>
              <SectionTitle>¿Por qué Cloudflare R2?</SectionTitle>
              <Tip>
        Bro7vision solicita enlaces para emitir tu contenido. Dichos enlaces los ubicas en tu Booster Studio. Para ello necesitas una plataforma de almacenamiento que Bro7vision no ofrece. Con Cloudflare R2 puedes tener una web propia con un espacio de almacenamiento generoso y además no tendrás que pagar un dominio propio, ya que Cloudflare te dará un dominio público. Es una oferta difícil de rechazar .Cloudflare R2 te da <strong style={{color:C.rosa}}>10 GB gratuitos</strong> para alojar tus videos, audios e imágenes. El contenido vive en <strong style={{color:C.rosa}}>tu cuenta, no en los servidores de Bro7vision</strong>. Si mañana cambias de plataforma, solo actualizas las URLs en Booster Studio y proyectas de nuevo. Migración en menos de 5 minutos. <strong style={{color:C.rosa}}>La IA te guía paso a paso</strong> Hoy en día cualquier IA conoce a CloudFlare y conoce su sistema. Te recomendamos que solicites una guía paso a paso para que sea todo más sencillo. 
              </Tip>

              <Notice>
                ⚠ <strong style={{color:C.rosa}}>Propiedad intelectual:</strong> Sube únicamente contenido propio o con licencia libre (CC). No está permitido subir música, videos o imágenes con derechos de terceros. El contenido hecho con IA generativa, tus propios podcasts o tu música original son bienvenidos.
              </Notice>

              <SectionTitle>Crea tu cuenta paso a paso</SectionTitle>
              {STEPS_R2.map(s => <Step key={s.n} n={s.n} title={s.title}>{s.body}</Step>)}

              <Tip>
                <strong style={{color:C.rosa}}>La IA es tu copiloto.</strong> Si algo no está claro copia esta pregunta en Claude, Gemini, ChatGPT o Copilot:
                <pre style={{background:C.codeBg, border:`1px solid ${C.border}`, borderRadius:6, padding:"0.75rem 1rem", fontFamily:"monospace", fontSize:"1rem", color:C.rosa, marginTop:"0.75rem", whiteSpace:"pre", overflowX:"auto"}}>
{`Tengo una cuenta en Cloudflare R2. Ayúdame a:
1. Crear un bucket llamado [nombre]
2. Activar el acceso público
3. Configurar una CORS Policy para https://bro7vision.com
Explícamelo paso a paso con descripciones detalladas.`}
                </pre>
              </Tip>

              <SectionTitle>Archivos grandes en Windows (más de 300 MB)</SectionTitle>
              <Tip>
                El panel web de R2 tiene un límite de 300 MB. Para archivos más grandes descarga <strong style={{color:C.rosa}}>Cyberduck</strong> (el del patito de goma), gratis para Windows y Mac en <a href="https://cyberduck.io" target="_blank" rel="noreferrer" style={{color:C.rosa}}>cyberduck.io</a>. Conecta con tus credenciales de R2 y arrastra los archivos directamente desde tu explorador. Sin límite de tamaño.
              </Tip>

              <SectionTitle>Alternativas si prefieres no usar R2</SectionTitle>
              {ALTERNATIVES.map(a => (
                <div key={a.name} style={{background:C.bgInner, border:`1px solid ${C.border}`, borderRadius:10, padding:"1.25rem 1.5rem", marginBottom:"1rem"}}>
                  <div style={{display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"0.5rem"}}>
                    <span style={{fontWeight:700, fontSize:"1.2rem", color:C.crema}}>{a.name}</span>
                    <span style={{fontSize:"0.9rem", fontWeight:600, padding:"0.2rem 0.6rem", borderRadius:99, background:"rgba(255,255,255,0.05)", color:a.tagColor}}>{a.tag}</span>
                  </div>
                  <p style={{fontSize:"1.05rem", color:C.muted, lineHeight:1.6, margin:"0 0 0.5rem"}}>{a.desc}</p>
                  <a href={a.url} target="_blank" rel="noreferrer" style={{fontSize:"1rem", color:C.rosa, textDecoration:"none"}}>→ {a.url}</a>
                </div>
              ))}
              <Tip>Para videos, R2 o Bunny son las opciones más estables. Evita Dropbox o Google Drive: los enlaces cambian con el tiempo y rompen la proyección.</Tip>
            </div>
          )}

          {tab === "enlaces" && (
            <div>
              <SectionTitle>Cómo funciona</SectionTitle>
              <Tip>
                Bro7vision no almacena tu contenido. <strong style={{color:C.rosa}}>Actúa como emisor</strong>: lee las URLs que tú le das y las muestra en los visores de la plataforma. El contenido es tuyo, siempre.
              </Tip>

              <SectionTitle>Flujo completo</SectionTitle>
              <div style={{display:"flex", flexDirection:"column", margin:"1rem 0"}}>
                {[
                  "Subes el archivo a R2 (o tu hosting elegido)",
                  "Copias la URL pública del archivo",
                  "Pegas la URL en Booster Studio",
                  "Pulsas el botón de proyección del bloque correspondiente",
                  "Brovision emite tu contenido en tiempo real",
                ].map((text, i) => (
                  <div key={i} style={{display:"flex", alignItems:"center", gap:"0.75rem", padding:"0.85rem 1.25rem", background:C.bgInner, border:`1px solid ${C.border}`, borderTop: i > 0 ? "none" : `1px solid ${C.border}`, borderRadius: i === 0 ? "8px 8px 0 0" : i === 4 ? "0 0 8px 8px" : 0}}>
                    <span style={{color:C.rosa, flexShrink:0, fontSize:"1.2rem"}}>{i === 0 ? "▶" : "↓"}</span>
                    <span style={{fontSize:"1.05rem", color:C.cremaAlpha}}>{text}</span>
                  </div>
                ))}
              </div>

              <Notice>Los cambios se reflejan en tiempo real. No hace falta que nadie de Bro7vision apruebe el enlace — solo el semáforo de emisión puede limitar el horario de aparición.</Notice>

              <SectionTitle>Qué puedes proyectar</SectionTitle>
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:"1rem", margin:"1rem 0"}}>
                {[
                  { icon:"📱", label:"Video vertical",    sub:"9:16 · visor PC/TV" },
                  { icon:"🖥️", label:"Video horizontal",  sub:"16:9 · visor PC/TV" },
                  { icon:"🎙️", label:"Audio PC",          sub:"BroLives 3D" },
                  { icon:"📻", label:"Audio Móvil",       sub:"Reproductor central" },
                  { icon:"🔮", label:"HoloPrisma",        sub:"4 imágenes · cubo 3D" },
                  { icon:"💬", label:"BroTwit",           sub:"Mensaje a tu comunidad" },
                  { icon:"✍️", label:"Blog editorial",    sub:"Escrito en Booster Studio" },
                ].map(p => (
                  <div key={p.label} style={{background:C.bgInner, border:`1px solid ${C.border}`, borderRadius:8, padding:"1rem 1.25rem", textAlign:"center"}}>
                    <div style={{fontSize:"2rem", marginBottom:"0.4rem"}}>{p.icon}</div>
                    <div style={{fontSize:"1rem", fontWeight:600, color:C.rosa, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"0.2rem"}}>{p.label}</div>
                    <div style={{fontSize:"0.9rem", color:C.muted}}>{p.sub}</div>
                  </div>
                ))}
              </div>

              <Tip>
                <strong style={{color:C.rosa}}>Blog y BroTwit</strong> se escriben directamente en <strong style={{color:C.rosa}}>Booster Studio</strong>, sin necesidad de alojar nada en R2. El resto del contenido sí requiere una URL pública de tu hosting.
              </Tip>
              <Tip>Bro7vision no descarga ni copia tus archivos. Solo los embebe por URL. Si cambias de hosting, actualizas la URL en Studio y proyectas de nuevo. Sin pérdida de datos, sin dependencia.</Tip>
            </div>
          )}

          {tab === "audio" && (
            <div>
              <SectionTitle>La experiencia radio FM de Bro7vision</SectionTitle>
              <Tip>
                En móvil Brovision no emite los videos de los creadores para ahorrar datos. En su lugar el usuario ve los <strong style={{color:C.rosa}}>videos de fondo de los 9 escenarios del Reality rotando como un salvapantallas</strong> y escucha tu audio. Es una experiencia de radio FM inmersiva: imagen atmosférica + sonido del creador.
              </Tip>

              <Notice>
                Para que la experiencia sea coherente, el audio que elijas debería encajar con la atmósfera visual de los fondos. Un podcast o una música ambiental funcionan especialmente bien.
              </Notice>

              <SectionTitle>Dos opciones para tu Audio Móvil</SectionTitle>

              <div style={{display:"flex", flexDirection:"column", gap:"1rem", margin:"1rem 0"}}>
                <div style={{background:C.bgInner, border:`1px solid ${C.border}`, borderRadius:10, padding:"1.25rem 1.5rem"}}>
                  <div style={{fontWeight:700, color:C.rosa, marginBottom:"0.4rem", fontSize:"1.15rem"}}>Opción A — El mismo mp3 que tu Audio PC</div>
                  <p style={{fontSize:"1.05rem", color:C.cremaAlpha, lineHeight:1.65, margin:0}}>Si ya tienes un audio proyectado en BroLives 3D, puedes usar exactamente esa misma URL en el campo de Audio Móvil de Booster Studio. Un solo archivo, dos destinos. Es la opción más sencilla.</p>
                </div>
                <div style={{background:C.bgInner, border:`1px solid ${C.border}`, borderRadius:10, padding:"1.25rem 1.5rem"}}>
                  <div style={{fontWeight:700, color:C.rosa, marginBottom:"0.4rem", fontSize:"1.15rem"}}>Opción B — Extraer el audio de un video de fondo del Reality</div>
                  <p style={{fontSize:"1.05rem", color:C.cremaAlpha, lineHeight:1.65, margin:0}}>Los 9 escenarios del Reality tienen sus propios videos de fondo. Puedes coger uno de esos videos, extraer su audio en mp3, subirlo a tu R2 y pegarlo como Audio Móvil. Así el sonido encaja perfectamente con lo que el usuario está viendo.</p>
                </div>
              </div>

              <SectionTitle>Cómo convertir un mp4 a mp3</SectionTitle>
              {[
                { n:1, title:"Descarga el video de fondo", body:"Consigue el archivo mp4 del escenario que quieras usar. Puedes pedírselo al equipo de Bro7vision o usar uno de tus propios videos." },
                { n:2, title:"Conviértelo a mp3", body:<>Usa una herramienta online como <a href="https://cloudconvert.com" target="_blank" rel="noreferrer" style={{color:C.rosa}}>CloudConvert</a> o pídele ayuda a Claude, Gemini o ChatGPT con este prompt:<pre style={{background:C.codeBg,border:`1px solid ${C.border}`,borderRadius:6,padding:"0.65rem 0.9rem",fontFamily:"monospace",fontSize:"1rem",color:C.rosa,marginTop:"0.6rem",whiteSpace:"pre-wrap"}}>{"Tengo un archivo mp4 y quiero extraer solo el audio en formato mp3 con buena calidad. ¿Cómo lo hago desde Windows/Mac sin instalar programas complejos?"}</pre></> },
                { n:3, title:"Sube el mp3 a tu R2", body:"Arrastra el archivo mp3 a tu bucket de Cloudflare R2, copia la URL pública y pégala en Booster Studio → Audio Móvil." },
                { n:4, title:"Proyecta", body:"Pulsa «Proyectar Audio Móvil». A partir de ese momento el reproductor central del móvil emitirá tu audio mientras el usuario navega." },
              ].map(s => <Step key={s.n} n={s.n} title={s.title}>{s.body}</Step>)}

              <SectionTitle>Monetización en audio</SectionTitle>
              <Tip>
                Los creadores de audio también pueden recibir <strong style={{color:C.rosa}}>Halos de Luz</strong> de sus fans como reconocimiento. Esta función estará disponible próximamente directamente desde la interfaz móvil. Queda anotado en la hoja de ruta de Brovision.
              </Tip>
            </div>
          )}

          {tab === "semaforo" && (
            <div>
              <SectionTitle>¿Qué es el semáforo?</SectionTitle>
              <Tip>
                Bro7vision quiere ser una plataforma abierta, pero con respeto hacia todos los públicos. El semáforo clasifica tu contenido por sensibilidad y determina en qué franja horaria puede aparecer. <strong style={{color:C.rosa}}>No es censura: es un sistema de convivencia.</strong> El equipo de Bro7vision asigna el estado tras revisar tu contenido, y puedes solicitar revisión en cualquier momento desde Booster Studio.
              </Tip>

              <SectionTitle>Los tres estados</SectionTitle>
              {SEMA_STATES.map(s => (
                <div key={s.label} style={{display:"flex", alignItems:"flex-start", gap:"1.25rem", marginBottom:"1.25rem", background:C.bgInner, borderRadius:10, padding:"1.25rem 1.5rem", border:`1px solid ${C.border}`}}>
                  <div style={{width:"1.8rem", height:"1.8rem", borderRadius:"50%", background:s.color, flexShrink:0, marginTop:"0.15rem", boxShadow:`0 0 8px ${s.color}`}} />
                  <div>
                    <div>
                      <span style={{fontWeight:700, color:C.crema, fontSize:"1.15rem"}}>{s.label}</span>
                      <span style={{fontSize:"1rem", color:C.muted, marginLeft:"0.5rem"}}>{s.horario}</span>
                    </div>
                    <p style={{fontSize:"1.05rem", color:C.cremaAlpha, marginTop:"0.3rem", lineHeight:1.6}}>{s.desc}</p>
                  </div>
                </div>
              ))}

              <SectionTitle>Cómo funciona la revisión</SectionTitle>
              {SEMA_STEPS.map((text, i) => <Step key={i} n={i+1}>{text}</Step>)}

              <Notice style={{color:"#86efac", borderColor:"#14532d", background:"rgba(13,31,13,0.85)"}}>
                El semáforo no penaliza a ningún creador. Un canal en rojo puede tener tanto valor y audiencia como uno en verde — simplemente aparece en su franja. La clave es la honestidad: dinos qué tipo de contenido emites y te colocamos en el horario que te corresponde.
              </Notice>
            </div>
          )}
        </div>

      <style>{`
        .mini-guide-scroll::-webkit-scrollbar { width: 10px; }
        .mini-guide-scroll::-webkit-scrollbar-track { background: rgba(217,193,202,0.05); border-radius: 5px; }
        .mini-guide-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #fcd34d, #fbbf24);
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(251,191,36,0.6), 0 0 20px rgba(251,191,36,0.3);
        }
        .mini-guide-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #fde68a, #fbbf24);
        }
        .mini-guide-scroll { scrollbar-width: thin; scrollbar-color: #fbbf24 rgba(217,193,202,0.05); }
      `}</style>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{display:"flex", alignItems:"center", gap:"0.75rem", margin:"1.75rem 0 1rem"}}>
      <span style={{fontSize:"1.1rem", fontWeight:700, color:C.rosa, textTransform:"uppercase", letterSpacing:"0.08em", whiteSpace:"nowrap"}}>{children}</span>
      <div style={{flex:1, height:1, background:C.border}} />
    </div>
  );
}

function Tip({ children }) {
  return (
    <div style={{background:C.bgInner, borderLeft:`3px solid ${C.rosaAlpha}`, borderRadius:"0 6px 6px 0", padding:"1rem 1.25rem", margin:"0.85rem 0", fontSize:"1.05rem", color:C.cremaAlpha, lineHeight:1.6}}>
      {children}
    </div>
  );
}

function Notice({ children, style: extraStyle = {} }) {
  return (
    <div style={{background:"rgba(217,193,202,0.05)", border:`1px solid ${C.borderAcc}`, borderRadius:8, padding:"1rem 1.25rem", fontSize:"1.05rem", color:C.crema, margin:"0.85rem 0", lineHeight:1.6, ...extraStyle}}>
      {children}
    </div>
  );
}

function Step({ n, title, children }) {
  return (
    <div style={{display:"flex", gap:"1rem", marginBottom:"1rem", alignItems:"flex-start"}}>
      {n !== undefined && (
        <div style={{minWidth:"2rem", height:"2rem", borderRadius:"50%", background:C.rosaAlpha, color:C.bg, fontWeight:800, fontSize:"0.95rem", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:"0.1rem"}}>
          {n}
        </div>
      )}
      <div style={{flex:1, fontSize:"1.05rem", lineHeight:1.6, color:C.cremaAlpha}}>
        {title && <strong style={{color:C.crema, display:"block", marginBottom:"0.2rem", fontSize:"1.1rem"}}>{title}</strong>}
        {children}
      </div>
    </div>
  );
}