# Zotero Utils

A combined Zotero plugin that provides annotation utilities and PDF summarization using the Mistral API.

## Features

This plugin combines the functionality of two previous plugins:
- **Annotation Utilities (AU)**: Translate annotations, export annotations/notes as Markdown, and smart copy
- **Summary by AI**: Generate AI-powered summaries of PDF documents

### Annotation Utilities
- **Translate**: Translate annotation text using Mistral AI
- **Export as Markdown**: Export annotations or notes as Markdown files with proper references
- **Smart Copy**: Copy annotation with reference and page info to clipboard

### PDF Summarization
- **Summarize PDFs**: Generate comprehensive summaries of PDF documents
- **Text Extraction**: Extract text from PDFs for analysis
- **Full Text Extraction**: Option to extract all text from the PDF file

## Installation

1. Download the plugin from the releases page
2. In Zotero, go to Tools > Add-ons
3. Click the gear icon and select "Install Add-on From File..."
4. Select the downloaded `.xpi` file

## Configuration

1. Get a Mistral API key from [https://console.mistral.ai/](https://console.mistral.ai/)
2. In Zotero, go to Edit > Preferences
3. Find "Zotero Utils" in the left sidebar
4. Enter your API key in the Mistral API Settings section
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

### Mistral API Settings
- **API Key**: Your Mistral API key
- **API Endpoint**: The Mistral API endpoint (default: https://api.mistral.ai/v1)
- **Model**: Choose from available Mistral models
- **Language**: Default language for summaries and translations

### Summary Settings
- **Extraction Mode**: Choose between "Text Only" (faster, cheaper) or "Full PDF with Images" (for PDFs with visual content)

### Export Settings
- **Export Path**: Directory where Markdown files will be saved (leave empty for home directory)

## Supported Models

The plugin supports all Mistral API models, including:
- mistral-large-latest
- mistral-small-latest
- mistral-tiny-latest
- codestral-latest
- mistral-mixtral-8x7b-latest
- mistral-mixtral-8x22b-latest

## API Notes

- You need a Mistral API key to use the AI features
- API calls consume tokens and may incur costs depending on your plan
- The free tier has generous limits for testing
- See [Mistral Pricing](https://mistral.ai/pricing/) for details

## License

MIT License - see LICENSE.md for details

## Acknowledgments

This plugin was created by combining and modifying two previous plugins:
- AU - Annotation Utilities
- Summary by AI

Both original plugins used the Gemini API and have been updated to use Mistral AI instead.
