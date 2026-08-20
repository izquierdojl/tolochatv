# Solución de problemas

## Activar logs detallados

En Docker puedes cambiar `LOG_LEVEL=INFO` por `LOG_LEVEL=DEBUG` en `docker-compose.yml` y reiniciar:

```bash
$ docker compose down
$ docker compose up -d
$ docker compose logs -f
```

En una ejecución manual:

```bash
LOG_LEVEL=DEBUG uv run ./main.py --port 8000
# o
uv run ./main.py --debug --port 8000
```

Con systemd:

```bash
sudo systemctl edit tolochatv
sudo systemctl restart tolochatv
journalctl -u tolochatv -f
```

Añade en el editor:

```ini
[Service]
Environment="LOG_LEVEL=DEBUG"
```

## El contenedor no inicia

Comprueba el estado y los logs:

```bash
$ docker compose ps
$ docker compose logs --tail=200 tolochatv
```

Si el equipo no tiene `/dev/dri`, comenta la sección `devices` de `docker-compose.yml`. Si el volumen no permite escritura, revisa los permisos de `./cache`; el contenedor necesita escribir `server_settings.json`, `users/` y las cachés.

En una instalación local confirma que Python, FFmpeg y FFprobe están disponibles:

```bash
python --version
$ ffmpeg -version
$ ffprobe -version
```

## No aparecen canales, películas o series

1. Abre **Settings > Sources**.
2. Comprueba la URL y, en Xtream, el nombre de usuario y la contraseña.
3. Pulsa el botón de actualización correspondiente.
4. Revisa que la categoría no esté en la columna **Unavailable**.
5. Limpia la caché de datos desde **Data Cache** si cambiaste la fuente.
6. Activa `LOG_LEVEL=DEBUG` y vuelve a cargar los datos.

Una lista M3U puede no incluir EPG. En ese caso añade una fuente **EPG Only** o indica manualmente la URL XMLTV.

## La reproducción falla o consume mucha CPU

En Settings revisa el modo de transcodificación y el codificador elegido. `Never` requiere que el navegador reproduzca el formato original; `Always` consume más recursos.

Si esperabas aceleración por hardware:

- En Docker, confirma que `/dev/dri` está montado para VAAPI.
- En NVIDIA, confirma que `nvidia-smi` funciona en el host y que se usa el perfil `nvidia`.
- Comprueba que la opción correspondiente aparece habilitada en **Hardware Acceleration**.
- Usa `software` como prueba de diagnóstico, no como solución automática para una GPU mal configurada.

## HTTPS o Chromecast no funcionan

Verifica que el certificado y la clave existen y que el proceso puede leerlos. Con Let's Encrypt, comprueba `/etc/letsencrypt/live` y el grupo `ssl-cert`.

```bash
sudo systemctl list-timers | grep certbot
sudo systemctl status tolochatv
```

Usa `--cert` y `--key` juntos. Si usas `--https` sin dominio, `main.py` busca el primer certificado válido bajo `/etc/letsencrypt/live`.

## CUDA o AI Upscale falla

Comprueba la GPU, el controlador, `nvidia-container-toolkit` y el espacio disponible en el volumen de modelos. El primer arranque de `Dockerfile.ai_upscale` construye motores específicos para la GPU; no interrumpas ese proceso.

Ejecuta `nvidia-smi` en el host para comprobar que el controlador responde. Si la compilación falla, inicia la imagen normal sin AI Upscale.

## Contraseña o cuenta perdida

Si todavía existe un administrador, cambia la contraseña desde **Settings**. Si no existe ninguno, restaura una copia de seguridad de `cache/server_settings.json` y `cache/users/` con el servicio detenido. No compartas esos ficheros.
