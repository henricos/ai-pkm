## Recriar Índices

**Skill:** `/recriar-indices`

**Quando usar:** Quando houver suspeita de divergência entre o frontmatter dos arquivos e o índice JSON em `sistema/indices/`, ou após operações manuais que possam ter desincronizado os dados.

**O que faz:**
- Varre `pkm/_*/` recursivamente procurando arquivos `_grupo.md`, extrai o frontmatter de cada um e regenera `pkm/sistema/indices/grupos.json`.
- Apresenta diff resumido (antes vs depois) e aguarda aprovação antes de sobrescrever.
