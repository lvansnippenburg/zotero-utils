// AI provider settings
// "providers" holds a JSON list of provider profiles ({id, name, endpoint, model, apiKey}).
// When empty, the built-in defaults (Gemini, Mistral, Local LLM) are used; see ZoteroUtils.DEFAULT_PROVIDERS.
pref("extensions.zotero-utils.providers", "");
// id of the selected provider profile
pref("extensions.zotero-utils.provider", "gemini");
pref("extensions.zotero-utils.language", "nl");

// Summary Settings
pref("extensions.zotero-utils.extractionMode", "text");

// Export Settings (from AU plugin)
pref("extensions.zotero-utils.exportPath", "");

// Auto-tagging Settings (from colors-and-autotag plugin)
pref("extensions.zotero-utils.autoTagEnabled", true);
pref("extensions.zotero-utils.unreadTag", "/unread");

// Annotation color labels (empty = keep Zotero's own color name)
pref("extensions.zotero-utils.colorLabel.ffd400", "Interessant punt"); // Yellow
pref("extensions.zotero-utils.colorLabel.ff6666", "Hoofdvraag / belangrijk punt"); // Red
pref("extensions.zotero-utils.colorLabel.5fb236", "Referentie naar ander werk"); // Green
pref("extensions.zotero-utils.colorLabel.2ea8e5", "Plaats"); // Blue
pref("extensions.zotero-utils.colorLabel.a28ae5", "Persoon"); // Purple
pref("extensions.zotero-utils.colorLabel.e56eee", "Hoe zit dit?"); // Magenta
pref("extensions.zotero-utils.colorLabel.f19837", "Hoofdstuk"); // Orange
pref("extensions.zotero-utils.colorLabel.aaaaaa", "Onzin"); // Gray
