"""Tests for i18n.py - lightweight translation catalog."""

from __future__ import annotations

from i18n import normalize_lang, resolve_language, set_current_lang, t, translate

import i18n


def test_translate_known_key():
    assert translate("Settings", "es-ES") == "Ajustes"


def test_translate_missing_key_falls_back():
    assert translate("No such string", "es-ES") == "No such string"


def test_translate_english_identity():
    assert translate("Settings", "en") == "Settings"


def test_translate_empty_lang_identity():
    assert translate("Settings", "") == "Settings"


def test_translate_empty_text():
    assert translate("", "es-ES") == ""


def test_normalize_lang():
    assert normalize_lang("es") == "es-ES"
    assert normalize_lang("es-ES") == "es-ES"
    assert normalize_lang("es-MX") == "es-ES"
    assert normalize_lang("en") == "en"
    assert normalize_lang("en-US") == "en"
    assert normalize_lang("fr") == "es-ES"
    assert normalize_lang("") == "es-ES"


def test_resolve_user_preference_wins():
    assert resolve_language("en", "es-ES,es;q=0.9", "es-ES") == "en"
    assert resolve_language("es-ES", "en-US,en;q=0.9", "es-ES") == "es-ES"


def test_resolve_browser_detection():
    assert resolve_language("", "es-ES,es;q=0.9", "es-ES") == "es-ES"
    assert resolve_language("", "es;q=0.9", "en") == "es-ES"
    assert resolve_language("", "en-US,en;q=0.9", "es-ES") == "en"


def test_resolve_other_browser_language_uses_server_default():
    assert resolve_language("", "fr-FR,fr;q=0.9", "es-ES") == "es-ES"
    assert resolve_language("", "de-DE,de;q=0.9", "en") == "en"


def test_resolve_no_headers_uses_server_default():
    assert resolve_language("", "", "es-ES") == "es-ES"
    assert resolve_language("", "", "en") == "en"


def test_t_uses_contextvar():
    set_current_lang("es-ES")
    assert t("Search") == "Buscar"
    set_current_lang("en")
    assert t("Search") == "Search"


def test_t_unset_context_identity():
    from i18n import _current_lang

    token = _current_lang.set("")
    try:
        assert t("Search") == "Search"
    finally:
        _current_lang.reset(token)


def test_load_catalog_missing_lang_returns_empty():
    assert i18n.load_catalog("xx-XX") == {}
    assert i18n.load_catalog("") == {}
