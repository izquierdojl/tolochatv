# Channels-tree Specification

## Purpose

Navegador de canales en vivo accesible desde el menú vertical: muestra los canales IPTV visibles en la guía, agrupados en un árbol desplegable por categorías, para lanzar la reproducción directamente sin pasar por la guía ni el buscador.

## Requirements

### Requirement: Acceso desde el menú vertical

El menú vertical de la interfaz (visible en todas las páginas) SHALL incluir un icono dedicado que muestra y oculta el panel lateral "Canales". El panel SHALL ser una columna fija del layout (`rail | panel | contenido`): al mostrarse ocupa su propio ancho y el contenido se desplaza, de modo que el contenido —incluido el vídeo del reproductor— nunca queda cubierto. El icono SHALL identificarse visualmente como lista de canales (estilo Material clásico, `view_list`) y ser coherente con el resto de iconos del rail. El panel solo se muestra en páginas autenticadas.

#### Scenario: Abrir el panel
- **GIVEN** un usuario autenticado en cualquier página
- **WHEN** activa el icono de canales del menú vertical
- **THEN** el panel se muestra como columna lateral, el contenido se desplaza para dejarle sitio y el foco inicial se sitúa dentro del panel

#### Scenario: Cerrar el panel
- **GIVEN** el panel de canales abierto
- **WHEN** el usuario pulsa Escape o vuelve a activar el icono
- **THEN** el panel se oculta, el contenido vuelve a ocupar todo el ancho y el foco vuelve al icono del menú

### Requirement: Panel fijo y reproductor

El panel SHALL estar disponible en todas las páginas autenticadas, incluida la del reproductor (`/play/...`). El vídeo del reproductor SHALL ocupar el ancho restante y SHALL mostrarse junto al panel sin quedar cubierto por él en ningún momento.

#### Scenario: Vídeo junto al panel
- **GIVEN** el panel de canales abierto y un canal en reproducción
- **WHEN** se muestra la página del reproductor
- **THEN** el vídeo ocupa el ancho restante junto al panel, sin superposición

#### Scenario: Panel cerrado, vídeo a ancho completo
- **GIVEN** el panel de canales oculto y un canal en reproducción
- **WHEN** se muestra la página del reproductor
- **THEN** el vídeo ocupa todo el ancho disponible

### Requirement: Persistencia del panel

El estado del panel (abierto/cerrado y grupos expandidos) SHALL persistir entre navegaciones y recargas de página, de modo que el panel conserve su estado al cambiar de página o recargar.

#### Scenario: Estado conservado entre páginas
- **GIVEN** el panel abierto con al menos un grupo expandido
- **WHEN** el usuario navega a otra página y vuelve
- **THEN** el panel sigue abierto y los mismos grupos siguen expandidos

### Requirement: Contenido del árbol

El panel SHALL mostrar únicamente los canales en vivo visibles en la guía por defecto: los grupos incluidos en el `guide_filter` del usuario, excluyendo los grupos no disponibles para el usuario. Cuando el `guide_filter` esté vacío, el panel SHALL mostrar todos los grupos de las fuentes cargadas, salvo los bloqueados para el usuario. El grupo sintético "Uncategorized" (canales sin grupo de la fuente) SHALL incluirse como un grupo más. Los grupos sin canales no se muestran. Los grupos SHALL mostrarse siempre en orden alfabético por su nombre, sin distinguir mayúsculas de minúsculas, con independencia del orden del filtro.

#### Scenario: Grupos según filtro y permisos
- **GIVEN** un usuario con `guide_filter` = [Noticias, Cine] y el grupo Noticias bloqueado en sus límites de usuario
- **WHEN** se abre el panel de canales
- **THEN** el árbol muestra el grupo Cine con sus canales y no muestra Noticias ni ningún otro grupo

#### Scenario: Canales sin grupo
- **GIVEN** canales en vivo sin grupo asignado en la fuente
- **WHEN** se abre el panel de canales
- **THEN** esos canales aparecen bajo el grupo "Uncategorized", sin duplicarse

