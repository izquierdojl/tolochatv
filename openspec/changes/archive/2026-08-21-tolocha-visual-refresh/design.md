## Context

La mayoría de las páginas de contenido (`guide.html`, `vod.html`, `series.html`, `search.html`, `settings.html`, `player.html` y `error.html`) heredan la estructura de `templates/base.html` y usan utilidades Tailwind con una paleta `gray/blue`. `login.html` y `setup.html` son documentos independientes, por lo que no heredan esa carcasa. `main.py` monta `static/` mediante `StaticFiles` y registra `asset_version` como global de Jinja (`main.py:129`), lo que permite versionar también una hoja CSS nueva sin cambiar la lógica de las rutas.

El cambio debe ser visual: no debe modificar los identificadores DOM ni los enlaces que consume `static/js/app.js`, ni los controles que gestiona `static/js/player.js`. Las plantillas pueden seguir usando Tailwind CDN, pero la identidad Tolocha debe estar centralizada para evitar que cada vista cree una variante de color.

## Goals / Non-Goals

**Goals:**

- Crear una capa visual compartida con tokens de color, superficies, bordes, estados, foco y profundidad reutilizables.
- Hacer reconocibles los motivos de montaña y pinar mediante capas decorativas ligeras que nunca intercepten eventos.
- Aplicar la misma composición a la carcasa autenticada y a las pantallas independientes de acceso/error.
- Mantener intacta la estructura funcional de guía, panel de canales, tarjetas de VOD/series, ajustes y reproductor.
- Validar contraste, foco visible, ausencia de overflow horizontal y comportamiento con movimiento reducido.

**Non-Goals:**

- Rediseñar la navegación, el árbol de canales, las rutas, los endpoints o el modelo de datos.
- Introducir un framework frontend, un sistema de temas configurable por usuario o una opción de modo claro.
- Descargar fotografías, fuentes, iconos o fondos de terceros para representar Tolocha.
- Cambiar textos de i18n, reglas de autenticación, controles de reproducción o preferencias del reproductor.

## Decisions

### 1. Hoja CSS compartida y clases semánticas

Se añadirá `static/css/tolocha-theme.css`, enlazada desde `base.html`, `login.html` y `setup.html` con `?v={{ asset_version }}`. La hoja definirá variables `--tc-*` y clases semánticas para shell, superficies, controles, estados y decoración. Las plantillas reemplazarán los usos visuales más importantes de `bg-gray-*`, `text-blue-*`, `border-gray-*` y `bg-red-*` por esas clases o por variables, sin exigir una reescritura del HTML funcional.

**Alternativas consideradas:** mantener únicamente utilidades Tailwind habría dejado colores dispersos y haría difícil mantener una identidad común; añadir un framework frontend sería desproporcionado para un cambio de presentación.

### 2. Paleta de bosque, piedra y luz cálida

La base se construirá con un fondo profundo de bosque (`#0d211c`), superficies de pino (`#123027` y `#1b4033`), musgo (`#6f8150`), piedra clara (`#c7b99c`), texto verdoso claro (`#e7eee9`) y un acento cálido de tierra/sol (`#d4a45b`). Los estados de error y aviso conservarán tonos propios, ajustados para destacar sobre las superficies oscuras. La hoja incluirá fallback sólido antes de cualquier gradiente.

Los colores se aplicarán por rol, no por componente: acción primaria, foco, selección, peligro y estado informativo tendrán usos consistentes en rail, botones, formularios, tarjetas, panel de canales, toasts y reproductor. Se comprobará el contraste de texto normal, controles y foco contra cada superficie principal.

### 3. Relieve decorativo generado localmente

El shell de `base.html` y las pantallas independientes usarán pseudo-elementos o un SVG inline/local con capas de laderas y una silueta de pinar en baja opacidad. La decoración se fijará al fondo de la vista, tendrá `pointer-events: none`, no contendrá información y quedará detrás de las superficies de contenido. Se reducirá o eliminará en tamaños estrechos si consume espacio visual.

