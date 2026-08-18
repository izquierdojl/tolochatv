## Why

Toda la interfaz de TolochaTV está hardcodeada en inglés (templates Jinja2, JS del navegador y mensajes de error de la API). El usuario quiere una app con interfaz en español de España (es-ES) como idioma por defecto, manteniendo el inglés disponible y con selección de idioma por usuario, auto-detección por navegador y un default global fijado por el admin.

## What Changes

- **Nuevo módulo `i18n.py`** (top-level, como el resto de módulos planos): catálogo de traducciones cargado desde ficheros JSON bajo `translations/`, helper `_()` para Python, y registro del global `_` en Jinja2 y de un endpoint JSON para el JS del navegador.
- **Catálogo `translations/es_ES.json`**: clave = texto en inglés (la cadena original, sin tocar el flujo actual), valor = español de España. Un único fichero compartido por Python, Jinja y JS. El inglés queda como fallback cuando falta una clave.
- **Preferencia de idioma en dos niveles**, siguiendo el patrón de `cc_lang`:
  - Por usuario en `users/{username}.json` (`cache.py`), guardado vía el endpoint existente `/api/user-prefs`.
  - Default global del servidor en `server_settings.json` (`cache.py`).
  - Auto-detección por cabecera `Accept-Language` del navegador como fallback cuando no hay preferencia explícita.
- **Selector de idioma** en la página de Settings (sección Client Settings), al lado de la preferencia de Closed Captions.
- **`<html lang>` dinámico**: `base.html`, `login.html` y `setup.html` pasan a emitir el idioma activo (`es-ES` por defecto).
- **Traducción de toda la UI**: templates (`templates/*.html`), strings de JS (`static/js/*.js` — botones, mensajes de estado, confirmaciones, tooltips) y mensajes de error visibles al usuario (`HTTPException` details en `main.py` y `ffmpeg_session.py`).
- **Límite de alcance**: no se traduce el contenido proveniente de las fuentes IPTV (nombres de canales/categorías, títulos y descripciones de EPG, títulos de películas/series). Solo la piel de la app.

## Capabilities

### New Capabilities

- `i18n`: selección de idioma (es-ES/es/en), catálogo de traducciones cargable, `_()` en Python/Jinja/JS, emisión del atributo `lang`, y comportamiento de la preferencia (per-usuario + auto-detección + default global).

### Modified Capabilities

_(Sin capacidades existentes: `openspec/specs` está vacío. No se modifica ningún spec previo.)_

## Impact

- **Módulos top-level afectados**: `main.py` (registro del global `_` en Jinja2, endpoint de catálogo para JS, traducción de mensajes HTTPException y `loading_message`, settings), `cache.py` (nueva clave `language` en user prefs y `default_language` en server settings), nuevo `i18n.py`, `ffmpeg_session.py` (mensajes de error).
- **Plantillas**: `templates/base.html`, `login.html`, `setup.html`, `settings.html`, `guide.html`, `player.html`, `search.html`, `vod.html`, `series.html`, `movie_detail.html`, `series_detail.html`, `error.html`.
- **JS**: `static/js/app.js`, `settings.js`, `player.js`, `virtual-guide.js`, `favorites-grid.js`.
- **Fichero nuevo**: `translations/es_ES.json`.
- **Tests afectados**: `main_test.py` (rutas de settings, página de login/setup, `/api/user-prefs`, `/api/i18n.js`), `cache_test.py` (persistencia de la nueva clave), `auth_test.py` (si toca el flujo de login), y nuevo `i18n_test.py` para el módulo.