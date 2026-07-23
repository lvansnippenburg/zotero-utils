ZoteroUtils = {
  PREF_BRANCH: "extensions.zotero-utils.",
  id: null,
  version: null,
  rootURI: null,
  initialized: false,
  addedElements: [],

  // Auto-tag settings
  autoTagEnabled: true,
  unreadTag: "/unread",

  // Annotation color customization
  colorLabelMap: {
    "#ffd400": "&nbsp;Interessant punt", // Yellow
    "#ff6666": "&nbsp;Hoofdvraag / belangrijk punt", // Red
    "#5fb236": "&nbsp;Referentie naar ander werk", // Green
    "#2ea8e5": "&nbsp;Plaats", // Blue
    "#a28ae5": "&nbsp;Persoon", // Purple
    "#e56eee": "&nbsp;Hoe zit dit?", // Magenta
    "#f19837": "&nbsp;Hoofdstuk", // Orange
    "#aaaaaa": "&nbsp;Onzin", // Gray
  },

  strings: {
    nl: {
      menuLabel: "Samenvatten",
      selectItem: "Selecteer een PDF-item",
      noPDF: "Geen PDF gevonden",
      configureAPI: "Configureer eerst uw API key in de voorkeuren",
      processing: "Tekst wordt geëxtraheerd...",
      sendingToAPI: "Verzenden naar AI...",
      success: "Samenvatting succesvol toegevoegd!",
      error: "Fout",
      noteTitle: "Samenvatting (AI)",
      headline: "Samenvatting (AI)",
      prompt: "Geef een uitgebreide samenvatting van dit document in het Nederlands. Behandel de belangrijkste punten, argumenten en conclusies. Geef geen andere commentaren dan de samenvatting zoals gevraagd, dus ook geen inleidende beschrijving.",
      translateLabel: "Vertalen",
      exportMarkdownLabel: "Exporteer als Markdown",
      smartCopyLabel: "Slim Kopieren",
      translateError: "Kan tekst niet vertalen",
      exportError: "Kan niet exporteren",
      smartCopySuccess: "Gekopieerd naar klembord",
      autoTagLabel: "Voeg /unread tag toe aan nieuwe items",
      colorCustomizationLabel: "Aangepaste annotatie kleur labels"
    },
    en: {
      menuLabel: "Summarize",
      selectItem: "Select a PDF item",
      noPDF: "No PDF found",
      configureAPI: "Please configure your API key in preferences first",
      processing: "Extracting text...",
      sendingToAPI: "Sending to AI...",
      success: "Summary successfully added!",
      error: "Error",
      noteTitle: "Summary (AI)",
      headline: "Summary (AI)",
      prompt: "Provide a comprehensive summary of this document in English. Cover the main points, arguments, and conclusions.",
      translateLabel: "Translate",
      exportMarkdownLabel: "Export as Markdown",
      smartCopyLabel: "Smart Copy",
      translateError: "Cannot translate text",
      exportError: "Cannot export",
      smartCopySuccess: "Copied to clipboard",
      autoTagLabel: "Add /unread tag to new items",
      colorCustomizationLabel: "Custom annotation color labels"
    },
  },

  init({ id, version, rootURI }) {
    if (this.initialized) return;

    this.id = id;
    this.version = version;
    this.rootURI = rootURI;
    this.initialized = true;

    // Register preference pane
    Zotero.PreferencePanes.register({
      pluginID: this.id,
      src: this.rootURI + "chrome/content/preferences.xhtml",
    });

    // Listen for preference changes to update menu labels
    Zotero.Prefs.registerObserver(this.PREF_BRANCH + "language", () => {
      this.updateMenuLabels();
    });

    // Register reader event listeners for annotation context menu
    Zotero.Reader.registerEventListener("createAnnotationContextMenu", this.handleAnnotationContextMenu.bind(this), this.id);

    // Register sidebar annotation export button
    Zotero.Reader.registerEventListener(
      "renderSidebarAnnotationHeader",
      this.handleSidebarAnnotationHeader.bind(this),
      this.id,
    );

    // Auto-tagging: Add /unread tag to new items
    this.setupAutoTagging();

    // Custom annotation color names
    this.setupColorCustomization();

    Zotero.debug("zotero-utils: initialized");
  },

  uninit() {
    if (!this.initialized) return;

    // Unregister reader event listeners
    Zotero.Reader.unregisterEventListener("createAnnotationContextMenu", this.id);
    Zotero.Reader.unregisterEventListener("renderSidebarAnnotationHeader", this.id);

    // Remove item-tree menu items and their listeners
    for (const { menuitem, popup, onPopup } of this.addedElements) {
      try {
        if (popup && onPopup) popup.removeEventListener("popupshowing", onPopup);
        if (menuitem && menuitem.parentNode) menuitem.remove();
      } catch (e) {
        Zotero.getMainWindow().console.log("ZoteroUtils: uninit menu cleanup error: " + e);
      }
    }
    this.addedElements = [];

    // Unregister preference pane
    try {
      Zotero.PreferencePanes.unregister(this.id);
    } catch (e) {
      Zotero.getMainWindow().console.log("ZoteroUtils: uninit pref pane error: " + e);
    }

    // Unregister preference observer
    Zotero.Prefs.unregisterObserver(this.PREF_BRANCH + "language");

    // Unregister auto-tagging observer
    this.cleanupAutoTagging();

    // Unregister color customization listeners
    this.cleanupColorCustomization();

    this.initialized = false;
  },

  // ==================== AUTO-TAGGING FUNCTIONS (from colors-and-autotag) ====================

  setupAutoTagging() {
    // Check if auto-tagging is enabled (default: true)
    this.autoTagEnabled = Zotero.Prefs.get(this.PREF_BRANCH + "autoTagEnabled", true) !== false;

    if (this.autoTagEnabled) {
      // Register notifier for new items - adds /unread tag
      this.notifierID = Zotero.Notifier.registerObserver(
        {
          notify: (event, type, ids, extraData) => {
            if (event === "add" && type === "item") {
              for (let id of ids) {
                let item = Zotero.Items.get(id);
                if (item && item.isRegularItem()) {
                  item.addTag(this.unreadTag);
                }
              }
            }
          },
        },
        ["item"],
      );
    }
  },

  cleanupAutoTagging() {
    if (this.notifierID) {
      Zotero.Notifier.unregisterObserver(this.notifierID);
      this.notifierID = null;
    }
  },

  // ==================== COLOR CUSTOMIZATION FUNCTIONS (from colors-and-autotag) ====================

  setupColorCustomization() {
    // Customize annotation color names
    const hackContextMenuLabel = (event) => {
      setTimeout(() => {
        event.reader._iframeWindow?.document.querySelectorAll(".context-menu .row").forEach((e) => {
          const color = e.querySelector("path[fill]")?.getAttribute("fill");
          if (!color) {
            return;
          }
          if (color in this.colorLabelMap) {
            e.innerHTML = e.querySelector("svg")?.outerHTML + this.colorLabelMap[color];
          }
        });
      }, 10);
    };

    Zotero.Reader.registerEventListener(
      "createAnnotationContextMenu",
      hackContextMenuLabel,
      this.id,
    );

    Zotero.Reader.registerEventListener(
      "createColorContextMenu",
      hackContextMenuLabel,
      this.id,
    );
  },

  cleanupColorCustomization() {
    // Unregister color customization listeners
    Zotero.Reader.unregisterEventListener("createAnnotationContextMenu", this.id);
    Zotero.Reader.unregisterEventListener("createColorContextMenu", this.id);
  },

  getLanguage() {
    return Zotero.Prefs.get(this.PREF_BRANCH + "language", true) || "nl";
  },

  getString(key) {
    const lang = this.getLanguage();
    return this.strings[lang][key] || this.strings["en"][key];
  },

  // ==================== SUMMARY FUNCTIONS (from zotero-summary-by-ai) ====================

  addToWindow(window) {
    const doc = window.document;

    // Wait for the document to be fully loaded
    if (doc.readyState !== "complete") {
      window.addEventListener("load", () => this.addToWindow(window), { once: true });
      return;
    }

    // Add summarize menu item to item context menu
    this.addSummarizeMenuItem(doc);

    // Add annotation context menu items (from AU plugin)
    this.addAnnotationContextMenuItems(window);
  },

  addSummarizeMenuItem(doc) {
    const menuPopup = doc.getElementById("zotero-itemmenu");
    if (!menuPopup) {
      Zotero.debug("zotero-utils: Could not find zotero-itemmenu");
      return;
    }

    // Check if already added
    if (doc.getElementById("zotero-utils-summarize-menuitem")) {
      return;
    }

    // Add separator
    const separator = doc.createXULElement("menuseparator");
    separator.id = "zotero-utils-summarize-separator";
    menuPopup.appendChild(separator);

    // Add menu item
    const menuitem = doc.createXULElement("menuitem");
    menuitem.id = "zotero-utils-summarize-menuitem";
    menuitem.setAttribute("label", this.getString("menuLabel"));
    menuitem.addEventListener("command", () => {
      this.summarizePDF();
    });

    menuPopup.appendChild(menuitem);
  },

  removeFromWindow(window) {
    const doc = window.document;

    // Remove summarize menu item
    const menuitem = doc.getElementById("zotero-utils-summarize-menuitem");
    if (menuitem) {
      menuitem.remove();
    }

    const separator = doc.getElementById("zotero-utils-summarize-separator");
    if (separator) {
      separator.remove();
    }

    // Remove annotation context menu items
    for (const { menuitem: annMenuItem, popup: annPopup, onPopup } of this.addedElements) {
      try {
        if (annPopup && onPopup) annPopup.removeEventListener("popupshowing", onPopup);
        if (annMenuItem && annMenuItem.parentNode) annMenuItem.remove();
      } catch (e) {
        window.console.log("ZoteroUtils: remove annotation menu error: " + e);
      }
    }
  },

  addAnnotationContextMenuItems(window) {
    // Register an item-tree context menu entry for notes export
    const itemmenu = window.document.getElementById("zotero-itemmenu");
    if (itemmenu) {
      const menuitem = window.document.createXULElement("menuitem");
      menuitem.id = "zotero-utils-export-note";
      menuitem.setAttribute("label", this.getString("exportMarkdownLabel"));
      menuitem.addEventListener("command", async () => {
        try {
          const items = window.ZoteroPane.getSelectedItems();
          for (const item of items) {
            if (item.isNote()) {
              await this.exportAnnotation(item);
            }
          }
        } catch (e) {
          window.console.log("ZoteroUtils: export note menu error: " + e);
        }
      });

      const onPopup = () => {
        const items = window.ZoteroPane.getSelectedItems();
        menuitem.hidden = !(items.length > 0 && items.every((i) => i.isNote()));
      };
      itemmenu.addEventListener("popupshowing", onPopup);
      itemmenu.appendChild(menuitem);

      this.addedElements.push({ menuitem, popup: itemmenu, onPopup });
    }
  },

  handleAnnotationContextMenu(event) {
    const { reader, params, append } = event;

    if (!params || !params.currentID) return;

    try {
      const libraryID = reader.itemID
        ? Zotero.Items.get(reader.itemID).libraryID
        : Zotero.Libraries.userLibraryID;

      const annotationItem = Zotero.Items.getByLibraryAndKey(libraryID, params.currentID);

      if (!annotationItem) return;

      // Show the menu items for any annotation that has highlighted/selected text
      if (annotationItem.annotationText && annotationItem.annotationText.trim().length > 0) {
        append({
          label: this.getString("translateLabel"),
          onCommand: async () => {
            await this.translateAnnotation(annotationItem, reader);
          },
        });
        append({
          label: this.getString("exportMarkdownLabel"),
          onCommand: async () => {
            await this.exportAnnotation(annotationItem);
          },
        });
        append({
          label: this.getString("smartCopyLabel"),
          onCommand: async () => {
            await this.smartCopyAnnotation(annotationItem);
          },
        });
      }
    } catch (e) {
      Zotero.getMainWindow().console.log("ZoteroUtils: error in context menu handler: " + e);
      Zotero.debug("ZoteroUtils: error in context menu handler: " + e);
      Zotero.debug("Stack: " + e.stack);
    }
  },

  handleSidebarAnnotationHeader(event) {
    const { reader, doc, params, append } = event;
    const annotation = params.annotation;

    if (!annotation?.text?.trim()) return;

    const btn = doc.createElement("button");
    btn.className = "toolbar-button";
    btn.title = this.getString("exportMarkdownLabel");
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
    </svg>`;

    btn.addEventListener("click", async () => {
      try {
        const libraryID = reader.itemID
          ? Zotero.Items.get(reader.itemID).libraryID
          : Zotero.Libraries.userLibraryID;
        const annotationItem = Zotero.Items.getByLibraryAndKey(libraryID, annotation.id);
        if (annotationItem) {
          await this.exportAnnotation(annotationItem);
        }
      } catch (e) {
        Zotero.getMainWindow().console.log("ZoteroUtils: export button error: " + e);
      }
    });

    append(btn);
  },

  async summarizePDF() {
    const zp = Zotero.getActiveZoteroPane();
    const items = zp.getSelectedItems();

    if (items.length === 0) {
      this.showMessage(this.getString("selectItem"));
      return;
    }

    const item = items[0];

    // Find PDF attachment
    let pdfItem = null;

    if (item.isAttachment() && item.attachmentContentType === "application/pdf") {
      pdfItem = item;
    } else if (item.isRegularItem()) {
      const attachments = item.getAttachments();
      for (let attachmentID of attachments) {
        const attachment = Zotero.Items.get(attachmentID);
        if (attachment.attachmentContentType === "application/pdf") {
          pdfItem = attachment;
          break;
        }
      }
    }

    if (!pdfItem) {
      this.showMessage(this.getString("noPDF"));
      return;
    }

    try {
      // Get API key
      const apiKey = Zotero.Prefs.get(this.PREF_BRANCH + "apiKey", true);

      if (!apiKey) {
        this.showMessage(this.getString("configureAPI"));
        return;
      }

      // Show progress
      const progressWin = new Zotero.ProgressWindow();
      progressWin.changeHeadline(this.getString("headline"));
      progressWin.addLines([this.getString("processing")]);
      progressWin.show();
      progressWin.startCloseTimer(120000);

      // Check extraction mode preference
      const extractionMode = Zotero.Prefs.get(this.PREF_BRANCH + "extractionMode", true) || "text";
      let summary;

      if (extractionMode === "text") {
        // Extract text from PDF using Zotero's built-in extraction
        Zotero.getMainWindow().console.log("zotero-utils: extracting text from PDF");
        const pdfText = await pdfItem.attachmentText;

        if (!pdfText || pdfText.trim().length === 0) {
          progressWin.close();
          throw new Error(
            "Could not extract text from PDF. The PDF might be scanned or image-based. Try using 'Full PDF with Images' mode in preferences.",
          );
        }

        Zotero.getMainWindow().console.log(
          "zotero-utils: extracted " + pdfText.length + " characters",
        );

        // Update progress
        progressWin.addLines([this.getString("sendingToAPI")]);

        // Call Gemini API with extracted text
        summary = await this.callAPIText(apiKey, pdfText);
      } else if (extractionMode === "native") {
        // Send native PDF directly to Gemini
        Zotero.getMainWindow().console.log("zotero-utils: processing native PDF (sending to Gemini)");

        // Get file and read
        const filePath = await pdfItem.getFilePathAsync();
        const data = await IOUtils.read(filePath);

        Zotero.getMainWindow().console.log(
          "zotero-utils: file size " + data.length + " bytes",
        );

        // Update progress
        progressWin.addLines([this.getString("sendingToAPI")]);

        // Convert to base64
        const base64Data = this.arrayBufferToBase64(data.buffer || data);

        // Call Gemini API with native PDF
        summary = await this.callAPIPDF(apiKey, base64Data);
      } else {
        // Full PDF mode - extract text from all pages
        // Note: Gemini API doesn't support PDF files directly, so we extract text
        Zotero.getMainWindow().console.log("zotero-utils: processing full PDF (text extraction)");

        // Get file and read as base64
        const filePath = await pdfItem.getFilePathAsync();
        const data = await IOUtils.read(filePath);

        Zotero.getMainWindow().console.log(
          "zotero-utils: file size " + data.length + " bytes",
        );

        // For Gemini, we need to extract text from the PDF
        // Try to use Zotero's text extraction first
        let pdfText = await pdfItem.attachmentText;

        if (!pdfText || pdfText.trim().length === 0) {
          // If text extraction fails, try to extract text from the PDF data
          // This is a fallback - Gemini API doesn't support PDF files directly
          Zotero.getMainWindow().console.log("zotero-utils: falling back to manual text extraction");
          pdfText = await this.extractTextFromPDF(data);
        }

        if (!pdfText || pdfText.trim().length === 0) {
          progressWin.close();
          throw new Error(
            "Could not extract text from PDF. The PDF might be scanned or image-based.",
          );
        }

        Zotero.getMainWindow().console.log(
          "zotero-utils: extracted " + pdfText.length + " characters",
        );

        // Update progress
        progressWin.addLines([this.getString("sendingToAPI")]);

        // Call Gemini API with extracted text
        summary = await this.callAPIText(apiKey, pdfText);
      }

      progressWin.close();

      // Add summary as note
      await this.addSummaryNote(pdfItem, summary);

      this.showMessage(this.getString("success"));
    } catch (error) {
      Zotero.debug("zotero-utils: " + error);
      Zotero.getMainWindow().console.log("zotero-utils: " + error);
      this.showMessage(this.getString("error") + ": " + error.message);
    }
  },

  arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000; // 32KB chunks

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      binary += String.fromCharCode.apply(null, chunk);
    }

    return btoa(binary);
  },

  // ==================== GEMINI API FUNCTIONS ====================

  async callAPIText(apiKey, pdfText) {
    const model = Zotero.Prefs.get(this.PREF_BRANCH + "model", true) || "gemini-2.5-flash-lite";
    const endpoint = Zotero.Prefs.get(this.PREF_BRANCH + "apiEndpoint", true) || "https://generativelanguage.googleapis.com/v1beta/openai";
    const url = endpoint + "/chat/completions";

    Zotero.getMainWindow().console.log("zotero-utils: calling Gemini API, model=" + model);

    const prompt = this.getString("prompt");

    // Build request for Gemini API
    const requestBody = {
      model: model,
      messages: [
        {
          role: "user",
          content: prompt + "\n\n" + pdfText
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    };

    Zotero.getMainWindow().console.log("zotero-utils: posting text to Gemini API");

    const xhr = await Zotero.HTTP.request("POST", url, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify(requestBody)
    });

    if (xhr.status !== 200) {
      Zotero.getMainWindow().console.log("zotero-utils: Gemini API request returned: " + xhr.status);
      Zotero.getMainWindow().console.log(
        "zotero-utils: response body: " + JSON.stringify(xhr.response),
      );
      const errBody = typeof xhr.response === "string" ? JSON.parse(xhr.response) : xhr.response;
      const errorMsg = errBody && errBody.error ? errBody.error.message : xhr.statusText;
      throw new Error("Gemini API Error " + xhr.status + ": " + errorMsg);
    } else {
      Zotero.getMainWindow().console.log("zotero-utils: Gemini API request returned: " + xhr.status);
    }

    Zotero.getMainWindow().console.log("zotero-utils: Gemini API call completed");

    const response = JSON.parse(xhr.response);

    if (response.choices && response.choices.length > 0 &&
      response.choices[0].message && response.choices[0].message.content) {
      return response.choices[0].message.content;
    } else {
      Zotero.getMainWindow().console.log("zotero-utils: No summary received from Gemini model.");
      Zotero.getMainWindow().console.log(
        "zotero-utils: Full response: " + JSON.stringify(response),
      );
      throw new Error("No summary received from Gemini model");
    }
  },

  async callAPIPDF(apiKey, base64Data) {
    const model = Zotero.Prefs.get(this.PREF_BRANCH + "model", true) || "gemini-2.5-flash-lite";
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

    Zotero.getMainWindow().console.log("zotero-utils: calling Gemini Native API for PDF, model=" + model);

    const promptText = this.getString("prompt");

    // Build native request for Gemini API
    const requestBody = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64Data
              }
            },
            {
              text: promptText
            }
          ]
        }
      ]
    };

    Zotero.getMainWindow().console.log("zotero-utils: posting native PDF to Gemini API");

    const xhr = await Zotero.HTTP.request("POST", url, {
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (xhr.status !== 200) {
      Zotero.getMainWindow().console.log("zotero-utils: Gemini Native API request returned: " + xhr.status);
      Zotero.getMainWindow().console.log(
        "zotero-utils: response body: " + JSON.stringify(xhr.response),
      );
      const errBody = typeof xhr.response === "string" ? JSON.parse(xhr.response) : xhr.response;
      const errorMsg = errBody && errBody.error ? errBody.error.message : xhr.statusText;
      throw new Error("Gemini API Error " + xhr.status + ": " + errorMsg);
    } else {
      Zotero.getMainWindow().console.log("zotero-utils: Gemini Native API request returned: " + xhr.status);
    }

    Zotero.getMainWindow().console.log("zotero-utils: Gemini Native API call completed");

    const response = JSON.parse(xhr.response);

    if (response.candidates && response.candidates.length > 0 &&
        response.candidates[0].content && response.candidates[0].content.parts &&
        response.candidates[0].content.parts.length > 0 &&
        response.candidates[0].content.parts[0].text) {
      return response.candidates[0].content.parts[0].text;
    } else {
      Zotero.getMainWindow().console.log("zotero-utils: No summary received from Gemini native model.");
      Zotero.getMainWindow().console.log(
        "zotero-utils: Full response: " + JSON.stringify(response),
      );
      throw new Error("No summary received from Gemini native model");
    }
  },

  // Gemini API doesn't support PDF files directly, so we use text extraction
  // This is a placeholder for future support if Gemini adds PDF processing
  async extractTextFromPDF(pdfData) {
    // For now, just return empty - text extraction should be handled by Zotero
    // In the future, we could implement PDF.js or another library for text extraction
    Zotero.getMainWindow().console.log("zotero-utils: extractTextFromPDF not implemented - relying on Zotero's extraction");
    return "";
  },

  async addSummaryNote(pdfItem, summary) {
    const note = new Zotero.Item("note");

    // Attach to parent item if PDF is an attachment
    if (pdfItem.parentItemID) {
      note.parentItemID = pdfItem.parentItemID;
    } else {
      note.parentItemID = pdfItem.id;
    }

    const lang = this.getLanguage();
    const dateLocale = lang === "nl" ? "nl-NL" : "en-US";
    const date = new Date().toLocaleDateString(dateLocale);
    const noteTitle = this.getString("noteTitle");

    // Convert Markdown to HTML
    const htmlSummary = this.markdownToHTML(summary);

    const htmlContent = "<h2>" + noteTitle + " (" + date + ")</h2>" + htmlSummary;

    note.setNote(htmlContent);
    await note.saveTx();
  },

  // ==================== TRANSLATION FUNCTION (from AU plugin, changed to Gemini) ====================

  async translateAnnotation(annotationItem, reader) {
    // Show progress window
    const mw = Zotero.getMainWindow();
    const progressWin = new Zotero.ProgressWindow({ window: mw });
    progressWin.changeHeadline(this.getString("translateLabel"));
    progressWin.addLines(["Translating..."]);
    progressWin.startCloseTimer(120000);
    mw.setTimeout(() => {
      progressWin.show();
    }, 0);

    const text = annotationItem.annotationText?.trim();
    if (!text) {
      this.showMessage(this.getString("translateLabel"), this.getString("translateError") + ": No text found");
      return;
    }

    const apiKey = Zotero.Prefs.get(this.PREF_BRANCH + "apiKey", true);
    if (!apiKey) {
      this.showMessage(
        this.getString("translateLabel"),
        this.getString("configureAPI")
      );
      return;
    }

    const lang = Zotero.Prefs.get(this.PREF_BRANCH + "language", true) || "nl";

    try {
      const model = Zotero.Prefs.get(this.PREF_BRANCH + "model", true) || "gemini-2.5-flash-lite";
      const endpoint = Zotero.Prefs.get(this.PREF_BRANCH + "apiEndpoint", true) || "https://generativelanguage.googleapis.com/v1beta/openai";
      const url = endpoint + "/chat/completions";

      const prompt = "Translate the following text to " + lang + ". Reply with only the translation, no explanation or preamble:\n\n" + text;

      const requestBody = {
        model: model,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      };

      const xhr = await Zotero.HTTP.request("POST", url, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + apiKey
        },
        body: JSON.stringify(requestBody),
        responseType: "json",
      });

      progressWin.close();

      if (xhr.status !== 200) {
        const errBody = typeof xhr.response === "string" ? JSON.parse(xhr.response) : xhr.response;
        const errorMsg = errBody && errBody.error ? errBody.error.message : xhr.statusText;
        throw new Error("Gemini API Error " + xhr.status + ": " + errorMsg);
      }

      const response = xhr.response;

      if (!response.choices || response.choices.length === 0 || !response.choices[0].message?.content) {
        throw new Error("No translation received from Gemini");
      }

      const translation = response.choices[0].message.content.trim();

      // Save translation as the annotation comment
      annotationItem.annotationComment = translation;
      await annotationItem.saveTx();

      this.showMessage(this.getString("translateLabel"), "Translation saved");
    } catch (e) {
      progressWin.close();
      Zotero.getMainWindow().console.log("ZoteroUtils: translation error: " + e);
      this.showMessage(this.getString("translateLabel"), this.getString("error") + ": " + e.message);
    }
  },

  // ==================== EXPORT FUNCTIONS (from AU plugin) ====================

  showMessage(headline, message) {
    const pw = new Zotero.ProgressWindow();
    pw.changeHeadline(headline || this.getString("headline"));
    pw.addDescription(message);
    pw.show();
    pw.startCloseTimer(4000);
  },

  _sanitizeFilename(text) {
    let name = text
      .slice(0, 30)
      .replace(/[\/\\:*?"<>|]/g, "-")
      .replace(/[\s.]+$/, "");
    if (!name) name = "annotation";
    return name + ".md";
  },

  _getExportDir() {
    const saved = Zotero.Prefs.get(this.PREF_BRANCH + "exportPath", true);
    if (saved && saved.trim()) return saved.trim();
    // Get home directory from environment
    const homeDir = Services.dirsvc.get("Home", Components.interfaces.nsIFile);
    return homeDir.path;
  },

  // Write markdown to the export dir, appending a time-based suffix when a file
  // with the same name already exists so Zotero won't overwrite it.
  async _writeMarkdownFile(reference, markdown) {
    const s = new Date().toTimeString().slice(3, 8).replace(":", ""); // only to make item unique, otherwise Zotero will overwrite
    let filename = this._sanitizeFilename(reference);
    const exportDir = this._getExportDir();
    let filePath = exportDir.endsWith("/") ? exportDir + filename : exportDir + "/" + filename;
    if (await IOUtils.exists(filePath)) {
      filename = filename.replace(/\.md$/, "") + " " + s + ".md";
      filePath = exportDir.endsWith("/") ? exportDir + filename : exportDir + "/" + filename;
    }
    await Zotero.File.putContentsAsync(filePath, markdown);
    return filename;
  },

  // Lightweight HTML -> Markdown conversion for Zotero note content.
  _htmlToMarkdown(html) {
    let s = html.replace(/\r\n?/g, "\n");
    s = s.replace(
      /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi,
      (m, lvl, t) => "\n" + "#".repeat(+lvl) + " " + t.trim() + "\n",
    );
    s = s.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**");
    s = s.replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, "*$2*");
    s = s.replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");
    s = s.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n");
    s = s.replace(/<br\s*\/?>/gi, "\n");
    s = s.replace(/<blockquote\b[^>]*>/gi, "> ");
    s = s.replace(/<\/(p|div|ul|ol|blockquote|h[1-6])>/gi, "\n\n");
    s = s.replace(/<[^>]+>/g, "");
    s = s
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&");
    return s.replace(/\n{3,}/g, "\n\n").trim();
  },

  // Build a short "Author year, page" style reference from a library item.
  _buildReference(libraryItem, pageLabel) {
    let authorLastName = "";
    try {
      const creators = libraryItem.getCreators();
      const author =
        creators.find((c) => Zotero.CreatorTypes.getName(c.creatorTypeID) === "author") ||
        creators[0];
      if (author) authorLastName = author.lastName || author.name || "";
    } catch (e) {}

    let year = "";
    try {
      const dateStr = libraryItem.getField("date");
      const m = dateStr && dateStr.match(/(\d{4})/);
      if (m) year = m[1];
    } catch (e) {}

    let reference = "";
    if (authorLastName) reference += authorLastName;
    if (year) reference += " " + year;
    if (pageLabel) reference += ", " + pageLabel;
    return reference;
  },

  async exportNote(noteItem) {
    const noteHTML = noteItem.getNote();
    if (!noteHTML || !noteHTML.trim()) {
      this.showMessage(this.getString("exportMarkdownLabel"), "This note is empty.");
      return;
    }

    const body = this._htmlToMarkdown(noteHTML);

    // A child note links to its parent item; a standalone note links to itself.
    const parentItem = noteItem.parentItem;
    const libraryItem = parentItem || noteItem;
    const prefix = Zotero.API.getLibraryPrefix(libraryItem.libraryID);
    const selectLink = `zotero://select/${prefix}/items/${libraryItem.key}`;

    let reference = parentItem ? this._buildReference(parentItem, "") : "";
    if (!reference) reference = noteItem.getNoteTitle() || "note";

    const markdown = [body, `[(${reference})](${selectLink})`].join("\n\n");

    try {
      await this._writeMarkdownFile(reference, markdown);
    } catch (e) {
      Zotero.getMainWindow().console.log("ZoteroUtils: export note error: " + e);
      this.showMessage(this.getString("exportMarkdownLabel"), this.getString("exportError") + ": " + e.message);
    }
  },

  async exportAnnotation(annotationItem) {
    if (annotationItem.isNote && annotationItem.isNote()) {
      return this.exportNote(annotationItem);
    }

    const mw = Zotero.getMainWindow();

    const annotationText = annotationItem.annotationText?.trim();
    if (!annotationText) {
      this.showMessage(this.getString("exportMarkdownLabel"), "No text found in this annotation.");
      return;
    }

    const comment = annotationItem.annotationComment || "";
    const pageLabel = annotationItem.annotationPageLabel || "";

    const attachmentItem = annotationItem.parentItem;
    if (!attachmentItem) {
      this.showMessage(this.getString("exportMarkdownLabel"), "Could not find parent PDF item.");
      return;
    }
    const libraryItem = attachmentItem.parentItem || attachmentItem;
    const libraryID = libraryItem.libraryID;
    const prefix = Zotero.API.getLibraryPrefix(libraryID);

    const selectLink = `zotero://select/${prefix}/items/${libraryItem.key}`;
    const qs = [];
    if (pageLabel) qs.push(`page=${encodeURIComponent(pageLabel)}`);
    qs.push(`annotation=${annotationItem.key}`);
    const pdfLink = `zotero://open-pdf/${prefix}/items/${attachmentItem.key}?${qs.join("&")}`;

    const title = libraryItem.getField("title") || "Unknown title";

    const quotedText = annotationText
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .map((l) => "" + l)
      .join("\n");

    const reference = this._buildReference(libraryItem, pageLabel);
    const sourceParts = [`[(${reference})](${selectLink})`];

    const mdLines = [quotedText + "\n"];
    if (comment.trim()) mdLines.push(comment.trim());
    mdLines.push(sourceParts.join(", "));
    mdLines.push(`[annotation](${pdfLink})`);

    const markdown = mdLines.join(" ");

    try {
      await this._writeMarkdownFile(reference, markdown);
    } catch (e) {
      mw.console.log("ZoteroUtils: export error: " + e);
      this.showMessage(this.getString("exportMarkdownLabel"), this.getString("exportError") + ": " + e.message);
    }
  },

  async _copyToClipboard(text) {
    const win = Zotero.getMainWindow();
    // Let the native context menu finish closing before touching the pasteboard;
    // a synchronous XPCOM copyString here segfaults Zotero on recent macOS
    await new Promise((resolve) => win.setTimeout(resolve, 0));
    try {
      await win.navigator.clipboard.writeText(text);
    } catch (e) {
      Zotero.debug("ZoteroUtils: async clipboard failed, falling back: " + e);
      Components.classes["@mozilla.org/widget/clipboardhelper;1"]
        .getService(Components.interfaces.nsIClipboardHelper)
        .copyString(text);
    }
  },

  // Copy "Chicago reference, page; year found in text; annotation zotero:// link"
  // to the clipboard, semicolon-separated, for quick pasting elsewhere.
  async smartCopyAnnotation(annotationItem) {
    const annotationText = annotationItem.annotationText?.trim();
    if (!annotationText) {
      this.showMessage(this.getString("smartCopyLabel"), "No text found in this annotation.");
      return;
    }

    const pageLabel = annotationItem.annotationPageLabel || "";

    const attachmentItem = annotationItem.parentItem;
    if (!attachmentItem) {
      this.showMessage(this.getString("smartCopyLabel"), "Could not find parent PDF item.");
      return;
    }
    const libraryItem = attachmentItem.parentItem || attachmentItem;
    const prefix = Zotero.API.getLibraryPrefix(libraryItem.libraryID);

    const qs = [];
    if (pageLabel) qs.push(`page=${encodeURIComponent(pageLabel)}`);
    qs.push(`annotation=${annotationItem.key}`);
    const pdfLink = `zotero://open-pdf/${prefix}/items/${attachmentItem.key}?${qs.join("&")}`;

    const reference = this._buildReference(libraryItem, pageLabel);

    const yearMatch = annotationText.match(/\b(1[4-9]\d{2}|20\d{2})\b/);
    const textYear = yearMatch ? yearMatch[1] : "";

    const parts = [reference, textYear, pdfLink];
    try {
      await this._copyToClipboard(parts.join("; "));
      this.showMessage(this.getString("smartCopyLabel"), this.getString("smartCopySuccess"));
    } catch (e) {
      Zotero.debug("ZoteroUtils: smart copy error: " + e);
      this.showMessage(this.getString("smartCopyLabel"), this.getString("error") + ": " + e.message);
    }
  },

  // ==================== MARKDOWN TO HTML CONVERSION (from zotero-summary-by-ai) ====================

  markdownToHTML(text) {
    let html = text;

    // Normalize line endings and remove excessive blank lines
    html = html.replace(/\r\n/g, "\n");
    html = html.replace(/\n{3,}/g, "\n\n");
    html = html.trim();

    // Escape HTML entities first
    html = html.replace(/&/g, "&amp;");
    html = html.replace(/</g, "&lt;");
    html = html.replace(/>/g, "&gt;");

    // Convert headers (must be done before other formatting)
    html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

    // Convert bold (**text** or __text__)
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");

    // Convert italic (*text* or _text_)
    html = html.replace(/\*([^*]+?)\*/g, "<em>$1</em>");
    html = html.replace(/_([^_]+?)_/g, "<em>$1</em>");

    // Convert inline code (`code`)
    html = html.replace(/`([^`]+?)`/g, "<code>$1</code>");

    // Convert links [text](url)
    html = html.replace(/\[([^\]]+?)\]\(([^)]+?)\)/g, '<a href="$2">$1</a>');

    // Convert list items to HTML
    html = html.replace(/^\* (.+)$/gm, "<li>$1</li>");
    html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
    html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

    // Wrap consecutive <li> items in <ul> tags
    const listPlaceholders = [];
    html = html.replace(/(<li>[\s\S]*?<\/li>[\s\S]*?)+/g, function (match) {
      if (!match.includes("<li>")) return match;
      let cleanList = match.replace(/\n/g, "");
      cleanList = cleanList.replace(/>\s+</g, "><");
      const finalList = "<ul>" + cleanList + "</ul>";
      const placeholder = "LISTPLACEHOLDER" + listPlaceholders.length + "ENDLIST";
      listPlaceholders.push(finalList);
      return placeholder;
    });

    // Convert blockquotes (> text)
    html = html.replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>");

    // Convert line breaks to paragraphs
    const paragraphs = html.split("\n\n");
    html = paragraphs
      .map(function (para) {
        para = para.trim();
        if (
          para.match(/^<(h[1-6]|ul|ol|blockquote|pre|div)/) ||
          para.match(/^LISTPLACEHOLDER\d+ENDLIST$/)
        ) {
          return para;
        }
        if (para === "") {
          return "";
        }
        return "<p>" + para.replace(/\n/g, "<br>") + "</p>";
      })
      .filter(function (para) {
        return para !== "";
      })
      .join("");

    // Final cleanup
    html = html.replace(/<p><\/p>/g, "");
    html = html.replace(/<p>\s*<\/p>/g, "");
    html = html.replace(/<br\s*\/?>\s*<\/p>/g, "</p>");
    html = html.replace(/<p>\s*<br\s*\/?>/g, "<p>");

    // Restore the protected lists from placeholders
    html = html.replace(/LISTPLACEHOLDER(\d+)ENDLIST/g, function (match, index) {
      return listPlaceholders[parseInt(index)];
    });

    // Final pass: ensure no whitespace or br tags remain in any list structures
    html = html.replace(/(<ul>[\s\S]*?<\/ul>)/g, function (match) {
      return match
        .replace(/\n/g, "")
        .replace(/>\s+</g, "><")
        .replace(/<br\s*\/?>/g, "");
    });

    html = html.replace(/<p><br><\/p>/g, "");
    html = html.replace(/<\/li><\/ul><br><ul>/g, "</li>");
    html = html.replace(/<br><ul><li>/g, "<ul><li>");

    return html;
  },

  updateMenuLabels() {
    // Update menu labels in all open windows when language changes
    const windows = Zotero.getMainWindows();
    for (let win of windows) {
      const menuitem = win.document.getElementById("zotero-utils-summarize-menuitem");
      if (menuitem) {
        menuitem.setAttribute("label", this.getString("menuLabel"));
      }
    }
  },

  // ==================== APPLE NOTES INTEGRATION (from AU plugin) ====================

  async createAppleNoteFromZotero(title, htmlBody) {
    if (Zotero.isWin || Zotero.isLinux) {
      throw new Error("Apple Notes integration only works on macOS.");
    }

    const osascript = Components.classes["@mozilla.org/file/local;1"].createInstance(
      Components.interfaces.nsIFile,
    );
    osascript.initWithPath("/usr/bin/osascript");
    const process = Components.classes["@mozilla.org/process/util;1"].createInstance(
      Components.interfaces.nsIProcess,
    );
    process.init(osascript);

    var script = 'tell application "Notes"' + "\n";
    script += "\ttell default account" + "\n";
    script += '\t\ttell folder "annotations"' + "\n";
    script +=
      '\t\t\tmake new note with properties { name: "' +
      title +
      '", body: "' +
      htmlBody +
      '" }' +
      "\n";
    script += "\t\tend tell" + "\n";
    script += "\tend tell" + "\n";
    script += "end tell" + "\n";

    Zotero.getMainWindow().console.log(script);

    const args = ["-e", script];
    process.run(true, args, args.length);

    if (process.exitValue !== 0) {
      throw new Error(`osascript failed with exit code ${process.exitValue}`);
    }
  },
};
