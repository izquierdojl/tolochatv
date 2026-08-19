## 1. Contrato y compatibilidad de preferencias

- [x] 1.1 Confirmar en `main.py` y `cache.py` que `GET/POST /api/user-prefs` conserva `favorites.movies` y `favorites.series` al añadir `favorites.live`, tratando la ausencia de `live` como una colección vacía sin migración obligatoria.
- [x] 1.2 Añadir en `main_test.py` pruebas autenticadas para guardar y recuperar `favorites.live`, conservar favoritos de películas/series, rechazar acceso no autenticado y aislar las preferencias entre usuarios.

## 2. Estructura visual y localización

- [x] 2.1 Añadir en `templates/base.html` el botón de favoritos del rail, con icono de estrella inline, estado activo y nombres accesibles localizados.
- [x] 2.2 Separar en el panel los contenedores de árbol y favoritos, incluyendo la lista plana, el estado vacío, el control de desmarcado y el enlace de reproducción sin anidar botones dentro de enlaces.
- [x] 2.3 Añadir a `translations/es_ES.json` las etiquetas de la sección, marcar/desmarcar, estado vacío y nombres accesibles de los controles.

## 3. Estado y persistencia en el cliente

- [x] 3.1 Extender el módulo de canales de `static/js/app.js` con `panelView` y la carga cacheada de `/api/user-prefs`, inicializando `favorites.live` sin romper las preferencias existentes.
- [x] 3.2 Implementar el guardado parcial de preferencias y el toggle de favoritos por `stream_id`, actualizando la estrella, la lista y el estado local aunque el guardado remoto sea asíncrono.
- [x] 3.3 Mantener la selección, expansión y scroll existentes del árbol al alternar entre la vista de grupos y la vista plana, incluyendo apertura directa de favoritos desde el rail.

## 4. Renderizado e interacción

- [x] 4.1 Modificar el renderizado de filas del árbol en `static/js/app.js` para mostrar la estrella como control hermano del enlace, con `aria-pressed`, estados visuales distintos y sin navegación al marcar/desmarcar.
- [x] 4.2 Indexar `treeData.groups` por `stream_id` y renderizar una sola fila por favorito visible, combinando sus grupos actuales entre paréntesis y omitiendo favoritos no disponibles.
- [x] 4.3 Implementar reproducción mediante `/play/live/{stream_id}` y desmarcado directo desde la lista, sincronizando las estrellas del árbol sin reconstruir innecesariamente el árbol completo.
- [x] 4.4 Integrar la vista de favoritos con `panelFocusables()` y el manejador de teclado existente: flechas, Enter, barra espaciadora y Escape deben conservar el foco y el comportamiento esperado.
- [x] 4.5 Persistir la vista activa del panel y el canal seleccionado al navegar desde un favorito al reproductor, restaurando la sección de favoritos al volver a cargar la página.

## 5. Verificación funcional

- [ ] 5.1 Ejecutar manualmente `uv run ./main.py --port 8000` y comprobar marcar/desmarcar desde árbol y favoritos, recarga, cambio de usuario, canal multicategoría, permisos, reproducción y comportamiento en `/play/`.
- [x] 5.2 Ejecutar `uv run ruff check .`, `uv run basedpyright` y `uv run pytest`.
