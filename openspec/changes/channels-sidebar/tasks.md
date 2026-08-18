## 1. Preparación

- [x] 1.1 Crear rama de trabajo `feature/channels-sidebar` desde `main` (flujo de PR del proyecto, como en i18n-spanish)
- [x] 1.2 Añadir las claves i18n nuevas al catálogo `translations/es_ES.json` ("Channels", "No channels available", "Expand all", "Collapse all")

## 2. Backend: endpoint del árbol

- [x] 2.1 Crear la helper `_build_channels_tree(username)` junto a `_get_guide_streams` (main.py:799): excluir grupos bloqueados (`auth.get_user_limits(...)["unavailable_groups"]`), canal bajo cada grupo visible al que pertenece (sin deduplicar), incluir el grupo sintético "Uncategorized", omitir grupos sin canales, envolver iconos con `_logo_url_filter` (main.py:163), **fallback**: `guide_filter` vacío → todas las `live_categories` (salvo grupos bloqueados), y **ordenación alfabética** de los grupos por `category_name` (sin distinguir mayúsculas, desempate por `category_id`)
- [x] 2.2 Crear el endpoint `GET /api/channels/tree` con `require_auth`: relleno de caché desde `live_data.json` si falta (patrón de guide_page, main.py:679-686) y respuesta `{"groups": [{category_id, category_name, channels: [{stream_id, name, icon}]}]}`; devuelve `{"groups": []}` solo sin datos
- [x] 2.3 Tests del endpoint en `main_test.py` (fixture `auth_client`/`mock_deps`, poblar `cache_module.get_cache()`): auth requerida → error 401; grupo bloqueado excluido; canal multicategoría en ambos grupos; "Uncategorized" incluido; guide_filter vacío → todos los grupos (salvo bloqueados); **grupos en orden alfabético** (con guide_filter poblado y vacío); sin datos de caché → `{"groups": []}`

## 3. Frontend: icono y panel

- [x] 3.1 Añadir en `templates/base.html` (rail, main.py:32-84 patrón `nav-link`) el icono `view_list` (Material clásico) con `title="{{ _('Channels') }}"` y estado `active` cuando el panel está visible
- [x] 3.2 Convertir el panel en **columna lateral fija** del layout de `base.html` (`<div class="flex h-full">` → `nav` rail + `#channels-panel` + `main flex-1`): `w-[300px] flex-shrink-0 overflow-y-auto`, colapsable a ancho 0, **sin** `position: fixed` ni portal a body; cabecera "Canales" + contador + **botón toggle desplegar/plegar todo** (`#channels-toggle-all`); el vídeo del reproductor (player.html extiende base) queda junto al panel sin superponerse
- [x] 3.3 Implementar en `static/js/app.js` el módulo del panel: toggle mostrar/ocultar, fetch único de `/api/channels/tree` cacheado en memoria, renderizado del árbol (cabecera de grupo `▶/▼` + nombre + contador, fila de canal con logo y `onerror`), colapso/expansión con estado en un `Map` por `category_id`, DOM perezoso (los canales de un grupo solo se montan al expandirlo), enlaces `<a href="/play/live/{stream_id}">`, **toggle desplegar/plegar todo** (si algún grupo plegado → expande todos; si todos desplegados → pliega todos), y **persistencia** del estado abierto/cerrado y de los grupos expandidos en `localStorage` (rehidratado al cargar cada página)
- [x] 3.4 Integrar teclado en app.js: con el foco dentro del panel, Escape lo oculta y devuelve el foco al icono con prioridad sobre el intercambio nav↔contenido (línea 216); las flechas se restringen al panel mientras el foco está en él, incluso en páginas custom (`hasCustomNav`, línea 6)
- [x] 3.5 Comprobar manualmente el flujo con `uv run ./main.py --port 8000`: abrir panel desde una página normal y desde `/play/`, expandir/replegar grupos individualmente y con el toggle de desplegar/plegar todo, lanzar un canal y verificar que el vídeo queda junto al panel sin superponerse, y que el estado (panel abierto + grupos expandidos) persiste al navegar/recargar

## 4. Verificación

- [x] 4.1 Ejecutar `uv run ruff check .`
- [x] 4.2 Ejecutar `uv run basedpyright`
- [x] 4.3 Ejecutar `uv run pytest`
- [x] 4.4 Abrir PR de `feature/channels-sidebar` a `main` y revisar diff
