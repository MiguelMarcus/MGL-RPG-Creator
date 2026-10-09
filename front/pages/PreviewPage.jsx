"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EntryPreview from "../components/odc/EntryPreview";
import { useODC } from "../state/ODCProvider";
import { loadEntry } from "../lib/storage.mjs";

export default function PreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedId = searchParams.get("id");
  const { entry, notify, setEntry } = useODC();
  const sheetRef = useRef(null);
  const [exportingPNG, setExportingPNG] = useState(false);
  const [loadedEntry, setLoadedEntry] = useState(null);
  const [loading, setLoading] = useState(Boolean(requestedId && entry.id !== requestedId));

  useEffect(() => {
    let cancelled = false;

    if (!requestedId || entry.id === requestedId) {
      setLoadedEntry(entry);
      setLoading(false);
      return () => { cancelled = true; };
    }

    setLoading(true);
    setLoadedEntry(null);
    loadEntry(requestedId).then(item => {
      if (cancelled) return;
      if (item) {
        setEntry(item);
        setLoadedEntry(item);
      }
      setLoading(false);
    }).catch(error => {
      if (!cancelled) {
        setLoading(false);
        notify(error?.message || "Não foi possível carregar esta criação.");
      }
    });

    return () => { cancelled = true; };
  }, [requestedId, entry, notify, setEntry]);

  const previewEntry = loadedEntry || entry;

  const downloadPNG = async () => {
    if (!sheetRef.current) {
      notify("Não foi possível localizar a ficha para exportar.");
      return;
    }
    setExportingPNG(true);
    try {
      await document.fonts.ready;
      await Promise.all([...sheetRef.current.querySelectorAll("img")].map(image => image.decode()));
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(sheetRef.current, {
        backgroundColor: "#553d2c",
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `${(previewEntry.name || "ficha").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();
      notify("Ficha exportada como PNG");
    } catch (error) {
      console.error("Não foi possível exportar a ficha como PNG.", error);
      notify("Não foi possível gerar o PNG. Verifique imagens externas e tente novamente.");
    } finally {
      setExportingPNG(false);
    }
  };

  if (loading) return <div className="page-content is-preview"><p>Carregando criação…</p></div>;

  if (requestedId && previewEntry.id !== requestedId) return <div className="page-content is-preview"><h1>Criação não encontrada</h1><p>Ela pode ter sido removida desta biblioteca ou aberta em outro navegador.</p></div>;

  return <div className="page-content is-preview">
    <div className="page-heading">
      <div><h1>{previewEntry.name || "Nova criação"}</h1><p>Prévia para leitura, compartilhamento ou impressão.</p></div>
      <div className="heading-actions">
        <button className="outline-button" onClick={() => router.push(`/editar?id=${encodeURIComponent(previewEntry.id)}`)}>Voltar à edição</button>
        <button className="outline-button" type="button" onClick={downloadPNG} disabled={exportingPNG}>{exportingPNG ? "Gerando PNG…" : "Salvar como PNG"} <span>↗</span></button>
        <button className="export-button" onClick={() => window.print()}>Salvar como PDF <span>↗</span></button>
      </div>
    </div>
    <div className="preview-wrap"><div ref={sheetRef}><EntryPreview entry={previewEntry} /></div></div>
  </div>;
}
