# ODC — Oficina de Criação

Aplicação modular para criar conteúdo de Old Dragon 2, visualizar fichas e exportar dados.

Página: https://miguelmarcus.github.io/MGL-RPG-Creator/

## Recursos

- Editor organizado para monstros, raças, classes, equipamentos e magias.
- Biblioteca de criações salva no navegador.
- Pré-visualização de ficha, envio de imagem e impressão/salvamento em PDF pelo navegador.
- Exportação no formato do importador Foundry para raças (`races`), classes/especializações (`classes`) e magias (`spells`), com IDs estáveis, habilidades, progressões e restrições.
- Exportação estruturada ODC para monstros e equipamentos.
- Interface responsiva construída com Tailwind CSS e estilos próprios.

## Estrutura

- `app/`: entrada Next.js, metadados e estilos globais.
- `components/odc/`: biblioteca, formulário modular e prévia da ficha.
- `lib/odc.mjs`: categorias, exemplo inicial e adaptação para JSON.
- `.github/workflows/deploy-pages.yml`: publicação estática no GitHub Pages.

As criações ficam no armazenamento local do navegador. O PDF é gerado pelo comando de impressão do navegador. O JSON é exportado como arquivo para importação no Foundry.

Para evitar duplicatas ao reimportar raças, classes ou magias, mantenha o mesmo ID de importação. Monstros e equipamentos são exportados no formato ODC; o importador informado aceita raças, classes e magias.
