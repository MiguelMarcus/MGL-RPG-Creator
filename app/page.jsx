import { Suspense } from "react";
import LibraryPage from "../front/pages/LibraryPage";

export default function Page() {
  return <Suspense fallback={<div className="page-content"><p>Carregando biblioteca…</p></div>}><LibraryPage /></Suspense>;
}
