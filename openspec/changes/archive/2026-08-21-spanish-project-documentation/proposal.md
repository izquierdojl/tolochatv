## Why

El `README.md` actual reúne demasiada información técnica y operativa en un único documento, está escrito principalmente en inglés y dificulta que una persona nueva instale, configure y administre TolochaTV. Se necesita una entrada más breve, en español de España y con enlaces a guías temáticas fáciles de mantener.

## What Changes

- Reescribir `README.md` en español de España, con lenguaje sencillo y directo, como punto de entrada del proyecto.
- Mantener una explicación clara de qué hace TolochaTV, qué necesita el usuario y qué responsabilidades legales tiene sobre sus fuentes y contenidos.
- Separar la documentación en varios ficheros Markdown para cubrir, como mínimo, instalación, configuración inicial, manejo de usuarios, fuentes IPTV, reproducción/transcodificación, GPU y resolución de problemas.
- Conservar las instrucciones operativas existentes que sigan siendo válidas para Docker, Debian/Ubuntu, desarrollo local, HTTPS, Chromecast, FFmpeg, CUDA y AI Upscale.
- Incluir enlaces internos coherentes entre el README y las guías, evitando duplicar instrucciones extensas.
- Mantener la atribución a `netv`, proyecto original del que procede el fork, y la referencia a la licencia Apache 2.0.
- Revisar enlaces, comandos, nombres de variables de entorno, rutas y referencias a imágenes para que la documentación no prometa funciones inexistentes.
- No modificar el comportamiento de la aplicación, sus APIs, dependencias ni los datos persistentes.

## Capabilities

### New Capabilities

<!-- No se introduce comportamiento del producto; el cambio es exclusivamente documental. -->

### Modified Capabilities

<!-- No cambian requisitos funcionales de TolochaTV. -->

## Impact

- `README.md` — nueva portada y guía rápida del proyecto.
- `docs/*.md` — nuevas guías temáticas enlazadas desde el README.
- `LICENSE` y la atribución del proyecto — se conservarán sin alterar su significado, incluyendo la mención a `netv` y Apache License 2.0.
- Módulos de aplicación (`main.py`, `cache.py`, `epg.py`, `auth.py`, etc.) — no afectados.
- Tests `*_test.py` — no se esperan cambios; se verificará que no se modifica código y que los enlaces y comandos documentados son coherentes con el repositorio.
