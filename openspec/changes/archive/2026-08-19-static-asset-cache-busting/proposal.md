## Why

Clients were serving stale, cached versions of `static/js/*` files (e.g. `app.js`), so UI features added to those files (like the channels sidebar) did not appear on already-deployed browsers even after the server was updated. Static files are served without any cache-busting, so the browser never re-fetches changed JS.

## What Changes

- Add a single `ASSET_VERSION` constant in `main.py` and expose it to all Jinja templates as `asset_version`.
- Append a `?v={{ asset_version }}` query parameter to every static `<script src="/static/js/*.js">` tag across templates (`base.html`, `guide.html`, `player.html`, `settings.html`, `series.html`, `vod.html`).
- Increment `ASSET_VERSION` whenever front-end files (`static/` or `templates/`) change, so clients fetch the latest version.
- No change to runtime API behavior; purely an asset-loading/versioning improvement.

## Capabilities

### New Capabilities
- `static-assets`: Versioned loading of front-end static assets (JS) so clients never serve stale cached files after a deploy.

### Modified Capabilities
<!-- None: this does not change existing spec-level behavior; it introduces a new versioning capability. -->

## Impact

- `main.py`: adds `ASSET_VERSION` global and registers `asset_version` Jinja global.
- `templates/`: `base.html`, `guide.html`, `player.html`, `settings.html`, `series.html`, `vod.html` — append version query to JS script tags.
- `static/js/*`: content unchanged; the version query forces re-fetch after changes.
- Tests: `main_test.py` route/render tests still pass; add a small assertion that `app.js` is served with the version query.
