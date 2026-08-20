# Desarrollo

## Preparar el entorno

Requisitos: Python 3.11 y [uv](https://docs.astral.sh/uv/). Desde la raíz del repositorio:

```bash
uv sync --group dev
```

Para ejecución normal basta con:

```bash
uv sync
```

FFmpeg y FFprobe deben estar en el `PATH` si se van a probar rutas de reproducción o transcodificación. Las pruebas unitarias están diseñadas para ejecutarse sin red ni FFmpeg real.

## Ejecutar la aplicación

```bash
uv run ./main.py --port 8000
```

Opciones útiles:

```bash
uv run ./main.py --debug
uv run ./main.py --https
uv run ./main.py --cert fullchain.pem --key privkey.pem
```

Abre <http://localhost:8000>. En un entorno limpio, crea el administrador en `/setup`.

## Comprobaciones automáticas

Ejecuta las mismas comprobaciones que usa CI:

```bash
uv run ruff check .
uv run basedpyright
uv run pytest
```

Pytest descubre ficheros `*_test.py` en la raíz. Las pruebas están aisladas y no deben depender de una cuenta real, red, FFmpeg ni un proveedor IPTV.

## Comprobación manual del navegador

Con el servidor en marcha:

1. Abre `/setup` y crea una cuenta.
2. Comprueba que `/` lleva a `/login` después de configurar el primer usuario.
3. Añade una fuente de prueba en **Settings**.
4. Revisa **Guide**, **Movies**, **Series**, **Search** y **Settings**.
5. Si pruebas la interfaz española, selecciona Español (España) y revisa títulos, mensajes y navegación.

En Windows puedes detener el servidor con `Ctrl+C`. En Linux también puedes finalizar el proceso con `kill`.

## Estructura útil

- `main.py`: aplicación FastAPI, rutas y arranque.
- `auth.py`: usuarios, contraseñas, roles, tokens y límites.
- `cache.py`: caché, configuración, fuentes y preferencias.
- `epg.py`: base SQLite y carga de XMLTV.
- `m3u.py` y `xtream.py`: obtención y análisis de fuentes.
- `ffmpeg_command.py` y `ffmpeg_session.py`: transcodificación y sesiones.
- `templates/` y `static/`: interfaz web.
- `tools/`: scripts auxiliares de instalación y preparación de datos.

No guardes credenciales reales en tests, ejemplos ni commits.
