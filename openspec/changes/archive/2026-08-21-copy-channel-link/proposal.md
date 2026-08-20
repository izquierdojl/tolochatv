## Why

El usuario quiere poder capturar el enlace directo de un canal IPTV y copiarlo al portapapeles desde el panel de canales, tanto en el árbol de todos los canales como en la sección de favoritos, para poder usarlo en un reproductor externo o compartirlo. El sistema ya resuelve esa URL directa en el servidor (lógica de `_get_live_player_info`), pero no la expone al cliente del panel.

## What Changes

- Añadir un botón de "copiar enlace" en cada fila de canal del panel de canales, situado **a la izquierda** del control de favoritos (estrella), tanto en la vista de árbol como en la lista de favoritos.
- Al pulsarlo, copiar al portapapeles la **URL directa del stream** del canal (la URL cruda del flujo IPTV, no el enlace de la app `/play/live/...`).
- Mostrar un aviso tipo "toast" no intrusivo indicando que el enlace se ha copiado.
- Exponer un endpoint autenticado que devuelva la URL directa de un canal en vivo a partir de su `stream_id`, reutilizando la resolución existente.
- Crear el cambio en una rama de trabajo separada (`feature/copy-channel-link`).

## Capabilities

### New Capabilities

- Ninguna. El comportamiento se añade dentro de la capacidad existente del árbol de canales.

### Modified Capabilities

- `channels-tree`: se añaden requisitos de comportamiento al panel de canales — un control de copiado de enlace directo por fila de canal (árbol y favoritos), con aviso "toast", y un endpoint autenticado que resuelve la URL directa del stream en vivo.

## Impact

- `main.py` — nuevo endpoint autenticado para resolver la URL directa de un canal en vivo (reutiliza la lógica de `_get_live_player_info`, main.py:1477). No se modifica el contrato de `/api/channels/tree`.
- `static/js/app.js` — renderizado del botón de copiado en las filas del árbol y de favoritos, gestión del click (fetch del endpoint, copia al portapapeles con retroceso, y toast). Es el único archivo JS afectado.
- `static/css` (si procede) — estilos del botón y del toast, siguiendo los patrones de Tailwind existentes.
- Tests: `main_test.py` (endpoint de URL directa: resolución xtream y `direct_url` m3u, auth requerida, canal inexistente). Los cambios de UI no tienen cobertura de tests existente.
