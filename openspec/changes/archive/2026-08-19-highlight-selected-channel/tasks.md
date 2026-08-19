## 1. Estado de selección (static/js/app.js — módulo Channels Tree)

- [x] 1.1 Añadir una constante de almacenamiento `STORE_SELECTED = 'tolochatv.channels.selected'` junto a `STORE_OPEN`/`STORE_EXPANDED` (app.js:260-261) y un estado `selectedStreamId: string | null` en el módulo.
- [x] 1.2 Cargar la selección persistida desde `localStorage` en la inicialización del módulo (mismo patrón try/catch que `loadState()`, app.js:297-307), comparando siempre como string.
- [x] 1.3 En la inicialización, si `location.pathname` coincide con `/play/live/{resto}` (la ruta es `/play/{stream_type}/{stream_id:path}`, puede contener `/`), asignar `selectedStreamId = decodeURIComponent(resto)` y persistirlo en `localStorage` (sincronización con el canal en reproducción, spec "Sincronización con el canal en reproducción").
- [x] 1.4 Al crear cada `<a>` de canal en `renderTree()` (app.js:355-371), añadir `a.dataset.streamId = String(ch.stream_id)` para poder localizarlo tras el render.

## 2. Resaltado visual del canal seleccionado

- [x] 2.1 Añadir en `templates/base.html` (bloque `<style>` existente, base.html:18-26) una regla CSS `.channel-selected` que resalte la fila de forma estable y diferenciable del anillo de foco (fondo azul/acento + texto, p.ej. `background-color: rgb(37 99 235 / 0.4)`), sin reutilizar los estilos de `:focus` (decisión D3 del design.md).
- [x] 2.2 En `renderTree()`, cuando `String(ch.stream_id) === selectedStreamId`, añadir la clase `channel-selected` al `<a>` del canal (además de sus clases existentes), garantizando que solo un canal quede resaltado (spec "Canal seleccionado resaltado").
- [x] 2.3 Al hacer clic en un canal del árbol, persistir `selectedStreamId = String(ch.stream_id)` en `localStorage` antes de la navegación a `/play/live/{stream_id}` (mismo comportamiento que el clic, sin bloquear el enlace).

## 3. Localización del canal seleccionado al abrir el panel

- [x] 3.1 En `showPanel()` (app.js:386-404), antes de `renderTree()`, si `selectedStreamId` está definido, expandir el primer grupo que contenga un canal con ese `stream_id` (`expanded.set(cat, true)` + `saveExpanded()`), de modo que quede visible al renderizar (spec "Localización del canal seleccionado").
- [x] 3.2 Tras el render inicial del árbol, **no** desplazar el scroll del panel (decisión del usuario: el scroll nunca se mueve al abrir el panel). El canal seleccionado solo se resalta y su grupo se expande si estaba colapsado; la posición de scroll vertical del panel se conserva exactamente.
- [x] 3.3 **No reconstruir el árbol al reabrir/volver** (decisión del usuario: "el árbol se recarga al hacer click y no debería ser así", design D5): añadir `treeRendered`; en `showPanel` solo llamar a `renderTree()` si el árbol no está montado o si `revealSelectedGroup()` devolvió `true` (se auto-expandió el grupo); si el árbol ya está montado, llamar solo a `applySelectionHighlight()` para actualizar la clase `.channel-selected` sin reconstruir.
- [x] 3.4 **Persistir y restaurar el scroll del panel**: clave `tolochatv.channels.scroll` (`STORE_SCROLL`), listener `scroll` pasivo del panel que guarda `panel.scrollTop`, y `restorePanelScroll()` tras el primer render. En `pageshow` con `e.persisted` (bfcache) re-aplicar `applySelectionHighlight()` y `restorePanelScroll()` para corregir un resaltado obsoleto del momento de la navegación.

## 4. Verificación

- [x] 4.1 Comprobación manual con `uv run ./main.py --port 8000`: abrir el panel "Canales", activar un canal (clic y doble-clic) y verificar que queda resaltado; navegar a otra página y volver comprobando que el resaltado persiste; abrir directamente `/play/live/{id}` y comprobar que ese canal aparece resaltado y el anterior deja de estarlo; abrir el panel con el grupo del canal colapsado y verificar que se expande y el canal queda visible; comprobar que solo hay un canal resaltado en todo momento. (Verificado por el usuario: el árbol conserva grupos expandidos, scroll y resaltado al navegar y volver — funciona correctamente).
- [x] 4.2 Ejecutar las comprobaciones del proyecto: `uv run ruff check .`, `uv run basedpyright` y `uv run pytest` (no debería haber cambios en Python ni en tests, `main_test.py` incluido).
