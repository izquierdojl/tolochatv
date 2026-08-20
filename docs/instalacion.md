# Instalación

TolochaTV puede ejecutarse con Docker o directamente con Python. Docker es la opción más sencilla para una instalación permanente. La aplicación escucha en el puerto `8000` por defecto.

## Docker Compose

### Requisitos

- Docker Engine o Docker Desktop.
- Docker Compose v2.
- Espacio para las imágenes, la caché y los segmentos de transcodificación.

### Instalación

```bash
git clone https://github.com/izquierdojl/tolochatv.git
cd tolochatv
docker compose build
$ docker compose up -d
```

El `docker-compose.yml` del repositorio construye la imagen localmente. Usa una imagen base de FFmpeg optimizada por defecto. Si no puedes acceder a esa imagen o prefieres el paquete de Ubuntu:

```bash
FFMPEG_IMAGE=ubuntu:24.04 docker compose build
```

Abre <http://localhost:8000>. El primer acceso redirige a `/setup` para crear el administrador.

### Datos y permisos

El volumen `./cache:/app/cache` conserva usuarios, configuración, logos y cachés al recrear el contenedor. El `entrypoint.sh` intenta ajustar los permisos de ese directorio para el usuario interno `tolochatv`.

Haz copias de seguridad de `cache/server_settings.json` y `cache/users/`. El archivo de configuración puede contener credenciales de las fuentes IPTV.

### GPU

El Compose incluye `/dev/dri` para Intel y AMD. Si el equipo no tiene ese dispositivo, comenta estas líneas antes de iniciar:

```yaml
devices:
  - /dev/dri:/dev/dri
```

Para NVIDIA:

```bash
$ docker compose --profile nvidia up -d
```

Necesitas el controlador NVIDIA y `nvidia-container-toolkit`. Consulta [Reproducción y hardware](reproduccion-y-hardware.md).

### Puerto y HTTPS

El puerto del host se puede cambiar sin editar el fichero:

```bash
TOLOCHATV_PORT=9000 docker compose up -d
```

`TOLOCHATV_HTTPS=1` activa HTTPS en el contenedor cuando los certificados están disponibles en la ruta esperada. Para certificados propios, monta el directorio de certificados en el servicio y usa la opción `--cert`/`--key` en una ejecución manual. Chromecast requiere HTTPS.

## Debian y Ubuntu con systemd

Los scripts de `tools/` están pensados para Linux. El flujo recomendado es:

```bash
./tools/install-prereqs.sh
./tools/install-letsencrypt.sh ejemplo.com   # opcional, para HTTPS
./tools/install-ffmpeg.sh                    # opcional
sudo ./tools/install-tolochatv.sh            # opcional: --port 9000
```

`install-prereqs.sh` instala Python 3.11 mediante `uv`. `install-tolochatv.sh` sincroniza el entorno, crea el servicio systemd y lo inicia con el usuario que ejecutó `sudo`.

Comandos de administración:

```bash
sudo systemctl status tolochatv
sudo systemctl restart tolochatv
journalctl -u tolochatv -f
sudo systemctl edit tolochatv --full
sudo ./tools/uninstall-tolochatv.sh
```

No ejecutes `install-tolochatv.sh` como `root` directamente. Usa `sudo` desde tu cuenta normal.

## Ejecución local

Requiere Python 3.11, `uv` y FFmpeg/FFprobe en el `PATH`:

```bash
cd tolochatv
uv sync
uv run ./main.py --port 8000
```

También se puede instalar con pip:

```bash
pip install .
./main.py --port 8000
```

En Windows puedes usar PowerShell y `uv run .\main.py --port 8000`; los scripts systemd de `tools/` no son necesarios para esa plataforma.

## Opciones de `main.py`

```text
--port PORT             Puerto de escucha, por defecto 8000
--debug                 Activa logs de depuración
--https [DOMAIN]        Usa certificados de Let's Encrypt
--cert FILE             Certificado TLS propio
--key FILE              Clave privada TLS propia
```

`--cert` y `--key` deben utilizarse juntos. `LOG_LEVEL` puede ser `DEBUG`, `INFO`, `WARNING`, `ERROR` o `CRITICAL` y tiene prioridad sobre `--debug`.

## Actualización

Con Docker:

```bash
$ git pull
$ docker compose build
$ docker compose up -d
```

Con systemd:

```bash
uv sync
sudo systemctl restart tolochatv
```

No borres `cache` durante una actualización si quieres conservar usuarios, fuentes y preferencias.
