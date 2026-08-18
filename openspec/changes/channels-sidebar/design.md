## Context

La guía (`/guide`, main.py:666) y el buscador (`/search`, main.py:1670) son los únicos puntos de lanzamiento de canales en vivo. Ambos comparten las mismas reglas de visibilidad, centralizadas en `_get_guide_streams` (main.py:799): grupos del `guide_filter` del usuario (persistido en user settings vía `load_user_settings`) menos los grupos bloqueados del usuario (`auth.get_user_limits(username)["unavailable_groups"]`, prefijados `cat:{id}`). Los datos viven en `get_cache()["live_categories"]`/`["live_streams"]`, con relleno desde `live_data.json` siguiendo el patrón de guide_page (main.py:679-686).

La reproducción es una navegación a `/play/live/{stream_id}` (mismo enlace que usa search.html:63). El menú vertical es un rail de 40px (`templates/base.html:32-84`) compartido por todas las páginas autenticadas (login/setup no extienden base). El dropdown de categorías de la guía (`templates/guide.html:332-364`) ya establece el patrón de panel flotante como portal en `body` posicionado por JS. Los iconos del rail son Material clásico (search, settings, tv) o SVG a mano; el nuevo usa el path Material `view_list`. Los logos externos se sirven vía proxy `/api/logo` aplicado con `_logo_url_filter` (main.py:163) en Jinja; `guide.html:316-328` mantiene un espejo JS (`logoUrlFilter`) del mismo filtro.

Ver proposal.md para la motivación y specs/channels-tree/spec.md para el comportamiento acordado.

## Goals / Non-Goals

**Goals:**
- Un solo endpoint que devuelva el árbol completo (decisión del usuario) con las mismas reglas de visibilidad que la guía.
- Panel flotante reutilizable en todas las páginas, sin duplicar lógica de visibilidad en el cliente.
- Navegación por teclado coherente con app.js, incluidas las páginas con navegación custom (`/play/`, `/guide`).

**Non-Goals:**
- Buscar/filtrar dentro del árbol (la sección es un lanzador, no un buscador).
- Carga perezosa por grupo o paginación.
- Sincronizar el estado expandido en vivo entre pestañas (solo se rehidrata al cargar cada página).
- Mostrar EPG en el árbol (los enlaces van al player normal).

## Decisions

### 1. Un endpoint que aplica la visibilidad en servidor
`GET /api/channels/tree` (auth requerida, mismo patrón de dependencia que `/api/guide/rows` en main.py:932) devuelve:

```json
{"groups": [
  {"category_id": "src1_12", "category_name": "Noticias",
   "channels": [{"stream_id": 123, "name": "CNN", "icon": "/api/logo?..."}]}
]}
```

- La lógica de visibilidad (exclusión de grupos bloqueados, canal multicategoría en cada grupo, inclusión de "Uncategorized") vive en una helper nueva `_build_channels_tree(username)` junto a `_get_guide_streams` (main.py:799), reutilizando `load_user_settings`, `auth.get_user_limits` y la caché de streams. Un canal se lista bajo cada grupo visible al que pertenece (sin deduplicar, a diferencia de la guía); los grupos sin canales se omiten. **Fallback**: si `guide_filter` está vacío (filtro de Ajustes sin configurar), el árbol usa todas las `live_categories` de las fuentes, salvo los grupos bloqueados. **Ordenación**: los grupos se ordenan SIEMPRE alfabéticamente por `category_name` (comparación sin distinguir mayúsculas, `str.lower`), con desempate por `category_id` para estabilidad; el orden del `guide_filter` deja de influir en el orden (solo decide qué grupos se muestran cuando está poblado). Solo cuando no hay datos en caché devuelve `{"groups": []}`.
- Los iconos se devuelven ya envueltos con `_logo_url_filter` (main.py:163) para que el cliente use la URL tal cual — evita duplicar `logoUrlFilter` en app.js.
- Sin datos en caché, devuelve `{"groups": []}` (el panel muestra el estado vacío; el panel se reabre tras el refresco de la guía).

**Alternativas descartadas**: (1) servir los datos inline en cada página vía `base.html` — inyecta miles de canales en cada respuesta de página; el fetch único al abrir el panel es más ligero y se cachea en memoria del cliente. (2) dejar el árbol vacío cuando `guide_filter` no está configurado (comportamiento inicial) — en la práctica, cargar una lista y no ver nada al abrir el panel era el fallo reportado; el filtro de Ajustes es un paso extra no obvio y su ausencia no debería dejar el navegador inútil. (3) acoplar el árbol a `guide_selected_cats` (la selección temporal del desplegable de la guía) — es un estado efímero de sesión y no encaja en un navegador persistente; se descarta y el árbol se basa solo en el filtro persistente con el retroceso a "todo".

