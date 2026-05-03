# CONTEXT.md — BRO7VISION SYSTEM BIBLE
# Actualizado: 2026-05-03
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
**Solo disponible en PC. En móvil/tablet muestra pantalla de bloqueo.**

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

**Nota naming:** En el código, `b_creator_profiles` agrupa Directores y Montadores.
El término "creador" en código se refiere siempre a Director/Montador del BackStage,
NO a creadores de contenido TikTok-style del Mundo del Espectador.

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
                   Tabla: b_advertiser_profiles
                   user_metadata.role = 'advertiser'

  SOY DIRECTOR   → modal DIRECTOR STUDIO
                   Campos: nombre artístico, email, password, muestra de visión
                   Botón: SOLICITAR CLAQUETA
                   Estado inicial: EN_CASTING hasta aprobación manual BRO7VISION
                   Tabla: b_creator_profiles
                   user_metadata.role = 'director'
                   No puede entrar al BackStage hasta estado CONTRATADO

  ▶ STUDIO       → botón discreto solo visible si VITE_SHOW_STUDIO=true (solo local)
                   Acceso admin directo al BackStage para RGartner
                   En producción/Cloudflare esta variable no existe → botón invisible
```

**Flujo de registro correcto:**
1. `supabase.auth.signUp()` con user_metadata.role
2. Insert en tabla de perfil usando `authData.user` (no `authData.session` — es null hasta confirmar email)
3. RLS: INSERT WITH CHECK (true) en perfiles — sesión no activa hasta confirmar email

**Email confirmación:** Configurado con Brevo SMTP
```
Host:     smtp-relay.brevo.com
Puerto:   587
Usuario:  a9fb5a001@smtp-brevo.com
Sender:   noreply@bro7vision.com
```
Durante desarrollo los emails pueden llegar a spam (dominio nuevo sin reputación).
Para producción añadir DKIM/SPF en Namecheap.

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

**ChannelMoon — nota crítica:**
Moon emite SIEMPRE el mismo video base por fase lunar.
El campo `funcion` en bs_escenarios actúa como MoonTurno (MT1–MT4),
NO como turno horario. Son 4 slots publicitarios sobre el mismo video.
Al cambiar la fase lunar → nuevo video base → nuevos 4 slots disponibles.

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
300 = GIRA_NACIONAL
404 = GIRA_MUNDIAL
305 = GIRA_REGIONAL (5 ciudades mini)
309 = GIRA_GRAN_REGIONAL (9 ciudades mini)
307 = METROPOLIS (7 mega ciudades)
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
1_120_305.mp4  ChannelOeste, Fase1(Nova), Turno2, PC, GIRA_REGIONAL
1_120_307.mp4  ChannelOeste, Fase1(Nova), Turno2, PC, METROPOLIS
1_120_309.mp4  ChannelOeste, Fase1(Nova), Turno2, PC, GIRA_GRAN_REGIONAL
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
2. ¿Existe [CANAL]_[FASE][TURNO][DISP]_307.mp4? → emite METROPOLIS.
3. ¿Existe [CANAL]_[FASE][TURNO][DISP]_309.mp4? → emite GIRA_GRAN_REGIONAL.
4. ¿Existe [CANAL]_[FASE][TURNO][DISP]_305.mp4? → emite GIRA_REGIONAL.
5. ¿Existe [CANAL]_[FASE][TURNO][DISP]_300.mp4? → emite GIRA_NACIONAL.
6. ¿Existe [CANAL]_[FASE][TURNO][DISP]_[ciudad].mp4? → emite SALA_CIUDAD.
7. Ninguno → emite base:
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

### Cambios 2026-05-03
- `cityToCode` ahora usa objetos `{ code, tipo }` en lugar de strings planos
- `tipo: "mega"` = población > 500.000 hab (Madrid, Barcelona, Valencia, Sevilla, Zaragoza, Málaga)
- `tipo: "mini"` = resto de ciudades
- Murcia (~460k) queda como mini
- Nuevas constantes: COBERTURA_GIRA_REGIONAL (305), COBERTURA_GIRA_GRAN_REGIONAL (309), COBERTURA_METROPOLIS (307)
- Nueva tabla COBERTURAS con precio, tipo_ciudad y max_ciudades
- Nuevos helpers: getMegaCities(), getMiniCities(), getCitiesForCobertura(cobertura), getTipoForCity(cityKey)

### Exportaciones principales

```js
import {
  CHANNELS,
  FASES,
  TURNOS,
  CODIGO_BASE,             // "000"
  COBERTURA_NACIONAL,      // "300"
  COBERTURA_INTERNACIONAL, // "404"
  COBERTURA_GIRA_REGIONAL,      // "305"
  COBERTURA_GIRA_GRAN_REGIONAL, // "309"
  COBERTURA_METROPOLIS,         // "307"
  COBERTURAS,              // tabla completa con precios y restricciones
  cityToCode,              // { "madrid": { code: "001", tipo: "mega" }, ... }
  codeToCity,              // { "001": "Madrid", ... }
  isMoonChannel,
  getCodeForCity,          // (cityKey) => "001" | null
  getTipoForCity,          // (cityKey) => "mega" | "mini" | null
  getCityForCode,
  getMegaCities,           // () => ciudades >500k
  getMiniCities,           // () => ciudades <500k
  getCitiesForCobertura,   // (cobertura) => lista filtrada para selector
  buildVideoName,
  getVideoCandidates,
  cityList,
  getTurno,
  resolveVideoFromCandidates,
} from './data/citycodes.js'
```

### getCitiesForCobertura — uso en selector del Marketplace
```js
// Filtra automáticamente según cobertura elegida por el Productor
// SALA_CIUDAD / GIRA_REGIONAL / GIRA_GRAN_REGIONAL → solo minis
// SALA_GRAN_CIUDAD / METROPOLIS → solo megas
// GIRA_NACIONAL / GIRA_MUNDIAL → sin selector de ciudad
const ciudades = getCitiesForCobertura('GIRA_REGIONAL') // → array de minis
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
SALA_CIUDAD          → 1 ciudad mini,    20€  → código archivo: 001-158
SALA_GRAN_CIUDAD     → 1 mega ciudad,    60€  → código archivo: 001-158
GIRA_REGIONAL        → 5 ciudades mini,  80€  → código archivo: 305
GIRA_GRAN_REGIONAL   → 9 ciudades mini, 160€  → código archivo: 309
METROPOLIS           → 7 mega ciudades, 350€  → código archivo: 307
GIRA_NACIONAL        → nacional,        500€  → código archivo: 300
GIRA_MUNDIAL         → internacional,   800€  → código archivo: 404
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

