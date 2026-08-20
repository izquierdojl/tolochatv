# Configuración

## Primer arranque

Si no existe ningún usuario, TolochaTV redirige a `/setup`. El primer usuario se convierte siempre en administrador.

- El nombre de usuario debe tener al menos 3 caracteres.
- La contraseña debe tener al menos 8 caracteres.
- Debes repetir la contraseña para confirmar la creación.

Después de crear la cuenta, inicia sesión y abre **Settings**.

## Añadir una fuente

En **Settings > Sources**, pulsa **Add Source**. Cada fuente tiene un nombre, una URL y un tipo:

### Xtream API

Selecciona **Xtream API** y rellena la URL del servidor, el nombre de usuario y la contraseña proporcionados por tu proveedor. Esta fuente puede ofrecer televisión en directo, VOD, series y EPG.

### Lista M3U

Selecciona **M3U Playlist** e indica la URL de la lista. La información de grupos, canales y una posible URL EPG se obtiene de la lista cuando está disponible.

### EPG Only

Selecciona **EPG Only** cuando tengas una URL XMLTV independiente. Esta fuente solo aporta guía de programación.

No guardes en documentación pública las credenciales de Xtream ni las URLs privadas de tus listas.

## EPG

Una fuente puede descargar EPG automáticamente. En cada fuente puedes configurar:

- **Fetch EPG from this source**: activa o desactiva la descarga desde esa fuente.
- **EPG URL**: URL XMLTV manual. Si se deja vacía, puede detectarse durante la primera actualización.
- **EPG Timeout**: tiempo de espera en segundos, entre 1 y 3600; el valor inicial es 120.
- **EPG Schedule**: horas de actualización separadas por comas, por ejemplo `03:00, 15:00`.

Usa el botón **EPG** de la fuente para actualizarla manualmente. La aplicación almacena el EPG en una base SQLite dentro de la caché y conserva una ventana de datos recientes para la guía.

También puedes preparar datos externos con `tools/zap2xml.py` y alinear una lista con `tools/alignm3u.py`. Consulta [Preguntas frecuentes](preguntas-frecuentes.md).

## Filtros y preferencias

Las preferencias del usuario se guardan por separado en `cache/users/<usuario>/settings.json` o en la carpeta de caché configurada.

- **Language**: idioma de la interfaz, incluido Español (España).
- **Live TV Filter**: categorías visibles en la guía. Puedes ordenarlas y moverlas entre disponibles y no disponibles.
- **Movies Filter** y **Series Filter**: categorías visibles de VOD y series.
- **Guide**: desplazamiento virtual para listas grandes.
- **Closed Captions**: activación, idioma, tamaño, fuente, color, sombra y fondo.
- **Favorites** y posiciones de reproducción: se guardan por usuario.

Si un cambio de filtro no aparece inmediatamente, actualiza los datos de la fuente desde **Settings**.

## Transcodificación

Los administradores pueden configurar en **Server Settings**:

- **Mode**: `Auto`, `Always` o `Never`.
- **Hardware Acceleration**: NVENC, AMF, QSV, VAAPI o software, según los codificadores detectados.
- Resolución máxima y calidad máxima.
- Caché de transcodificación VOD y tiempo de recuperación de sesiones en directo.
- Búfer DVR en directo.
- Directorio de segmentos HLS. Vacío significa el directorio temporal del sistema; un SSD suele ofrecer mejor rendimiento.
- Sondeos de códecs y subtítulos para directo, películas y series.
- User-Agent usado al obtener streams durante la transcodificación.

Las opciones no disponibles por hardware aparecen desactivadas. Consulta [Reproducción y hardware](reproduccion-y-hardware.md) antes de forzar un codificador.

## Caché y copias de seguridad

La aplicación usa `cache/` si existe; de lo contrario usa `.cache/`. En Docker el volumen habitual es `./cache`.

Contenido importante:

- `server_settings.json`: fuentes, configuración del servidor, usuarios y clave de firma.
- `users/`: preferencias y progreso de cada usuario.
- `logos/`: logos descargados.
- Datos de directo, películas y series, además de la base EPG.

No edites `server_settings.json` mientras el servidor está en ejecución salvo que sepas exactamente qué estás haciendo. Para una copia completa, detén el servicio y copia todo el directorio de caché.
