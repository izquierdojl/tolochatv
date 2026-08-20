## 1. Preparación Y Fuente De Verdad

- [x] 1.1 Revisar `README.md`, `docker-compose.yml`, `Dockerfile*`, `pyproject.toml`, `main.py`, `auth.py`, `cache.py`, `epg.py` y `tools/`, y elaborar una lista de comandos, rutas, variables y funciones que deben conservarse; verificar que la lista cubre las instrucciones actuales sin inventar comportamiento.
- [x] 1.2 Crear `docs/` y definir el índice de guías enlazadas desde `README.md`; verificar que cada destino previsto tiene una ruta concreta y que no se crean ficheros fuera del alcance documental.

## 2. Portada Del Proyecto

- [x] 2.1 Reescribir `README.md` en español de España con descripción, características, requisitos, advertencia sobre contenidos IPTV, instalación rápida, primer acceso y mapa de documentación; verificar que se puede entender el flujo básico sin abrir otra guía.
- [x] 2.2 Añadir al README la atribución breve a `netv` de Joshua V. Dillon, la relación de fork y la referencia a Apache License 2.0; verificar que los enlaces a `LICENSE`, `netv` y todas las guías existen.

## 3. Instalación Y Configuración

- [x] 3.1 Crear `docs/instalacion.md` con Docker, Debian/Ubuntu, desarrollo local, actualización, puertos, HTTPS y certificados, conservando los comandos válidos del repositorio; verificar cada comando y ruta frente a `docker-compose.yml`, `main.py` y `tools/`.
- [x] 3.2 Crear `docs/configuracion.md` con el primer arranque, creación del administrador, fuentes Xtream/M3U, EPG, preferencias, caché y ubicación de datos; verificar que los nombres de las opciones coinciden con la interfaz y `cache.py`.

## 4. Usuarios Y Marco Legal

- [x] 4.1 Crear `docs/usuarios.md` para explicar administrador, usuarios normales, cambio de contraseña, roles, límites por fuente y grupos restringidos según `auth.py`; verificar que no se documentan permisos o acciones que el sistema no ofrece.
- [x] 4.2 Crear `docs/licencia.md` con la atribución completa a `netv`, el carácter derivado de TolochaTV, Apache License 2.0 y la responsabilidad del usuario sobre sus contenidos; verificar que el texto no sustituye ni contradice `LICENSE`.

## 5. Reproducción Y Operación

- [x] 5.1 Crear `docs/reproduccion-y-hardware.md` con reproducción, transcodificación, FFmpeg, aceleración Intel/AMD/NVIDIA, Chromecast y AI Upscale; verificar que las opciones de hardware y sus requisitos distinguen el camino básico del opcional.
- [x] 5.2 Crear `docs/solucion-de-problemas.md` con logs, arranque, permisos, `/dev/dri`, HTTPS, CUDA y problemas habituales; verificar que cada diagnóstico remite a comandos o ficheros presentes en el repositorio.
- [x] 5.3 Crear `docs/preguntas-frecuentes.md` con atajos de teclado, fuentes IPTV legales, EPG, HDHomeRun y dudas frecuentes; verificar que los enlaces externos y los scripts `tools/` mencionados siguen existiendo.

## 6. Desarrollo Y Revisión Documental

- [x] 6.1 Crear `docs/desarrollo.md` con instalación del entorno mediante `uv`, ejecución local, pruebas, lint, typecheck y comprobaciones manuales; verificar que incluye los comandos de desarrollo definidos en `AGENTS.md` y `pyproject.toml`.
- [x] 6.2 Revisar todos los documentos para eliminar duplicados, asegurar terminología coherente de español de España y conservar literalmente comandos, variables, nombres de fichero, URLs y opciones CLI; verificar mediante búsquedas que no quedan referencias de marca o rutas obsoletas.
- [x] 6.3 Comprobar todos los enlaces Markdown relativos de `README.md` y `docs/` y corregir destinos inexistentes; verificar que cada enlace local apunta a un fichero presente en la rama.

## 7. Validación Final

- [x] 7.1 Confirmar que `git diff --name-only` solo contiene `README.md` y documentación Markdown de `docs/`, además de los artefactos del cambio OpenSpec; verificar que no se modifican `main.py`, `auth.py`, `cache.py`, `epg.py`, dependencias ni `LICENSE`.
- [x] 7.2 Ejecutar `uv run ruff check .`, `uv run basedpyright` y `uv run pytest`; verificar que las tres órdenes terminan correctamente y que la documentación no introduce regresiones.
- [x] 7.3 Revisar el resultado final como usuario nuevo: seguir la instalación rápida, localizar la configuración de usuarios y encontrar la atribución a `netv`; verificar que README y todas las guías se pueden navegar desde sus enlaces.
