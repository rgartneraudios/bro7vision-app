# BRO7VISION — RESUMEN DE SESIÓN Y HOJA DE RUTA
# Fecha: Mayo 2026
# Para: Nuevo chat con Claude

---

## CONTEXTO GENERAL

BRO7VISION es un ecosistema ciudadano digital con estética Neon/Bio-luminiscente.
Fusión de red social, comercio local geolocalizado y sistema de entretenimiento.
Funciona como agencia de publicidad gamificada con economía colaborativa B2B.
Consultar CONTEXT.md para el sistema completo.

---

## LO QUE SE HIZO EN SESIONES ANTERIORES

### MIGRACIÓN COMPLETA AL NUEVO SISTEMA DE PERSONAJES

Se migró todo el sistema de personajes de una arquitectura monolítica compartida
a cables individuales por personaje. Cada personaje tiene su propio:
- Hook (`useAgentX.js`)
- Fetch de contexto (`fetchContextoX.js`)
- Prompt (`promptX.js`)
- Banner (`XBanner.jsx`) en `src/components/personajes/`

### ARQUITECTURA NUEVA — CABLES INDIVIDUALES

```
ORÁCULO
  useSmisterioChat.js   promptSmisterio.js   SmisterioBanner.jsx
  useJaguarChat.js      promptJaguar.js      JaguarBanner.jsx
  useOrumamaChat.js     promptOrumama.js     OrumamaBanner.jsx

OSOS PC
  useAgentTito.js       promptTito.js        TitoBanner.jsx
  useAgentLara.js       promptLara.js        LaraBanner.jsx
  useAgentPuffo.js      promptPuffo.js       PuffoBanner.jsx

OSOS MOBILE
  useAgOsosMobile.js    (instancia los tres según oso_id)

PRODUCTOS
  useAgentNovaExplora.js   NovaBanner.jsx → personajes/
  useAgentNovaCierre.js    NovaCierre.jsx → personajes/
                           NovaCierreMobile.jsx → personajes/

SERVICIOS
  useAgentIsabella.js      IsabellaBanner.jsx → personajes/
  (Isabella + Profesor)    IsabellaCierre.jsx → personajes/
                           IsabellaCierreMobile.jsx → personajes/

AUDIO
  useAgentMapache.js       MapacheBanner.jsx → personajes/
  (Mapache + Ami)

AVISOS
  useAgentEvelyn.js        EvelynBanner.jsx → personajes/
  (Evelyn + Larry)

REINOS
  useAgentRumores.js       (sin Banner PC, solo Mobile via chatMobile)
```

### ARCHIVOS MANTENIDOS COMO UTILIDADES

```
src/services/agents/ososPS.js          ← ciudades/países/sectores, datos puros
src/services/agents/novaCierrePS.js    ← compartido NovaCierre + IsabellaCierre
src/services/agents/novaExploraPS.js   ← usado por useAgentNovaExplora
src/services/agents/evelynExploraPS.js ← usado por useAgentEvelyn
```

### DATOS DEL ORÁCULO

```
src/data/smisterio/   ← AntartidaBot, BucegiBot, EgiptoBot, TartariaBot + episodios IA
src/data/jaguar/      ← 13 signos + 13 XMito.js + amazonas/
src/data/orumama/     ← 12 hierbas + hierbas.js + guisos.js + recetario/
```

---

## LO QUE SE HIZO EN ESTA SESIÓN (25 Mayo 2026)

### LIMPIEZA DE SUPABASE — PROFILES

- Eliminada columna `card_banner_url` de `profiles` — era redundante con `banner_url`
- Unificado a `banner_url` en todo el código (App.jsx, BoosterModal.jsx, BroLives3D.jsx, HoloPrism.jsx)

### ROLES SIMPLIFICADOS

- Eliminado rol `video` (Video Vlogger) — no tiene sector propio ni buscador dedicado
- Renombrado `bro_aud` → `bro_mus` (música)
- Renombrado `bro_pod` → `bro_aud` (audio/podcast en general)
- Rol `talk` queda vinculado a `bro_aud`

### SECTOR AVISOS — MEJORAS COMPLETAS

#### Supabase
- Nueva columna `banner_avi` TEXT NULL en tabla `avisos` ← imagen del aviso
- Carpeta `avisos/` creada en R2: `https://media.bro7vision.com/avisos/`

#### evelynExploraPS.js
- Eliminado campo `alcance` de `CAMPOS_AVISO` — no existía en tabla Supabase
- Flujo limpio: `tipo → título → contenido → banner → CONFIRMO`

#### useAgentEvelyn.js
- Orden de detecciones corregido — `avisoEnProceso` se comprueba PRIMERO
- `banner_avi` añadido al INSERT de avisos
- `setAvisoEnConstruccion` expuesto en el return del hook
- INSERT captura error de Supabase correctamente con `{ error: insertError }`
- Valores de tipo corregidos: `OFREZCO/NECESITO` → `OFERTA/DEMANDA` (constraint Supabase)

