## Why

El árbol de canales permite iniciar la reproducción, pero obliga a recorrer grupos cada vez que el usuario quiere volver a un canal habitual. Añadir favoritos de canales proporciona un acceso directo y persistente, coherente con los favoritos existentes de películas y series.

## What Changes

- Añadir una acción de estrella a la derecha de cada canal del árbol para marcarlo o desmarcarlo sin iniciar la reproducción.
- Persistir los favoritos de canales dentro de las preferencias del usuario, separados de los favoritos de películas y series.
- Añadir un icono y una sección de favoritos en el panel de canales.
- Mostrar los canales favoritos en una lista plana con el nombre del canal y su grupo entre paréntesis, sin reconstruir un árbol.
- Permitir desmarcar un canal directamente desde la lista de favoritos.
- Hacer que activar el nombre de un favorito navegue a `/play/live/{stream_id}` y lance la reproducción normal.
- Mantener la accesibilidad de teclado y la localización de las nuevas etiquetas y estados vacíos.

## Capabilities

### New Capabilities

- Ninguna. Los favoritos son una ampliación de una capacidad existente.

### Modified Capabilities

- `channels-tree`: añadir marcado/desmarcado de canales, acceso a la lista plana de favoritos, persistencia por usuario y lanzamiento desde esa lista.

## Impact

- `main.py` — reutilizar el contrato autenticado de `/api/user-prefs` y el contenido de `/api/channels/tree`; no se requiere un endpoint público nuevo.
- `templates/base.html` — nueva acción de estrella en las filas, icono del rail y contenedor de la sección de favoritos.
- `static/js/app.js` — estado de favoritos, lectura/escritura de preferencias, renderizado de la lista plana y navegación/teclado.
- `translations/es_ES.json` — etiquetas para favoritos de canales, acciones de marcar/desmarcar y estado vacío.
- `main_test.py` — verificar que las preferencias de favoritos siguen requiriendo autenticación y conservan el nuevo grupo de favoritos; añadir pruebas de contrato si se modifica el endpoint.
- No se prevén cambios en `cache.py`, `auth.py`, `epg.py` ni en el esquema de almacenamiento: se reutiliza el JSON de preferencias por usuario existente.
