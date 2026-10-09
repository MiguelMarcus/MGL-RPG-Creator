"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import EntryPreview from "../components/odc/EntryPreview";
import { useODC } from "../state/ODCProvider";

export default function PreviewPage() {
  const router = useRouter();
  const { entry, notify } = useODC();
  const sheetRef = useRef(null);
  const [exportingPNG, setExportingPNG] = useState(false);

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
      link.download = `${(entry.name || "ficha").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
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

  return <div className="page-content is-preview">
    <div className="page-heading">
      <div><h1>{entry.name || "Nova criação"}</h1><p>Prévia para leitura, compartilhamento ou impressão.</p></div>
      <div className="heading-actions">
        <button className="outline-button" onClick={() => router.push(`/editar?id=${encodeURIComponent(entry.id)}`)}>Voltar à edição</button>
        <button className="outline-button" type="button" onClick={downloadPNG} disabled={exportingPNG}>{exportingPNG ? "Gerando PNG…" : "Salvar como PNG"} <span>↗</span></button>
        <button className="export-button" onClick={() => window.print()}>Salvar como PDF <span>↗</span></button>
      </div>
    </div>
    <div className="preview-wrap"><div ref={sheetRef}><EntryPreview entry={entry} /></div></div>
  </div>;
}