#### Scenario: Grupos en orden alfabético
- **GIVEN** una fuente con los grupos [Cine, Deportes, Acción]
- **WHEN** se abre el panel de canales
- **THEN** los grupos se muestran en este orden: Acción, Cine, Deportes

#### Scenario: Filtro vacío muestra todos los grupos
- **GIVEN** un usuario cuyo `guide_filter` no incluye ningún grupo y una fuente cargada con grupos
- **WHEN** se abre el panel de canales
- **THEN** el árbol muestra todos los grupos de la fuente, excepto los bloqueados para el usuario, en orden alfabético

#### Scenario: Sin canales disponibles
- **GIVEN** no hay canales en vivo cargados (ninguna fuente o sin datos)
- **WHEN** se abre el panel de canales
- **THEN** el panel muestra un mensaje de que no hay canales disponibles

### Requirement: Canal en varios grupos

Un canal que pertenezca a varios grupos SHALL aparecer bajo cada uno de los grupos a los que pertenece, siempre que el grupo esté visible para el usuario.

#### Scenario: Canal multicategoría
- **GIVEN** un canal con `category_ids` = [Deportes, Noticias], ambos grupos visibles
- **WHEN** se abre el panel de canales
- **THEN** el canal aparece tanto bajo Deportes como bajo Noticias

#### Scenario: Canal con grupo bloqueado
- **GIVEN** un canal con `category_ids` = [Deportes, Noticias] y Deportes bloqueado para el usuario
- **WHEN** se abre el panel de canales
- **THEN** el canal aparece bajo Noticias y no bajo Deportes

### Requirement: Interacción del árbol

Cada grupo del panel SHALL poder expandirse y colapsarse de forma independiente. Cada grupo SHALL mostrar su nombre y el número de canales que contiene. Los grupos SHALL mostrarse en orden alfabético por su nombre.

#### Scenario: Desplegar y replegar un grupo
- **GIVEN** el panel de canales abierto con varios grupos colapsados
- **WHEN** el usuario activa un grupo
- **THEN** el grupo se expande mostrando sus canales; al activarlo de nuevo, se colapsa

#### Scenario: Estado de grupos conservado
- **GIVEN** el panel de canales abierto con al menos un grupo expandido
- **WHEN** el usuario cierra el panel y lo vuelve a abrir
- **THEN** los grupos expandidos conservan su estado

### Requirement: Desplegar/plegar todos los grupos

El panel SHALL incluir un control que despliegue o pliegue todos los grupos a la vez. El control SHALL desplegar todos los grupos cuando haya alguno plegado y SHALL plegarlos todos cuando ya estén desplegados. El resultado SHALL persistir con el resto del estado del panel.

#### Scenario: Desplegar todo
- **GIVEN** el panel abierto con algunos grupos colapsados
- **WHEN** el usuario activa el control de desplegar todo
- **THEN** todos los grupos se expanden mostrando sus canales

#### Scenario: Plegar todo
- **GIVEN** el panel abierto con todos los grupos expandidos
- **WHEN** el usuario activa el control de plegar todo
- **THEN** todos los grupos se colapsan

#### Scenario: Estado del control persistente
- **GIVEN** el panel abierto con todos los grupos desplegados mediante el control
- **WHEN** el usuario navega a otra página y vuelve
- **THEN** los grupos siguen desplegados

### Requirement: Lanzamiento de canales

Al activar un canal del árbol SHALL iniciarse la reproducción normal del canal, navegando a `/play/live/{stream_id}` con el identificador del canal. El enlace SHALL comportarse como los enlaces de canal existentes (la guía y el buscador).

#### Scenario: Reproducir un canal
- **GIVEN** el panel de canales abierto con un grupo expandido
- **WHEN** el usuario activa un canal del grupo
- **THEN** el navegador navega a `/play/live/{stream_id}` y se inicia la reproducción normal