**RLS INSERT:** WITH CHECK (true) en ambas tablas — el insert ocurre
con authData.user antes de que la sesión esté activa (email sin confirmar).

**BackStage lee el rol desde:** `session.user.user_metadata.role`
- 'director' → consulta b_creator_profiles
- 'advertiser' → consulta b_advertiser_profiles

### Tablas BackStage

**bs_tarifas**
```
id            uuid PK
cobertura     text UNIQUE  → 'SALA_CIUDAD'|'SALA_GRAN_CIUDAD'|'GIRA_REGIONAL'|
                             'GIRA_GRAN_REGIONAL'|'METROPOLIS'|'GIRA_NACIONAL'|'GIRA_MUNDIAL'
precio        numeric      → 20|60|80|160|350|500|800
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
                              ⚠ Para Moon: funcion = MoonTurno (MT1–MT4), NO turno horario
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
ciudades_array jsonb        → array de códigos para coberturas multi-ciudad
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

**bs_estudio_blog** ← contenido editorial del Estudio Marketing
```
id           uuid PK DEFAULT gen_random_uuid()
titulo       text NOT NULL
categoria    text         → 'ESTRATEGIA'|'TIMING'|'COBERTURA'|'FORMATO'|'AUDIENCIA'|'ROI'
cuerpo_texto text
imagen_url   text         → URL imagen (R2 o externa)
destacado    boolean DEFAULT false → card grande featured en el blog
activo       boolean DEFAULT true
created_at   timestamptz DEFAULT now()

