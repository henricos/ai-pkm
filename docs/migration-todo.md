# migration-todo.md

Lista de pendências da migração do sistema antigo (`ai-pkm` legado) para este repositório. O sistema antigo foi separado em dois repositórios: `pkm` (conteúdo, privado) e `ai-pkm` (plataforma, público). Esta lista rastreia o que ainda precisa ser ajustado, decidido ou criado para completar essa transição.

Para consulta do sistema antigo, pode existir uma cópia local não rastreada pelo Git em `backup-ai-pkm/` na raiz deste projeto. Essa pasta está no `.gitignore` e nunca deve ser commitada.

---

## Estado atual da migração

### Banco de dados transitório

Embora o sistema esteja arquitetado para usar SQLite como banco de dados, a migração foi feita mantendo os índices JSON como mecanismo de persistência transitório. Os três índices foram movidos de `sistema/indices/` do repositório legado para a pasta `index/` na raiz deste projeto:

- `index/topicos.json` — taxonomia de tópicos válidos
- `index/grupos.json` — catálogo de grupos derivado do frontmatter
- `index/templates.json` — catálogo de modelos disponíveis (o nome "templates" é legado; o conceito foi renomeado para "modelos" neste projeto)

As skills e scripts ainda dependem desses arquivos para funcionar. A migração para SQLite é trabalho futuro; enquanto isso, `index/` é o banco de dados do sistema.

---

### Mudança de convenção de prefixos no `pkm` (breaking change)

A separação do sistema do conteúdo permitiu simplificar os prefixos de pastas no repositório `pkm`. A pasta `sistema/` foi removida do `pkm`, eliminando a ambiguidade que antes justificava o uso do prefixo `_` em tópicos.

| Elemento | Convenção antiga | Convenção nova |
|---|---|---|
| Pasta de tópico | `_topico/` (prefixo `_`) | `topico/` (sem prefixo) |
| Pasta de grupo | sem prefixo, dentro de tópico | `_grupo/` (prefixo `_`) |
| Arquivo manifest de grupo | `_grupo.md` | `_grupo.md` (inalterado) |
| Inbox | `__inbox/` (prefixo `__`) | `__inbox/` (inalterado) |

Com isso: tópicos ficam limpos (sem prefixo), grupos assumem o `_` de forma consistente com o `_grupo.md` que os identifica, e a inbox mantém o `__`.

---

### Refatoração do frontmatter de conhecimento (breaking change)

O schema de frontmatter foi revisado para remover campos derivados e estados operacionais. O princípio adotado: o frontmatter contém apenas campos intrínsecos e estáveis — o que não pode ser inferido da estrutura de pastas, do nome do arquivo ou do estado do sistema.

| Campo | Situação | Justificativa |
|---|---|---|
| `descricao` | **Removido** | Derivável do conteúdo do arquivo |
| `topico` | **Removido** | Derivável da pasta onde o arquivo está |
| `tipo` | **Removido** | Derivável do prefixo `url_` no nome do arquivo |
| `processado` | **Removido** | Estado operacional; não pertence ao frontmatter |
| `maturidade` | **Removido** | Estado operacional; não pertence ao frontmatter |
| `ambito` | **Removido** | Campo de uso inconsistente |
| `formato` | **Fundido em `modelo`** | Antes exclusivo de `tipo: url` (extrato \| resumo) |
| `template` | **Renomeado para `modelo`** | Antes exclusivo de `tipo: nota`; conceito unificado |
| `modelo` | **Novo** | Campo unificado que substitui `formato` e `template`; presente quando aplicável em qualquer tipo |
| `url` | Mantido | Inalterado |
| `autores` | Mantido | Inalterado |
| `data_captura` | Mantido | Inalterado |
| `data_publicacao` | Mantido | Inalterado |

O arquivo `docs/schemas/frontmatter-conhecimento.md` ainda reflete o schema antigo e precisa ser atualizado (ver tarefa 2).

---

## Tarefas pendentes

- [x] **1. Código + Documentação** — Atualizar referências de caminho em `.agents/skills/` e `docs/` para refletir a nova estrutura de pastas e a nova localização dos índices

  Os scripts Python em `.agents/skills/*/scripts/` foram portados sem adaptação e ainda contêm caminhos antigos como `sistema/indices/`, `_*/`, `__inbox/`. Os SKILL.md e specs em `docs/flows/` tiveram substituições parciais mas podem ter referências residuais. Os arquivos de documentação de convenção (`docs/pkm-conventions.md`, `docs/pkm-structure.md`, `docs/pkm-naming.md`) descrevem a convenção antiga de prefixos e precisam refletir a nova. Fazer grep sistemático por `sistema/indices`, `sistema/esquemas`, `sistema/convencoes`, `_*/` e `pkm/sistema` em todos os arquivos `.md` e `.py` do projeto para mapear e corrigir todas as ocorrências. Atualizar o `AGENTS.md`: seção "Busca de conteúdo" para apontar para `index/grupos.json` e `index/topicos.json`; seção "Regras universais" para refletir os novos prefixos de pastas.

