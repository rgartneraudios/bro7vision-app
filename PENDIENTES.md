# PENDIENTES BROVISION — Actualizado 2026-05-01

## Quién es el usuario
El usuario prefiere que lo llamen **Signor Roberto** o **Maravilla**.
Conoce bien su proyecto, toma decisiones rápidas y prefiere ir por fases ordenadas sin hacer cambios grandes bajo presión de tiempo.

---

## Cómo está el proyecto (resumen)

**Stack:** React 18 + Vite 7 + Tailwind CSS + Supabase + Cloudflare Pages + Workers
**Deploy:** Cloudflare Pages (migrado desde Vercel — ya limpiado)
**IA:** Mistral vía Cloudflare Worker (`brovision-ai.bro7vision.workers.dev`)
**Agentes:** 14 personajes con lógica propia (Tito, Lara, Puffo, Nova, Isabella, Evelyn, Larry, Mapache, Ami, Oráculo, Rumores, Jaguar, Orumama, SMisterio)

---

## Lo que se hizo en sesión 2026-04-30

### 1. mapachePS.js — COMPLETADO ✅
- Eliminado `detectarCodigoMapache` y todo el sistema CODIGO A/D
- Eliminados CATÁLOGO A y CATÁLOGO B del prompt
- `buildMapachePrompt` simplificado: acepta `card_activa` para el nuevo flujo

### 2. Flujo de audio conectado — COMPLETADO ✅
```
BroCard pulsada → descripción en banner
  ├─ Botón ▶ PLAY → onHandoff(AUDIO_PLAY, canal: selectedCard) → BroLives
  └─ Enter en chat ("dale", "si", "ok"...) → extraContext.card_activa → AUDIO_PLAY → BroLives
```

### 3. Limpieza de archivos muertos — COMPLETADO ✅
- Eliminado `Booster_Logistica_Backup.jsx`
- Eliminada carpeta `.vercel/`
- `noise.svg` creado localmente (`/public/assets/noise.svg`)
- `DirectorAccess.jsx`: URL externa → `/assets/noise.svg`

### 4. Bifurcación de tabs en BoosterModal — COMPLETADO ✅

| Archivo | Antes | Después |
|---|---|---|
| `BoosterModal.jsx` | 1594 líneas | 1342 líneas (−252) |
| `AvisosTab.jsx` | — | 148 líneas (nuevo, autogestiona fetch) |
| `MarketTab.jsx` | 198 líneas (cáscara, 14 props) | 275 líneas (autónomo, 2 props) |

- `AvisosTab`: gestiona `misAvisos`, `mensajesRecibidos` y su propio useEffect. Sin props.
- `MarketTab`: gestiona assets, catálogo, servicios, handlers y efectos. Solo recibe `formData/setFormData`.

### 5. Limpieza de App.jsx — COMPLETADO ✅

| Archivo | Antes | Después |
|---|---|---|
| `App.jsx` | 862 líneas, 96+ useState | 659 líneas |
| `useSessionManager.js` | — | nuevo (auth + perfil + toggles IA) |
| `useNavigationState.js` | — | nuevo (step, intent, scope, realityMode, ventasMode, ososModo) |
| `useUIModals.js` | — | nuevo (showRadar, showStory, showLegal, showWalletModal, showBooster, drawers) |
| `useStripCards.js` | — | nuevo (cargarStripCards + estado del strip) |
| `useBalances.js` | — | nuevo (balances inicializados desde perfilOso, handleGameWin) |

App.jsx queda como orquestador: 5 hook calls, handleCentralHandoff, 7 agentes de chat, useMemos y render.
DesktopLayout y MobileTabletLayout no requirieron cambios (reciben los mismos props vía layoutProps).

---

## Lo que se hizo en sesión 2026-05-01

### 6. BackStage — Módulo Productor MARKETPLACE — COMPLETADO ✅

Creados 4 archivos en `src/components/backstage/`:

