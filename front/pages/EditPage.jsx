"use client";

import { useRouter } from "next/navigation";
import EntryEditor from "../components/odc/EntryEditor";
import { toFoundryJSON } from "../../back/odc.mjs";
import { useODC } from "../state/ODCProvider";

export default function EditPage() {
  const router = useRouter();
  const { entry, saved, saving, save, discard, setEntry } = useODC();

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(toFoundryJSON(entry), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(entry.name || "criacao").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return <div className="page-content">
    <div className="page-heading">
      <div><h1>{entry.name || "Nova criação"}</h1><p>Edite cada grupo de informações separadamente e visualize a ficha quando quiser.</p></div>
      <div className="heading-actions">
        <button className="outline-button" onClick={() => router.push("/visualizar")}>Ver ficha</button>
        <button className="outline-button" onClick={downloadJSON}>Exportar JSON</button>
        <button className="outline-button" onClick={() => router.push("/visualizar")}>Abrir ficha para PDF</button>
      </div>
    </div>
    <section className="editor-panel edit-page-panel">
      <div className="panel-top"><span className="panel-title">Editar detalhes</span><span className="panel-context">{saved ? "Alterações salvas" : "Alterações pendentes"}</span></div>
      <EntryEditor entry={entry} onChange={setEntry} />
      <div className="editor-footer">
        <span>{saved ? "Todas as alterações salvas" : "Alterações ainda não salvas"}</span>
        <div><button className="text-action" onClick={discard}>Descartar</button><button className="save-button" onClick={save} disabled={saving}>{saving ? "Salvando…" : "Salvar criação"} <span>↗</span></button></div>
      </div>
    </section>
  </div>;
}
