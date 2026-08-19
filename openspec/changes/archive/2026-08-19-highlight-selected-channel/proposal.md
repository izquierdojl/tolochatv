## Why

Al hacer doble-clic (o activar) un canal del panel lateral "Canales", se inicia correctamente la reproducción en `/play/live/{stream_id}`, pero el panel pierde la noción de qué canal está seleccionado: al navegar y volver, ningún canal queda resaltado, y el usuario no ve cuál es el canal activo para gestionarlo directamente. Este pequeño inconveniente rompe el flujo de uso del panel como navegador de canales.

## What Changes

- El panel lateral "Canales" mantiene un **canal seleccionado** y lo **resalta visualmente** (fondo/acento) de forma estable, distinta del anillo de foco transitorio.
- La selección se **persiste en `localStorage`** para que sobreviva a la navegación (al abrir `/play/...` y al volver a la guía, búsqueda, etc.).
- La selección se mantiene **sincronizada con el canal en reproducción**: al cargar cualquier página cuya URL sea `/play/live/{stream_id}`, ese canal pasa a ser el seleccionado.
- Al seleccionar un canal (clic en el árbol), se guarda como seleccionado **antes** de navegar a `/play/live/{stream_id}`.
- Al abrir el panel, el grupo que contiene el canal seleccionado se **expande y el canal se desplaza a la vista** cuando es posible, para que el usuario pueda localizarlo directamente.
- Al seleccionar un canal en el árbol también se guarda el `scroll`/posición del panel donde estaba, para restaurarlo al volver.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `channels-tree`: Añade una nueva exigencia de comportamiento: el panel "Canales" debe mantener y resaltar visualmente el canal seleccionado, persistir esa selección y mantenerla sincronizada con el canal en reproducción.

## Impact

- **Código afectado**: únicamente frontend.
  - `static/js/app.js` — módulo del panel de canales (`renderTree`, estado de selección, persistencia en `localStorage`, sincronización con la URL `/play/live/{stream_id}`, auto-expansión/scroll al canal seleccionado).
  - `templates/base.html` — clase/estilo CSS para resaltar el canal seleccionado del árbol (si no se define en `app.js`).
- **APIs**: ninguna. No se modifica ningún endpoint (`/api/channels/tree` ya aporta `stream_id` por canal).
- **Módulos Python**: ninguno (`main.py`, `cache.py`, etc. no cambian).
- **Pruebas**: no hay pruebas JS en pytest; los tests existentes (`main_test.py`) no se ven afectados. Verificación manual vía `uv run ./main.py --port 8000`.
- **i18n**: no se añaden cadenas de UI nuevas; el resaltado es puramente visual. Si se añade alguna etiqueta de accesibilidad (`title`/`aria-label`), debe incluirse en `translations/es_ES.json`.
