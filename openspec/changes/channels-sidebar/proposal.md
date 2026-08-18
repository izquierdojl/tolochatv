## Why

Los canales en vivo solo se pueden lanzar desde la guía (con su EPG) o desde el buscador. Para un uso habitual de zapping es incómodo: no existe una vista simple de "todos mis canales agrupados" desde la que arrancar la reproducción con un clic. Se añade una nueva sección en el menú vertical (rail de iconos) que muestra los canales IPTV visibles en la guía, anidados por grupos desplegables, para lanzarlos directamente.

## What Changes

- Nuevo icono en el menú vertical de `base.html` (estilo Material clásico, `view_list`) que muestra/oculta el panel lateral "Canales".
- El panel es una **columna lateral fija** del layout (`rail | panel | contenido`): al abrirlo ocupa su propio ancho y el contenido se desplaza; nunca se superpone a nada, incluido el vídeo del reproductor, que queda junto al panel.
- El estado del panel (abierto/cerrado y grupos expandidos) persiste entre páginas (localStorage).
- El panel es la base para operaciones futuras con canales (favoritos, nueva ventana, reproductores externos), que añadirán acciones por fila sin cambiar el layout.
- El árbol muestra grupos → canales, con el logo y nombre de cada canal, y contador de canales por grupo.
- Los grupos se muestran **siempre en orden alfabético** (por nombre, sin distinguir mayúsculas), independientemente del orden del filtro.
- La cabecera del panel incluye un **toggle para desplegar o plegar todos los grupos** a la vez.
- Los canales mostrados son exactamente los visibles en la guía por defecto: los grupos del `guide_filter` del usuario (incluido el grupo sintético "Uncategorized"), excluyendo los grupos no disponibles para el usuario (`cat:{id}`). Si el `guide_filter` está vacío (filtro de ajustes sin configurar), el árbol muestra todos los grupos de las fuentes cargadas, salvo los bloqueados.
- Un canal perteneciente a varios grupos aparece bajo cada uno de ellos.
- Clic en un canal → navegación normal a `/play/live/{stream_id}` (misma ruta que guía y buscador).
- Nuevo endpoint `GET /api/channels/tree` (auth requerida) que devuelve grupos + canales en un solo fetch.
- El panel es accesible por teclado: flechas para navegar, Escape colapsa, foco inicial dentro del árbol al abrir.
- Textos del panel traducidos vía i18n (`_()`/`I18N.t()`), añadiendo claves nuevas al catálogo `translations/es_ES.json`.
- **Nota de flujo de trabajo**: la implementación se desarrollará en una rama separada (p. ej. `feature/channels-sidebar`) para revisión por PR, como se hizo con el change i18n-spanish.

## Capabilities

### New Capabilities
- `channels-tree`: navegador de canales en vivo en el menú vertical — árbol de grupos desplegables con los canales visibles en la guía, lanzables a `/play/live/{stream_id}`, con endpoint de datos propio.

### Modified Capabilities
<!-- Ninguna: la guía, el buscador y el player no cambian su comportamiento. -->

## Impact

- `main.py` — nuevo endpoint `GET /api/channels/tree` (reutiliza `load_file_cache`/caché en memoria, `auth.get_user_limits`, `load_user_settings` como `_get_guide_streams`) con ordenación alfabética de grupos.
- `templates/base.html` — nuevo icono + panel lateral fijo con cabecera "Canales" (contador + toggle desplegar/plegar todo).
- `static/js/app.js` — lógica del panel: mostrar/ocultar, fetch del árbol, renderizado, colapso/expansión individual y de todos los grupos, persistencia (localStorage), integración con la navegación por teclado existente (Escape, flechas).
- `translations/es_ES.json` — nuevas claves ("Channels", "No channels", "Expand all", "Collapse all", etc.).
- Tests: `main_test.py` (endpoint `/api/channels/tree`: filtrado por guide_filter, grupos no disponibles, canal multicategoría en varios grupos, inclusión de "Uncategorized", **orden alfabético**, auth requerida).