### 2. Icono + panel lateral fijo (columna del layout)
- Nuevo elemento en el rail de `base.html` (junto a los demás `nav-link`) con el path Material `view_list` relleno, `title="{{ _('Channels') }}"`, y el estado `active` cuando el panel está visible.
- El panel deja de ser un portal `fixed`: es una **columna del layout** de `base.html` — `<div class="flex h-full">` → `nav` (rail, `w-10`) + `#channels-panel` + `main` (`flex-1`). El panel es `w-[300px] flex-shrink-0 overflow-y-auto` y al ocultarse queda a ancho 0 (el `main` recupera todo el ancho). Como `player.html` extiende `base.html`, el vídeo del reproductor queda automáticamente junto al panel y nunca cubierto.
- Estructura del árbol: cabecera de grupo (`▶/▼` + nombre + contador) y filas de canal (`img` con el icono + nombre, `onerror` oculta el logo como en guide.html:241). Los canales de un grupo solo se renderizan al expandirlo (DOM perezoso), lo que mantiene el árbol fluido con miles de canales. El panel queda preparado para futuras operaciones por fila (favoritos, nueva ventana, reproductores externos) sin cambiar el layout.
- La cabecera del panel (`#channels-panel`) incluye, junto al título "Channels" y el contador, un botón de **toggle desplegar/plegar todo** (`#channels-toggle-all`): si algún grupo está plegado → "Expand all"; si todos están desplegados → "Collapse all".
- En pantallas estrechas la columna de 300px puede ocupar demasiado; queda como detalle a decidir (p. ej. overlay o colapso por defecto en móvil) fuera del alcance actual.

### 3. Estado y ciclo de vida en app.js
- Un pequeño módulo en `static/js/app.js` (se carga en todas las páginas vía base.html): toggle del panel, fetch único de `/api/channels/tree` cacheado en memoria, renderizado del árbol y colapso/expansión con estado en un `Map` por `category_id`.
- **Desplegar/plegar todo**: el botón de cabecera decide la acción según el estado — si hay algún grupo plegado, expande todos (`expanded` con todas las categorías a `true`); si todos están desplegados, los pliega todos (`expanded` vacío). El renderizado usa el mismo DOM perezoso por grupo.
- **Persistencia**: el estado abierto/cerrado y los grupos expandidos se guardan en `localStorage` (claves tipo `tolochatv.channels.panelOpen` y `tolochatv.channels.expanded`) y se rehidratan al cargar cada página, de modo que el panel "se queda" donde lo dejó el usuario.
- Los enlaces de canal son `<a href="/play/live/{stream_id}">` normales; el manejo de Enter existente (app.js:189-203) y el clic funcionan sin cambios.

### 4. Teclado integrado con app.js existente
- **Escape**: cuando el foco está dentro del panel, Escape lo oculta (colapsa) y devuelve el foco al icono — con prioridad sobre el intercambio nav↔contenido actual (app.js:216-224).
- **Flechas**: mientras el foco está dentro del panel, las flechas se restringen al contenedor del panel (los `getFocusables` del panel son los grupos y canales visibles), incluso en páginas custom (`hasCustomNav` en app.js:6-7): el panel debe navegarse también desde `/play/`. Al salir del panel, vuelve el comportamiento habitual.

### 5. i18n
Cadenas nuevas ("Channels", estado vacío, "Expand all", "Collapse all") vía `I18N.t(...)` en JS y `_()` en el título del icono del template. Se añaden las claves al catálogo `translations/es_ES.json` (el inglés es identidad, sin catálogo). Los nombres de grupos/canales son contenido de fuente, no se traducen.

## Risks / Trade-offs

- **Payload grande en un solo fetch** (miles de canales, algunos con logos remotos) → elegido por el usuario; mitigación: DOM perezoso (solo se montan grupos expandidos) y los logos se cargan bajo demanda del navegador (lazy `img` si hace falta).
- **Conflicto de teclado con páginas custom** (`/play/`, `/guide` gestionan sus propias flechas) → el panel intercepta solo cuando está abierto y el foco está en él; al cerrarse no altera el comportamiento actual.
- **Endpoint sin datos de caché** devuelve vacío aunque el fondo esté cargando → mitigación: el panel muestra el estado vacío y se reabre tras el refresco; no se añade lógica de suscripción al estado de carga (fuera de alcance).
- **Doble aparición de canales multicategoría** (visible para el usuario) → comportamiento decidido explícitamente (espec: canal en cada grupo).
- **El panel fijo reduce el ancho del contenido/vídeo** → aceptado por el usuario (columna lateral); el panel se puede ocultar para ancho completo. En pantallas estrechas la columna de 300px puede estorbar → mitigación futura (overlay o colapso por defecto en móvil), fuera del alcance actual.
- **localStorage y varias pestañas** → el estado se rehidrata al cargar cada página; los cambios en una pestaña no se propagan en vivo a otras (aceptable para un cliente self-hosted).
- **"Desplegar todo" monta todos los canales de golpe** (con miles de canales el DOM puede ser pesado) → mitigación: el renderizado sigue siendo por grupo; si resulta lento con listas muy grandes, optimización futura (virtualización o límite de filas montadas).

## Migration Plan

- Sin cambios de esquema ni de configuración: solo aditivo (endpoint nuevo + icono + panel).
- Despliegue: rama separada `feature/channels-sidebar` con PR, igual que i18n-spanish.
- Rollback: revert del PR; la ausencia del panel no afecta a nada existente.
