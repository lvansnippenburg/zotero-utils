# Zotero Utils

A Zotero plugin that provides annotation export (to markdown), PDF summarization and annotation translation (using the Gemini API), auto-tagging, and annotation color customization.

## Features

### Annotation Utilities
- **Translate**: Translate annotation text using Gemini AI
- **Export as Markdown**: Export annotations or notes as Markdown files with proper references
- **Smart Copy**: Copy annotation with reference and page info to clipboard

### PDF Summarization
- **Summarize PDFs**: Generate comprehensive summaries of PDF documents

### Auto-tagging
- **Automatic /unread tag**: New items automatically receive the `/unread` tag (configurable)
- **Enable/Disable**: Toggle auto-tagging on/off in preferences

### Annotation Color Customization
- **Dutch color labels**: Annotation highlight colors have custom Dutch names
- **Color mapping**: Each highlight color is mapped to a descriptive label (e.g., Yellow = "Interessant punt")

## Installation

1. Download the plugin from the releases page
2. In Zotero, go to Tools > Add-ons
3. Click the gear icon and select "Install Add-on From File..."
4. Select the downloaded `.xpi` file

## Configuration

1. Get a Gemini API key from [https://aistudio.google.com/](https://aistudio.google.com/)
2. In Zotero, go to Edit > Preferences
3. Find "Zotero Utils" in the left sidebar
4. Enter your API key in the Gemini API Settings section
5. Configure your preferred model, language, and other settings

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

### Gemini API Settings
- **API Key**: Your Gemini API key
- **API Endpoint**: The Gemini API endpoint (default: https://generativelanguage.googleapis.com/v1beta/openai)
- **Model**: Choose from available Gemini models
- **Language**: Default language for summaries and translations

### Summary Settings
- **Extraction Mode**: Choose between:
  - **Text Only (Faster)**: Uses Zotero's built-in text extraction (faster).
  - **Full Text Extraction (Thorough)**: Extracts text from the entire PDF before sending (thorough).
  - **Send Native PDF (Multimodal)**: Sends the actual PDF file directly to Gemini's native API for multimodal analysis (recommended).

### Export Settings
- **Export Path**: Directory where Markdown files will be saved (leave empty for home directory)

### Auto-tagging Settings
- **Enable Auto-tagging**: Turn on/off automatic tagging of new items
- **Unread Tag**: The tag to apply to new items (default: /unread)

### Annotation Colors
- **Custom Labels**: Dutch labels for annotation highlight colors (configurable in code)

## Supported Models

The plugin supports Gemini API models via the OpenAI-compatible endpoint, including:
- gemini-2.5-flash-lite
- gemini-2.0-flash
- gemini-1.5-flash
- gemini-1.5-pro

## API Notes

- You need a Gemini API key to use the AI features
- API calls consume tokens and may incur costs depending on your plan
- The free tier has generous limits for testing
- See [Gemini Pricing](https://ai.google.dev/pricing) for details

## License

MIT License - see LICENSE.md for details

## Acknowledgments

This plugin was created by combining and modifying three previous plugins:
- **AU - Annotation Utilities**: Annotation translation and export
- **Summary by AI**: PDF summarization
- **Colors and Autotag**: Auto-tagging and color customization

The plugin uses Google's Gemini API.
