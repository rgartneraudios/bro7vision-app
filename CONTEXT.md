# CONTEXT.md — BRO7VISION SYSTEM BIBLE
# Actualizado: 2026-05-02
# Consultar este archivo antes de tocar Reality, citycodes.js o BackStage.

---

## QUÉ ES BRO7VISION

Ecosistema ciudadano digital con estética Neon/Bio-luminiscente que gamifica la realidad.
Fusión de red social inmersiva, comercio local geolocalizado y sistema de entretenimiento.
Funciona también como agencia de publicidad gamificada con economía colaborativa B2B.

**Tres economías en paralelo:**
- Economía creativa → BRO7VISION + Directores de Escena / Montadores
- Economía publicitaria → BRO7VISION + Productores (Empresas/Autónomos)
- Economía colaborativa → Comercios entre sí (BRO7VISION como facilitador)

**FASE 0 (actual):** pruebas y simulación. Usuarios ganan Puntos Génesis gratuitos.
**FASE 1 (futura):** lanzamiento comercial con dinero Fiat, pasarelas de pago.
Sin criptomonedas en ninguna fase.

---

## DOS MUNDOS — UN SOLO ECOSISTEMA

**MUNDO DEL ESPECTADOR (app principal):**
El ciudadano/usuario/consumidor. Ve el producto terminado.
Videos de fondo inmersivos, Brostories, personajes, gamificación.
No sabe nada de lo que hay detrás.

**BACKSTAGE (espacio profesional):**
Business, Directores de Escena y Montadores.
Estilo funcional Discord/Notion — estética de estudio cinematográfico.
El Montador/Director nunca ve datos del Productor y viceversa.
BRO7VISION es siempre el intermediario editorial entre ambos.

---

## ROLES — NAMING CINEMATOGRÁFICO

```
CIUDADANO/USUARIO  → consume, juega, gana Puntos Génesis
PRODUCTOR          → comercio/empresa que contrata espacios publicitarios
MONTADOR           → editor que toma videos base y entrega pieza final
DIRECTOR           → crea Brostories, contenido narrativo original
ESTUDIO            → BRO7VISION, coordina y aprueba todo
```

**Regla crítica:** Productor NO habla directamente con el Montador.
El Estudio (BRO7VISION) es siempre el intermediario.
Límite de revisiones: 2 rondas máximo en pack básico.

---

## ACCESO BIFURCADO — LOGIN

```
Pantalla principal: email + password + INICIAR SESIÓN
Acceso visitante:   EXPLORAR COMO VISITANTE (solo lectura)
Registro:           ¿Nuevo en la Red? Crear ID

Bifurcaciones profesionales (parte inferior del login):
  SOY ANUNCIANTE → modal BROVISION BUSINESS
                   Campos: razón social, sector, email corporativo, password
                   Estado inicial: EN_CASTING hasta aprobación BRO7VISION

  SOY DIRECTOR   → modal DIRECTOR STUDIO
                   Campos: nombre artístico, email, password, muestra de visión
                   Botón: SOLICITAR CLAQUETA
                   Estado inicial: EN_CASTING hasta aprobación manual BRO7VISION
                   Registro usa Supabase Auth directamente
                   No puede entrar al BackStage hasta estado CONTRATADO
```

---

## REALITY — 9 CANALES

```
1 = ChannelOeste
2 = ChannelMoon
3 = ChannelEste
4 = Solo Earth
5 = Solo Fantasy
6 = Solo Cinema
7 = Band Earth
8 = Band Fantasy
9 = Band Cinema
```

**Funciones / Turnos horarios (todos los canales excepto ChannelMoon base):**
```
1 = 05:00 – 11:00
2 = 11:00 – 17:00
3 = 17:00 – 23:00
4 = 23:00 – 05:00
```

**Temporadas / Fases lunares (ChannelMoon):**
```
1 = Luna Nueva
2 = Luna Creciente
3 = Luna Plena
4 = Luna Menguante
```

---

## NOMENCLATURA DE ARCHIVOS — SISTEMA DEFINITIVO

### Patrón universal
```
[CANAL]_[FASE][TURNO][DISPOSITIVO]_[CÓDIGO].mp4
```

- **CANAL:** 1 dígito (1–9)
- **FASE:** 1 dígito → 0=SinFase(base resto) | 1–4=Fase lunar
- **TURNO:** 1 dígito → 0=SinTurno(base Moon) | 1–4=Turno horario
- **DISPOSITIVO:** 0=PC | 1=Móvil
- **CÓDIGO:** 3 dígitos → ver tabla abajo

