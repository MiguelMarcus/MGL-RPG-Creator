# ODC — Oficina de Criação

Aplicação modular para criar conteúdo de Old Dragon 2, visualizar fichas e exportar dados.

Página: https://miguelmarcus.github.io/MGL-RPG-Creator/

## Recursos

- Editor organizado para monstros, raças, classes, equipamentos e magias.
- Biblioteca de criações salva no navegador.
- Pré-visualização de ficha, envio de imagem e exportação como PNG ou PDF pelo navegador.
- Exportação no formato do importador Foundry para raças (`races`), classes/especializações (`classes`) e magias (`spells`), com IDs estáveis, habilidades, progressões e restrições.
- Exportação estruturada ODC para monstros e equipamentos.
- Interface responsiva construída com Tailwind CSS 4.3 e estilos próprios.
- Páginas separadas para biblioteca, criação, edição e visualização da ficha.

## Estrutura

- `app/`: rotas mínimas do App Router do Next.js.
- `front/`: páginas, componentes isolados (incluindo a sidebar), estado do cliente, persistência local e estilos.
- `back/odc.mjs`: categorias, criação de dados-base, formatação de texto e adaptação para JSON.
- `postcss.config.mjs`: integração do Tailwind CSS 4.3 com PostCSS.
- `.github/workflows/deploy-pages.yml`: publicação estática no GitHub Pages.

O projeto permanece estático e sem API: `back/` agrupa a lógica de domínio compartilhada, não um servidor separado. As criações ficam no armazenamento local do navegador. O PDF é gerado pelo comando de impressão do navegador. O JSON é exportado como arquivo para importação no Foundry.

Para evitar duplicatas ao reimportar raças, classes ou magias, mantenha o mesmo ID de importação. Monstros e equipamentos são exportados no formato ODC; o importador informado aceita raças, classes e magias.
