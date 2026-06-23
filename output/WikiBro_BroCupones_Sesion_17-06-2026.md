# CONTEXTO PARA NUEVO CHAT — WIKIBRO + BROCUPONES (sesión 17/06/2026)

Soy RGartner, creador de BRO7VISION. Llámame "Signor Roberto" o "Maravilla". Tono TARS. NOCOD = no código, solo reflexión. COCHI = OpenCode, ejecuta los cambios.

Este documento complementa (no reemplaza) el documento maestro de Bro7Vision y el contexto previo de WikiBro. Cubre específicamente lo construido en la sesión del 17/06/2026: integración de BroCupones dentro de WikiBro.

---

## QUÉ SE CONSTRUYÓ EN ESTA SESIÓN

### 1. Eliminación completa del sistema de Avisos (oferta/demanda)
El viejo flujo de Avisos (publicar/conectar entre usuarios, 200 génesis por acción) quedó **completamente descontinuado**, sustituido por WikiBro. Se eliminó de `useAgentEvelyn.js` y `EvelynBanner.jsx`:
- `FRASES_EVELYN`, `evelynBot`, `FRASES_LARRY`, `larryBot`
- `esIntencionPublicar`, `esIntencionConsultar`, `detectarBusquedaAviso`, `fraseBuscandoAviso`
- Estados `avisoEnConstruccion`, `esPatrocinado`, ref `avisoConectarRef`
- Props `onAvisoConectar`, `onAvisoPublicar`
- Rama `HANDOFF_AVISO_CONECTAR`
- UI completa en el banner: indicador de progreso, subida de banner, tarjeta de conexión, botones CONFIRMO/cancelar

Se mantuvo intacto: `detectarSalidaAviso` (volver a Osos), `detectarInternoAviso` (cambio Evelyn↔Larry) — son navegación de sector, no del viejo sistema transaccional.

### 2. Arquitectura de dos superficies separadas
```
EvelynBanner.jsx  → SOLO conversación (chat corto, frases tipo "¿Qué buscas?",
                    "Ahí tienes el listado", "Mira si hay BroCupón activo")
WikiBroAcordeon.jsx → Componente NUEVO, overlay hermano (no anidado en el banner)
                    Muestra el listado real con scroll, para 30+ resultados
```

`WikiBroAcordeon.jsx` está inspirado en `OraculoAcordeon.jsx` pero adaptado:
- Centrado (no pegado a la derecha), ancho fijo 900px en desktop, full-width en mobile
- Fondo: imagen `/images/galaxys_bg.webp` en pseudo-elemento `::before` a `opacity: 0.25`, contenido en layer separado a opacity 1 (texto siempre nítido — NO es overlay oscuro tradicional)
- Tipografía sans-serif funcional con acentos neón cyan/amarillo (NO Playfair/cursiva — eso es solo para Oráculo)
- Animación `cascadaAcordeon` (cae desde arriba), scrollbar fina estilizada, botón cierre "✕"
- Cada fila muestra: nombre, badge 🟡 BroCupón activo (si aplica), dirección·barrio, teléfono·horario, descripción del cupón en cursiva amarilla (si tiene_brocupon), badge 🟢 OFICIAL / ⚪ COMUNIDAD

El hook (`useAgentEvelyn.js`) controla apertura/cierre vía `acordeonAbierto` (state) y pasa `resultadosWiki` (array) como prop. `EvelynBanner.jsx` monta `<WikiBroAcordeon>` condicionalmente fuera del contenedor del chat.

### 3. Flujo único para modo básico e IA
```
Usuario escribe algo
  → buscarEnWikiBro() SIEMPRE se ejecuta (con o sin Neural IA activo)
  → resultados se guardan en resultadosWiki, acordeonAbierto = true
  ↓
  ¿iaActiva?
  NO  → frase hardcodeada: "Ahí tienes el listado de la WikiBro
        [— mira que alguno tiene BroCupón activo, aprovecha la oferta]"
  SÍ  → enviarIA() construye un "sobre" de contexto y llama al Worker,
        Evelyn/Larry narran conversacionalmente
```
El listado (acordeón) se ve IGUAL en ambos modos. Solo cambia el mensaje de texto que lo acompaña.

**Pendiente para más adelante (NO implementado aún):** en modo IA, cuando un resultado tiene `brovision_user_id`, hacer un segundo fetch a `profiles` para enriquecer la respuesta (ej. "este negocio tiene blog y videos en Brovision"). Quedó explícitamente diferido, no es bloqueante.

### 4. Integración BroCupones — el problema de la FK y la solución con VIEW

**Objetivo de negocio:** si una entrada de WikiBro pertenece a un comercio registrado en Brovision con un cupón activo, Evelyn lo señala con badge y descripción, conectando WikiBro con el sistema de BroCards/Nova/Isabella.

