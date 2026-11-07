# Zotero Utils

A Zotero plugin that provides annotation export (to markdown), PDF summarization and annotation translation (using Gemini, Mistral, a local LLM server or any other OpenAI-compatible API), auto-tagging, and annotation color customization.

## building (on my mac)
Run:
```zplugin_build.sh```

## Features

### Annotation Utilities
- **Translate**: Translate annotation text using the selected AI provider
- **Export as Markdown**: Export annotations or notes as Markdown files with proper references
- **Smart Copy**: Copy annotation with reference and page info to clipboard: 
```Cuyt 2017, 66; (a year if in selected annotation); zotero://open-pdf/library/items/C5PD6J7W?page=66&annotation=AC8NY6RW```

### PDF Summarization
- **Summarize PDFs**: Generate comprehensive summaries of PDF documents using the selected AI provider.

### Auto-tagging
- **Automatic /unread tag**: New items automatically receive the `/unread` tag (configurable)
- **Enable/Disable**: Toggle auto-tagging on/off in preferences

### Annotation Color Customization
- **Custom color labels**: Annotation highlight colors get custom names (Dutch by default, editable in settings)
- **Color mapping**: Each highlight color is mapped to a descriptive label (e.g., Yellow = "Interessant punt")

## Installation

1. Download the plugin from the releases page
2. In Zotero, go to Tools > Add-ons
3. Click the gear icon and select "Install Add-on From File..."
4. Select the downloaded `.xpi` file

## Configuration

1. Get an API key from your provider, e.g. Gemini ([aistudio.google.com](https://aistudio.google.com/)) or Mistral ([console.mistral.ai](https://console.mistral.ai/)). A local server needs no key (or its password).
2. In Zotero, go to Edit > Settings
3. Find "Zotero Utils" in the left sidebar
4. Select a provider under "AI Provider" and check its endpoint, model name and API key
5. Configure your language and other settings

## Usage

### Annotation Translation
1. Select text in a PDF to create an annotation
2. Right-click on the annotation
3. Select "Translate" from the context menu
4. The translation will be saved as the annotation comment

### Export as Markdown
1. Right-click on an annotation or note
2. Select "Export as Markdown"
3. The annotation/note will be saved as a Markdown file in your configured export directory

### Smart Copy
1. Right-click on an annotation
2. Select "Smart Copy"
3. A formatted reference string will be copied to your clipboard

### Summarize PDF
1. Right-click on a PDF item or a regular item with PDF attachments
2. Select "Summarize" from the context menu
3. A summary note will be created and attached to the parent item

## Preferences

### AI Provider
- **Provider**: The provider profile used for summaries and translations. Built in: Google Gemini, Mistral and Local LLM.
- **Add provider… / Remove**: Add your own profile (e.g. OpenAI, OpenRouter, Ollama) or remove one
- **Endpoint**: OpenAI-compatible base URL offering `/chat/completions`
  - Gemini: `https://generativelanguage.googleapis.com/v1beta/openai`
  - Mistral: `https://api.mistral.ai/v1`
  - Local LLM: `http://127.0.0.1:8000/v1`
- **Model name**: e.g. `gemini-flash-lite-latest`, `mistral-small-latest`, or the name your local server uses
- **API key**: Sent as a Bearer token; optional for local servers (127.0.0.1 / localhost)
- **Language**: Default language for summaries and translations

### Summary Settings
- **Extraction Mode**: Choose between:
  - **Text Only (Faster)**: Uses Zotero's built-in text extraction (faster).
  - **Full Text Extraction (Thorough)**: Extracts text from the entire PDF before sending (thorough).
  - **Send Native PDF (Multimodal)**: Sends the actual PDF file directly to Gemini's native API for multimodal analysis (Gemini only; other providers receive the extracted text).

### Export Settings
- **Export Path**: Directory where Markdown files will be saved (leave empty for home directory)

### Auto-tagging Settings
- **Enable Auto-tagging**: Turn on/off automatic tagging of new items
- **Unread Tag**: The tag to apply to new items (default: /unread)

### Annotation Colors
- **Custom Labels**: A label per highlight color (Yellow, Red, Green, Blue, Purple, Magenta, Orange, Gray), shown in the PDF reader's color menus. Defaults are Dutch; leave a field empty to keep Zotero's own name.

## Supported Models

Any model offered through an OpenAI-compatible `/chat/completions` endpoint can be used, for example
Gemini models, Mistral models, or models served by a local server (llama.cpp, vLLM, LM Studio, Ollama, …).

## API Notes

- You need an API key for a cloud provider, or a running local LLM server, to use the AI features
- API calls consume tokens and may incur costs depending on your plan
- See [Gemini Pricing](https://ai.google.dev/pricing) and [Mistral Pricing](https://mistral.ai/pricing) for details

## License

MIT License - see LICENSE.md for details

## Acknowledgments

This plugin was created by combining and modifying three previous plugins:
- **AU - Annotation Utilities**: Annotation translation and export
- **Summary by AI**: PDF summarization
- **Colors and Autotag**: Auto-tagging and color customization

The plugin can use Google's Gemini API, Mistral's API, or any OpenAI-compatible API.
