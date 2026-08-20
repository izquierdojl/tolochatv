## 1. Rama de trabajo

- [x] 1.1 Asegurar que los cambios se desarrollan en la rama `feature/copy-channel-link` (creada desde `main`); verificar con `git branch --show-current` antes de comenzar la implementación

## 2. Endpoint de URL directa (backend)

- [x] 2.1 Añadir en `main.py` un endpoint autenticado `GET /api/channels/live-url?stream_id={id}` que reutilice `_get_live_player_info` (main.py:1477) y devuelva `{"url": "..."}`; cuando no se pueda resolver la URL, devolver un error HTTP 404. Verificar con tests en `main_test.py`
- [x] 2.2 Añadir tests del endpoint en `main_test.py`: resolución xtream (URL `{base}/live/{user}/{pwd}/{orig_id}.m3u8`), resolución con `direct_url` de m3u, canal inexistente (404) y petición sin autenticación (rechazada). Verificar con `uv run pytest main_test.py -k live_url`

## 3. Botón de copiado y toast (frontend)

- [x] 3.1 En `static/js/app.js`, añadir un helper de "toast" local (crear elemento, mostrar unos segundos, eliminar) reutilizable para éxito y error. Verificar que el helper se invoca sin errores en la consola del navegador
- [x] 3.2 En la construcción de las filas del árbol (`app.js` ~619), insertar el botón de copiado a la izquierda del control de favoritos, con `dataset.streamId`, `aria-label` y `title` localizados y estilo coherente con los controles del panel. Verificar que el botón aparece a la izquierda de la estrella
- [x] 3.3 En la construcción de las filas de favoritos (`app.js` ~415), insertar el mismo botón de copiado a la izquierda del control de desmarcado. Verificar que aparece a la izquierda de la estrella en la sección de favoritos
- [x] 3.4 Implementar el manejador de click del botón: `fetch('/api/channels/live-url?stream_id=...')`, copiar la URL al portapapeles con `navigator.clipboard.writeText` y retroceso mediante `textarea` + `execCommand('copy')` (patrón de `player.js` 1075-1092), y mostrar el "toast" de éxito; en caso de error (URL no resoluble o fallo de copia), mostrar el "toast" de error sin copiar. Verificar manualmente copiando desde árbol y favoritos

## 4. Verificación y calidad

- [x] 4.1 Añadir/actualizar claves de i18n (traducciones) para el nombre accesible del botón y los mensajes de "toast" (éxito y error) en los catálogos existentes. Verificar que no quedan claves sin traducir en es
- [x] 4.2 Ejecutar `uv run ruff check .`, `uv run basedpyright` y `uv run pytest` y confirmar que pasan sin errores nuevos