**Campos añadidos a la tabla `wikibro`:**
```sql
ALTER TABLE wikibro
ADD COLUMN brovision_user_id UUID REFERENCES profiles(id) NULL,
ADD COLUMN tiene_brocupon BOOLEAN DEFAULT false,
ADD COLUMN cobertura TEXT NULL;
```
`brovision_user_id` tiene FK declarada hacia `profiles(id)`. `tiene_brocupon` y `cobertura` se gestionan manualmente por Signor Roberto en Fase 0 (sin automatismos) cuando una entidad contacta y se verifica.

**Primer intento (FALLÓ):** select con embed automático de Supabase:
```js
.select(`*, comercio_cupones (id, descripcion, tipo_descuento, valor, activo)`)
.eq('comercio_cupones.activo', true)
```
Esto dio **400 Bad Request**. Causa raíz: PostgREST solo permite embeds automáticos si existe una FK declarada entre las dos tablas del select. `wikibro.brovision_user_id` tiene FK hacia `profiles`, NO hacia `comercio_cupones` — la relación real es a nivel de datos (`comercio_cupones.user_id = wikibro.brovision_user_id`), pero sin constraint declarada PostgREST no puede resolver el JOIN automático.

**Solución implementada: VIEW en Supabase.**
```sql
CREATE VIEW wikibro_con_cupones AS
SELECT
  w.*,
  cc.id            AS cupon_id,
  cc.descripcion   AS cupon_descripcion,
  cc.descuento_pct AS cupon_descuento_pct,
  cc.condicion     AS cupon_condicion,
  cc.tipo_brocard  AS cupon_tipo_brocard,
  cc.activo        AS cupon_activo
FROM wikibro w
LEFT JOIN comercio_cupones cc
  ON cc.user_id = w.brovision_user_id
  AND cc.activo = true;

GRANT SELECT ON wikibro_con_cupones TO anon, authenticated;
```
**Notas de diseño importantes:**
- `LEFT JOIN`, no `JOIN` normal — así las filas de `wikibro` sin cupón siguen apareciendo (la mayoría del directorio).
- El filtro `cc.activo = true` va DENTRO del `ON`, no en un `WHERE` — si fuera `WHERE`, se convertiría en un JOIN normal de facto y desaparecerían del listado las filas sin cupón activo.
- Columnas reales de `comercio_cupones` (confirmadas por consulta a `information_schema.columns`, NO son las que se asumieron originalmente): `id, comercio_nombre, banner_11_url, web_url, descuento_pct (int4), condicion (text, default '1 producto'), coste_genesis (int4, default 1000), sector, activo (bool, default true), created_at, ciudad, pais, alcance (default 'LOCAL'), descripcion, modelo_key, fase_lunar, vencimiento (date), user_id, palabra_clave_1/2/3, tipo_brocard, email_comercio`. **No existen columnas `tipo_descuento` ni `valor`** — el descuento real es `descuento_pct`.

**Código resultante en `useAgentEvelyn.js` → `buscarEnWikiBro`:**
```js
let query = supabase.from('wikibro_con_cupones').select('*');
```
(Reemplaza el select con embed roto. El resto de filtros — ciudad/barrio/categoria con `ilike`, `es_spam_report`, `.limit(10)` — quedó igual.)

**Código resultante en `WikiBroAcordeon.jsx`:** columnas planas, no array anidado:
```jsx
{item.tiene_brocupon && item.cupon_descripcion && (
  <p>"{item.cupon_descripcion}"</p>
)}
```

**✅ Verificado funcionando end-to-end** con caso de prueba real: fila "Osos IA" en Málaga (Vélez-Málaga), categoría "Cafetería", con `tiene_brocupon = true` y cupón "Te de menta" en `comercio_cupones` vinculado por `brovision_user_id`. El acordeón muestra correctamente nombre, dirección, badge 🟡 BroCupón activo, descripción en cursiva, badge ⚪ COMUNIDAD. Probado en modo básico (sin Neural IA).

### 5. Bugs encontrados y corregidos en `enviarIA()` / `armarSobreWikiBro()`
Tres bugs reales en el camino de datos hacia el modo IA (NO afectaban la búsqueda en sí, solo el contexto que recibía el Worker para narrar):

1. `enviarIA()` no pasaba `intencion` a `armarSobreWikiBro()` → la detección de spam en modo IA estaba completamente rota (la rama `if (intencion === 'spam')` nunca se ejecutaba, llegaba `undefined`).
2. `telefono` tampoco se reenviaba a `armarSobreWikiBro()`.
3. `fetchContexto()` se llamaba dentro de `enviarIA()` pero el resultado nunca se usaba (código muerto).

