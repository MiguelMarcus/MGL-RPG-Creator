import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { CreationEntry } from "../front/types/entry";

const entriesFile = join(process.cwd(), "data", "entries.json");

async function readEntries(): Promise<CreationEntry[]> {
  try {
    const content = await readFile(entriesFile, "utf8");
    const entries: unknown = JSON.parse(content);
    return Array.isArray(entries) ? entries as CreationEntry[] : [];
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeEntries(entries: CreationEntry[]) {
  await mkdir(dirname(entriesFile), { recursive: true });
  const temporaryFile = `${entriesFile}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(entries, null, 2), "utf8");
  await rename(temporaryFile, entriesFile);
}

export async function listEntries() {
  const entries = await readEntries();
  return entries.sort((first, second) => String(second.updated).localeCompare(String(first.updated)));
}

export async function getEntry(id: string) {
  const entries = await readEntries();
  return entries.find(entry => entry.id === id) || null;
}

export async function createEntry(entry: CreationEntry) {
  const entries = await readEntries();
  if (entries.some(item => item.id === entry.id)) return null;
  const now = new Date().toISOString();
  const savedEntry = { ...entry, created: entry.created || now, updated: now };
  await writeEntries([...entries, savedEntry]);
  return savedEntry;
}

export async function updateEntry(id: string, entry: CreationEntry) {
  const entries = await readEntries();
  const index = entries.findIndex(item => item.id === id);
  if (index === -1) return null;
  const savedEntry = { ...entry, id, created: entries[index].created || new Date().toISOString(), updated: new Date().toISOString() };
  entries[index] = savedEntry;
  await writeEntries(entries);
  return savedEntry;
}

export async function removeEntry(id: string) {
  const entries = await readEntries();
  const remainingEntries = entries.filter(entry => entry.id !== id);
  if (remainingEntries.length === entries.length) return false;
  await writeEntries(remainingEntries);
  return true;
}
