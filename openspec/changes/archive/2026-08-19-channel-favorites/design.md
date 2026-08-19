## Context

El panel se construye en `templates/base.html` y su ciclo de vida está concentrado en el módulo IIFE de `static/js/app.js` que actualmente mantiene `treeData`, el estado de expansión y la selección del canal. `GET /api/channels/tree` ya devuelve los canales visibles agrupados, mientras que `GET/POST /api/user-prefs` en `main.py` persiste por usuario un objeto `favorites` usado por películas y series. `cache.load_user_settings` devuelve ese objeto para usuarios existentes y nuevos, pero las preferencias antiguas no incluyen todavía una clave `live`.

## Goals / Non-Goals

**Goals:**

- Reutilizar el almacenamiento autenticado de `favorites` para añadir una colección `live` sin alterar las colecciones `movies` y `series`.
- Mantener una única fuente de verdad para disponibilidad y nombres: la respuesta ya autorizada de `/api/channels/tree`.
- Añadir el control de estrella y la vista plana sin romper la persistencia de expansión, selección y scroll del panel actual.
- Mantener el comportamiento de teclado del panel y evitar que una acción de estrella active el enlace de reproducción.

**Non-Goals:**

- Crear una tabla, endpoint o mecanismo de sincronización nuevo para favoritos.
- Mostrar favoritos de canales no visibles por los permisos, el `guide_filter` o la ausencia de datos actual.
- Cambiar la guía EPG, el buscador, la ruta `/play/live/{stream_id}` o los favoritos de VOD/series.
- Ordenar manualmente favoritos o convertir la lista plana en otro árbol.

## Decisions

### 1. Persistir en `favorites.live` dentro de `/api/user-prefs`

El cliente leerá las preferencias autenticadas mediante `GET /api/user-prefs` al inicializar el panel y guardará el objeto completo mediante el `POST /api/user-prefs` parcial ya existente, añadiendo únicamente `favorites.live`. Cada entrada se indexará por `stream_id` y conservará al menos el nombre del canal y los grupos conocidos como metadatos de respaldo.

La lectura tratará una ausencia de `live` como `{}` para compatibilidad con los JSON existentes; no se modifica el valor de las colecciones `movies` o `series` ni se requiere migración de archivos. El guardado conserva todas las claves existentes antes de enviar la actualización.

**Alternativas consideradas:** `localStorage` habría sido más sencillo, pero mezclaría usuarios en un mismo navegador y no seguiría el patrón de favoritos ya persistido por usuario. Un endpoint específico habría duplicado el contrato de preferencias sin aportar comportamiento observable adicional.

### 2. Derivar la lista desde el árbol visible

`treeData.groups` será indexado por `stream_id` cuando se renderice o actualice el árbol. Para cada canal favorito se combinarán los nombres de todos los grupos visibles en una sola entrada, ordenados según el orden del árbol, de modo que un canal multicategoría aparezca una sola vez como `Nombre (Grupo A, Grupo B)`. Las entradas guardadas que no tengan correspondencia en `treeData` se omitirán de la interfaz, evitando exponer canales que ya no están disponibles.

La lista se actualizará localmente al marcar o desmarcar, sin volver a solicitar el árbol ni reconstruirlo desde cero. El nombre y los grupos mostrados procederán siempre de los datos actuales del árbol, no de metadatos antiguos guardados en preferencias.

La vista activa del panel (`tree` o `favorites`) se conservará en `localStorage` junto al estado de apertura. Al activar el enlace de un favorito se actualizará el mismo `STORE_SELECTED` usado por el árbol; al cargar el reproductor se restaurarán tanto la sección de favoritos como el resaltado del canal seleccionado.

### 3. Separar navegación y acción de estrella en cada fila

En `templates/base.html` la fila de canal se representará como un contenedor con un enlace de reproducción y un botón de estrella hermano, no como un botón anidado dentro de un `<a>`. `static/js/app.js` asignará `aria-pressed`, un nombre accesible localizado y una representación visual distinta (`★`/`☆` o equivalente SVG) al botón. Su listener detendrá la acción de la fila y actualizará la preferencia; el enlace seguirá navegando a `/play/live/{stream_id}`.

El nuevo acceso a favoritos será otro botón del rail junto a `#channels-tree-btn`, con un icono Material de estrella incluido inline para mantener el patrón de iconos existente sin depender de una descarga remota. Al activarlo se abrirá el panel y se seleccionará la vista plana; el botón del árbol volverá a seleccionar la vista de grupos sin perder estados de expansión, selección o scroll.

### 4. Estado de vistas dentro del módulo de `app.js`

Se añadirá un estado `panelView` (`tree` o `favorites`) y un contenedor `#channels-favorites` en `base.html`. El encabezado mantendrá los controles propios del árbol, como `#channels-toggle-all`, solo cuando la vista de árbol esté activa. `panelFocusables()` seguirá consultando el panel completo para que flechas, Enter y Escape funcionen con ambos modos; el enlace de favorito conserva el manejo normal de Enter y el botón de desmarcado usa el comportamiento nativo de botón.

El panel cargará `/api/channels/tree` y `/api/user-prefs` una vez por página/panel, cacheando ambas respuestas en memoria del módulo. Los errores de preferencias se tratarán como colección vacía y no impedirán usar el árbol; los errores de guardado no deben borrar el estado local visible y se registrarán siguiendo el patrón existente de preferencias.

### 5. Pruebas y verificación

`main_test.py` cubrirá el contrato autenticado de `/api/user-prefs`, la conservación de `movies`/`series` al guardar `favorites.live` y el aislamiento entre directorios de usuario, usando `mock_deps` y los fixtures existentes. La interacción del DOM se verificará con el flujo manual del panel en páginas normales y `/play/`: marcar, recargar, cambiar entre árbol/favoritos, reproducir, desmarcar, comprobar multicategoría, permisos y teclado.

## Risks / Trade-offs

- [Riesgo] El `POST /api/user-prefs` conserva el patrón existente de reemplazar el objeto `favorites` completo y dos pestañas podrían escribir a la vez → Mitigación: partir siempre del objeto leído, actualizar solo `live` y refrescar la vista local; aceptar la misma limitación de sincronización entre pestañas que ya tienen VOD y series.
- [Riesgo] Un canal puede cambiar de nombre o grupo entre sesiones → Mitigación: renderizar únicamente la intersección con `treeData` actual y usar sus nombres/grupos, conservando la clave para que reaparezca si vuelve a estar disponible.
- [Riesgo] Un árbol grande hace costoso recalcular la lista → Mitigación: indexar una sola vez por `stream_id` y actualizar solo la lista/controles afectados; no añadir un segundo fetch ni un endpoint por favorito.
- [Riesgo] Un control de estrella dentro de un enlace provocaría navegación accidental o HTML inválido → Mitigación: usar elementos hermanos y detener explícitamente la acción del control.

## Migration Plan

- Desplegar los cambios de `main.py` (solo pruebas/contrato si no se requiere lógica nueva), `templates/base.html`, `static/js/app.js` y `translations/es_ES.json` de forma aditiva.
- Los usuarios existentes empiezan con `favorites.live` vacío de forma implícita; su primera modificación persiste la nueva colección junto a las existentes.
- Para revertir, retirar el acceso y los controles de canales en una reversión del cambio. Las claves `live` sobrantes en `settings.json` se ignoran por la versión anterior y no afectan a películas ni series.