### Requirement: Datos del árbol por API

El sistema SHALL exponer un endpoint `GET /api/channels/tree` que devuelva en una sola respuesta JSON los grupos y canales del árbol, calculados con las reglas de visibilidad del panel (filtro del usuario, con retroceso a todos los grupos cuando el filtro está vacío, y grupos no disponibles). El endpoint SHALL requerir autenticación y SHALL rechazar peticiones no autenticadas.

#### Scenario: Respuesta del endpoint
- **GIVEN** un usuario autenticado con grupos visibles
- **WHEN** se solicita `GET /api/channels/tree`
- **THEN** la respuesta contiene la lista de grupos visibles en orden alfabético, cada uno con su nombre y su lista de canales (identificador, nombre y logo), incluyendo el grupo "Uncategorized" cuando corresponda

#### Scenario: Respuesta con filtro vacío
- **GIVEN** un usuario autenticado sin `guide_filter` configurado y una fuente cargada con grupos
- **WHEN** se solicita `GET /api/channels/tree`
- **THEN** la respuesta incluye todos los grupos cargados, salvo los bloqueados para el usuario

#### Scenario: Sin autenticación
- **GIVEN** una petición sin token válido
- **WHEN** se solicita `GET /api/channels/tree`
- **THEN** la respuesta es un error de autenticación y no se devuelve ningún dato del árbol

### Requirement: Accesibilidad de teclado

El panel SHALL ser navegable por teclado con las mismas convenciones que el resto de la interfaz: las flechas desplazan el foco entre grupos y canales visibles, Enter activa el elemento enfocado y Escape cierra el panel.

#### Scenario: Navegación con flechas
- **GIVEN** el panel de canales abierto con foco dentro de él
- **WHEN** el usuario pulsa flechas arriba/abajo
- **THEN** el foco se mueve entre los grupos y canales visibles siguiendo el orden del árbol

#### Scenario: Activar con Enter
- **GIVEN** el panel de canales abierto con un canal enfocado
- **WHEN** el usuario pulsa Enter
- **THEN** se inicia la reproducción del canal (mismo comportamiento que el clic)

### Requirement: Canal seleccionado resaltado

El panel de canales SHALL mantener un canal seleccionado y resaltarlo visualmente de forma estable, diferenciable del anillo de foco transitorio de navegación. Al activar un canal del árbol, ese canal SHALL pasar a ser el seleccionado. La selección SHALL persistir entre navegaciones y recargas de página.

#### Scenario: Canal resaltado tras activarlo
- **WHEN** el usuario activa un canal del árbol (clic, doble-clic o Enter)
- **THEN** ese canal pasa a ser el seleccionado y se resalta visualmente, distinguiéndose del resto de filas del panel

#### Scenario: Selección persistente entre páginas
- **GIVEN** un canal seleccionado en el panel
- **WHEN** el usuario navega a otra página y vuelve
- **THEN** el mismo canal sigue resaltado como seleccionado

#### Scenario: Solo un canal seleccionado
- **GIVEN** un canal A seleccionado
- **WHEN** el usuario activa el canal B en el árbol
- **THEN** el canal B pasa a ser el seleccionado y el canal A deja de resaltarse

### Requirement: Sincronización con el canal en reproducción

La selección del panel SHALL mantenerse sincronizada con el canal en reproducción: al cargar cualquier página autenticada cuya ruta sea `/play/live/{stream_id}`, el canal con ese `stream_id` SHALL pasar a ser el seleccionado del panel.

#### Scenario: Selección al abrir el reproductor
- **GIVEN** el usuario navega directamente a `/play/live/{stream_id}`
- **WHEN** se carga la página y se abre el panel de canales
- **THEN** el canal con ese `stream_id` aparece resaltado como seleccionado