**Corregido:**
```js
// en enviar():
await enviarIA(textoUsuario, resultados, categoria, barrio, intencion, telefono);

// en enviarIA():
const enviarIA = async (textoUsuario, resultados, categoria, barrio, intencion, telefono) => {
  const sobre = armarSobreWikiBro({
    alias: autorAlias, ciudad, categoria, barrio, telefono, intencion, resultados,
  });
  // ...
```
Se eliminó la línea `const contexto = await fetchContexto();` de dentro de `enviarIA()`. La definición de `fetchContexto` y sus imports (`fetchContextoEvelyn`, `fetchContextoLarry`) se conservaron sin uso activo, reservados para el futuro enriquecimiento desde `profiles` (punto pendiente arriba).

### 6. Placeholder de input pendiente de aplicar
Signor Roberto va a cambiar manualmente el placeholder del input del chat de Evelyn/Larry a algo como:
> "Escribe qué buscas — abrimos la WikiBro" o "¿Qué buscas? Te abro la WikiBro"

---

## ARCHIVOS TOCADOS EN ESTA SESIÓN
```
CREADO  src/components/personajes/WikiBroAcordeon.jsx
EDITADO src/hooks/useAgentEvelyn.js          (limpieza Avisos + flujo único + fix enviarIA)
EDITADO src/components/personajes/EvelynBanner.jsx  (limpieza UI Avisos + montaje WikiBroAcordeon)
SUPABASE: ALTER TABLE wikibro (3 columnas nuevas)
SUPABASE: CREATE VIEW wikibro_con_cupones + GRANT
```
NO se tocó: `evelynExploraPS.js` (detectarIntencionWikiBro, extraerParametrosBusqueda, buildEvelynWikiPrompt, armarSobreWikiBro — solo se les pasaron parámetros adicionales desde fuera, su lógica interna no cambió salvo lo descrito en el punto 5).

---

## HOJA DE RUTA — PENDIENTES (orden no implica prioridad)

### A. Seed de datos con OpenStreetMap (PRÓXIMO TEMA A RETOMAR)
Mencionado como pendiente en el documento original de WikiBro (punto D): "Script que consulta Overpass API por ciudad y categoría. Puebla wikibro con fuente = 'OPENSTREETMAP', verificado = true. Arranca con datos reales desde el día uno sin depender de la comunidad."
**Nada de esto se ha definido en detalle todavía** — ni si se usa la Overpass API pública, ni el mapeo de categorías OSM → categorías WikiBro, ni la cadencia/ciudades a poblar primero, ni si es un script manual (Signor Roberto lo corre una vez) o algo recurrente. Está completamente abierto para la próxima sesión.

### B. Campaña de email vía Brevo (sin desarrollar en esta sesión)
Seguía como pendiente desde el documento original de WikiBro (punto E): "300 emails/mes a entidades y negocios reales. Invitación a verificar su ficha en WikiBro y registrarse en BroVision. Excusa natural para captación de comercios y profesionales."
No se definió en esta sesión: a quién se le manda exactamente (¿solo entidades sin `brovision_user_id`? ¿también las que ya tienen `tiene_brocupon`?), contenido del email, ni cómo se conecta operativamente con el flujo manual de verificación que ya existe (Signor Roberto activa `verificado`/`tiene_brocupon` a mano en Supabase tras contacto).

### C. Enriquecimiento de modo IA desde `profiles`
Cuando un resultado de WikiBro tiene `brovision_user_id`, hacer fetch a `profiles` para que Evelyn/Larry puedan decir cosas como "este negocio tiene blog y videos en Brovision, está registrado". Explícitamente diferido — no bloqueante, sin diseño técnico aún.

### D. Resto de hoja de ruta original de WikiBro (sin cambios desde el documento previo)
- Formulario de aportación ciudadana (panel donde usuario registrado aporta una entrada, validación anti-URL en campos de texto, recompensa en Génesis al aprobar)
- Panel de moderación admin (aprobar/rechazar entradas pendientes)
- Reporte de spam desde Evelyn (ya existe la detección de intención `spam` en `evelynExploraPS.js`, pero el flujo de creación de entrada con `es_spam_report` + incremento de `reportes_count` no se tocó en esta sesión)
- Contacto de creadores vía Evelyn leyendo email/@handle público desde `profiles` (sin mensajería interna)

---

## DECISIONES DE PRODUCTO REAFIRMADAS EN ESTA SESIÓN
- WikiBro sustituye TOTALMENTE a Avisos — no conviven, no hay vuelta atrás al sistema viejo.
- El listado de resultados nunca vive embebido dentro del banner de chat de un personaje — siempre es un panel/overlay separado (patrón ya usado en Oráculo, ahora replicado en WikiBro).
- Las vistas SQL (`CREATE VIEW`) son la solución preferida para resolver relaciones entre tablas sin FK directa, en vez de intentar embeds de Supabase que dependen de constraints declaradas.
