## 1. Base visual

- [x] 1.1 Crear `static/css/tolocha-theme.css` con tokens `--tc-*`, colores por rol, superficies, estados de foco/hover/seleccionado, fallback sólido y reglas `prefers-reduced-motion`; verificar que la hoja es autónoma, no introduce recursos remotos y contiene el tratamiento de montaña/pinar con `pointer-events: none`.
- [x] 1.2 Enlazar la hoja versionada desde `templates/base.html`, `templates/login.html` y `templates/setup.html`, y revisar `main.py`/`ASSET_VERSION` solo si la convención de cacheado lo exige; verificar en las respuestas HTML que el enlace incluye `?v=` y que `/static/css/tolocha-theme.css` se sirve.

## 2. Carcasa y vistas de contenido

- [x] 2.1 Aplicar la identidad a `templates/base.html`: fondo y relieve, rail, panel `#channels-panel`, `main`, toasts, botones y estados globales; verificar que permanecen intactos los IDs y atributos usados por `static/js/app.js` y que el foco sigue visible.
- [x] 2.2 Actualizar `templates/guide.html`, `templates/vod.html`, `templates/movie_detail.html`, `templates/series.html`, `templates/series_detail.html` y `templates/search.html` para usar superficies, tarjetas, filtros, chips y estados semánticos del tema; verificar que sus enlaces, formularios y scripts siguen presentes en el HTML renderizado.
- [x] 2.3 Actualizar `templates/settings.html` con superficies, controles, formularios, detalles desplegables, chips de categorías y estados de peligro del tema; verificar que los campos existentes conservan sus `id`, `name`, acciones y comportamiento de `settings.js`.

## 3. Reproductor y acceso

- [x] 3.1 Adaptar `templates/player.html` y sus estilos locales a la paleta Tolocha para controles, progreso, carga, error, overlays y menú; verificar que `player.js` conserva todos los selectores y que vídeo, controles y mensajes mantienen contraste.
- [x] 3.2 Adaptar `templates/login.html`, `templates/setup.html` y `templates/error.html` a la misma marca, panel, fondo decorativo, mensajes y estados de formulario; verificar las rutas de login, setup y error con las pruebas de renderizado existentes.
- [x] 3.3 Ajustar breakpoints y capas decorativas para escritorio, tableta y móvil, incluyendo el panel de canales y el reproductor; verificar manualmente ausencia de desplazamiento horizontal, controles utilizables y contenido prioritario visible en una pantalla estrecha.

## 4. Verificación y acabado

- [x] 4.1 Añadir o ajustar comprobaciones en `main_test.py` para la carga versionada del CSS, las clases/estructura visual compartida y la presencia de la identidad en login/setup sin depender de red ni navegador; verificar que las pruebas nuevas pasan con fixtures existentes.
- [x] 4.2 Revisar contraste de texto, controles, foco y estados sobre las superficies principales, además de la preferencia `prefers-reduced-motion`; verificar visualmente guía, catálogo, ajustes, player y acceso en escritorio y móvil.
- [x] 4.3 Ejecutar `uv run ruff check .`, `uv run basedpyright` y `uv run pytest`; verificar que los tres comandos finalizan correctamente y que no se han modificado `cache.py`, `epg.py` ni `auth.py`.
