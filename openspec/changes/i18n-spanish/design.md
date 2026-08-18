## Context

TolochaTV no tiene ninguna infraestructura de traducción: todas las cadenas de interfaz están en inglés, hardcodeadas en `templates/*.html` (12 plantillas, ~2.500 líneas), `static/js/*.js` (5 ficheros, ~3.400 líneas) y los `HTTPException` de `main.py`. Las preferencias por usuario ya viven en `users/{username}/settings.json` vía `cache.load_user_settings` (con `cc_lang` como precedente de preferencia por usuario) y los ajustes globales en `server_settings.json`. La whitelist de claves de `save_user_prefs` está en `main.py:2580-2587`; los defaults de usuario en `cache.py:537-543`; `get_user_prefs` en `main.py:2555-2565`. `get_current_user(request) -> dict | None` (`main.py:374`) permite resolver idioma en páginas no autenticadas (login/setup). Ver proposal.md — Why/What para la motivación.

## Goals / Non-Goals

**Goals:**
- Mecanismo de traducción compartido por las tres capas (Python, Jinja, JS) con un único catálogo JSON.
- Español de España (es-ES) como idioma por defecto, inglés como alternativa y fallback.
- Resolución de idioma por usuario > navegador (Accept-Language) > default del servidor.
- Cambio mínimo e invasivo en los ~20 `TemplateResponse` existentes y en los endpoints.

**Non-Goals:**
- No se añade toolchain de gettext/Babel ni compilación de catálogos.
- No se traduce el contenido de las fuentes IPTV (canales, EPG, títulos de VOD/series).
- No se traduce la maquinaria interna de transcodificación (`ffmpeg_session.py`) — mensajes técnicos en inglés.
- No se introduce un sistema de plugins de idiomas ni traducción en caliente de catálogos (recarga al reiniciar/por TTL simple).

## Decisions

### 1. Catálogo JSON plano keyed por cadena inglesa
`translations/es_ES.json` con formato `{ "Settings": "Ajustes", ... }`. La clave es el texto original en inglés; el inglés es la identidad (fallback = devolver la clave). Un único fichero consumido por Python, Jinja y JS.

- **Alternativa considerada:** gettext `.po`/`.mo` con Babel. Rechazada: añade toolchain, compilación y no lo consumen las tres capas tan directamente. Para ~300-400 claves, un JSON plano es suficiente y encaja con el espíritu de un solo fichero de FastAPI.

### 2. Nuevo módulo top-level `i18n.py`
Funciones:
- `SUPPORTED_LANGS = ("es-ES", "en")`, `DEFAULT_LANG = "es-ES"`.
- `load_catalog(lang: str) -> dict[str, str]` — lee `translations/{lang}.json` (cacheado en memoria; `TRANSLATIONS_DIR` reemplazable en tests como se hace con los paths de `cache.py`).
- `translate(text: str, lang: str) -> str` — lookup en el catálogo, fallback a `text`.
- `resolve_language(user_lang: str, accept_language: str, server_default: str) -> str` — prioridad 1/2/3 y normalización (`es*` → `es-ES`; cualquier no-es sin preferencia → `server_default`; valor no soportado → `DEFAULT_LANG`).
- `contextvar _current_lang` + `set_current_lang(lang)` / `current_lang()` y una función global `t(text: str) -> str` que traduce con el idioma del contextvar.

### 3. Resolución por petición vía dependencia FastAPI
Nueva dependencia `resolve_locale(request)` en `main.py` que:
1. `user = get_current_user(request)`; si autenticado y `user_settings["language"]` no vacío → ese idioma.
2. Si no, parsea `request.headers.get("accept-language")` → primer tag; si empieza por `es` → `es-ES`.
3. Si no, `load_server_settings().get("default_language", "es-ES")`.
4. Llama a `set_current_lang(...)` y devuelve el código.

Se inyecta en cada ruta de página (junto al `Depends` de auth existente). El global `_` de Jinja lee el contextvar, así que los `TemplateResponse` existentes no cambian de estructura — solo el contenido de sus cadenas.

- **Alternativa considerada:** middleware. Rechazado: la resolución necesita el usuario (solo disponible vía dependencia) y no hay un punto de middleware que lea prefs por usuario sin duplicar lógica.

