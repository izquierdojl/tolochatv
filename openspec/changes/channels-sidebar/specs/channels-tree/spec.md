## Purpose

Navegador de canales en vivo accesible desde el menú vertical: muestra los canales IPTV visibles en la guía, agrupados en un árbol desplegable por categorías, para lanzar la reproducción directamente sin pasar por la guía ni el buscador.

## ADDED Requirements

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
