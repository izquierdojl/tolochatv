## Why

La interfaz actual funciona, pero su apariencia se apoya casi por completo en grises y azules genéricos, por lo que no transmite una identidad propia de TolochaTV. Se propone una renovación visual coherente inspirada en la cordillera de Tolocha, sus pinares y los tonos del Bajo Aragón, sin alterar el flujo de reproducción ni sobrecargar la navegación.

## What Changes

- Introducir una identidad visual común basada en verdes de pino, verdes musgo, tonos tierra y acentos cálidos, sustituyendo los usos visuales genéricos donde sea necesario.
- Añadir fondos y detalles decorativos sutiles inspirados en laderas, pinos y relieve montañoso mediante CSS y/o SVG local, sin depender de imágenes remotas.
- Renovar la carcasa compartida de las páginas autenticadas: rail de navegación, panel de canales, áreas de contenido, tarjetas, controles, estados vacíos, avisos y toasts.
- Aplicar el mismo lenguaje visual a guía, películas, series, búsqueda, ajustes y reproductor, respetando las jerarquías y funciones existentes.
- Mejorar la presentación de las pantallas de login, configuración inicial y error para que formen parte de la misma identidad sin exigir autenticación.
- Mantener contraste suficiente, foco visible, navegación por teclado, estados hover/seleccionado y una composición usable en escritorio y pantallas estrechas.
- Incorporar una estrategia de movimiento muy contenida, con alternativa respetuosa con `prefers-reduced-motion`.
- No cambiar rutas, contratos de API, reglas de acceso, datos de usuario, reproducción ni comportamiento funcional de las páginas.

## Capabilities

### New Capabilities

- `visual-design`: identidad visual y tratamiento decorativo responsive de la interfaz TolochaTV, incluyendo la carcasa compartida y las pantallas de acceso.

### Modified Capabilities

<!-- No se modifican requisitos funcionales de capacidades existentes. -->

## Impact

- `templates/base.html` y las plantillas de página (`guide.html`, `vod.html`, `series.html`, `search.html`, `settings.html`, `player.html`, `login.html`, `setup.html` y `error.html`) recibirán los cambios de presentación.
- `static/` podrá incorporar una hoja de estilos visual compartida y recursos SVG locales; se conservará el uso actual de Tailwind donde resulte compatible.
- `main.py` no requiere cambios de lógica, salvo que la implementación necesite exponer una versión de recurso estático ya contemplada por el sistema; `cache.py`, `epg.py` y `auth.py` no deben cambiar.
- No se prevén dependencias externas nuevas ni cambios de almacenamiento.
- Las pruebas de rutas y renderizado de `main_test.py` deben conservarse; si se añaden comprobaciones de HTML accesible o clases/recursos visuales, se incorporarán en ese archivo sin depender de red ni de un navegador real.
