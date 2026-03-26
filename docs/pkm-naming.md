# Nomenclatura de Arquivos

Fonte de verdade para regras de nomeação de arquivos de conhecimento no repositório. Fluxos e skills não repetem estas regras — apenas apontam para este arquivo.

---

## Prefixo de tipo

Arquivos de URL recebem o prefixo `url_` no slug. Nenhum outro tipo usa prefixo. O tipo é determinado pela estrutura do conteúdo (não pelo frontmatter) e sinalizado exclusivamente pelo prefixo do arquivo.

| Tipo | Prefixo | Exemplo |
|---|---|---|
| URL | `url_` | `url_ibm-technology-rag-vs-long-context.md` |
| Nota | nenhum | `metodo-zettelkasten-visao-geral.md` |
| Artigo | nenhum | `arquitetura-de-agentes.md` |

O prefixo `url_` permite inspeção visual imediata (`ls`) e glob preciso em scripts (`url_*.md`), sem abrir nenhum arquivo.

**Consistência obrigatória:** `/validar-estrutura` verifica que todo arquivo com prefixo `url_` possui campo `url` no frontmatter, e vice-versa.

---

## Formato do slug para URLs

```
url_[autor-ou-conta]_[titulo-resumido].md
```

### Autor/conta primeiro, título depois

O criador/canal é a âncora de agrupamento — `ls` lista por criador, não por tema. Consistente com convenção BibTeX/citekey para referências.

**Para contas de redes sociais:** usar o nome de exibição normalizado para kebab-case, nunca o handle com `@` ou underscores. Exemplos:
- `@jensheitmann_` → `jens-heitmann`
- `@mikemeansbusiness_ai` → `mike-means-business`
- `@hubermanlab` → `huberman-lab`

**Para canais do YouTube:** nome do canal normalizado. Exemplos:
- `IBM Technology` → `ibm-technology`
- `Lex Fridman Podcast` → `lex-fridman`

**Para instituições e marcas:** nome normalizado. Exemplos:
- `Harvard Business Review` → `harvard-business-review`
- `Anthropic` → `anthropic`

**Sem autor identificável:** slug começa diretamente pelo título, sem placeholder.

### Nome completo do autor

Usar nome completo, não apenas sobrenome: `tiago-forte`, `sonke-ahrens`, `nate-jones`. Caracteres especiais normalizados para ASCII: `ö→o`, `ã→a`, `ç→c`, etc.

### Separador entre autor e título

Um hífen simples separa os segmentos (não underscore, não barra). O prefixo `url_` já marca o início; `_` não é repetido internamente.

```
url_ibm-technology-rag-vs-long-context.md
     └─ autor ──────┘└─ título ─────────┘
```

### Título resumido

- 3 a 6 palavras que capturam a essência
- Idioma da fonte (o slug é identificador — manter o idioma original torna a rastreabilidade com a fonte mais direta)

**Palavras a banir do segmento de título:**

| Categoria | Palavras |
|---|---|
| Artigos (pt) | o, a, os, as, um, uma |
| Artigos (en) | the, a, an |
| Preposições curtas (pt) | de, do, da, em, no, na, para, por, com, sobre |
| Conectivos/interrogativos | e, ou, mas, que, como, quando, onde, quem |
| Tipos de conteúdo | artigo, post, postagem, video, aula, tutorial, guia, recurso, link |
| Baixo valor semântico | novo, melhor, top, lista, numero |

---

## Formato do slug para notas e artigos

```
[titulo-resumido].md
```

- Kebab-case, sem prefixo
- 3 a 6 palavras descritivas
- Apenas letras minúsculas, números e hífens
- Sem acentos, cedilhas ou caracteres especiais
- Idioma: português do Brasil

---

## Regras gerais

- Extensão sempre em minúsculas (`.md`, `.svg`, `.pdf`, `.png`)
- Sidecars preservam o nome completo do binário: `arquitetura-de-agentes.svg.md`
- Nenhum espaço, underscore (exceto o `url_` do prefixo) ou caractere especial
- Se houver conflito de nome no destino, adicionar sufixo numérico: `url_ibm-technology-rag-vs-long-context-2.md`

---

## Arquivos do sistema

As regras acima valem para **todo o repositório** — não apenas para arquivos de conhecimento em `pkm/[topico]/`. Arquivos em `docs/`, `.agents/skills/` e demais pastas de infraestrutura também seguem kebab-case.

Resumo da convenção de `_` vs `-`:

| Contexto | Caractere | Exemplos |
|---|---|---|
| Prefixo estrutural de grupo/subtópico | `_` | `_meu-framework/`, `_llms/`, `__inbox/` |
| Prefixo de tipo em arquivo de URL | `_` | `url_ibm-technology-rag.md` |
| Separador de palavras em qualquer slug | `-` | `nota-conceito.md`, `estrutura-de-pastas.md` |
| Root-level standards | MAIÚSCULAS | `README.md`, `AGENTS.md`, `CLAUDE.md` |

`_` é sempre prefixo — nunca separador de palavras.
