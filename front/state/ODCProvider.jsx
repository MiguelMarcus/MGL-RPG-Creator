"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { blankEntry } from "../../back/odc.mjs";
import { loadEntries, requestPersistentStorage, saveEntry } from "../lib/storage.mjs";

const ODCContext = createContext(null);

export function useODC() {
  const context = useContext(ODCContext);
  if (!context) throw new Error("useODC deve ser usado dentro de ODCProvider.");
  return context;
}

export default function ODCProvider({ children }) {
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [active, setActive] = useState("todos");
  const [selected, setSelected] = useState("");
  const [entry, setEntry] = useState(() => blankEntry());
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    let mounted = true;
    loadEntries().then(list => {
      if (!mounted) return;
      setEntries(list);
      const requestedId = new URLSearchParams(window.location.search).get("id");
      const requestedEntry = list.find(item => item.id === requestedId);
      if (requestedEntry) {
        setEntry(requestedEntry);
        setSelected(requestedEntry.id);
        setActive(requestedEntry.type);
        setSaved(true);
      }
    }).catch(error => {
      if (mounted) setToast(error?.message || "Não foi possível abrir a biblioteca deste navegador.");
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("odc-theme");
    const next = stored || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, []);

  const notify = useCallback(text => {
    setToast(text);
    window.setTimeout(() => setToast(current => current === text ? "" : current), 2600);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("odc-theme", next);
  }, [theme]);

  const updateEntry = useCallback(value => {
    setEntry(value);
    setSaved(false);
  }, []);

  const startCreation = useCallback(type => {
    const item = blankEntry(type);
    setEntry(item);
    setSelected(item.id);
    setActive(type);
    setSaved(false);
    router.push(`/editar?id=${encodeURIComponent(item.id)}`);
  }, [router]);

  const openEntry = useCallback((item, destination = "/editar") => {
    setSelected(item.id);
    setEntry(item);
    setActive(item.type);
    setSaved(true);
    router.push(`${destination}?id=${encodeURIComponent(item.id)}`);
  }, [router]);

  const save = useCallback(async () => {
    if (!entry.name.trim()) {
      notify("Informe um nome antes de salvar.");
      return;
    }
    setSaving(true);
    try {
      await requestPersistentStorage();
      await saveEntry(entry);
      setEntries(current => [...current.filter(item => item.id !== entry.id), entry]);
      setSelected(entry.id);
      setSaved(true);
      notify("Criação salva na sua biblioteca");
      router.push(`/visualizar?id=${encodeURIComponent(entry.id)}`);
    } catch (error) {
      const quota = error?.name === "QuotaExceededError" || error?.name === "NS_ERROR_DOM_QUOTA_REACHED";
      notify(quota ? "O espaço deste navegador acabou. Exporte e remova imagens ou variantes que não usa." : error?.message || "Não foi possível salvar. Suas alterações continuam abertas.");
    } finally {
      setSaving(false);
    }
  }, [entry, notify, router]);

  const discard = useCallback(() => {
    const original = entries.find(item => item.id === selected);
    if (original) {
      setEntry(original);
      setSaved(true);
      return;
    }
    const fresh = blankEntry(entry.type);
    setEntry(fresh);
    setSelected(fresh.id);
    setSaved(false);
  }, [entries, entry.type, selected]);

  const value = useMemo(() => ({
    entries, active, setActive, selected, entry, setEntry: updateEntry,
    saved, saving, toast, setToast, query, setQuery, theme, toggleTheme,
    notify, startCreation, openEntry, save, discard,
  }), [entries, active, selected, entry, updateEntry, saved, saving, toast, query, theme, toggleTheme, notify, startCreation, openEntry, save, discard]);

  return <ODCContext.Provider value={value}>{children}</ODCContext.Provider>;
}
