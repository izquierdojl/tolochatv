## Context

El panel de canales (`templates/base.html` + módulo IIFE de `static/js/app.js`) renderiza filas de canal tanto en el árbol (app.js:583-621) como en la lista de favoritos (app.js:384-418). Cada fila termina con el botón de favorito `.channel-favorite-btn`. La URL directa del stream se resuelve en el servidor en `_get_live_player_info` (main.py:1477): para fuentes xtream construye `{base}/live/{user}/{pwd}/{orig_id}.m3u8` (main.py:1498) y para fuentes m3u usa `stream["direct_url"]` (main.py:1489). El endpoint `/api/channels/tree` (main.py:1037) solo devuelve `stream_id`, `name` e `icon`, no la URL directa. Existe ya un patrón de copiado al portapapeles con retroceso en `static/js/player.js` (1075-1092), pero no hay ningún mecanismo de "toast" en la aplicación.

## Goals / Non-Goals

**Goals:**
- Poner un botón de copiado de enlace directo a la izquierda de la estrella en cada fila del árbol y de favoritos.
- Copiar la URL directa del stream al portapapeles y mostrar un "toast" de confirmación.
- Reutilizar la resolución de URL existente del servidor sin duplicar lógica.

**Non-Goals:**
- No exponer todas las URLs directas de golpe en `/api/channels/tree` (se resuelven bajo demanda).
- No cambiar el enlace que copia (se copia la URL directa del stream, no `/play/live/...`).
- No implementar autenticación ni i18n nuevos más allá de añadir las claves de traducción necesarias para los textos del botón y el toast.

## Decisions

### 1. Endpoint autenticado para resolver la URL directa bajo demanda
Se añade un endpoint `GET /api/channels/live-url?stream_id={id}` (auth requerida) que reutiliza `_get_live_player_info` (main.py:1477) y devuelve `{"url": "..."}`. Devuelve error (HTTP 404) cuando no se puede resolver la URL del canal.
**Racional:** `/api/channels/tree` no incluye la URL directa y añadirla a todas las filas expondría todas las credenciales de stream por adelantado y engrosaría la respuesta. Resolver bajo demanda por `stream_id` sigue el patrón existente de resolución de información del reproductor y evita duplicar lógica.
**Alternativa considerada:** incluir `url` en cada canal de `/api/channels/tree`. Descartada por exposición innecesaria de credenciales y mayor peso de respuesta.

### 2. Botón de copiado a la izquierda de la estrella
En `static/js/app.js`, en la construcción de cada fila del árbol (tras crear el enlace, antes de `favorite`, app.js:619) y de favoritos (antes de `remove`, app.js:415), se inserta un botón `type="button"` con clase similar a `channel-copy-btn` (icono de enlace/clipboard), `dataset.streamId`, `aria-label` y `title` localizados.
**Racional:** cumple el requisito de posición "a la izquierda del icono de favoritos" y mantiene la coherencia visual con los controles existentes del panel.

### 3. Copiado al portapapeles con retroceso
Al pulsar el botón, el cliente hace `fetch('/api/channels/live-url?stream_id=...')`, y con la URL resultante usa `navigator.clipboard.writeText` con el retroceso mediante `textarea` + `document.execCommand('copy')` (mismo patrón que player.js:1075-1092).
**Racional:** el patrón ya existe y es multiplataforma (incluidos contextos no seguros donde `navigator.clipboard` no está disponible).

### 4. Toast propio en `static/js/app.js`
Se implementa un pequeño helper de "toast" en el módulo del panel (crea un elemento en el DOM, lo muestra unos segundos y lo elimina), reutilizable para el caso de éxito y de error. No existe infraestructura de toast en la app, por lo que se añade una mínima y local.
**Racional:** la funcionalidad pedida exige un aviso no intrusivo; crear un helper local evita introducir una dependencia nueva.

## Risks / Trade-offs

- [La URL directa puede requerir contexto de red del servidor y no ser alcanzable desde el cliente] → Es el comportamiento esperado y pedido (copiar la URL directa); el "toast" de error cubre el caso en que no se resuelva.
- [`navigator.clipboard` puede no estar disponible en contextos no seguros] → Se usa el retroceso con `textarea`/`execCommand`, ya probado en player.js.
- [Nuevo endpoint expone la URL directa a usuarios autenticados] → El endpoint exige autenticación y solo resuelve canales ya visibles; no filtra canales que el usuario no puede ver. Se documenta que no debe loguear credenciales de stream.
