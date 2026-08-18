## 1. Fundación del módulo i18n

- [x] 1.1 Crear `i18n.py` con `SUPPORTED_LANGS = ("es-ES", "en")`, `DEFAULT_LANG = "es-ES"`, `TRANSLATIONS_DIR` (reemplazable en tests), `load_catalog()`, `translate()` y `resolve_language()` con normalización `es*` → `es-ES`
- [x] 1.2 Añadir a `i18n.py` el `contextvar` de idioma, `set_current_lang()`/`current_lang()` y la función global `t()` que traduce con el idioma del contextvar
- [x] 1.3 Crear `translations/es_ES.json` con el catálogo inicial (todas las claves de UI y errores identificadas en el barrido de plantillas y `main.py`)
- [x] 1.4 Crear `i18n_test.py` cubriendo: `translate` con clave presente/ausente (fallback inglés), `resolve_language` con todas las combinaciones de prioridad, y `t()` leyendo el contextvar

## 2. Integración en el backend

- [x] 2.1 Registrar `TEMPLATES.env.globals["_"] = i18n.t` en `main.py` (junto a `logo_url` y el resto de filtros/globals)
- [x] 2.2 Añadir la dependencia `resolve_locale(request)` en `main.py` usando `get_current_user()` (auth opcional) + `Accept-Language` + `default_language` del servidor, y `set_current_lang()` en cada ruta de página (login, setup, guide, vod, series, movie_detail, series_detail, player, search, settings, error)
- [x] 2.3 Pasar el código de idioma resuelto como variable `lang` al contexto de las plantillas de página
- [x] 2.4 Añadir el endpoint `GET /api/i18n.js` (auth opcional) que devuelve `window.I18N` con `strings` + `t(k)` (fallback a la clave)
- [x] 2.5 Cargar `/api/i18n.js` en `base.html` (y en `login.html`/`setup.html` que no extienden base) antes de los demás scripts

## 3. Persistencia de la preferencia de idioma

- [x] 3.1 Añadir `data.setdefault("language", "")` en `cache.load_user_settings` (`cache.py:537-543`)
- [x] 3.2 Añadir `"language"` a `get_user_prefs` (`main.py:2555-2565`) y a la whitelist de `save_user_prefs` (`main.py:2580-2587`)
- [x] 3.3 Añadir `default_language` a `server_settings.json` (lectura con `get("default_language", "es-ES")`) y aceptarlo en el endpoint de guardado de ajustes del servidor (`main.py` ~2656-2694)
- [x] 3.4 Actualizar `cache_test.py` y `main_test.py` para cubrir la persistencia de `language` (user prefs) y `default_language` (server settings)

## 4. Selector de idioma en Settings

- [x] 4.1 Añadir el dropdown "Idioma / Language" en la sección Client Settings de `settings.html` (valores es-ES/en, marcado según `lang` activo), que hace POST a `/api/user-prefs` con `{"language": ...}` y recarga la página
- [x] 4.2 Añadir el dropdown "Idioma por defecto" en la sección Server Settings de `settings.html` (solo admin), guardado vía el endpoint de ajustes del servidor
- [x] 4.3 Añadir `default_language` a la respuesta del endpoint de lectura de ajustes del servidor (`get_settings_api`, `main.py:2787`)
- [x] 4.4 Actualizar `settings.js` si necesita nuevos handlers para los dropdowns de idioma (o reutilizar los patrones existentes de `cc_lang`/settings)
- [x] 4.5 Test de ruta en `main_test.py`: página de settings muestra el selector; POST a `/api/user-prefs` con `language` persiste y se refleja en `GET /api/user-prefs`

## 5. Traducción de plantillas

- [x] 5.1 Envolver con `{{ _('...') }}` todas las cadenas visibles de `base.html` (títulos nav, tooltips, Logout) y emitir `<html lang="...">` dinámico
- [x] 5.2 Traducir `login.html` y `setup.html` (títulos, labels, botones, mensaje de error) y su `<html lang>`
- [x] 5.3 Traducir `settings.html` (todas las secciones: filtros, captions, usuarios, transcoding, user-agent, data/probe cache, sources, modales) — el fichero más grande
- [x] 5.4 Traducir `guide.html` (header, categorías, EPG, mensajes de carga/error/empty states)
- [x] 5.5 Traducir `player.html` (menú de settings del reproductor, overlay, títulos/tooltips de botones, error state)
- [x] 5.6 Traducir `search.html`, `vod.html`, `series.html`, `movie_detail.html`, `series_detail.html` y `error.html`
- [x] 5.7 No envolver contenido de fuente (nombres de canales/categorías, títulos EPG/VOD/series, nombres de fuentes/grupos) — revisión explícita de cada plantilla

## 6. Traducción de JavaScript

- [x] 6.1 Envolver con `I18N.t('...')` las cadenas de `settings.js` (Deleting..., Failed, Copied!, Detecting..., Done!, Request failed, Added, Delete, confirm de borrado de fuente)
- [x] 6.2 Envolver las cadenas de `player.js` (alert de Cast, y cualquier texto visible dinámico)
- [x] 6.3 Envolver las cadenas de `app.js`, `virtual-guide.js` y `favorites-grid.js` (si las hay)
- [x] 6.4 Verificar que las cadenas inyectadas desde Jinja en los `<script>` inline (config de GUIDE_CONFIG, FAVORITES_CONFIG, PLAYER_CONFIG) quedan traducidas por el lado servidor con `_()`

## 7. Traducción de mensajes de error del backend

- [x] 7.1 Envolver con `_()` los `HTTPException` visibles al usuario en `main.py` (403/429/400/404 de auth, permisos, usuarios, fuentes, contenido) y el `loading_message`
- [x] 7.2 Dejar sin traducir los `HTTPException` de `ffmpeg_session.py` y los técnicos que se lanzan desde hilos en segundo plano (documentar en comentario el criterio)
- [x] 7.3 Test de ruta en `main_test.py`: un error de login/permiso renderiza el mensaje traducido con `lang=es-ES` activo

## 8. Verificación final

- [x] 8.1 Ejecutar `uv run ruff check .` y corregir cualquier violación
- [x] 8.2 Ejecutar `uv run basedpyright` y corregir cualquier error de tipos
- [x] 8.3 Ejecutar `uv run pytest` y confirmar que toda la suite pasa
- [x] 8.4 Prueba manual con la app en `es-ES`: login/setup, guide, settings (cambio de idioma por usuario y default del servidor), y verificar que el contenido de las fuentes IPTV se muestra sin traducir