| Archivo | Qué hace |
|---|---|
| `BackStage.jsx` | Contenedor principal: topbar Productor, 3 tabs, guard EN_CASTING/SUSPENDIDO/CONTRATADO |
| `MarketplaceTab.jsx` | Grid de 72 slots, fetcha `bs_escenarios` + `bs_butacas` + `bs_tarifas` en paralelo |
| `EscenarioCard.jsx` | Card con video thumb R2 (hover-to-play), badges LIBRE/OCUPADO por cobertura |
| `ReservaPanel.jsx` | Panel lateral: selector cobertura, dropdown cityList, Moon Turno MT1-4, guión, insert `bs_butacas` → EN_CASTING |

**Lógica de slots (72 cards):**
- Moon (canal 2): 4 fases × 2 dispositivos = 8 cards
- Resto (canales 1,3-9): 8 canales × 4 turnos × 2 dispositivos = 64 cards

**Routing en App.jsx:**
```jsx
if (session?.user?.user_metadata?.role === 'advertiser') {
  return <BackStage session={session} onLogout={handleLogout} />;
}
```

**Fix BusinessAccess.jsx:**
- Tabla corregida: `advertiser_profiles` → `b_advertiser_profiles`
- Añadido `estado: 'EN_CASTING'` al insert de registro

---

## Pendiente para la próxima sesión

### PRIORIDAD 1 — BackStage: completar Productor

- **MIS CAMPAÑAS** — lista de `bs_butacas` propias con estado del flujo (cartel, función, ciudad, guión, estado badge)
- **COMUNIDAD** — tablón editorial BRO7VISION + avisos de Compra Conjunta + modal PUBLICAR AVISO
- Verificar **RLS Supabase**: `bs_butacas` SELECT debe exponer `cobertura/estado/canal` sin revelar `productor_id` ajeno

### PRIORIDAD 2 — BackStage: perfil Director/Montador
Cuando se haga `SOY DIRECTOR` → BackStage con rol `creator`:
- Tab **REFERENCIA** (grid de piezas aprobadas como benchmark)
- Tab **MIS RODAJES** (butacas EN_CASTING para postularse + rodajes asignados)

### PRIORIDAD 4 — Supabase Realtime
Con App limpio, crear `useRealtimeSync.js`:
```js
// Balances del usuario actual
supabase.channel('profile-sync')
  .on('postgres_changes', { event: 'UPDATE', table: 'profiles', filter: `id=eq.${userId}` },
      payload => setBalances(...))

// Avisos nuevos en la ciudad activa
supabase.channel('avisos-live')
  .on('postgres_changes', { event: '*', table: 'avisos' },
      payload => refrescarStrip())
```
El hook puede vivir en `useSessionManager` o ser independiente.

### PRIORIDAD 5 — Personalidades de otros agentes (menor urgencia)
Los archivos `data/nova/Personalidad.js`, `data/isabella/Personalidad.js`, `data/larry/Personalidad.js` y `data/profesor/Personalidad.js` todavía mencionan el sistema CODIGO D/A. Revisar si aplica actualizarlos.

### PRIORIDAD 6 — `pages/Agente.jsx` solitario
Único archivo en `pages/`. O se adopta la convención pages/routes de forma consistente o se mueve a `components/`.

---

## Notas técnicas para no repetir trabajo

- **Cloudflare Worker IA:** `https://brovision-ai.bro7vision.workers.dev` — no tocar sin necesidad
- **`legacy-peer-deps=true`** en `.npmrc` — conflicto de dependencias sin resolver, investigar antes de actualizar paquetes
- **`dist/`** en `.gitignore` — Cloudflare Pages lo genera en build
- **`useBalances`** recibe `(perfilOso, session)` — inicializa desde perfil, `handleGameWin` actualiza Supabase
- **`handleCentralHandoff`** es el orquestador central — vive en App.jsx por diseño, no mover
- **`handleNavigation`** debe declararse DESPUÉS de los `useAgentChat` calls — necesita `resetOsos`
- **`realItems`** se carga en App.jsx con `[session, step]` — recarga en cada navegación intencional

## BackStage & Reality — Ver CONTEXT.md
Para cualquier tarea relacionada con Reality, nomenclatura de videos,
citycodes.js o BackStage, consultar CONTEXT.md en la raíz del proyecto.
