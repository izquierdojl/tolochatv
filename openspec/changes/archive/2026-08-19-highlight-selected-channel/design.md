## Context

See proposal.md — Why. The channels panel is a single JS module (`static/js/app.js`, IIFE "Channels Tree") present on every authenticated page via `templates/base.html`. It already:
- Fetches `/api/channels/tree` once (`GET /api/channels/tree`, main.py:1037) and caches it in memory; each channel object carries `stream_id`, `name`, `icon`.
- Renders groups lazily: a group's channels are only mounted when expanded; expand/collapse lives in a `Map` keyed by `category_id` (`expanded`).
- Persists panel open state and expanded groups in `localStorage` under `tolochatv.channels.*` keys (`panelOpen`, `expanded`), rehydrating on every page load.
- Creates each channel as `<a href="/play/live/{stream_id}">`; activation navigates (full page load), which is why any in-memory selection is lost.

There is currently no notion of a "selected" channel, and no visual state beyond the transient focus ring.

## Goals / Non-Goals

**Goals:**
- A single persisted "selected channel" for the panel, visually highlighted and distinguishable from the focus ring.
- Selection stays in sync with the currently playing channel (`/play/live/{stream_id}` in the URL), on every page.
- On open, the selected channel is revealed (group expanded + scrolled into view).
- Frontend-only; no backend or API change.

**Non-Goals:**
- Not changing the guide (`/guide`, `virtual-guide.js` EPG grid) selection behavior.
- Not an inline/mini player on the panel.
- Not restoring keyboard focus to the selected channel after navigation (only the visual highlight + reveal-on-open).
- Not remembering the panel's raw scroll offset.

## Decisions

**D1 — Persist selection in `localStorage` (`tolochatv.channels.selected`).**
A single string `stream_id`. Reuses the existing `tolochatv.channels.*` namespace and the existing try/catch + rehydrate pattern in `loadState()`. Alternative (server-side per-user settings via `/api/user-prefs`) rejected: it is overkill for a UI-only preference and would require a new API round-trip; the existing panel state already lives client-side.

**D2 — Derive selection from the URL on every page load.**
On module init, parse `location.pathname`; if it matches `/play/live/{stream_id}` (route is `/play/{stream_type}/{stream_id:path}` so the id may contain slashes — take the full remainder after `live/`), set `selectedStreamId = decodeURIComponent(remainder)` and persist it. This keeps the panel in sync with playback regardless of entry point (direct URL, guide, search, favorites). Clicking a channel in the tree also writes the selection before navigation (belt and braces; navigation is a full page load). Selection value is compared as a string, since `stream_id` may be numeric-like (`ch.stream_id` may be `int` in JSON).

**D3 — Explicit CSS class instead of dynamic Tailwind classes.**
`templates/base.html` loads the Tailwind Play CDN, whose JIT observes the DOM at runtime; relying on it for dynamically-injected highlight classes is fragile. Instead, add a small `.channel-selected` rule to the existing `<style>` block in `base.html` (alongside the existing `a:focus` rules) and toggle that class in `renderTree`. The row `<a>` gets `data-stream-id` for reliable lookup after render.

**D4 — Reveal-on-open via expand-first-matching-group only (no scroll).**
In `showPanel`, if `selectedStreamId` is set, expand the first group that contains it (`expanded.set(...)` + `saveExpanded()`, consistent with existing persistence semantics) so the channel is highlighted when rendered. The panel's vertical scroll position is never moved on open (decision from user feedback: scrolling on open was seen as an unwanted "desposicionamiento"). We deliberately avoid `scrollIntoView` and any `scrollTop` manipulation. If the selected channel is not in the visible tree (e.g. `guide_filter` changed), do nothing — no error.

**D5 — Do not rebuild the tree on re-open; persist and restore the panel's scroll.**
User feedback: "la lista/árbol se recarga al hacer click sobre un canal y no debería ser así". The tree must not visibly rebuild when a channel is clicked (which navigates to the player) and the user returns. Because navigation is a full page load, the tree only survives across `Back` navigation via the browser's bfcache (DOM stays intact). To make this reliable:
- Track `treeRendered`; in `showPanel`, only call `renderTree()` when the tree is not yet mounted OR the selected channel's group had to be auto-expanded (`revealSelectedGroup()` returns true). Otherwise only `applySelectionHighlight()` toggles the `.channel-selected` class on the already-mounted tree — no rebuild, no scroll loss.
- Persist the panel's `scrollTop` in `localStorage` (`tolochatv.channels.scroll`) via a passive `scroll` listener, and restore it after the first render (`restorePanelScroll()`). This preserves scroll across reopen and full reloads.
- On bfcache restore (`pageshow` with `e.persisted`), re-apply `applySelectionHighlight()` and `restorePanelScroll()` so a stale highlight from the moment of navigation is corrected.

## Risks / Trade-offs

- [Channel may belong to several groups] → Expand only the first group that contains it (deterministic order = tree order). The channel is still highlighted wherever it appears.
- [Auto-expanding a group the user deliberately collapsed] → Accepted: it is required by the "Localización" requirement and the expanded state persists (consistent with existing behavior), so the user only sees it once.
- [`localStorage` unavailable] → Wrap all reads/writes in try/catch, mirroring existing code; selection simply won't persist.
- [Selected channel filtered out of the panel] → Graceful no-op; no highlight, no error.
- [Tailwind Play CDN JIT] → Mitigated by D3 (explicit CSS class in base.html).

## Migration Plan

No migration needed (frontend-only, additive). Rollback: revert the changes to `static/js/app.js` and `templates/base.html`; a stale `tolochatv.channels.selected` key in a client's `localStorage` is harmless and simply ignored.

## Open Questions

None — decisions are resolved above and do not change the spec or task breakdown.
