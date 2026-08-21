## Why

TolochaTV no ofrece un lugar visible para consultar qué es el proyecto, qué versión está instalada, con qué herramientas se construye ni dónde encontrar su código. Una sección breve de información, accesible desde la navegación principal, mejora la identificación de la aplicación y facilita el acceso al repositorio sin interferir con la reproducción.

## What Changes

- Añadir una página autenticada `/about` con la información básica del proyecto TolochaTV.
- Mostrar en la página la versión actual (`0.1.0`), las principales herramientas utilizadas y un enlace al repositorio oficial.
- Añadir una entrada "Información" o "Acerca de" en la navegación lateral, inmediatamente debajo de Configuración.
- Incorporar un icono local de información acorde con los iconos existentes, descargado desde una fuente compatible y servido sin depender de una petición externa en tiempo de ejecución.
- Añadir las traducciones necesarias y conservar los estados de foco, selección y diseño responsivo de la carcasa compartida.

## Capabilities

### New Capabilities

- `about-page`: página de información del proyecto y acceso permanente desde la navegación autenticada.

### Modified Capabilities

<!-- No se modifican requisitos de capacidades existentes. -->

## Impact

- `main.py` — nueva ruta autenticada y datos de presentación de la página.
- `templates/base.html` — nuevo enlace de navegación bajo Configuración.
- `templates/about.html` — nueva vista con la información del proyecto.
- `static/` — recurso local del icono de información, siguiendo el estilo visual existente.
- `translations/es_ES.json` y catálogo de i18n — nuevas cadenas de la página y de navegación.
- `main_test.py` — pruebas de acceso autenticado, contenido esencial, versión, enlace al repositorio y orden del enlace en la navegación.
- No se requieren nuevas dependencias ni cambios en las APIs de reproducción.