**Alternativas consideradas:** una fotografía de la cordillera tendría mayor impacto, pero añade peso, derechos y una dependencia remota; un fondo de imagen externo contradice el funcionamiento autosuficiente del proyecto. Una ilustración grande y dominante se descarta porque competiría con EPG, tarjetas y vídeo.

### 4. Capas por tipo de pantalla

- En `base.html`, el `body`, el rail, `#channels-panel`, `main`, toasts y estados globales recibirán las clases del tema. Se conservarán los IDs `channels-tree-btn`, `channels-favorites-btn`, `channels-panel` y sus estados actuales.
- En `guide.html`, `vod.html`, `series.html`, `movie_detail.html`, `series_detail.html`, `search.html` y `settings.html`, se estilizarán contenedores de tarjetas, filtros, encabezados, chips, detalles y estados sin cambiar sus enlaces, formularios o scripts.
- En `player.html`, los controles y overlays conservarán sus IDs y el comportamiento de `player.js`; el color de progreso, error, carga, menú y botones se adaptará dentro del marco de vídeo, evitando que el motivo de fondo reduzca el contraste del vídeo.
- En `login.html`, `setup.html` y `error.html`, se reutilizarán la misma hoja, marca, panel de formulario, mensajes y botón primario, con un fondo de relieve independiente de la autenticación.

### 5. Responsive y accesibilidad como restricciones de estilo

La hoja limitará el ancho de decoraciones, usará `overflow-x: hidden` solo en el nivel visual que corresponda y conservará los contenedores desplazables existentes. Los breakpoints priorizarán el contenido: formularios y grids pasarán a una columna, el panel de canales conservará controles accesibles y el reproductor no recibirá márgenes decorativos que reduzcan su área útil.

Los selectores `:focus-visible` tendrán un anillo de dos capas con color de foco y separación de la superficie. Hover y seleccionado tendrán además cambio de superficie, borde o icono. Las transiciones serán cortas y `@media (prefers-reduced-motion: reduce)` desactivará animaciones decorativas y reducirá las transiciones funcionales.

### 6. Carga y cacheado

Se aprovechará `asset_version` ya registrado en `main.py` para la URL de la hoja CSS. No se añadirán llamadas de red, fuentes ni dependencias de compilación. La ausencia de un recurso SVG opcional no impedirá la carga porque cada capa decorativa tendrá un fondo de color o gradiente de respaldo.

## Risks / Trade-offs

- **La hoja nueva puede ser anulada por utilidades Tailwind:** cargarla después de Tailwind y limitar los overrides a clases semánticas del tema; revisar las vistas que mantengan utilidades directas.
- **El contraste puede variar entre superficies y overlays del reproductor:** comprobar los pares de color de cada estado sobre fondos sólidos y aplicar una placa opaca cuando el texto se superponga al vídeo.
- **El CSS decorativo puede afectar rendimiento en dispositivos modestos:** usar gradientes y formas estáticas, limitar el número de capas y evitar animaciones continuas.
- **El panel de canales ya modifica el ancho del layout:** no añadir una segunda columna decorativa; el motivo debe pertenecer al fondo del shell y el panel debe conservar su ancho y scroll actuales.
- **Las pantallas standalone pueden desincronizarse del shell:** ambas deben enlazar la misma hoja y utilizar las mismas clases semánticas, con una prueba de renderizado para login y setup.
- **La versión de CSS puede quedar obsoleta en caché si no se incrementa:** incluir `asset_version` en el enlace y actualizarlo siguiendo la convención de `static-assets` cuando cambien recursos servidos.

## Migration Plan

1. Añadir la hoja visual y enlazarla en las plantillas compartidas e independientes; no requiere migración de datos ni configuración.
2. Aplicar las clases semánticas por grupos de plantillas, comprobando que los scripts existentes siguen encontrando sus IDs.
3. Revisar rutas de renderizado con `main_test.py` y ejecutar la validación visual manual en escritorio y móvil, incluyendo preferencias de movimiento reducido.
4. Si el resultado debe revertirse, eliminar el enlace/clases del tema o revertir el cambio; la estructura funcional, APIs, cachés y datos de usuarios permanecen compatibles.
