## Context

Consulta `proposal.md` para la motivación y `specs/about-page/spec.md` para el contrato observable. La aplicación concentra sus rutas en `main.py`, renderiza vistas con `TEMPLATES.TemplateResponse` y protege las páginas autenticadas mediante `require_auth`. La carcasa común y su navegación viven en `templates/base.html`; las traducciones se resuelven mediante el global `_` registrado desde `i18n.t`, y `asset_version` ya se utiliza para invalidar caché de recursos frontend.

La versión del proyecto está declarada actualmente como `0.1.0` en `pyproject.toml`. Los iconos de la navegación son SVG de 24 x 24 y actualmente se sirven dentro de la plantilla, mientras que el cambio solicitado requiere conservar una copia local del nuevo icono.

## Goals / Non-Goals

**Goals:**

- Añadir una ruta autenticada `/about` que renderice una vista sencilla dentro de la carcasa común.
- Exponer en esa vista el nombre del proyecto, la versión de `pyproject.toml`, una lista breve de herramientas y la URL canónica del repositorio.
- Añadir en `base.html` un enlace inmediatamente posterior al enlace de `/settings`, con un SVG local, estado activo y nombre accesible.
- Reutilizar i18n, estilos de la carcasa y el versionado de recursos existente, con pruebas offline.

**Non-Goals:**

- No crear una API nueva ni modificar las rutas de reproducción, autenticación o configuración.
- No introducir un framework de iconos, una dependencia de CDN ni una pantalla de administración editable.
- No añadir analítica, comprobación remota de actualizaciones, changelog ni información personal de mantenedores.

## Decisions

### Ruta y renderizado

Añadir una función de ruta en `main.py` siguiendo el patrón de `settings_page`: dependencias `Request`, `require_auth` y `resolve_locale`, y respuesta mediante `TEMPLATES.TemplateResponse`. Crear `templates/about.html` extendiendo `base.html`, sin JavaScript propio, para que la página funcione como contenido estático y herede la navegación y el tema.

**Alternativa considerada:** reutilizar `settings.html` con una sección anclada. Se descarta porque mezclaría información pública del proyecto con controles administrativos y haría más difícil proteger, probar y mantener la página.

### Fuente de versión y datos del proyecto

Mantener `pyproject.toml` como fuente de verdad para la versión y el enlace oficial al repositorio. En `main.py`, leer los campos necesarios con `tomllib` desde el archivo del proyecto al inicializar la aplicación y pasarlos como contexto a la plantilla, con valores constantes de respaldo si el archivo no está disponible en una instalación ejecutable. La lista de herramientas será una colección estática y breve, centrada en Python, FastAPI, Jinja2, SQLite, FFmpeg y HLS.js, sin mostrar secretos ni configuración del servidor.

**Alternativa considerada:** duplicar la versión como constante en `main.py`. Se descarta porque podría quedar desfasada respecto a `pyproject.toml` en el siguiente lanzamiento.

### Icono local y ubicación en la navegación

Añadir un SVG de información de 24 x 24 en `static/icons/info.svg`, procedente de una fuente con licencia compatible y conservado como recurso del proyecto. Referenciarlo desde el nuevo enlace de `templates/base.html` con una URL local y el mismo tamaño visual que los iconos vecinos; el texto traducido en `title` y `aria-label` proporcionará la identificación accesible. Insertar el bloque después del enlace existente de `/settings`, no después de otro control, para que el orden visual y el orden del DOM coincidan.

**Alternativa considerada:** cargar un icono desde una CDN o dibujar otro conjunto de iconos. Se descarta porque añade una dependencia de red y rompe la coherencia de la navegación existente.

### Traducciones, estados y pruebas

Añadir las nuevas claves inglesas y sus traducciones españolas en `translations/es_ES.json`, usando `{{ _('...') }}` en la plantilla. Marcar el enlace como activo cuando `request.url.path == '/about'`. Incrementar `ASSET_VERSION` porque cambian plantillas y un recurso estático.

Extender `main_test.py` con pruebas que reutilicen `auth_client` y `mock_deps`: acceso autenticado, redirección o rechazo para visitante anónimo, presencia del nombre/versión/herramientas/repositorio en la respuesta, y orden del enlace de información respecto a Configuración. Añadir una comprobación de que el SVG local existe y se sirve desde la ruta estática si el patrón de pruebas de recursos lo permite.

**Alternativa considerada:** pruebas de navegador para una página sin comportamiento dinámico. Se descarta como requisito inicial porque las pruebas de rutas y HTML cubren el contrato con menor coste y siguen el enfoque offline del repositorio.

## Risks / Trade-offs

- [La lectura de `pyproject.toml` puede fallar en una distribución donde el archivo no se copie] → usar valores de respaldo definidos en `main.py` y comprobar que la página continúa renderizando.
- [La versión mostrada puede cambiar al actualizar metadatos sin actualizar traducciones o expectativas de texto] → probar contra el valor de proyecto y no duplicar una versión fija en la plantilla.
- [El SVG descargado puede no respetar el estilo o la licencia] → elegir una fuente permisiva, mantener el recurso local en el repositorio y verificar dimensiones, contraste y atribución necesaria antes de implementarlo.
- [El enlace externo puede abrir una página inaccesible temporalmente] → mantenerlo como enlace directo sin convertirlo en dependencia de carga; la página y el resto de la navegación deben seguir funcionando sin GitHub.
- [El nuevo elemento puede reducir el espacio útil del rail en pantallas estrechas] → conservar las dimensiones actuales de los enlaces y validar la navegación con teclado y viewport estrecho.

## Migration Plan

No hay migración de datos ni cambios incompatibles de API. Implementar la ruta, plantilla, traducciones, SVG y pruebas; incrementar `ASSET_VERSION`; ejecutar `uv run ruff check .`, `uv run basedpyright` y `uv run pytest`. El rollback consiste en retirar la ruta, la plantilla, el SVG, las traducciones y el enlace de navegación, restaurando el valor anterior de `ASSET_VERSION`.
