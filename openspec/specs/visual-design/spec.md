# visual-design Specification

## Purpose

Define una identidad visual propia para TolochaTV, inspirada en la cordillera y los pinares del Bajo Aragón, sin comprometer la legibilidad, la accesibilidad ni el uso del reproductor IPTV.

## Requirements

### Requirement: Tolocha visual identity

La interfaz SHALL utilizar una identidad cromática y tipográfica coherente basada en verdes de pino y musgo, tonos tierra y un acento cálido de referencia aragonesa. Los colores SHALL distinguir claramente fondo, superficie, texto principal, texto secundario, borde, acción y estado seleccionado en todas las vistas renovadas.

#### Scenario: Shared authenticated shell

- **GIVEN** un usuario autenticado abre la guía, películas, series, búsqueda, ajustes o reproductor
- **WHEN** se renderiza la vista
- **THEN** la navegación lateral y las superficies principales presentan la misma identidad visual de TolochaTV, sin volver al esquema genérico de grises y azules como combinación dominante

#### Scenario: Access screens use the same identity

- **GIVEN** un usuario visita login, configuración inicial o una página de error
- **WHEN** se renderiza la pantalla sin autenticación o con error
- **THEN** la pantalla utiliza la misma paleta, jerarquía de controles y lenguaje visual que la carcasa autenticada

### Requirement: Mountain and pine decorative treatment

La interfaz SHALL incluir al menos un tratamiento visual reconocible y sutil de cordillera, ladera o pinar en los fondos o superficies principales. Los elementos decorativos SHALL ser locales al proyecto o generables por CSS/SVG, no SHALL bloquear la interacción ni SHALL depender de una descarga de imágenes de terceros.

#### Scenario: Decorative motif is visible without obscuring content

- **GIVEN** una vista principal contiene datos, tarjetas, controles o vídeo
- **WHEN** el usuario la visualiza
- **THEN** el motivo de montaña o pinar aporta profundidad en segundo plano y el texto, los logos, los controles y el vídeo permanecen claramente distinguibles

#### Scenario: Missing decorative resource does not break the page

- **GIVEN** un recurso decorativo opcional no está disponible
- **WHEN** se carga cualquier vista que lo utilice
- **THEN** la interfaz conserva fondos, contraste, contenido e interacción mediante el tratamiento de color de respaldo

### Requirement: Accessible visual states

Todos los controles interactivos SHALL conservar un estado de foco visible y diferenciado del hover. Los estados activo, seleccionado, deshabilitado, vacío, carga, éxito y error SHALL mantener una diferencia visual suficiente sin depender únicamente del color.

#### Scenario: Keyboard focus remains visible

- **GIVEN** el usuario recorre con Tab la navegación, los filtros, las tarjetas, los controles del reproductor o los formularios
- **WHEN** un elemento recibe el foco
- **THEN** se muestra un indicador de foco visible sobre el fondo decorado y el foco no queda recortado por un contenedor desplazable

#### Scenario: Selected channel remains distinguishable

- **GIVEN** el usuario selecciona o está reproduciendo un canal desde el árbol, favoritos o la guía
- **WHEN** se actualiza su estado visual
- **THEN** el canal seleccionado se distingue del resto mediante una combinación de superficie, borde, icono o indicador adicional, manteniendo el nombre legible

### Requirement: Responsive presentation

La renovación SHALL conservar la funcionalidad y la jerarquía de contenido en escritorios, tabletas y pantallas estrechas. Los fondos y motivos SHALL adaptarse al tamaño disponible y no SHALL introducir desplazamiento horizontal accidental.

#### Scenario: Narrow authenticated viewport

- **GIVEN** una página autenticada se muestra en una pantalla estrecha
- **WHEN** el usuario abre el panel de canales o consulta tarjetas y formularios
- **THEN** los controles siguen siendo utilizables, el contenido prioritario permanece visible y no aparece una barra de desplazamiento horizontal causada por la decoración o el tema

#### Scenario: Player remains usable at every size

- **GIVEN** el usuario abre el reproductor en escritorio o móvil
- **WHEN** se aplica el nuevo tratamiento visual
- **THEN** el vídeo, sus controles y la información asociada mantienen su espacio funcional, contraste y capacidad de interacción

### Requirement: Restrained motion

Las transiciones o efectos visuales SHALL ser breves y no SHALL ser necesarios para comprender el estado de la interfaz. Cuando el dispositivo indique `prefers-reduced-motion: reduce`, la interfaz SHALL eliminar o minimizar las animaciones decorativas y de transición.

#### Scenario: Reduced motion preference

- **GIVEN** el navegador informa de una preferencia de movimiento reducido
- **WHEN** el usuario abre, cierra o cambia de vista
- **THEN** los elementos decorativos no ejecutan animaciones continuas y las transiciones funcionales se reducen sin impedir la respuesta visual del control
