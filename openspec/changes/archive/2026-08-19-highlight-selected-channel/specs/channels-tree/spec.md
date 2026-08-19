## ADDED Requirements

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
