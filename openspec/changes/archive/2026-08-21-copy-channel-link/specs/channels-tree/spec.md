## ADDED Requirements

### Requirement: Copiar enlace directo del canal

Cada fila de canal del panel SHALL incluir, a la **izquierda** del control de favoritos (estrella), un control para copiar el enlace directo del canal. El control SHALL estar presente tanto en la vista de árbol de todos los canales como en la sección de canales favoritos. Al activarlo, el sistema SHALL copiar al portapapeles la **URL directa del stream** del canal (la URL cruda del flujo IPTV, no el enlace de la aplicación) y SHALL mostrar un aviso tipo "toast" no intrusivo indicando que el enlace se ha copiado. El control SHALL cambiar únicamente la acción de copiado, sin iniciar la reproducción ni cambiar el canal seleccionado.

#### Scenario: Copiar enlace desde el árbol
- **GIVEN** un canal visible en el árbol de todos los canales
- **WHEN** el usuario activa su control de copiado
- **THEN** la URL directa del stream de ese canal queda en el portapapeles, se muestra un "toast" indicando que se ha copiado y el navegador permanece en la vista actual sin iniciar reproducción

#### Scenario: Copiar enlace desde favoritos
- **GIVEN** un canal mostrado en la sección de canales favoritos
- **WHEN** el usuario activa su control de copiado
- **THEN** la URL directa del stream de ese canal queda en el portapapeles, se muestra un "toast" indicando que se ha copiado y el navegador permanece en la vista actual sin iniciar reproducción

#### Scenario: Posición del control
- **GIVEN** una fila de canal en el árbol o en favoritos
- **WHEN** el panel muestra la fila
- **THEN** el control de copiado aparece inmediatamente a la izquierda del control de favoritos de esa fila

#### Scenario: Canal sin URL directa resoluble
- **GIVEN** un canal cuya URL directa no puede resolverse en el servidor
- **WHEN** el usuario activa su control de copiado
- **THEN** no se copia nada al portapapeles y se muestra un aviso de error localizado en lugar del "toast" de éxito

### Requirement: Resolución de URL directa por API

El sistema SHALL exponer un endpoint autenticado que, dado un `stream_id` de un canal en vivo, devuelva la URL directa del stream del canal (la misma que se usa para reproducir el canal en el reproductor). El endpoint SHALL requerir autenticación y SHALL rechazar peticiones no autenticadas.

#### Scenario: Resolución exitosa
- **GIVEN** un usuario autenticado y un `stream_id` de un canal en vivo existente
- **WHEN** se solicita la URL directa de ese canal
- **THEN** la respuesta contiene la URL directa del stream del canal

#### Scenario: Canal inexistente
- **GIVEN** un usuario autenticado y un `stream_id` que no corresponde a ningún canal en vivo
- **WHEN** se solicita la URL directa de ese canal
- **THEN** la respuesta indica que no se pudo resolver la URL del canal

#### Scenario: Sin autenticación
- **GIVEN** una petición sin token válido
- **WHEN** se solicita la URL directa de un canal
- **THEN** la respuesta es un error de autenticación y no se devuelve ninguna URL

### Requirement: Accesibilidad del control de copiado

El control de copiado del árbol y de favoritos SHALL ser accesible por teclado, tener un nombre accesible localizado y distinguirse visualmente del resto de la fila, coherente con el estilo de los demás controles del panel.

#### Scenario: Activar copiado con teclado
- **GIVEN** el foco está sobre el control de copiado de un canal
- **WHEN** el usuario pulsa Enter o la barra espaciadora
- **THEN** el enlace del canal se copia al portapapeles, se muestra el "toast" correspondiente y el foco permanece en un control operativo sin navegar al reproductor
