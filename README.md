# TolochaTV

Reproductor IPTV web, ligero y autoalojado. TolochaTV permite ver televisión en directo, películas y series desde tus propias fuentes Xtream Codes o listas M3U.

Este proyecto es un fork y trabajo derivado de [netv](https://github.com/jvdillon/netv), creado por Joshua V. Dillon. Consulta la [información de licencia y atribución](docs/licencia.md).

![Guía EPG](screenshots/epg.png)

## Qué ofrece

- Televisión en directo con guía EPG.
- Películas y series con temporadas y episodios.
- Transcodificación con FFmpeg cuando el navegador no puede reproducir el formato original.
- Aceleración Intel, AMD y NVIDIA cuando el sistema la ofrece.
- Subtítulos y personalización de subtítulos.
- Favoritos, búsqueda y reanudación de películas y series.
- Interfaz adaptable a ordenador, tablet y móvil.
- Compatibilidad con Chromecast mediante HTTPS.
- AI Upscale opcional mediante TensorRT y una GPU NVIDIA.

TolochaTV no proporciona canales ni contenido. Necesitas una suscripción o una fuente IPTV propia y debes tener derecho a usar el contenido que reproduces.

## Instalación rápida con Docker

Requisitos: Docker y Docker Compose.

```bash
git clone https://github.com/izquierdojl/tolochatv.git
cd tolochatv
docker compose build
docker compose up -d
```

Abre <http://localhost:8000>. En el primer acceso se mostrará `/setup` para crear la cuenta de administrador. Después entra en **Settings** y añade una fuente Xtream Codes, M3U o EPG.

La configuración y los usuarios se guardan en `./cache`. Para actualizar una instalación construida desde el repositorio:

```bash
git pull
docker compose build
docker compose up -d
```

Si no tienes GPU o `/dev/dri`, elimina o comenta la sección `devices` de `docker-compose.yml`. Para construir con el FFmpeg de Ubuntu en lugar de la imagen optimizada:

```bash
FFMPEG_IMAGE=ubuntu:24.04 docker compose build
```

Consulta la [guía de instalación](docs/instalacion.md) para Docker, Linux, Windows, HTTPS y desarrollo local.

## Documentación

| Tema | Guía |
|---|---|
| Instalación, actualización y HTTPS | [docs/instalacion.md](docs/instalacion.md) |
| Primer arranque y fuentes IPTV | [docs/configuracion.md](docs/configuracion.md) |
| Usuarios, roles y límites | [docs/usuarios.md](docs/usuarios.md) |
| Reproducción, FFmpeg y GPU | [docs/reproduccion-y-hardware.md](docs/reproduccion-y-hardware.md) |
| Desarrollo y pruebas | [docs/desarrollo.md](docs/desarrollo.md) |
| Problemas habituales | [docs/solucion-de-problemas.md](docs/solucion-de-problemas.md) |
| Preguntas frecuentes y atajos | [docs/preguntas-frecuentes.md](docs/preguntas-frecuentes.md) |
| Licencia y atribución | [docs/licencia.md](docs/licencia.md) |

## Requisitos

- Docker, o Python 3.11 y [uv](https://docs.astral.sh/uv/) para ejecutarlo directamente.
- FFmpeg y FFprobe disponibles en el `PATH` si ejecutas la aplicación fuera de Docker.
- Una fuente Xtream Codes, una lista M3U o una URL XMLTV de tu proveedor.
- Una GPU compatible solo si quieres usar aceleración por hardware o AI Upscale.

La aplicación también puede ejecutarse en Windows. Los scripts de `tools/` para systemd, certificados y preparación del sistema están pensados para Debian/Ubuntu y otras distribuciones Linux.

## Configuración básica

1. Abre la aplicación en el navegador.
2. Crea el primer usuario en `/setup`. Ese usuario siempre es administrador.
3. Entra en **Settings**.
4. Añade una fuente en **Sources**.
5. Pulsa **Refresh** para descargar canales, películas, series y EPG.
6. Ajusta categorías, subtítulos, transcodificación y usuarios según necesites.

La [guía de configuración](docs/configuracion.md) explica cada tipo de fuente y las opciones disponibles.

## Variables y opciones frecuentes

En Docker puedes usar:

```bash
TOLOCHATV_PORT=9000 docker compose up -d
TOLOCHATV_HTTPS=1 docker compose up -d
```

Para una ejecución manual:

```bash
uv run ./main.py --port 8000
uv run ./main.py --debug
uv run ./main.py --cert fullchain.pem --key privkey.pem
```

`LOG_LEVEL=DEBUG` activa logs detallados. No publiques `server_settings.json`: contiene credenciales de fuentes IPTV y la configuración de usuarios.

## Desarrollo

```bash
uv sync --group dev
uv run ./main.py --port 8000
```

Los comandos de lint, typecheck y tests están en [docs/desarrollo.md](docs/desarrollo.md).

## Licencia

TolochaTV se distribuye bajo [Apache License 2.0](LICENSE). Es un trabajo derivado de [netv](https://github.com/jvdillon/netv), de Joshua V. Dillon. La [guía de licencia](docs/licencia.md) explica la atribución y las responsabilidades sobre el contenido IPTV.
