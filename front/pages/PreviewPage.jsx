"use client";

import { useRouter } from "next/navigation";
import EntryPreview from "../components/odc/EntryPreview";
import { useODC } from "../state/ODCProvider";

export default function PreviewPage() {
  const router = useRouter();
  const { entry } = useODC();
  return <div className="page-content is-preview">
    <div className="page-heading">
      <div><h1>{entry.name || "Nova criação"}</h1><p>Prévia para leitura, compartilhamento ou impressão.</p></div>
      <div className="heading-actions">
        <button className="outline-button" onClick={() => router.push("/editar")}>Voltar à edição</button>
        <button className="export-button" onClick={() => window.print()}>Salvar como PDF <span>↗</span></button>
      </div>
    </div>
    <div className="preview-wrap"><EntryPreview entry={entry} /></div>
  </div>;
}
