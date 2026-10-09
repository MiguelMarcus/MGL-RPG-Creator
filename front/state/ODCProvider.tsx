"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { blankEntry } from "../../back/odc.mjs";
import { deleteEntry, loadEntries, requestPersistentStorage, saveEntry } from "../lib/storage";
import type { CreationEntry, CreationType } from "../types/entry";

type ActiveCategory = CreationType | "todos";
type ODCContextValue = {
  entries: CreationEntry[]; active: ActiveCategory; setActive: (category: ActiveCategory) => void;
  selected: string; entry: CreationEntry; setEntry: (entry: CreationEntry) => void;
  saved: boolean; saving: boolean; toast: string; setToast: (message: string) => void;
  query: string; setQuery: (query: string) => void; theme: string; toggleTheme: () => void;
  notify: (message: string) => void; startCreation: (type: CreationType) => void;
  openEntry: (entry: CreationEntry, destination?: string) => void; save: () => Promise<void>;
  discard: () => void; remove: (entry: CreationEntry) => Promise<void>;
};

const ODCContext = createContext<ODCContextValue | null>(null);
const freshEntry = (type?: CreationType) => blankEntry(type) as CreationEntry;
const errorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;

export function useODC() {
  const context = useContext(ODCContext);
  if (!context) throw new Error("useODC deve ser usado dentro de ODCProvider.");
  return context;
}

export default function ODCProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [entries, setEntries] = useState<CreationEntry[]>([]);
  const [active, setActive] = useState<ActiveCategory>("todos");
  const [selected, setSelected] = useState("");
  const [entry, setEntry] = useState<CreationEntry>(() => freshEntry());
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    let mounted = true;
    const requestedId = new URLSearchParams(window.location.search).get("id");
    const selectRequestedEntry = (list: CreationEntry[]) => {
      const requestedEntry = list.find(item => item.id === requestedId);
      if (!requestedEntry || !mounted) return;
      setEntry(requestedEntry); setSelected(requestedEntry.id); setActive(requestedEntry.type); setSaved(true);
    };

    loadEntries().then(localEntries => {
      if (!mounted) return;
      setEntries(localEntries); selectRequestedEntry(localEntries);
    }).catch(error => { if (mounted) setToast(errorMessage(error, "Não foi possível abrir a biblioteca deste navegador.")); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("odc-theme");
    const next = stored || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    setTheme(next); document.documentElement.dataset.theme = next;
  }, []);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(current => current === message ? "" : current), 2600);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next); document.documentElement.dataset.theme = next; localStorage.setItem("odc-theme", next);
  }, [theme]);

  const updateEntry = useCallback((value: CreationEntry) => { setEntry(value); setSaved(false); }, []);
  const startCreation = useCallback((type: CreationType) => {
    const item = freshEntry(type); setEntry(item); setSelected(item.id); setActive(type); setSaved(false);
    router.push(`/editar?id=${encodeURIComponent(item.id)}`);
  }, [router]);
  const openEntry = useCallback((item: CreationEntry, destination = "/editar") => {
    setSelected(item.id); setEntry(item); setActive(item.type); setSaved(true);
    router.push(`${destination}?id=${encodeURIComponent(item.id)}`);
  }, [router]);

  const save = useCallback(async () => {
    if (!entry.name.trim()) { notify("Informe um nome antes de salvar."); return; }
    setSaving(true);
    const localEntry = { ...entry, updated: new Date().toISOString() };
    try {
      await requestPersistentStorage();
      await saveEntry(localEntry);
      setEntries(current => [...current.filter(item => item.id !== localEntry.id), localEntry]);
      setEntry(localEntry); setSelected(localEntry.id); setSaved(true);
      notify("Criação salva neste navegador.");
      router.push(`/visualizar?id=${encodeURIComponent(localEntry.id)}`);
    } catch (error) {
      const quota = error instanceof DOMException && error.name === "QuotaExceededError";
      notify(quota ? "O espaço deste navegador acabou. Exporte e remova imagens ou variantes que não usa." : errorMessage(error, "Não foi possível salvar. Suas alterações continuam abertas."));
    } finally { setSaving(false); }
  }, [entry, notify, router]);

  const discard = useCallback(() => {
    const original = entries.find(item => item.id === selected);
    if (original) { setEntry(original); setSaved(true); return; }
    const fresh = freshEntry(entry.type); setEntry(fresh); setSelected(fresh.id); setSaved(false);
  }, [entries, entry.type, selected]);

  const remove = useCallback(async (item: CreationEntry) => {
    await deleteEntry(item.id);
    setEntries(current => current.filter(entryItem => entryItem.id !== item.id));
    notify("Criação excluída.");
    if (selected === item.id) { const fresh = freshEntry(item.type); setEntry(fresh); setSelected(""); setSaved(false); }
  }, [notify, selected]);

  const value = useMemo(() => ({ entries, active, setActive, selected, entry, setEntry: updateEntry, saved, saving, toast, setToast, query, setQuery, theme, toggleTheme, notify, startCreation, openEntry, save, discard, remove }), [entries, active, selected, entry, updateEntry, saved, saving, toast, query, theme, toggleTheme, notify, startCreation, openEntry, save, discard, remove]);
  return <ODCContext.Provider value={value}>{children}</ODCContext.Provider>;
}