### Códigos
```
000 = Base limpio (sin contrato)
300 = Cobertura Nacional (GIRA_NACIONAL)
404 = Cobertura Internacional (GIRA_MUNDIAL)
001–158 = Ciudad específica (ver citycodes.js)
```

### Vídeos BASE (permanentes en R2, nunca se borran)

**Resto de canales (1,3–9):** fase=0, turno=1–4
```
1_010_000.mp4  ChannelOeste, SinFase, Turno1, PC, Base
1_011_000.mp4  ChannelOeste, SinFase, Turno1, Móvil, Base
1_020_000.mp4  ChannelOeste, SinFase, Turno2, PC, Base
9_040_000.mp4  Band Cinema,  SinFase, Turno4, PC, Base
```

**ChannelMoon (canal 2):** fase=1–4, turno=0
```
2_100_000.mp4  ChannelMoon, Fase1(Nova),      SinTurno, PC, Base
2_101_000.mp4  ChannelMoon, Fase1(Nova),      SinTurno, Móvil, Base
2_200_000.mp4  ChannelMoon, Fase2(Creciente), SinTurno, PC, Base
2_201_000.mp4  ChannelMoon, Fase2(Creciente), SinTurno, Móvil, Base
2_300_000.mp4  ChannelMoon, Fase3(Plena),     SinTurno, PC, Base
2_301_000.mp4  ChannelMoon, Fase3(Plena),     SinTurno, Móvil, Base
2_400_000.mp4  ChannelMoon, Fase4(Menguante), SinTurno, PC, Base
2_401_000.mp4  ChannelMoon, Fase4(Menguante), SinTurno, Móvil, Base
```

**Total vídeos base:**
```
ChannelMoon:   4 fases × 2 dispositivos               =  8 vídeos
Resto canales: 8 canales × 4 turnos × 2 dispositivos  = 64 vídeos
TOTAL                                                  = 72 vídeos
```

### Contratos (temporales — se suben y borran cada fase)

**Resto de canales** — contrato por Fase + Turno:
```
1_120_001.mp4  ChannelOeste, Fase1(Nova), Turno2, PC, Madrid
1_120_300.mp4  ChannelOeste, Fase1(Nova), Turno2, PC, GIRA_NACIONAL
1_120_404.mp4  ChannelOeste, Fase1(Nova), Turno2, PC, GIRA_MUNDIAL
```

**ChannelMoon** — contrato por Fase + MoonTurno (MT1–MT4):
```
2_110_001.mp4  ChannelMoon, Fase1(Nova), MT1, PC, Madrid
2_120_300.mp4  ChannelMoon, Fase1(Nova), MT2, PC, GIRA_NACIONAL
2_130_404.mp4  ChannelMoon, Fase1(Nova), MT3, PC, GIRA_MUNDIAL
2_240_001.mp4  ChannelMoon, Fase2(Creciente), MT4, PC, Madrid
```

---

## LÓGICA DE CARGA DE VIDEO — PRIORIDAD

```
1. ¿Existe [CANAL]_[FASE][TURNO][DISP]_404.mp4? → emite GIRA_MUNDIAL. Bloquea todo.
2. ¿Existe [CANAL]_[FASE][TURNO][DISP]_300.mp4? → emite GIRA_NACIONAL. Bloquea locales.
3. ¿Existe [CANAL]_[FASE][TURNO][DISP]_[ciudad].mp4? → emite SALA_CIUDAD.
4. Ninguno → emite base:
     Resto: [CANAL]_0[TURNO][DISP]_000.mp4
     Moon:  [CANAL]_[FASE]0[DISP]_000.mp4
```

El sistema hace HEAD requests a R2 en orden de prioridad.
Carga el primero que existe. Si ninguno → base limpio.
Un solo video cargado en cada momento. Sin capas. Sin RAM extra.

---

## citycodes.js — ARCHIVO MAESTRO

**Ubicación:** `src/data/citycodes.js`
**Importar siempre para cualquier lógica de nombres de video.**

### Exportaciones principales