#### Scenario: Cambio de canal en reproducción
- **GIVEN** el canal A seleccionado y en reproducción
- **WHEN** el usuario navega a `/play/live/{stream_id_B}` (desde el panel o desde cualquier otra parte de la interfaz)
- **THEN** el canal B pasa a ser el seleccionado y el canal A deja de resaltarse

### Requirement: Localización del canal seleccionado

Al abrir el panel, si existe un canal seleccionado, el panel SHALL expandir el grupo que lo contiene si estaba colapsado y resaltar el canal. La posición de scroll vertical del panel SHALL conservarse sin desplazarse al abrir el panel.

#### Scenario: Grupo colapsado con canal seleccionado
- **GIVEN** un canal seleccionado cuyo grupo está colapsado
- **WHEN** se abre el panel de canales
- **THEN** el grupo se expande y el canal queda resaltado

#### Scenario: El scroll no se desplaza al abrir
- **GIVEN** un panel de canales con una posición de scroll concreta y un canal seleccionado
- **WHEN** se abre el panel de canales
- **THEN** la posición de scroll vertical del panel permanece exactamente donde estaba, sin desplazarse, y el canal seleccionado queda resaltado

### Requirement: El árbol no se reconstruye al navegar y volver

Al activar un canal del panel (que navega al reproductor) y volver a la página anterior, el árbol de canales SHALL conservar su estado y su estructura sin reconstruirse desde cero: los grupos permanecen en su estado expandido/colapsado y la posición de scroll del panel se mantiene. La única actualización sobre el árbol ya montado es el resaltado del canal seleccionado.

#### Scenario: El árbol conserva su estado al volver
- **GIVEN** un panel abierto con ciertos grupos expandidos y una posición de scroll concreta
- **WHEN** el usuario activa un canal (navegando al reproductor) y vuelve a la página anterior
- **THEN** el árbol no se reconstruye: los mismos grupos siguen expandidos, la posición de scroll se mantiene y el canal activado queda resaltado

#### Scenario: Actualización incremental del resaltado
- **GIVEN** un árbol ya montado en el panel
- **WHEN** cambia el canal seleccionado
- **THEN** solo se actualiza el resaltado (la clase del canal seleccionado), sin re-renderizar el resto del árbol

### Requirement: Marcar canales como favoritos

Cada fila de canal del árbol SHALL incluir, en su extremo derecho, un control de estrella que indique si el canal está marcado como favorito. Activar la estrella SHALL cambiar únicamente el estado de favorito del canal, sin iniciar su reproducción ni cambiar el canal seleccionado.

#### Scenario: Marcar un canal
- **GIVEN** un canal visible en el árbol que no está marcado como favorito
- **WHEN** el usuario activa su control de estrella
- **THEN** la estrella pasa al estado marcado, el canal se añade a favoritos y el navegador permanece en la vista actual

#### Scenario: Desmarcar un canal desde el árbol
- **GIVEN** un canal visible en el árbol que está marcado como favorito
- **WHEN** el usuario activa su control de estrella
- **THEN** la estrella pasa al estado no marcado, el canal se elimina de favoritos y el navegador permanece en la vista actual

#### Scenario: Favoritos aislados por usuario
- **GIVEN** dos usuarios autenticados que utilizan el mismo servidor
- **WHEN** el primer usuario marca un canal como favorito y el segundo abre el panel
- **THEN** el favorito del primer usuario no aparece en el estado ni en la lista de favoritos del segundo

### Requirement: Persistencia de favoritos de canales

Los favoritos de canales SHALL persistir en las preferencias del usuario autenticado y SHALL conservarse entre recargas, navegaciones y nuevas sesiones del mismo usuario. Los favoritos de canales SHALL mantenerse separados de los favoritos de películas y series existentes.

#### Scenario: Recuperar favoritos tras recargar
- **GIVEN** un usuario que ha marcado uno o más canales como favoritos
- **WHEN** recarga una página autenticada y abre el panel de canales
- **THEN** los controles de estrella y la lista de favoritos reflejan los mismos canales marcados

