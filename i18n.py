"""Lightweight i18n: JSON catalogs keyed by English source string.

Catalog files live in ``translations/{lang}.json`` with English strings as
keys and the translated text as values. English is the identity: a missing
key falls back to the original string. The request-scoped language lives in
a contextvar (``_current_lang``); ``t()`` translates with it.
"""

from __future__ import annotations

from contextvars import ContextVar
from pathlib import Path

import json


APP_DIR = Path(__file__).resolve().parent
TRANSLATIONS_DIR = APP_DIR / "translations"

SUPPORTED_LANGS = ("es-ES", "en")
DEFAULT_LANG = "es-ES"

_current_lang: ContextVar[str] = ContextVar("i18n_current_lang", default="")

_catalogs: dict[str, dict[str, str]] = {}


def normalize_lang(lang: str) -> str:
    """Normalize a language tag to a supported code."""
    if not lang:
        return DEFAULT_LANG
    tag = lang.strip().lower()
    if tag == "en" or tag.startswith("en-"):
        return "en"
    if tag == "es" or tag.startswith("es-"):
        return "es-ES"
    return DEFAULT_LANG


def load_catalog(lang: str) -> dict[str, str]:
    """Load the translation catalog for a language (cached). Returns {} when missing."""
    if not lang:
        return {}
    if lang not in _catalogs:
        catalog: dict[str, str] = {}
        # Language codes use hyphens (es-ES); catalog files use underscores (es_ES.json)
        path = TRANSLATIONS_DIR / f"{lang.replace('-', '_')}.json"
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            catalog = {str(k): str(v) for k, v in data.items()}
        except (OSError, json.JSONDecodeError):
            catalog = {}
        _catalogs[lang] = catalog
    return _catalogs[lang]


def clear_catalog_cache() -> None:
    """Drop cached catalogs (used by tests)."""
    _catalogs.clear()


def translate(text: str, lang: str) -> str:
    """Translate a string; fall back to the original when no translation exists."""
    if not text or not lang:
        return text
    return load_catalog(lang).get(text, text)


def resolve_language(user_lang: str, accept_language: str, server_default: str) -> str:
    """Resolve the active language: user pref > browser > server default."""
    if user_lang:
        return normalize_lang(user_lang)
    if accept_language:
        first = accept_language.split(",")[0].strip().lower()
        if first.startswith("es"):
            return "es-ES"
        if first.startswith("en"):
            return "en"
    return normalize_lang(server_default)


def set_current_lang(lang: str) -> None:
    """Set the request-scoped language for this context."""
    _current_lang.set(normalize_lang(lang))


def current_lang() -> str:
    """Get the request-scoped language. Empty until set (English fallback)."""
    return _current_lang.get()


def t(text: str) -> str:
    """Translate with the request-scoped language. Falls back to the original."""
    return translate(text, current_lang())
