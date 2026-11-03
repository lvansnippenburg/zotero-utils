// AI provider: "gemini" or "local" (OpenAI-compatible local server)
pref("extensions.zotero-utils.provider", "gemini");

// Local LLM Settings
pref("extensions.zotero-utils.localEndpoint", "http://127.0.0.1:8000/v1");
pref("extensions.zotero-utils.localModel", "");
pref("extensions.zotero-utils.localApiKey", "");

// Gemini API Settings
pref("extensions.zotero-utils.apiKey", "");
pref("extensions.zotero-utils.apiEndpoint", "https://generativelanguage.googleapis.com/v1beta/openai");
pref("extensions.zotero-utils.language", "nl");
pref("extensions.zotero-utils.model", "gemini-flash-lite-latest");

// Summary Settings
pref("extensions.zotero-utils.extractionMode", "text");

// Export Settings (from AU plugin)
pref("extensions.zotero-utils.exportPath", "");

// Auto-tagging Settings (from colors-and-autotag plugin)
pref("extensions.zotero-utils.autoTagEnabled", true);
pref("extensions.zotero-utils.unreadTag", "/unread");
