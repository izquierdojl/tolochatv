## Context

TolochaTV serves its front-end from `static/` via `app.mount("/static", StaticFiles(...))` in `main.py`, with templates in `templates/` rendered through `Jinja2Templates`. Static JS is referenced by raw `<script src="/static/js/*.js">` tags with no version query, so browsers cache them indefinitely and keep serving stale versions after a deploy. See proposal.md - Why.

`main.py` already registers Jinja globals on `TEMPLATES.env.globals` (e.g. `_` for i18n), so adding a version global follows an existing pattern. Templates extend `base.html` and inherit its `asset_version` global.

## Goals / Non-Goals

**Goals:**
- Single source of truth for the front-end asset version, exposed to all templates.
- Every static JS `<script>` tag gets a `?v=` query so a version bump forces a refetch.
- Keep the implementation minimal and consistent with the existing Jinja-global pattern.

**Non-Goals:**
- Hashing file contents or auto-computing versions per file (out of scope; a manually bumped constant is sufficient).
- Applying cache-busting to CSS or images (not required to fix the reported issue).
- Setting HTTP `Cache-Control` headers on the static mount.

## Decisions

- **Expose a single `ASSET_VERSION` string as a Jinja global `asset_version`.**
  Define `ASSET_VERSION` in `main.py` next to the other globals and register it via `TEMPLATES.env.globals["asset_version"] = ASSET_VERSION`. Rationale: one constant, visible in templates, trivially bumpable. Alternative considered: content-hashing each file (more robust but more machinery); manual constant is enough for this project's release cadence.
- **Append `?v={{ asset_version }}` to every static JS script tag in templates.**
  Touches `base.html`, `guide.html`, `player.html`, `settings.html`, `series.html`, `vod.html`. The query is ignored by the static server (FastAPI serves the same file) but changes the cache key in browsers. Alternative considered: adding cache headers — works but affects all static content and requires re-deploy logic; the query approach is scoped and explicit.
- **Use a date-based version constant** (e.g. `2026-08-19-1`) so it is human-meaningful and clearly increments per release.

## Risks / Trade-offs

- [Version constant forgotten on future front-end changes] → Mitigation: keep the constant adjacent to the templates/static globals and reference it in `tasks.md`; the pattern is a single, discoverable line to bump.
- [Query param not applied to a newly added JS file] → Mitigation: the spec requires every static JS tag to carry the version; new templates should follow the established pattern.
