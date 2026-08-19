## Purpose

Ensures clients always load the latest version of front-end static assets (JavaScript) after a deploy, so UI features shipped in those files are never hidden by stale browser caches.

## ADDED Requirements

### Requirement: Versioned static asset URLs

The system SHALL serve every static JavaScript asset referenced by its HTML templates with a version query parameter derived from a single version constant, so that when the version is incremented, clients request the new asset instead of reusing a cached copy.

#### Scenario: Asset URL includes version
- **WHEN** a template that extends `base.html` (e.g. `/guide`) is rendered for an authenticated user
- **THEN** each `<script src="/static/js/*.js">` tag in the page includes a `?v=<version>` query parameter matching the current `ASSET_VERSION`

#### Scenario: Version changes force refetch
- **WHEN** `ASSET_VERSION` is incremented and a client that previously cached the asset requests a page
- **THEN** the client requests the asset with the new version query, obtaining the updated file rather than the stale cached copy

#### Scenario: No-version fallback not emitted
- **WHEN** a page referencing static JavaScript is rendered
- **THEN** no `<script src="/static/js/*.js">` tag is emitted without a version query parameter

#### Scenario: Existing behavior unaffected for missing assets
- **WHEN** the version query is present but the underlying asset file is unchanged
- **THEN** the asset is served normally with its existing content