```js
import {
  CHANNELS,                // { 1: "ChannelOeste", 2: "ChannelMoon", ... }
  FASES,                   // { 0: "Sin Fase", 1: "Luna Nueva", ... }
  TURNOS,                  // { 0: "Sin Turno", 1: "05:00-11:00", ... }
  CODIGO_BASE,             // "000"
  COBERTURA_NACIONAL,      // "300"
  COBERTURA_INTERNACIONAL, // "404"
  cityToCode,              // { "madrid": "001", "barcelona": "024", ... }
  codeToCity,              // { "001": "Madrid", "024": "Barcelona", ... }
  isMoonChannel,           // (canal) => canal === 2
  getCodeForCity,          // (cityKey) => "001" | null
  getCityForCode,          // (code) => "Madrid" | null
  buildVideoName,          // (canal, fase, turno, dispositivo, codigo) => "1_020_000.mp4"
  getVideoCandidates,      // (canal, fase, turno, dispositivo, cityKey) => string[]
  cityList,                // array ordenado alfabéticamente para dropdowns
} from './data/citycodes.js'
```

### buildVideoName — uso correcto

```js
// Vídeos BASE
buildVideoName(1, 0, 2, 0, "000")  // → "1_020_000.mp4"  ChannelOeste T2 PC base
buildVideoName(2, 1, 0, 0, "000")  // → "2_100_000.mp4"  Moon Nova PC base
buildVideoName(2, 3, 0, 1, "000")  // → "2_301_000.mp4"  Moon Plena Móvil base

// CONTRATOS resto de canales
buildVideoName(1, 1, 2, 0, "001")  // → "1_120_001.mp4"  Madrid
buildVideoName(1, 1, 2, 0, "300")  // → "1_120_300.mp4"  GIRA_NACIONAL
buildVideoName(1, 1, 2, 0, "404")  // → "1_120_404.mp4"  GIRA_MUNDIAL

// CONTRATOS ChannelMoon (MoonTurnos MT1–MT4)
buildVideoName(2, 1, 1, 0, "001")  // → "2_110_001.mp4"  MT1 Madrid
buildVideoName(2, 2, 3, 0, "300")  // → "2_230_300.mp4"  MT3 GIRA_NACIONAL
```

### getVideoCandidates — uso en el reproductor

```js
const candidates = getVideoCandidates(canal, faseActual, turnoActual, dispositivo, cityKey);
// Devuelve [GIRA_MUNDIAL, GIRA_NACIONAL, local, base] en orden de prioridad
// La app hace HEAD request a R2 por cada uno y carga el primero que existe
```

---

## MINIATURAS — CARTELES

**Ubicación en R2:** `https://media.bro7vision.com/thumbs/`
**Formato:** MP4, 1 segundo, 480px, loop
**Nomenclatura:** igual que los videos base, extensión .mp4

```
https://media.bro7vision.com/thumbs/1_010_000.mp4  ChannelOeste T1 PC
https://media.bro7vision.com/thumbs/2_100_000.mp4  Moon Nova PC
```

**Construcción de URL:**
```js
const cartelUrl = `https://media.bro7vision.com/thumbs/${buildVideoName(canal, fase, turno, dispositivo, "000")}`;
```

**Comportamiento en BackStage — hover to play:**
```jsx
<video
  ref={videoRef}
  src={cartelUrl}
  width={480}
  muted
  loop
  playsInline
  onMouseEnter={() => videoRef.current.play()}
  onMouseLeave={() => {
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  }}
/>
```

---

## INFRAESTRUCTURA R2

**URL base media:** `https://media.bro7vision.com/`

**Estructura R2:**
```
bucket/
  [videos base y contratos — a pelo, sin carpeta]
  thumbs/
    [72 carteles MP4 de 1 segundo]
```

**CORS configurado:**
```json
[{
  "AllowedOrigins": [
    "http://localhost:5173",
    "https://bro7vision-app.pages.dev",
    "https://bro7vision.com",
    "https://www.bro7vision.com"
  ],
  "AllowedMethods": ["GET", "HEAD"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["Content-Length", "Content-Range"],
  "MaxAgeSeconds": 3600
}]
```

---

## NAMING CINEMATOGRÁFICO — REFERENCIA COMPLETA

```
Espacio profesional   → BackStage
Canal/Escenario       → Escenario
Turno horario         → Función
Fase lunar            → nombre de la fase (Luna Nueva, Luna Creciente...)
Slot contratado       → Butaca
Miniatura             → Cartel
Texto del anuncio     → Guión
Video editado         → Pieza Final
Comercio/empresa      → Productor
Editor                → Montador
Director de Escena    → Director
BRO7VISION            → Estudio
```

