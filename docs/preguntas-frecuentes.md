# Preguntas frecuentes

## ¿TolochaTV incluye canales?

No. Es un reproductor. Debes aportar una fuente Xtream, M3U o XMLTV y ser responsable de que su uso sea legal en tu jurisdicción.

Para contenido público puedes consultar [iptv-org/iptv](https://github.com/iptv-org/iptv), siempre revisando las condiciones de cada canal y proveedor.

## ¿Dónde consigo una guía EPG?

Puedes usar la URL XMLTV de tu proveedor, [iptv-org/epg](https://github.com/iptv-org/epg), una fuente **EPG Only** o preparar datos con `tools/zap2xml.py`. La disponibilidad y exactitud dependen de la fuente.

## ¿Cómo preparo una lista de HDHomeRun?

HDHomeRun puede ofrecer una lista M3U sin identificadores suficientes para relacionar la guía. Los scripts del repositorio permiten descargar y alinear los datos:

```bash
wget http://192.168.1.87/lineup.m3u -O tools/lineup.m3u
./tools/zap2xml.py --zip 90210
./tools/alignm3u.py --input tools/lineup.m3u --xmltv tools/xmltv.xml --output tools/ota.m3u
```

Después añade `tools/ota.m3u` como fuente M3U. Sustituye la IP y el código postal por los de tu instalación.

## ¿Qué atajos de teclado existen?

| Tecla | Acción |
|---|---|
| `Espacio` / `k` | Reproducir o pausar |
| `f` | Pantalla completa |
| `m` | Silenciar |
| `c` | Activar o desactivar subtítulos |
| `i` | Mostrar u ocultar información |
| `←` / `→` | Retroceder o avanzar 10 segundos |
| `↑` / `↓` | Subir o bajar el volumen |
| `j` | Saltar a un momento |
| `Esc` | Volver o cerrar |

## ¿Qué significa TolochaTV?

El proyecto comenzó como un fork de [netv](https://github.com/jvdillon/netv). La explicación original juega con la pronunciación de N-E-T-V, que suena como “any TV”. El nombre TolochaTV mantiene la relación histórica, pero el proyecto actual tiene su propia interfaz y código.

## ¿Puedo usarlo en Windows?

Sí, puedes usar Docker Desktop o una instalación local con Python, `uv` y FFmpeg en el `PATH`. Los scripts `install-*.sh` y el servicio systemd están orientados a Linux.

## ¿Cómo cambio el idioma?

En **Settings > Language** puedes seleccionar Español (España) o English. El administrador también puede definir el idioma predeterminado para usuarios sin preferencia.

## ¿Dónde se guardan mis datos?

La aplicación usa `cache/` si existe y `.cache/` en caso contrario. Ahí se almacenan usuarios, preferencias, fuentes, logos, EPG y datos descargados. Haz copias de seguridad y protege el acceso a ese directorio.
