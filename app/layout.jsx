import "../front/styles/globals.css";
import ODCProvider from "../front/state/ODCProvider";
import WorkspaceShell from "../front/components/layout/WorkspaceShell";

export const metadata = {
  title: "ODC — Oficina de Criação",
  description: "Crie raças, monstros, equipamentos, classes e magias para Old Dragon 2."
};

export default function RootLayout({ children }) {
  return <html lang="pt-BR"><body><ODCProvider><WorkspaceShell>{children}</WorkspaceShell></ODCProvider></body></html>;
}
