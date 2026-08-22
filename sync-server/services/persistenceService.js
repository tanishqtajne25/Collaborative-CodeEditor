const Y = require("yjs");
const prisma = require("../db/prisma");

// Track debounce timers per document to batch DB writes
const saveDebounceTimers = new Map();

/**
 * Loads a persisted Y.Doc state from the database and applies it.
 * @param {string} docName
 * @param {Y.Doc} ydoc
 * @returns {Promise<boolean>} True if loaded from DB, false if new doc
 */
async function loadDocumentState(docName, ydoc) {
  try {
    const room = await prisma.room.findUnique({
      where: { docName },
    });

    if (room && room.ydocState) {
      const binaryUpdate = new Uint8Array(room.ydocState);
      // Apply snapshot to doc with 'persistence' origin
      Y.applyUpdate(ydoc, binaryUpdate, "persistence");
      console.log(`[PERSISTENCE] Restored doc "${docName}" from database (${binaryUpdate.length} bytes)`);
      return true;
    }
  } catch (error) {
    console.error(`[PERSISTENCE] Error loading doc "${docName}":`, error.message);
  }
  return false;
}

/**
 * Saves current binary CRDT state of Y.Doc to database.
 * @param {string} docName
 * @param {Y.Doc} ydoc
 */
async function saveDocumentState(docName, ydoc) {
  try {
    const binaryUpdate = Y.encodeStateAsUpdate(ydoc);
    const content = ydoc.getText("monaco").toString();

    await prisma.room.upsert({
      where: { docName },
      update: {
        ydocState: Buffer.from(binaryUpdate),
        lastContent: content,
        updatedAt: new Date(),
      },
      create: {
        docName,
        ydocState: Buffer.from(binaryUpdate),
        lastContent: content,
      },
    });

    console.log(`[PERSISTENCE] Saved snapshot for doc "${docName}" (${binaryUpdate.length} bytes)`);
  } catch (error) {
    console.error(`[PERSISTENCE] Failed to save doc "${docName}":`, error.message);
  }
}

/**
 * Attaches debounced persistence listener to a Y.Doc instance.
 * @param {string} docName
 * @param {Y.Doc} ydoc
 */
function bindPersistence(docName, ydoc) {
  if (ydoc.persistenceAttached) return;
  ydoc.persistenceAttached = true;

  ydoc.on("update", (update, origin) => {
    // Don't trigger save if update came from loading the snapshot itself
    if (origin === "persistence") return;

    // Clear existing timer
    if (saveDebounceTimers.has(docName)) {
      clearTimeout(saveDebounceTimers.get(docName));
    }

    // Debounce database write by 1.5 seconds
    const timer = setTimeout(() => {
      saveDebounceTimers.delete(docName);
      saveDocumentState(docName, ydoc);
    }, 1500);

    saveDebounceTimers.set(docName, timer);
  });
}

/**
 * Flush and immediately save all pending documents (for graceful shutdown)
 * @param {Map<string, Y.Doc>} activeDocsMap
 */
async function flushAllDocuments(activeDocsMap) {
  console.log("[PERSISTENCE] Flushing all active documents to DB...");
  const promises = [];
  activeDocsMap.forEach((ydoc, docName) => {
    promises.push(saveDocumentState(docName, ydoc));
  });
  await Promise.allSettled(promises);
  console.log("[PERSISTENCE] Flush completed.");
}

module.exports = {
  loadDocumentState,
  saveDocumentState,
  bindPersistence,
  flushAllDocuments,
};
