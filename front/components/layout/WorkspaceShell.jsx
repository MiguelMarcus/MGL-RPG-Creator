"use client";

import { usePathname } from "next/navigation";
import { categories } from "../../../back/odc.mjs";
import { useODC } from "../../state/ODCProvider";
import Sidebar from "./Sidebar";

const pageNames = {
  "/": "Biblioteca",
  "/criar": "Nova criação",
  "/editar": "Editar criação",
  "/visualizar": "Visualizar ficha",
};

export default function WorkspaceShell({ children }) {
  const pathname = usePathname();
  const { active, setActive, entries, entry, saved, theme, toggleTheme, toast, setToast } = useODC();
  const category = categories.find(item => item.id === entry.type);
  const isLibrary = pathname === "/";
  const isCreate = pathname === "/criar";
  const isEntryPage = pathname === "/editar" || pathname === "/visualizar";

  return <div className="app-shell min-h-screen">
    <Sidebar active={active} setActive={setActive} entries={entries} />
    <main className="workspace-main min-w-0 flex-1">
      <header className="topbar">
        <div className="breadcrumbs">
          <span>{pageNames[pathname] || "ODC"}</span>
          {isEntryPage && <><b aria-hidden="true">›</b><strong>{category?.label || "Criação"}</strong><b aria-hidden="true">›</b><span>{entry.name || "Nova criação"}</span></>}
        </div>
        <div className="top-actions">
          {!isCreate && <span className={`save-state ${saved ? "is-saved" : ""}`}><i />{saved ? "Salvo" : "Não salvo"}</span>}
          <button className="theme-toggle" onClick={toggleTheme} aria-label={`Ativar modo ${theme === "dark" ? "claro" : "escuro"}`} title={`Modo ${theme === "dark" ? "claro" : "escuro"}`}>
            <span aria-hidden="true">{theme === "dark" ? "☼" : "☾"}</span><span className="theme-label">{theme === "dark" ? "Claro" : "Escuro"}</span>
          </button>
        </div>
      </header>
      {children}
      {toast && <div className="toast" role="status" onAnimationEnd={() => setToast("")}>{toast}</div>}
    </main>
  </div>;
}