#### Scenario: Conservar favoritos de otros tipos
- **GIVEN** un usuario con favoritos de películas o series y sin favoritos de canales
- **WHEN** marca un canal como favorito
- **THEN** los favoritos de películas y series siguen intactos y el canal se guarda en su colección independiente

### Requirement: Sección de canales favoritos

El panel SHALL incluir un icono de favoritos identificable visualmente con una estrella y una sección diferenciada de la vista de árbol. La sección SHALL mostrar una lista plana, sin cabeceras ni anidación por grupos, con una fila por canal favorito visible para el usuario. Cada fila SHALL mostrar el nombre del canal y, entre paréntesis, el nombre del grupo o grupos visibles a los que pertenece.

#### Scenario: Abrir la sección de favoritos
- **GIVEN** el panel de canales abierto
- **WHEN** el usuario activa el icono de favoritos
- **THEN** se muestra la sección de favoritos, el icono queda activo y la vista de árbol deja de ser la sección principal visible

#### Scenario: Conservar la sección al reproducir un favorito
- **GIVEN** la sección de favoritos está abierta y muestra un canal marcado
- **WHEN** el usuario activa el nombre de ese canal para reproducirlo
- **THEN** la nueva página autenticada conserva abierta la sección de favoritos y el canal reproducido permanece identificado como seleccionado

#### Scenario: Canal favorito en varios grupos
- **GIVEN** un canal favorito que pertenece a varios grupos visibles
- **WHEN** se muestra la sección de favoritos
- **THEN** el canal aparece una sola vez y la fila identifica todos sus grupos visibles sin duplicar el canal

#### Scenario: Canal favorito no visible
- **GIVEN** un canal guardado como favorito que ya no está disponible para el usuario o no aparece en los datos actuales del árbol
- **WHEN** se muestra la sección de favoritos
- **THEN** el canal no se muestra ni se exponen sus datos en la interfaz, aunque su preferencia pueda conservarse para una futura sincronización

#### Scenario: Sin canales favoritos
- **GIVEN** un usuario sin canales favoritos visibles
- **WHEN** abre la sección de favoritos
- **THEN** se muestra un estado vacío localizado que indica que todavía no hay canales favoritos

### Requirement: Acciones desde la lista de favoritos

Cada fila de la lista de favoritos SHALL incluir un control para desmarcar el canal directamente. El nombre o enlace principal de la fila SHALL iniciar la reproducción normal del canal mediante `/play/live/{stream_id}`.

#### Scenario: Reproducir un favorito
- **GIVEN** un canal mostrado en la sección de favoritos
- **WHEN** el usuario activa el nombre del canal
- **THEN** el navegador navega a `/play/live/{stream_id}` y se inicia la reproducción normal

#### Scenario: Desmarcar desde favoritos
- **GIVEN** un canal mostrado en la sección de favoritos
- **WHEN** el usuario activa el control de desmarcado
- **THEN** el canal desaparece de la lista, su estrella del árbol queda no marcada y no se inicia la reproducción

### Requirement: Accesibilidad de favoritos

Los controles de favorito del árbol, el icono de la sección y los controles de desmarcado SHALL ser accesibles por teclado, tener nombres accesibles localizados y distinguir visualmente los estados marcado y no marcado sin depender únicamente del color.

#### Scenario: Activar favorito con teclado
- **GIVEN** el foco está sobre el control de estrella de un canal
- **WHEN** el usuario pulsa Enter o la barra espaciadora
- **THEN** el estado del favorito cambia sin navegar al reproductor y el foco permanece en un control operativo

#### Scenario: Navegar entre árbol y favoritos
- **GIVEN** el panel está abierto y contiene el icono de favoritos y sus filas
- **WHEN** el usuario navega con las flechas y activa un elemento con Enter
- **THEN** el foco sigue las convenciones del panel, el icono cambia de sección o el canal se reproduce según el elemento activado

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
