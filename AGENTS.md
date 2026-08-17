# AGENTS.md

neTV: self-hosted IPTV player. Single FastAPI app (`main.py`) + flat Python modules. NOT a package — modules are imported by filename (`import main`, `import cache`, etc.), so name collisions matter and top-level files are the app.

## Commands (dev, uses uv)

- Install deps: `uv sync --group dev`
- Lint: `uv run ruff check .`
- Typecheck: `uv run basedpyright`
- Tests: `uv run pytest`
- Run app: `uv run ./main.py --port 8000` (flags: `--https`, `--cert FILE --key FILE`, `--debug`)
- CI runs exactly: `ruff check` → `basedpyright` → `pytest` (Python 3.11). Always run all three after changes.

## Testing

- pytest discovers `*_test.py` at repo root (`testpaths = ["."]`, `pythonpath = ["."]`).
- Run one file directly: `python main_test.py` (each test file ends with a `testing.run_tests(__file__)` block).
- Run a single test: `uv run pytest main_test.py -k test_name`.
- Tests are fully mocked/offline (no network, no ffmpeg). Importing `main` in a test requires the `mock_deps` fixture (mocks `defusedxml` in `sys.modules`, patches cache paths) — reuse it for new route tests; don't import `main` at module top level.
- Background preload threads from FastAPI `lifespan` are patched out via the `client`/`auth_client` fixtures; populate `cache_module.get_cache()` directly for page tests.
- pytest-asyncio is used for async route tests.

## Architecture

- `main.py` — all routes, ~5000 lines: pages (/guide, /vod, /series, /settings), APIs, auth, transcode/subtitle/SSE endpoints.
- `cache.py` — file cache + server settings + sources. `CACHE_DIR` prefers legacy `./cache` if it exists, else `./.cache`; holds `server_settings.json`, `users/`, `logos/`, and JSON data caches (`live_data`, `vod_data`, `series_data`).
- `epg.py` — XMLTV EPG into a SQLite DB under `CACHE_DIR` (`epg.init(CACHE_DIR)`); prune keeps a 24h buffer.
- `m3u.py` / `xtream.py` — source data fetching (Xtream Codes + M3U).
- `auth.py` — users, JWT tokens, admin, per-user stream/group limits.
- `ffmpeg_command.py` / `ffmpeg_session.py` — transcode pipeline (probe cache, session recovery). Requires `ffmpeg`/`ffprobe` on PATH (unit tests mock these).
- `templates/` (Jinja2) + `static/` (JS/CSS) — the UI; templates rely on filters registered in `main.py` (e.g. `logo_url`).
- `tools/` — ops scripts (`install-*.sh`, `zap2xml.py`, `alignm3u.py`, ...). Excluded from basedpyright; not part of the app.
- AI Upscale: TensorRT engines in `SR_ENGINE_DIR` (env var, default `~/ffmpeg_build/models`), named `{model}_{height}p_fp16.engine`; availability gated by `is_sr_available()`.

## Lint / style quirks

- `ruff` runs with `fix = true` in config but CI only runs `check`; use `--fix` locally to auto-apply.
- `[tool.ruff.lint.isort]` `known-first-party` lists `core, ae, gm, data, tools` — stale leftovers from another project; the app modules are first-party by default, so don't add app modules to that list.
- Line length 100 (`E501` ignored). Type hints use PEP 604 (`X | None`) and `from __future__ import annotations` at top of every module.
- `basedpyright` uses `standard` mode, `pythonVersion = "3.11"` (do not use Python-3.12+ syntax).

## Runtime / deploy

- Docker: `docker compose build` needs the prebuilt FFmpeg base image `ghcr.io/jvdillon/netv-ffmpeg:latest` (arg `FFMPEG_IMAGE`); `FFMPEG_IMAGE=ubuntu:24.04 docker compose build` uses stock apt ffmpeg. NVIDIA GPU requires `docker compose --profile nvidia up -d`.
- Container runs as non-root user `netv` via `entrypoint.sh` (fixes `./cache` ownership + `/dev/dri` group).
- Config through env vars: `NETV_PORT`, `NETV_HTTPS`, `LOG_LEVEL` (DEBUG for verbose logs).
- Release flow: push `v*` tags (`.github/workflows/release.yml` builds + pushes ghcr image).