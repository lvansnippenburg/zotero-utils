function install(data, reason) {
  Zotero.getMainWindow().console.log("zotero-utils: Installing");
}

async function startup({ id, version, rootURI }, reason) {
  Zotero.getMainWindow().console.log("zotero-utils: starting");
  Services.scriptloader.loadSubScript(rootURI + "content/ZoteroUtils.js");
  
  // Wait for main window and initialize
  await Zotero.uiReadyPromise;
  
  ZoteroUtils.init({ id, version, rootURI });
  Zotero.ZoteroUtils = ZoteroUtils;
  
  // Add to all open windows
  const windows = Zotero.getMainWindows();
  for (let win of windows) {
    ZoteroUtils.addToWindow(win);
  }
}

function onMainWindowLoad({ window }) {
  if (Zotero.ZoteroUtils) {
    Zotero.ZoteroUtils.addToWindow(window);
  }
}

function onMainWindowUnload({ window }) {
  if (Zotero.ZoteroUtils) {
    Zotero.ZoteroUtils.removeFromWindow(window);
  }
}

function shutdown({ id, version, rootURI }, reason) {
  Zotero.debug("zotero-utils: Shutting down");

  // Unregister preference observer
  Zotero.Prefs.unregisterObserver(ZoteroUtils.PREF_BRANCH + "language");

  // Remove from all windows
  const windows = Zotero.getMainWindows();
  for (let win of windows) {
    ZoteroUtils.removeFromWindow(win);
  }

  // Clean up
  if (Zotero.ZoteroUtils) {
    Zotero.ZoteroUtils.uninit();
    delete Zotero.ZoteroUtils;
  }
}

function uninstall(data, reason) {
  Zotero.getMainWindow().console.log("zotero-utils: Uninstalling");
}