- [x] **2. Código + Documentação** — Adaptar skills, scripts e schemas ao novo frontmatter

  O schema de frontmatter mudou (ver seção "Refatoração do frontmatter" acima). Os impactos são: (a) `docs/schemas/frontmatter-conhecimento.md` ainda tem o schema antigo — reescrever refletindo os campos novos; (b) skills que liam ou escreviam campos removidos precisam de adaptação de lógica — as mais afetadas são `/triar` (escrevia `tipo`, `formato`, `processado`, `maturidade`, `template`), `/processar-url` (lia `formato`, escrevia `processado: true`), `/criticar-url` e `/readequar-url` (liam `formato` e `processado`), `/criar-nota` e `/criticar-nota` (liam/escreviam `maturidade` e `template`), `/validar-estrutura` (validava campos do schema antigo); (c) scripts Python que manipulam frontmatter precisam usar os novos campos; (d) o arquivo `index/templates.json` usa o nome legado "templates" — avaliar se deve ser renomeado para `index/models.json` e atualizar as referências.

- [ ] **3. Código** — Montar o repositório `pkm` em `pkm/` na raiz deste projeto

  O repositório `pkm` (privado, em `github.com/henricos/pkm`) deve ser clonado ou montado como pasta `pkm/` na raiz do `ai-pkm`. Essa pasta já está no `.gitignore`. Sem ela, nenhuma skill operacional funciona — todas dependem de `pkm/__inbox/` e `pkm/topico/`.

- [x] **4. Documentação** — Definir localização definitiva dos modelos de nota e mover de `docs/schemas/`

  Os arquivos `nota-conceito.md`, `nota-empresa.md`, `nota-ferramenta.md`, `nota-procedimento.md` e `url-resumo.md` estão temporariamente em `docs/schemas/` junto com os contratos de frontmatter (`frontmatter-conhecimento.md`, `frontmatter-grupo.md`). Modelos são artefatos operacionais — o agente os lê e aplica ao criar e readequar notas. Por isso não pertencem em `docs/`. Candidato natural: `.agents/models/`, seguindo o padrão de `.agents/skills/`. Decidir o local definitivo, mover os arquivos, atualizar as referências nas skills e em `AGENTS.md`.

- [ ] **5. Documentação** — Documentar no `AGENTS.md` a convenção de trabalho com SDD, `docs/specs/` e OpenSpec

  O projeto adota Spec-Driven Development (SDD): antes de implementar qualquer feature, uma spec é escrita em `docs/specs/` descrevendo o comportamento esperado. O agente deve ler a spec antes de implementar e atualizar a spec se o comportamento mudar. OpenSpec é o formato/ferramenta de especificação usado. Essa convenção ainda não foi documentada no `AGENTS.md`. Adicionar uma seção explicando o fluxo: spec em `docs/specs/` → implementação → atualização da spec. Consultar `backup-ai-pkm/_tecnologia/openspec.md` e `backup-ai-pkm/_tecnologia/spec-driven-development-ia.md` para contexto.

- [ ] **6. Documentação** — Preencher seções TODO em `docs/architecture.md`

  As seguintes seções estão marcadas como `> TODO` e precisam ser preenchidas em sessão dedicada: (a) **Estrutura de diretórios** — ainda não há código no repo, então esta seção será a primeira definição da árvore de pastas do projeto Node.js/Next.js; (b) **Modelo de dados principal** — entidades centrais: itens do PKM, grupos, tópicos, sessões do agente, operações; (c) **Fluxo de dados do caso mais crítico** — execução de skill com proposta de mudança, aprovação do usuário e commit no pkm; (d) **Convenções de código** — TypeScript, Zod, Drizzle, padrões de Route Handler. Stack de referência já está na tabela da seção "Stack" do mesmo arquivo.

- [x] **7. Documentação** — Remover nota desatualizada em `docs/prd.md`

  Na seção "Fluxos operacionais suportados na v1", a última linha diz `Specs detalhadas de cada fluxo ficam em \`docs/flows/\` (a criar em sessão dedicada).` A pasta `docs/flows/` já existe com os 13 specs. Remover o trecho `(a criar em sessão dedicada)` ou reescrever a linha para refletir que as specs já existem.

- [ ] **8. Documentação** — Expandir `README.md`

  O README atual é mínimo. Adicionar: (a) parágrafo sobre o modelo humano/IA — "O humano deposita itens e toma decisões; a IA é a única escritora de arquivos no acervo"; (b) seção "Fluxos de trabalho" com menção breve às skills e link para `docs/flows/`; (c) seção "Integração com IA" mencionando que o repo é agnóstico de ferramenta via `AGENTS.md`, com suporte nativo a Claude Code, Cursor, Antigravity e Codex CLI. Consultar `backup-ai-pkm/README.md` para referência do texto original.

- [ ] **9. Documentação** — Criar `design.md` com o padrão de Design System

  O projeto usa Ant Design + Tailwind CSS com design tokens centralizados em `tailwind.config.ts`. O `design.md` é um arquivo de referência lido pelo agente antes de gerar código de UI, garantindo que qualquer geração respeite as restrições visuais do sistema. Deve conter: tokens de cores, espaçamento e tipografia; como os tokens alimentam tanto o Tailwind quanto o `ConfigProvider` do Ant Design; convenções de uso de componentes Ant Design; padrão de classes Tailwind para layout e espaçamento. Consultar `backup-ai-pkm/_tecnologia/padrao-design-md.md` e `backup-ai-pkm/_tecnologia/design-tokens.md` para referência.