#### EvelynBanner.jsx
- Nuevo estado `esperandoImagen` — se activa cuando tipo+título+contenido completos
- `handleEnviar` bloquea el chat cuando `esperandoImagen` activo (excepto CONFIRMO)
- Nuevo bloque UI de subida de imagen con previsualización, botón SALTAR y CONFIRMAR
- Botón SUBIR BANNER implementado con `<label htmlFor>` para compatibilidad móvil
- Upload a R2 con validación: solo JPEG/PNG/WebP, máximo 2MB
- Ruta R2: `https://media.bro7vision.com/avisos/{timestamp}-{filename}`
- NOTA: En móvil no hay subida de imagen — se publica sin banner (decisión de diseño)

#### useStripCards.js
- SELECT de avisos incluye `banner_avi`
- Map separa `banner_avi` y `banner_url` como campos distintos
- BroCardStrip muestra `banner_avi || banner_url` correctamente

#### BroCardStrip.jsx — bro_avi en footer
- Eliminado `author_alias` del footer de tarjetas de avisos
- JOIN con profiles para obtener `bro_avi` del autor
- `bro_avi` disponible internamente en EvelynBanner para referencia pero no renderizado

---

## REGLAS DE LA ARQUITECTURA NUEVA

1. **Cable grueso individual** — cada personaje es autónomo
2. **Sin condicionantes entre personajes** — tocar uno no rompe otro
3. **Hooks en** `src/hooks/`
4. **Fetch en** `src/services/contexto/`
5. **Prompts en** `src/data/[personaje]/prompt[Personaje].js`
6. **Banners en** `src/components/personajes/`
7. **El único cable que sale** de cada personaje es el handoff
8. **novaCierrePS.js** es la única excepción compartida — NovaCierre e IsabellaCierre

---

## HOJA DE RUTA — PENDIENTE

### FASE 3B — CUENTOS EN EL ORÁCULO (próxima sesión)

Cada personaje tendrá su versión narrativa en el Oráculo.
Mismo patrón que Smisterio/Jaguar/Orumama pero para todos.

```
PERSONAJES A CREAR EN ORÁCULO:
  NovaCuentos.jsx      useAgentNovaCuentos.js    promptNovaCuentos.js
  TitoCuentos.jsx      useAgentTitoCuentos.js    promptTitoCuentos.js
  LaraCuentos.jsx      useAgentLaraCuentos.js    promptLaraCuentos.js
  PuffoCuentos.jsx     useAgentPuffoCuentos.js   promptPuffoCuentos.js
  IsabellaCuentos.jsx  useAgentIsabellaCuentos.js
  MapacheCuentos.jsx   useAgentMapacheCuentos.js
  AmiCuentos.jsx       useAgentAmiCuentos.js
  EvelynCuentos.jsx    useAgentEvelynCuentos.js
  LarryCuentos.jsx     useAgentLarryCuentos.js
  RumoresCuentos.jsx   useAgentRumoresCuentos.js
  ProfesorCuentos.jsx  useAgentProfesorCuentos.js
```

Handoff desde Banner mercantil → Banner Cuentos:
```
NovaExplora → [botón Oráculo] → NovaCuentos
TitoBanner  → [botón Oráculo] → TitoCuentos
...etc
```

### CONTENIDO PENDIENTE DE RELLENAR (RGartner)

```
Jaguar:
  - 13 archivos XMito.js    ← mitología de cada signo al estilo Jaguar
  - amazonas2..N.js         ← citas de Confucio al estilo Jaguar

Orumama:
  - recetario1.js           ← receta de guiso tradicional
  - recetario2.js           ← receta de guiso tradicional
```

### LIMPIEZA PENDIENTE EN PROMPTBUILDER

En `promptBuilder.js` quedan referencias a jaguar y orumama que se
pueden limpiar cuando se confirme que el sistema funciona en producción.

### FASE BACKSTAGE

Continuar desarrollo del BackStage según CONTEXT.md:
- Marketplace de escenarios
- Flujo de butacas y contratos
- Estudio Marketing

### FASE COMMERCE

Video Commerce con BroCredit según documento de Commerce.

---

## NOTAS PARA EL NUEVO CHAT

- Leer CONTEXT.md antes de tocar nada
- La arquitectura de personajes está completa — no tocar los hooks existentes
- Para nuevos personajes del Oráculo seguir exactamente el patrón de SmisterioBanner
- Worker URL: `https://brovision-ai.bro7vision.workers.dev`
- Supabase tabla personajes: `personaje_update` con `personaje_id`
- Videos base en R2: `https://media.bro7vision.com/`
- Imágenes de avisos en R2: `https://media.bro7vision.com/avisos/`
- RGartner = Signor Roberto = el creador. Puede llamarse "Maravilla"

### ESTADO ACTUAL DE COLUMNAS — TABLA PROFILES
- `avatar_url` — foto circular del usuario
- `banner_url` — banner de tarjetas (antes había card_banner_url, ya eliminada)
- `bro_pd` — código sector Productos
- `bro_ser` — código sector Servicios
- `bro_avi` — código sector Avisos
- `bro_mus` — código sector Música (antes bro_aud)
- `bro_aud` — código sector Audio/Podcast (antes bro_pod)

### ESTADO ACTUAL DE COLUMNAS — TABLA AVISOS
- `banner_avi` TEXT NULL — imagen del aviso (URL R2)
- `type` — OFERTA | DEMANDA (constraint check)
- `author_alias` — alias del autor al momento de publicar
- Upload móvil de banner NO implementado — decisión de diseño