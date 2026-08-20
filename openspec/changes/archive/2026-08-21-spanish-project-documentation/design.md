## Context

El proyecto usa `README.md` como documentación principal y actualmente concentra en él la instalación, el uso, la administración, el desarrollo, la configuración de GPU y las preguntas frecuentes. La aplicación no necesita cambios: las instrucciones deben describir el comportamiento real de `main.py`, `auth.py`, `cache.py`, `epg.py`, `docker-compose.yml` y los scripts disponibles en `tools/`.

La propuesta y su motivación están en `proposal.md`. Al ser un cambio documental, `.openspec.yaml` marca las especificaciones funcionales como omitidas.

## Goals / Non-Goals

**Goals:**

- Convertir `README.md` en una portada breve con descripción, requisitos mínimos, instalación rápida y mapa de documentación.
- Organizar la información extensa en guías temáticas bajo `docs/`, con nombres y enlaces consistentes en español.
- Mantener comandos ejecutables y nombres técnicos exactos: `docker compose`, `uv`, `TOLOCHATV_PORT`, `TOLOCHATV_HTTPS`, `LOG_LEVEL`, `--https`, `--cert`, `--key` y `--debug`.
- Documentar el flujo de primer arranque y el manejo de usuarios según las capacidades de `auth.py`, incluyendo administrador, usuarios normales, contraseñas, límites de streams y grupos restringidos.
- Mantener una sección legal clara que atribuya el origen del fork a [`netv`](https://github.com/jvdillon/netv), de Joshua V. Dillon, bajo Apache License 2.0.
- Revisar los enlaces relativos y las referencias a ficheros del repositorio después de mover el contenido.

**Non-Goals:**

- Cambiar rutas HTTP, APIs, plantillas, traducciones de la interfaz o comportamiento de autenticación.
- Añadir nuevas dependencias, scripts de validación o un generador de documentación.
- Traducir el código, los nombres de opciones CLI, variables de entorno, mensajes técnicos de error o la licencia legal.
- Prometer soporte para plataformas, formatos, proveedores o funciones que no estén respaldados por el repositorio.

## Decisions

### Mantener un README corto y usar guías temáticas

`README.md` será la entrada para nuevos usuarios: propósito, características principales, requisitos, instalación recomendada, primer acceso, enlaces a documentación y atribución. El contenido operativo detallado se moverá a ficheros independientes:

- `docs/instalacion.md`: Docker, Debian/Ubuntu, desarrollo local, puertos, HTTPS y actualización.
- `docs/configuracion.md`: primer arranque, fuentes Xtream/M3U, EPG, preferencias y ubicación de datos.
- `docs/usuarios.md`: creación del administrador, usuarios, roles, contraseñas, límites y grupos no disponibles.
- `docs/reproduccion-y-hardware.md`: reproducción, transcodificación, FFmpeg, Intel/AMD/NVIDIA, Chromecast y AI Upscale.
- `docs/desarrollo.md`: entorno con `uv`, ejecución local, pruebas, lint, typecheck y comprobaciones manuales.
- `docs/solucion-de-problemas.md`: logs, problemas de `/dev/dri`, HTTPS, CUDA, permisos y arranque.
- `docs/preguntas-frecuentes.md`: atajos de teclado, fuentes legales, EPG, HDHomeRun y dudas habituales.
- `docs/licencia.md`: atribución a `netv`, relación de fork, licencia Apache 2.0 y responsabilidad sobre contenidos.

Se elige esta división frente a un único README largo porque permite localizar una tarea concreta y revisar cada área sin repetir todo el documento. Se evitará crear subdirectorios adicionales mientras el número de guías siga siendo pequeño.

### Usar el repositorio como fuente de verdad

Cada instrucción se contrastará con los ficheros existentes, especialmente `docker-compose.yml`, `Dockerfile*`, `pyproject.toml`, `main.py`, `auth.py`, `cache.py`, `epg.py` y `tools/`. Los comandos se conservarán tal como deben ejecutarse; solo se traducirán sus explicaciones. Cuando una opción dependa de hardware, una imagen o un certificado, se indicará como opcional y se explicará su requisito.

Se descarta copiar literalmente todo el README actual porque contiene referencias que pueden quedar desactualizadas o ser demasiado específicas. También se descarta inventar una tabla de compatibilidad nueva: solo se conservarán datos que puedan justificarse en el repositorio o en los enlaces oficiales ya citados.

### Enlaces y responsabilidades legales

La portada enlazará cada guía con rutas relativas (`docs/...`). La atribución aparecerá de forma visible en `README.md` y se ampliará en `docs/licencia.md`; no se modificará `LICENSE`. El texto diferenciará el código de TolochaTV del proyecto original `netv` y recordará que el usuario debe disponer de derechos para acceder a sus contenidos IPTV.

### Verificación sin cambios de aplicación

No se añadirán tests de comportamiento porque no cambia la aplicación. La revisión incluirá comprobación manual de enlaces, búsqueda de rutas y comandos obsoletos, revisión de idioma y ejecución de la batería habitual del repositorio para demostrar que los cambios están limitados a documentación.

## Risks / Trade-offs

- [Las instrucciones pueden quedar obsoletas si cambia el código] -> Contrastar cada sección con la implementación actual y señalar claramente las opciones opcionales o dependientes del entorno.
- [Dividir la información puede ocultar el contexto para quien solo lee README] -> Mantener una portada autosuficiente para instalación rápida y un índice visible de guías.
- [La traducción puede alterar el significado legal o técnico] -> Mantener sin traducir nombres propios, comandos, variables, enlaces, nombres de archivos y el texto legal de la licencia.
- [Los comandos de GPU dependen de sistema, controlador e imagen] -> Separar el camino básico sin GPU de las rutas opcionales y enlazar documentación oficial cuando corresponda.
- [Los enlaces relativos pueden romperse al reorganizar el contenido] -> Revisar todos los enlaces con una búsqueda específica y probar que cada destino existe.

## Migration Plan

No hay migración de datos ni despliegue especial. En la rama `feature/spanish-project-documentation` se crearán las guías, se actualizará `README.md`, se revisarán los enlaces y se validará el árbol de trabajo. Si la revisión detecta un problema, el rollback consiste en revertir los cambios documentales de la rama; no se modifican `cache/`, usuarios ni configuración de ejecución.

## Open Questions

No quedan preguntas abiertas que cambien el alcance o la organización propuesta.
