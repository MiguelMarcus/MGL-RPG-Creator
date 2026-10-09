import { Suspense } from "react";
import PreviewPage from "../../front/pages/PreviewPage";

export default function Page() {
  return <Suspense fallback={<div className="page-content is-preview"><p>Carregando criação…</p></div>}><PreviewPage /></Suspense>;
}
