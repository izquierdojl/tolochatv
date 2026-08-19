## ADDED Requirements

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