**Coberturas:**
```
SALA_CIUDAD         → local, 20€
SALA_GRAN_CIUDAD    → mega ciudad, 60€
GIRA_REGIONAL       → zonal, 120€
GIRA_GRAN_REGIONAL  → mega zonal, 200€
GIRA_NACIONAL       → nacional, 500€  → código archivo: 300
GIRA_MUNDIAL        → internacional, 800€ → código archivo: 404
```

**Estados del flujo:**
```
EN_CASTING          → butaca contratada, buscando Montador
EN_RODAJE           → Montador asignado, trabajando
EN_DEBATE           → Montador entregó, Productor debe aprobar
LISTO_PARA_ESTRENO  → Productor aprobó, Estudio revisa final
EN_CARTELERA        → Pieza Final activa en emisión geolocalizada
```

---

## TABLAS SUPABASE — MAPA COMPLETO

### Prefijos
```
brost_   → tablas de Brostories (renombradas por SignorRoberto)
b_       → perfiles profesionales compartidos (Brostories + BackStage)
bs_      → tablas exclusivas del BackStage
```

### Tablas Brostories — NO TOCAR
```
brost_campanas          → preguntas trampa, impresiones, clicks
brost_parrilla          → dia_semana, click_destino_url, broshop_id
postulaciones           → 500 Fundadores. NUNCA tocar.
```

### Tablas perfiles profesionales compartidos
```
b_creator_profiles      → Directores y Montadores (Brostories + BackStage)
  + tipo   text         → 'director'|'montador'|'ambos'
  + estado text         → 'EN_CASTING'|'CONTRATADO'|'SUSPENDIDO'

b_advertiser_profiles   → Productores (Brostories + BackStage)
  + estado text         → 'EN_CASTING'|'CONTRATADO'|'SUSPENDIDO'
```

### Tablas BackStage — creadas 2026-05-02

**bs_tarifas**
```
id            uuid PK
cobertura     text UNIQUE  → 'SALA_CIUDAD'|'SALA_GRAN_CIUDAD'|'GIRA_REGIONAL'|
                             'GIRA_GRAN_REGIONAL'|'GIRA_NACIONAL'|'GIRA_MUNDIAL'
precio        numeric      → 20|60|120|200|500|800
pct_estudio   numeric      → 65 (BRO7VISION %)
pct_montador  numeric      → 35 (Montador %)
activo        boolean
created_at    timestamptz
```

**bs_escenarios**
```
id             uuid PK
canal          smallint     → 1–9
nombre_display text         → 'ChannelOeste', 'Solo Earth', 'Channel Moon'
es_moon        boolean      → true solo canal 2
fase_lunar     smallint     → 1–4 | null si no es Moon
funcion        smallint     → 1–4 | null si es Moon base
activo         boolean
created_at     timestamptz
```

**bs_solicitudes**
```
id               uuid PK
nombre_artistico text
email            text
muestra_url      text
tipo             text        → 'director'|'montador'|'ambos'
estado           text        → 'EN_CASTING'|'CONTRATADO'|'RECHAZADO'
created_at       timestamptz
```

**bs_butacas** ← tabla viva, aquí corre el negocio
```
id             uuid PK
escenario_id   uuid FK → bs_escenarios
canal          smallint     → 1–9
fase_lunar     smallint     → 1–4
funcion        smallint     → 1–4 (MoonTurno si es Moon)
dispositivo    smallint     → 0=PC | 1=Móvil
cobertura      text         → 'SALA_CIUDAD'|...|'GIRA_MUNDIAL'
ciudad_codigo  text         → '001'–'158' | null si GIRA_NACIONAL o GIRA_MUNDIAL
productor_id   uuid FK → b_advertiser_profiles
montador_id    uuid FK → b_creator_profiles | null hasta asignación
guion          text         → brief del Productor
pieza_final    text         → URL video editado en R2 | null hasta entrega
nombre_archivo text         → construido con buildVideoName()
estado         text         → estados del flujo
precio         numeric      → precio del momento de contratar (no cambia)
fecha_inicio   date
fecha_fin      date
created_at     timestamptz
updated_at     timestamptz  → trigger automático
```

**bs_rodajes**
```
id         uuid PK
butaca_id  uuid FK → bs_butacas
crew_id    uuid FK → b_creator_profiles
notas      jsonb
estado     text        → estados del flujo
created_at timestamptz
updated_at timestamptz → trigger automático
```

---

