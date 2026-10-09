import "./globals.css";

export const metadata = {
  title: "ODC — Oficina de Criação",
  description: "Crie raças, monstros, equipamentos, classes e magias para Old Dragon 2."
};

export default function RootLayout({ children }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
