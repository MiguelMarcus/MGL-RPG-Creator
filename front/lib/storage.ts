import type { CreationEntry } from "../types/entry";

const DATABASE_NAME = "odc-library";
const DATABASE_VERSION = 1;
const ENTRY_STORE = "entries";
const LEGACY_KEY = "odc-entries";

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("Este navegador não oferece armazenamento local compatível."));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(ENTRY_STORE)) database.createObjectStore(ENTRY_STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Não foi possível abrir a biblioteca local."));
    request.onblocked = () => reject(new Error("Feche outras abas do ODC e tente novamente."));
  });
}

function readAll(database: IDBDatabase): Promise<CreationEntry[]> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(ENTRY_STORE, "readonly");
    const request = transaction.objectStore(ENTRY_STORE).getAll();
    request.onsuccess = () => resolve((request.result || []) as CreationEntry[]);
    request.onerror = () => reject(request.error || new Error("Não foi possível ler a biblioteca."));
    transaction.onabort = () => reject(transaction.error || new Error("A leitura da biblioteca foi interrompida."));
  });
}

function readOne(database: IDBDatabase, id: string): Promise<CreationEntry | null> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(ENTRY_STORE, "readonly");
    const request = transaction.objectStore(ENTRY_STORE).get(id);
    request.onsuccess = () => resolve((request.result as CreationEntry | undefined) || null);
    request.onerror = () => reject(request.error || new Error("Não foi possível ler a criação."));
    transaction.onabort = () => reject(transaction.error || new Error("A leitura da criação foi interrompida."));
  });
}

function writeEntries(database: IDBDatabase, entries: CreationEntry[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(ENTRY_STORE, "readwrite");
    const store = transaction.objectStore(ENTRY_STORE);
    entries.forEach(entry => store.put(entry));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("Não foi possível gravar a biblioteca."));
    transaction.onabort = () => reject(transaction.error || new Error("A gravação da biblioteca foi interrompida."));
  });
}

function readLegacyEntries(): CreationEntry[] {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    const entries: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(entries) ? entries.filter((entry): entry is CreationEntry => Boolean(entry && typeof entry === "object" && "id" in entry && (entry as CreationEntry).id !== "brugo-bufante")) : [];
  } catch { return []; }
}

export async function loadEntries(): Promise<CreationEntry[]> {
  const database = await openDatabase();
  try {
    const current = await readAll(database);
    if (current.length) return current;
    const legacy = readLegacyEntries();
    if (legacy.length) await writeEntries(database, legacy);
    try { localStorage.removeItem(LEGACY_KEY); } catch {}
    return legacy;
  } finally { database.close(); }
}

export async function loadEntry(id: string): Promise<CreationEntry | null> {
  if (!id) return null;
  const database = await openDatabase();
  try { return await readOne(database, id); } finally { database.close(); }
}

export async function saveEntry(entry: CreationEntry) { return saveEntries([entry]); }

export async function saveEntries(entries: CreationEntry[]) {
  const database = await openDatabase();
  try { await writeEntries(database, entries); } finally { database.close(); }
}

export async function deleteEntry(id: string) {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(ENTRY_STORE, "readwrite");
      transaction.objectStore(ENTRY_STORE).delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error("Não foi possível excluir a criação."));
      transaction.onabort = () => reject(transaction.error || new Error("A exclusão da criação foi interrompida."));
    });
  } finally { database.close(); }
}

export async function requestPersistentStorage() {
  try { if (navigator.storage?.persist) await navigator.storage.persist(); } catch {}
}