### 4. Integración en Jinja
`TEMPLATES.env.globals["_"] = i18n.t` (registrado junto a `logo_url`, etc. en `main.py`). Cada cadena visible se envuelve: `{{ _('Settings') }}`, `title="{{ _('Live TV') }}"`, placeholders, etc. Las cadenas que ya van por variables de contexto (nombres de canales, categorías, títulos) NO se envuelven — son contenido de fuente. El atributo `<html lang>` en `base.html`, `login.html` y `setup.html` usa la variable `lang` pasada desde la dependencia.

### 5. Integración en JavaScript
Nuevo endpoint `GET /api/i18n.js` (auth opcional — usa `get_current_user` — para servir tanto a páginas autenticadas como a login/setup) que resuelve el idioma activo con la misma lógica y devuelve un fichero JS:
```js
window.I18N = { strings: { "Settings": "Ajustes", ... }, t: function(k) { return this.strings[k] ?? k; } };
```
Se carga con `<script src="/api/i18n.js"></script>` antes de los demás scripts. Las cadenas del JS se envuelven `I18N.t('Delete')`, `I18N.t('Failed')`, etc.

- **Alternativa considerada:** inyectar el catálogo en cada `TemplateResponse`. Rechazado: duplica datos en cada página y complica login/setup; un fichero JS cacheable es más limpio y comparte la misma resolución de idioma.

### 6. Persistencia de la preferencia
- `cache.py load_user_settings`: añadir `data.setdefault("language", "")`.
- `main.py get_user_prefs`: añadir `"language"` a la respuesta.
- `main.py save_user_prefs` whitelist (`main.py:2580-2587`): añadir `"language"`.
- `default_language` en `server_settings.json`, expuesto en la sección Server Settings de `settings.html`, aceptado por el endpoint de guardado de ajustes del servidor (`save_settings` en `main.py`, alrededor de `2656-2694`).

### 7. UI de Settings
- **Client Settings**: dropdown "Idioma / Language" (es-ES / English) que hace POST a `/api/user-prefs` con `{"language": ...}` y recarga la página (mismo patrón que `cc_lang`).
- **Server Settings (admin)**: dropdown "Idioma por defecto" que se guarda vía el endpoint de ajustes del servidor.

### 8. Traducción de mensajes de error
Los `HTTPException` de `main.py` visibles al usuario (403/429/400/404 de auth, permisos, usuarios, fuentes, contenido) se envuelven con `_()`. Se mantienen en inglés los de `ffmpeg_session.py` (transcodificación, técnicos) y los que se lanzan desde hilos en segundo plano donde el contextvar de idioma no está disponible.

## Risks / Trade-offs

- [Riesgo: olvidar cadenas al envolver ~300-400 strings en templates/JS] → Mitigación: barrido sistemático por fichero y revisión visual de cada plantilla; el fallback a inglés evita texto roto aunque falte una clave.
- [El contextvar de idioma no se propaga a hilos/background tasks (preload, transcodificación)] → Mitigación: esos mensajes quedan en inglés (documentado en la decisión 8); solo las rutas request-scoped usan el idioma.
- [Cambiar idioma no re-traduce la página hasta recargar] → Mitigación: aceptado explícitamente; el dropdown de Settings recarga tras guardar.
- [Tamaño del catálogo inline en `/api/i18n.js` por página] → Mitigación: fichero pequeño (~20-30 KB) y cacheable por el navegador; se puede cachear con ETag si crece.
- [Páginas nuevas futuras pueden olvidar envolver cadenas] → Mitigación: el fallback a inglés hace que el fallo sea silencioso pero visible; documentar la convención `_()` en AGENTS.md al implementar.

## Migration Plan

- Despliegue: sin migración de datos. `language` usa `setdefault` (no rompe `settings.json` existentes) y `default_language` usa `get("default_language", "es-ES")` (no rompe `server_settings.json` existentes).
- Rollback: revertir los commits; las cadenas envueltas con `_()` que devuelve el texto original (catalog vacío en `en`) mantienen la app funcional en inglés.

## Open Questions

- ¿El selector de idioma debe recargar automáticamente la página al cambiar o aplicarse en la siguiente navegación? Se resolverá al implementar sin cambiar specs ni diseño (detalle de UX).