RLS: SELECT WHERE activo = true (lectura pública para todos los roles)
INSERT: solo desde Supabase Table Editor por RGartner (sin policy de INSERT)
```

---

## BACKSTAGE — ESTRUCTURA REACT

### Acceso por rol
```
BackStage.jsx lee session.user.user_metadata.role:
  'director'   → consulta b_creator_profiles → vista Director/Montador
  'advertiser' → consulta b_advertiser_profiles → vista Productor
```

### Marketplace — vista según rol

**Vista DIRECTOR/MONTADOR:**
- Header fijo: "CONTRATACIÓN PARA LA PRÓXIMA FASE LUNAR"
- Grid 4 columnas scrolleable, agrupado por canal
- Por canal: cartel MP4 hover-to-play + fila PC (T1-T4) + fila Móvil (T1-T4)
- Cada slot muestra estado:
  - 🟢 LIBRE → nadie lo ha contratado
  - 🔴 GLOBAL → GIRA_MUNDIAL activo, en producción
  - 🔴 NACIONAL → GIRA_NACIONAL activo, en producción
  - 🟡 LOCAL → contrato de ciudad activo, Montador puede practicar
- Botón ESTUDIO MARKETING visible para todos los roles

**Vista PRODUCTOR/BUSINESS:**
- Mismo header y grid
- Cada slot muestra badges con precios y selector de cobertura
- Al pulsar slot LIBRE → panel lateral con selector cobertura + ciudades + precio + RESERVAR BUTACA
- getCitiesForCobertura() filtra automáticamente megas/minis según cobertura elegida

### Estudio Marketing
- Accesible para Directores, Montadores y Productores
- **GALERÍA:** feed vertical scrolleable, piezas a ~720px centrado
  - Sección HORIZONTAL: iframes 16:9, flechas navegación
  - Sección VERTICAL: iframes 9:16 (~320px ancho, formato teléfono), flechas navegación
  - Videos reales subidos por RGartner con ejemplos de marcas simuladas
- **BLOG:** conectado a bs_estudio_blog
  - Estilo tabloide/periódico sensacionalista
  - Card destacada (destacado=true): título enorme, Playfair Display
  - Grid 2 columnas para el resto
  - Modal artículo completo con ← VOLVER AL BLOG
  - RGartner añade artículos desde Supabase Table Editor

### Pantalla EN_CASTING
- Se muestra cuando estado ≠ 'CONTRATADO'
- Estética cinematográfica Star Wars con texto grande
- Para aprobar manualmente: UPDATE b_creator_profiles SET estado='CONTRATADO' WHERE id='auth_uid'

---

## REPARTOS ECONÓMICOS

```
Halos Pay (ciudadanos → creadores TikTok-style):   60% Creador / 40% BRO7VISION
Directores BroStories video/audio:                 70% Director / 30% BRO7VISION
Montadores videos Reality (bs_butacas):            35% Montador / 65% BRO7VISION
Packs Publicitarios completos:                     Pendiente de definir
```

---

## PRECIOS POR COBERTURA

```
Cobertura            Precio    Estudio 65%   Montador 35%   Ciudades
────────────────────────────────────────────────────────────────────
SALA_CIUDAD           20€         13€            7€          1 mini
SALA_GRAN_CIUDAD      60€         39€           21€          1 mega
GIRA_REGIONAL         80€         52€           28€          5 mini
GIRA_GRAN_REGIONAL   160€        104€           56€          9 mini
METROPOLIS           350€        227€          123€          7 mega
GIRA_NACIONAL        500€        325€          175€          nacional
GIRA_MUNDIAL         800€        520€          280€          internacional
```

GIRA_NACIONAL / GIRA_MUNDIAL: 1 escenario × 1 función exclusivo.
No bloquea otros escenarios ni funciones.
Precios estimativos para Fase 1. A validar con audiencia real.

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
- BackStage solo disponible en PC. Bloqueado en móvil/tablet.
- VITE_SHOW_STUDIO=true solo en .env.local — nunca en producción
- Email SMTP: Brevo con dominio bro7vision.com verificado en Namecheap