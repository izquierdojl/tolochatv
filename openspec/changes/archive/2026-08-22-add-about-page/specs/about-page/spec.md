## Purpose

Ofrece a los usuarios un lugar claro y breve para identificar TolochaTV, consultar su versión y herramientas principales, y acceder al repositorio oficial desde la aplicación.

## ADDED Requirements

### Requirement: Project information page

La aplicación SHALL proporcionar una página de información en `/about` para usuarios autenticados. La página SHALL identificar el proyecto como TolochaTV y SHALL mostrar la versión actualmente instalada, las principales herramientas utilizadas para construirlo y el enlace al repositorio oficial `https://github.com/izquierdojl/tolochatv`.

#### Scenario: Authenticated user views project information

- **GIVEN** un usuario autenticado está navegando por TolochaTV
- **WHEN** abre `/about`
- **THEN** recibe una página renderizada dentro de la carcasa común que muestra el nombre TolochaTV, la versión actual, las herramientas principales y el enlace al repositorio oficial

#### Scenario: Repository link opens the official project

- **GIVEN** la página de información muestra el enlace al repositorio
- **WHEN** el usuario activa ese enlace
- **THEN** el navegador apunta a `https://github.com/izquierdojl/tolochatv` y el enlace se distingue como una acción navegable

#### Scenario: Unauthenticated access is protected

- **GIVEN** un visitante no autenticado solicita `/about`
- **WHEN** la aplicación procesa la solicitud
- **THEN** no muestra la información protegida y aplica el flujo de autenticación existente

### Requirement: About entry in primary navigation

La navegación lateral SHALL incluir una entrada traducible de información o acerca de enlazada a `/about`, situada inmediatamente después de la entrada de Configuración. La entrada SHALL utilizar un icono local de información visualmente coherente con los iconos existentes, con nombre accesible y estado activo cuando la ruta actual sea `/about`.

#### Scenario: User finds the about entry below settings

- **GIVEN** un usuario autenticado visualiza la navegación lateral
- **WHEN** recorre las entradas de navegación en su orden visual
- **THEN** encuentra la entrada de Información o Acerca de inmediatamente debajo de Configuración y puede activarla para abrir `/about`

#### Scenario: About icon is available without an external request

- **GIVEN** el usuario carga la carcasa sin acceso a recursos de terceros
- **WHEN** se renderiza la navegación
- **THEN** el icono de Información se muestra desde un recurso local del proyecto, conserva el tamaño y contraste de los iconos vecinos, y no bloquea la navegación

#### Scenario: Keyboard and assistive technology access the entry

- **GIVEN** el usuario recorre la navegación con teclado o tecnología de asistencia
- **WHEN** el foco llega a la entrada de Información
- **THEN** el foco es visible, la entrada tiene un nombre accesible y la ruta activa puede distinguirse sin depender únicamente del color

### Requirement: Localized and responsive presentation

La página y su entrada de navegación SHALL reutilizar el sistema de traducciones de la aplicación, SHALL conservar la identidad visual compartida y SHALL permanecer legibles y utilizables en pantallas estrechas y amplias sin introducir desplazamiento horizontal accidental.

#### Scenario: Spanish user sees translated labels

- **GIVEN** el idioma activo es español
- **WHEN** el usuario visualiza la navegación o la página `/about`
- **THEN** las etiquetas y títulos nuevos aparecen traducidos al español y no se muestran claves internas de traducción

#### Scenario: About page remains usable on narrow screens

- **GIVEN** el usuario abre `/about` en una pantalla estrecha
- **WHEN** consulta la información y el enlace al repositorio
- **THEN** el contenido se adapta al ancho disponible, mantiene contraste y no requiere desplazamiento horizontal
