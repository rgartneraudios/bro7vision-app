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

## LO QUE SE HIZO EN ESTA SESIÓN

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

### CONTEXTO DE SUPABASE POR PERSONAJE

```
src/services/contexto/
  fetchContextoTito.js
  fetchContextoLara.js
  fetchContextoPuffo.js
  fetchContextoNova.js
  fetchContextoIsabella.js
  fetchContextoProfesor.js
  fetchContextoMapache.js
  fetchContextoAmi.js
  fetchContextoEvelyn.js
  fetchContextoLarry.js
  fetchContextoRumores.js
```

Cada fetch lee de `personaje_update` en Supabase:
`vivencia_actual, estado_animo, promo_ciudad/regional/etc, special_*`

### ARCHIVOS ELIMINADOS

```
src/hooks/useAgentChat.js          ← monolito 14 modos
src/services/agents/botOrchestrator.js
src/services/agents/promptBuilder.js
src/services/agents/knowledgeSources.js
src/services/agents/SystemBus.js
src/data/*/Personalidad.js         ← 13 archivos
src/services/agents/bots/titoBot.js
src/services/agents/bots/laraBot.js
src/services/agents/bots/puffoBot.js
src/services/agents/bots/novaBot.js
src/services/agents/bots/isabellaBot.js
src/services/agents/bots/profesorBot.js
src/services/agents/bots/mapacheBot.js
src/services/agents/bots/amiBot.js
src/services/agents/bots/evelynBot.js
src/services/agents/bots/larryBot.js
src/services/agents/bots/rumoresBot.js
src/services/agents/bots/novaUtils.js
src/services/agents/bots/isabellaUtils.js
src/services/agents/bots/mapacheUtils.js
src/services/agents/bots/avisoUtils.js
src/services/agents/bots/reinosUtils.js
src/hooks/usePersonajeChat.js      ← hook genérico del Oráculo viejo
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
- RGartner = Signor Roberto = el creador. Puede llamarse "Maravilla"
