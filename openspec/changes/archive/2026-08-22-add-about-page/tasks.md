## 1. Datos de proyecto y ruta

- [x] 1.1 Añadir en `main.py` la carga de versión y URL desde `pyproject.toml` mediante `tomllib`, con valores de respaldo, y exponer una ruta autenticada `/about` que use `require_auth`, `resolve_locale` y `TEMPLATES.TemplateResponse`; verificar con una prueba de acceso autenticado y protección para visitantes anónimos.
- [x] 1.2 Crear `templates/about.html` extendiendo `base.html`, mostrando TolochaTV, la versión, Python/FastAPI/Jinja2/SQLite/FFmpeg/HLS.js y el enlace oficial; verificar que la respuesta contiene esos datos y no expone configuración sensible.

## 2. Navegación e identidad visual

- [x] 2.1 Obtener un icono SVG de información con licencia compatible, guardarlo como `static/icons/info.svg` con dimensiones y contraste equivalentes a los iconos existentes, y verificar que el recurso local existe y se sirve sin CDN.
- [x] 2.2 Insertar en `templates/base.html` el enlace a `/about` inmediatamente después de `/settings`, con `title`, `aria-label`, estado activo y el icono local; incrementar `ASSET_VERSION` y verificar el orden del DOM y el foco visible en la respuesta renderizada.

## 3. Traducciones y pruebas

- [x] 3.1 Añadir las claves de navegación, título, campos y herramientas al catálogo i18n y sus traducciones en `translations/es_ES.json`; verificar que la vista en español no muestra claves internas.
- [x] 3.2 Extender `main_test.py` usando `auth_client` y `mock_deps` para cubrir contenido, URL del repositorio, versión, autenticación, navegación e icono local; verificar que las nuevas pruebas pasan offline.

## 4. Validación del cambio

- [x] 4.1 Ejecutar `uv run ruff check .` y corregir cualquier error introducido por el cambio; verificar salida exitosa.
- [x] 4.2 Ejecutar `uv run basedpyright` y `uv run pytest`; verificar que el typecheck y toda la suite pasan sin regresiones.
