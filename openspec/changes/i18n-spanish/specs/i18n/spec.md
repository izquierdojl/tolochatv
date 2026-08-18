## Purpose

Permite que TolochaTV muestre toda su interfaz (UI, mensajes de estado y errores visibles al usuario) en un idioma seleccionable, con español de España (es-ES) como idioma por defecto, inglés como alternativa y fallback al inglés cuando falta una traducción. La selección combina preferencia por usuario, auto-detección por navegador y un default global fijado por el admin.

## ADDED Requirements

### Requirement: Resolución del idioma activo
El sistema SHALL determinar el idioma activo de cada petición con este orden de prioridad: (1) preferencia de idioma del usuario autenticado, (2) auto-detección por la cabecera `Accept-Language` del navegador, (3) idioma por defecto del servidor. El idioma por defecto del servidor SHALL ser `es-ES`.

#### Scenario: Usuario con preferencia explícita
- **WHEN** un usuario autenticado tiene guardada una preferencia de idioma (`language`) en sus ajustes de usuario
- **THEN** el sistema usa ese idioma para todas sus peticiones, ignorando la cabecera del navegador y el default del servidor

#### Scenario: Sin preferencia de usuario y navegador en español
- **WHEN** el usuario no tiene preferencia de idioma y su cabecera `Accept-Language` empieza por `es` o `es-ES`
- **THEN** el sistema usa `es-ES`

#### Scenario: Sin preferencia de usuario y navegador en otro idioma
- **WHEN** el usuario no tiene preferencia de idioma y su cabecera `Accept-Language` no indica español
- **THEN** el sistema usa el idioma por defecto del servidor

#### Scenario: Navegador sin cabecera de idioma
- **WHEN** la petición no incluye cabecera `Accept-Language` (o viene vacía) y el usuario no tiene preferencia
- **THEN** el sistema usa el idioma por defecto del servidor

### Requirement: Preferencia de idioma por usuario
El sistema SHALL permitir que un usuario autenticado guarde y consulte su idioma de interfaz a través del endpoint existente de preferencias de usuario, y SHALL persistirla en sus ajustes de usuario. Un valor vacío SHALL indicar "sin preferencia" (auto-detección).

#### Scenario: Guardar idioma
- **WHEN** un usuario autenticado envía `{"language": "es-ES"}` al endpoint de preferencias de usuario
- **THEN** el sistema guarda la preferencia y la devuelve en lecturas posteriores de sus preferencias

#### Scenario: Limpiar preferencia
- **WHEN** un usuario autenticado envía `{"language": ""}` al endpoint de preferencias de usuario
- **THEN** el sistema elimina la preferencia y vuelve a la auto-detección por navegador

### Requirement: Idioma por defecto del servidor
El sistema SHALL exponer un ajuste global `default_language` en los ajustes del servidor, configurable por el admin, que actúa como idioma de la interfaz para usuarios sin preferencia ni detección por navegador.

#### Scenario: Admin cambia el default
- **WHEN** el admin guarda un valor `default_language` distinto en los ajustes del servidor
- **THEN** el sistema lo usa como idioma para las peticiones que no tienen preferencia de usuario ni detección por navegador

### Requirement: Traducción de la interfaz
El sistema SHALL resolver todas las cadenas de la interfaz (títulos, botones, placeholders, tooltips, mensajes de estado) mediante el catálogo de traducciones del idioma activo. Cuando una cadena no exista en el catálogo, el sistema SHALL mostrar el texto original en inglés.

#### Scenario: Cadena traducida
- **WHEN** el idioma activo es `es-ES` y una cadena de la interfaz existe en el catálogo español
- **THEN** el sistema muestra la traducción en español de España

#### Scenario: Cadena sin traducción
- **WHEN** el idioma activo es `es-ES` y una cadena de la interfaz no existe en el catálogo español
- **THEN** el sistema muestra la cadena original en inglés

#### Scenario: Modo inglés
- **WHEN** el idioma activo es `en`
- **THEN** el sistema muestra las cadenas originales en inglés

### Requirement: Traducción en el navegador (JavaScript)
El sistema SHALL exponer el catálogo de traducciones del idioma activo al JavaScript del navegador, de modo que las cadenas generadas por el cliente (mensajes de estado, confirmaciones, tooltips dinámicos) se muestren en el idioma activo.

#### Scenario: Carga del catálogo para el navegador
- **WHEN** el navegador solicita el catálogo de traducciones para el idioma activo
- **THEN** el sistema responde con las traducciones correspondientes y el JavaScript las usa para renderizar sus cadenas

#### Scenario: Clave ausente en el catálogo del navegador
- **WHEN** el JavaScript solicita una clave que no existe en el catálogo del idioma activo
- **THEN** el cliente muestra la clave original en inglés

### Requirement: Traducción de mensajes de error
El sistema SHALL mostrar los mensajes de error visibles al usuario (por ejemplo, errores de autenticación, permisos o gestión de usuarios) en el idioma activo. Los mensajes puramente técnicos de la maquinaria interna (FFmpeg, transcodificación) SHALL permanecer sin traducir.

#### Scenario: Error de login en español
- **WHEN** el idioma activo es `es-ES` y se produce un error de autenticación visible al usuario
- **THEN** el sistema muestra el mensaje de error traducido al español de España

### Requirement: Atributo de idioma del documento
El sistema SHALL emitir el atributo `lang` en el elemento `<html>` de cada página con el código del idioma activo (`es-ES` o `en`).

#### Scenario: Página en español
- **WHEN** el idioma activo es `es-ES`
- **THEN** el documento HTML se emite con `lang="es-ES"`

#### Scenario: Página en inglés
- **WHEN** el idioma activo es `en`
- **THEN** el documento HTML se emite con `lang="en"`

### Requirement: Contenido de las fuentes IPTV no se traduce
El sistema SHALL NO traducir el contenido procedente de las fuentes IPTV: nombres de canales y categorías, títulos y descripciones de EPG, títulos de películas y series, ni nombres de fuentes o grupos. Estos se muestran tal y como los proporciona la fuente.

#### Scenario: Título de película en idioma original
- **WHEN** el idioma activo es `es-ES` y se muestra una película cuyo título está en inglés
- **THEN** el sistema muestra el título original sin traducir