# Reproducción y hardware

## Reproducción

TolochaTV intenta entregar el stream directamente cuando el navegador puede reproducirlo. Si el formato, los códecs o los subtítulos no son compatibles, FFmpeg puede crear una salida HLS transcodificada.

En **Settings > Server Settings > Transcoding** puedes elegir:

- **Auto**: transcodifica solo cuando hace falta.
- **Always**: transcodifica siempre; puede ser necesario para aplicar límites o compatibilidad uniforme.
- **Never**: no transcodifica; el navegador debe admitir el stream original.

El sondeo de medios detecta códecs y subtítulos. Añade un pequeño retraso al primer inicio, pero los resultados se reutilizan desde la caché.

## FFmpeg

FFmpeg y FFprobe deben estar disponibles en el `PATH` cuando la aplicación se ejecuta fuera de Docker. La imagen Docker estándar instala o incluye FFmpeg. Para una instalación Linux optimizada puedes usar `tools/install-ffmpeg.sh`.

La aplicación guarda segmentos y sesiones de transcodificación en el directorio configurado en **Transcode Directory**. Si está vacío usa el directorio temporal del sistema. Un disco rápido ayuda cuando hay varios streams.

## Aceleración Intel y AMD

Docker Compose expone `/dev/dri` para VAAPI. El contenedor intenta detectar el dispositivo y el controlador. En Linux, el usuario que ejecuta Docker debe tener acceso al dispositivo `render`.

En **Hardware Acceleration** pueden aparecer:

- `vaapi` para decodificación o codificación mediante VAAPI.
- `qsv` para Intel Quick Sync.
- `amf+vaapi` o `amf+software` para AMD cuando FFmpeg dispone de AMF.
- `software` como alternativa basada en CPU.

Si el codificador aparece desactivado, revisa `/dev/dri`, los controladores del host y la imagen de FFmpeg.

## Construir FFmpeg personalizado

La imagen normal ya incluye FFmpeg. Solo necesitas construirlo si quieres habilitar una combinación concreta de CUDA, NVENC, AMF, VAAPI, QSV o códecs adicionales. El proceso requiere Docker BuildKit y al menos 20 GB de espacio:

```bash
$ docker build --progress plain --build-arg NVIDIA=cuda:12.8 --build-arg FFMPEG_BASE_IMAGE=ubuntu:24.04 -f Dockerfile.ffmpeg -t tolochatv-ffmpeg:cuda12.8 .
FFMPEG_IMAGE=tolochatv-ffmpeg:cuda12.8 docker compose --profile nvidia build
FFMPEG_IMAGE=tolochatv-ffmpeg:cuda12.8 docker compose --profile nvidia up -d
```

Elige la versión CUDA según el controlador instalado. Si no necesitas este nivel de personalización, usa la imagen normal o `FFMPEG_IMAGE=ubuntu:24.04`.

## NVIDIA

Para Docker instala el controlador NVIDIA y `nvidia-container-toolkit`, y arranca el perfil específico:

```bash
$ docker compose --profile nvidia up -d
```

Las opciones disponibles pueden incluir `nvenc+vaapi` y `nvenc+software`. La imagen base y la versión CUDA deben ser compatibles con el controlador. Para elegir una imagen FFmpeg concreta:

```bash
FFMPEG_IMAGE=ghcr.io/izquierdojl/tolochatv-ffmpeg:<cuda-version> docker compose --profile nvidia up -d
```

Comprueba la compatibilidad de tu equipo con:

```bash
nvidia-smi --query-gpu=driver_version,compute_cap --format=csv,noheader
```

No fuerces NVENC si no aparece disponible en Settings.

## Chromecast y HTTPS

Los navegadores y Chromecast pueden exigir HTTPS, especialmente cuando el servidor no está en la misma máquina que el cliente. Puedes usar Let's Encrypt en Linux:

```bash
./tools/install-letsencrypt.sh ejemplo.com
sudo ./tools/install-tolochatv.sh
```

También puedes iniciar manualmente con certificados propios:

```bash
uv run ./main.py --cert fullchain.pem --key privkey.pem
```

## AI Upscale

AI Upscale es opcional y requiere una GPU NVIDIA compatible, Docker con acceso a GPU, `nvidia-container-toolkit` y espacio para los motores TensorRT. La imagen específica se construye así:

```bash
$ docker build -f Dockerfile.ai_upscale -t tolochatv-ai-upscale .
$ docker run --gpus all -v tolochatv-models:/models -p 8000:8000 tolochatv-ai-upscale
```

El primer arranque construye los motores para la GPU y puede tardar varios minutos. Se guardan en el volumen `/models` para los arranques siguientes. La interfaz muestra las opciones solo cuando detecta motores disponibles.

En una instalación Linux sin la imagen AI también puedes preparar los motores con:

```bash
uv sync --group ai_upscale
./tools/install-ai_upscale.sh
```

El script usa `~/ffmpeg_build/models` por defecto. Puedes cambiarlo con `MODEL_DIR=/ruta/a/modelos`.