## BACKSTAGE — ESTRUCTURA REACT

### Perfil PRODUCTOR — 3 pestañas

**MIS CAMPAÑAS:**
- Lista de butacas contratadas con estado visible
- Por cada butaca: cartel escenario, función, ciudad/cobertura, guión, estado
- Placeholder para métricas futuras

**MARKETPLACE:**
- Grid de cards con cartel MP4 (hover-to-play)
- Cada card: nombre escenario, función o fase, badges LIBRE/OCUPADO por ciudad
- Butacas con pocas ciudades → efecto titilante en badges LIBRE
- Al pulsar ciudad LIBRE → panel lateral:
  - Nombre del Productor
  - Guión (texto con contador de caracteres)
  - Selector cobertura: GIRA_MUNDIAL / GIRA_NACIONAL / SALA_CIUDAD [dropdown cityList]
  - Precio calculado automáticamente desde bs_tarifas
  - Botón: RESERVAR BUTACA
- Ciudad pasa a OCUPADO → butaca creada en bs_butacas con estado EN_CASTING

**COMUNIDAD:**
- Tablón editorial BRO7VISION (cards título + imagen + texto)
- Sección Avisos de Compra Conjunta
- Botón PUBLICAR AVISO → modal: producto, cantidad, descripción
- Crea aviso en tabla avisos con categoría 'COMPRA_CONJUNTA'

### Perfil DIRECTOR/MONTADOR — 2 pestañas

**REFERENCIA:**
- Grid de piezas aprobadas como benchmark de calidad
- Cada card: cartel + tipo espacio + cobertura + descripción

**MIS RODAJES:**
- Lista de rodajes asignados con estado del flujo
- POSTULACIONES ABIERTAS: butacas en estado EN_CASTING
- Por cada postulación: cartel, función, guión del Productor, precio, botón POSTULARME
- Una vez asignado → Montador sube Pieza Final para aprobación

---

## CALENDARIO DE CAMPAÑA — CICLO LUNAR

```
DÍA -7 (lunes)   → BackStage abre campaña próxima fase
                    Carteles de los 72 escenarios visibles
                    Productores contratan butacas y eligen ciudades
                    Efecto titilante en butacas con pocas ciudades
                    Estudio publica inteligencia editorial
                    Se abre reserva anticipada para fase siguiente

DÍA -2 (sábado)  → Deadline contratación. Montadores reciben encargo.

DÍA -1 (domingo) → Deadline entrega. Montadores suben Pieza Final a R2.
                    Estudio revisa y aprueba.

DÍA 0  (lunes)   → Nueva fase lunar. Piezas Finales en emisión desde 00:00.

DÍA +7 (lunes)   → Termina la fase. Piezas Finales se borran de R2.
                    Quedan solo los 72 videos base limpios.
```

---

## PRECIOS POR COBERTURA

```
Cobertura            Precio/butaca   Estudio 65%   Montador 35%
──────────────────────────────────────────────────────────────
SALA_CIUDAD              20€            13€            7€
SALA_GRAN_CIUDAD         60€            39€           21€
GIRA_REGIONAL           120€            78€           42€
GIRA_GRAN_REGIONAL      200€           130€           70€
GIRA_NACIONAL           500€           325€          175€
GIRA_MUNDIAL            800€           520€          280€
```

GIRA_NACIONAL / GIRA_MUNDIAL: 1 escenario × 1 función exclusivo.
No bloquea otros escenarios ni funciones.
Precios estimativos para Fase 1. A validar con audiencia real.

---

## VIDEOMAP — SISTEMA SEPARADO

Videos de ciudad/zona para inmersión geográfica del usuario en sectores.
**NO tiene publicidad. NO tiene turnos. NO tiene fases lunares.**
Se activa por código postal del usuario (BoosterModal).
Archivo: `src/data/VideoMap.js`
Sistema completamente independiente de Reality y citycodes.js.

---

## NOTAS CRÍTICAS

- `citycodes.js` es la única fuente de verdad para nombres de archivo de video
- El precio en `bs_butacas` se guarda en el momento de contratar — no cambia aunque cambien bs_tarifas
- `b_creator_profiles` y `b_advertiser_profiles` son compartidas entre Brostories y BackStage
- El campo `id` en perfiles enlaza con `auth.uid()` — no existe columna `user_id`
- Videos base en R2 nunca se borran. Solo se borran las Piezas Finales al terminar cada fase.
- RLS activo en todas las tablas bs_*
