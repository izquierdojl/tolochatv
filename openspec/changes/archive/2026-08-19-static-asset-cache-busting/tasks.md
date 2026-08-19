## 1. Version constant and Jinja global

- [x] 1.1 Add `ASSET_VERSION` constant in `main.py` (e.g. `"2026-08-19-1"`) near the other template globals
- [x] 1.2 Register `TEMPLATES.env.globals["asset_version"] = ASSET_VERSION`

## 2. Apply version query to static JS in templates

- [x] 2.1 `templates/base.html`: `app.js` script tag gets `?v={{ asset_version }}`
- [x] 2.2 `templates/guide.html`: `virtual-guide.js` script tag gets `?v={{ asset_version }}`
- [x] 2.3 `templates/player.html`: `player.js` script tag gets `?v={{ asset_version }}`
- [x] 2.4 `templates/settings.html`: `settings.js` script tag gets `?v={{ asset_version }}`
- [x] 2.5 `templates/series.html`: `favorites-grid.js` script tag gets `?v={{ asset_version }}`
- [x] 2.6 `templates/vod.html`: `favorites-grid.js` script tag gets `?v={{ asset_version }}`

## 3. Tests and verification

- [x] 3.1 Add/extend a route render test in `main_test.py` asserting a page extending `base.html` emits `/static/js/app.js?v=<ASSET_VERSION>`
- [x] 3.2 Run `uv run ruff check .`
- [x] 3.3 Run `uv run basedpyright`
- [x] 3.4 Run `uv run pytest`
