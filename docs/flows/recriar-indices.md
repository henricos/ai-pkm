## Recriar Índices

**Skill:** `/recriar-indices`

**Quando usar:** Quando houver suspeita de divergência entre o frontmatter dos arquivos e o índice JSON em `index/`, ou após operações manuais que possam ter desincronizado os dados.

**O que faz:**
- Varre `pkm/*/` recursivamente procurando arquivos `_grupo.md`, extrai o frontmatter de cada um e regenera `index/grupos.json`.
- Apresenta diff resumido (antes vs depois) e aguarda aprovação antes de sobrescrever.
