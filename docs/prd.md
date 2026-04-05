# PRD — ai-pkm v1

## Objetivos mensuráveis da v1

- Navegar a estrutura completa do repositório `pkm` via interface web (tópicos, subtópicos, grupos, arquivos soltos, inbox)
- Disparar qualquer skill existente a partir da UI e acompanhar execução em tempo real
- Aprovar ou rejeitar mudanças propostas pelo agente sem sair do navegador
- Receber e incorporar automaticamente mudanças feitas via CLI (push externo) sem intervenção manual
- Manter operação local via CLI (Claude Code, Cursor, Codex) sem conflito com a operação web

---

## Fluxos operacionais suportados na v1

O sistema deve suportar a execução de todos os fluxos abaixo via interface web e via CLI local, sem modificação das skills:

- `/anotar` — captura rápida para a inbox
- `/triar` — classifica itens da inbox, propõe destino e cria estrutura necessária
- `/criar-nota` — abre sessão para desenvolver rascunho ou síntese
- `/criticar-nota` — avalia qualidade, lacunas e clareza de notas
- `/criticar-url` — avalia resumos de URL comparando com o texto-fonte
- `/readequar-nota` — alinha nota a modelo novo ou atualizado
- `/readequar-url` — alinha resumo de URL a modelo novo ou atualizado
- `/processar-url` — transforma itens `tipo: url` pendentes em conteúdo útil (suporta web, PDF, YouTube, Instagram, TikTok)
- `/criar-grupo` — cria um novo grupo dentro de um tópico
- `/reorganizar-topicos` — reorganiza a estrutura de tópicos da base
- `/recriar-indices` — reconstrói os índices derivados do sistema
- `/validar-estrutura` — verifica invariantes da base
- `/commit-push` — encerramento Git com mensagem em Conventional Commits

Specs detalhadas de cada fluxo ficam em `flows/`.

---

## Requisitos funcionais

### Navegação e visualização

**RF-01** — A interface exibe a estrutura real do repositório `pkm` em árvore: tópicos (`_topico/`), subtópicos, grupos (pasta com `_grupo.md`) e arquivos soltos.

**RF-02** — Arquivos Markdown são renderizados com seu conteúdo.

**RF-03** — Binário e sidecar são tratados como um único item lógico: a visualização principal exibe o binário (imagem, diagrama, PDF); o conteúdo textual do sidecar fica em aba ou drawer complementar. O sidecar não aparece como arquivo separado na árvore.

**RF-21** — O sistema impede que um binário saia da inbox sem sidecar associado. Um binário na inbox sem sidecar está em estado incompleto e não pode ser triado para a base estruturada.

**RF-04** — A inbox (`__inbox/`) é exibida com destaque, mostrando itens pendentes de triagem.

### Execução agentica e console

**RF-05** — Skills podem ser disparadas a partir de botões contextuais na interface ou de uma paleta de comandos global.

**RF-06** — Existe um único console global de execução, persistente e retomável, compartilhado por toda a aplicação.

**RF-07** — O console reflete o estado atual da sessão com pelo menos cinco estados: `ocioso`, `executando`, `aguardando usuário`, `concluído`, `erro`.

**RF-08** — Um indicador persistente visível fora do console informa o estado atual, permitindo ao usuário saber se há algo em andamento ou pendente sem abrir o console.

**RF-09** — O console pode ser aberto, fechado e minimizado sem interromper a execução em andamento.

**RF-10** — O console é retomável após fechar e reabrir o navegador, reencontrando o processo no estado em que ficou — inclusive quando houver pendência aguardando resposta do usuário.

**RF-11** — O sistema executa uma ação por vez. Um lock impede o início de nova ação enquanto houver sessão ativa.

**RF-12** — O usuário interage com o agente dentro do console: responde perguntas, aprova propostas e rejeita mudanças sem sair da interface.

### Sincronização

**RF-13** — A aplicação recebe webhook de push do GitHub e atualiza seu clone local do repositório `pkm`.

**RF-14** — Após receber webhook, a aplicação executa reindexação incremental comparando o commit anterior com o novo.

**RF-15** — Antes de iniciar qualquer ação relevante, a aplicação verifica se o clone local do `pkm` está sincronizado com o remoto e se o banco já indexou o último commit conhecido.

**RF-16** — Quando desincronização é detectada, a aplicação sincroniza e reindexo automaticamente antes de prosseguir.

### Backup e persistência

**RF-17** — A cada operação que alterar o conteúdo do `pkm`, a aplicação gera um commit local no repositório.

**RF-18** — A cada operação que alterar o estado do sistema, a aplicação gera um snapshot do banco SQLite.

**RF-19** — Uma vez ao dia, o repositório `pkm` é enviado (push) para o remoto automaticamente.

**RF-20** — Uma vez ao dia, os backups do banco são copiados para um local seguro.

---

## Requisitos não-funcionais

**RNF-01** — Single-user por design: sem concorrência, execução serial, sem autenticação multi-conta.

**RNF-02** — Self-hosted em container único. Frontend, BFF e agente rodam no mesmo processo Node.js.

**RNF-03** — O repositório `pkm` é a fonte primária de verdade do conteúdo. O banco SQLite é um índice derivado e reconstruível.

**RNF-04** — Skills devem funcionar identicamente via interface web e via CLIs locais (Claude Code, Cursor, Codex) sem modificação.

**RNF-05** — Saídas do agente são validadas por Zod antes de chegarem à UI ou ao banco.

**RNF-06** — A aplicação nunca opera sobre um estado desatualizado do `pkm` antes de iniciar ações relevantes.

---

## Fluxos críticos

### Fluxo 1 — Disparo de skill pela UI

1. Usuário seleciona skill na interface (ex: `/triar`)
2. Sistema verifica lock — rejeita se há execução ativa
3. Sistema verifica sincronização do clone local do `pkm`
4. Se desync detectado: sincroniza e reindexo antes de prosseguir
5. Sistema cria sessão no Agent SDK; registra metadados (`session_id`, tipo de ação, arquivos envolvidos, status, timestamps)
6. Console global atualiza para estado `executando`; streaming via SSE
7. Agente executa skill e propõe mudanças
8. Console muda para `aguardando usuário`; indicador persistente ativa
9. Usuário aprova ou rejeita dentro do console
10. Agente conclui; gera commit local no `pkm` + snapshot do banco
11. Console muda para `concluído`; lock é liberado

### Fluxo 2 — Sincronização após push externo (operação local via CLI)

1. Usuário opera localmente via CLI, faz commit e push no `pkm`
2. GitHub dispara webhook para a aplicação web
3. Aplicação recebe webhook; atualiza clone local do `pkm`
4. Compara hash do commit anterior com o novo
5. Executa reindexação incremental dos arquivos alterados
6. Atualiza banco com novos metadados
7. Interface reflete a estrutura atualizada sem ação do usuário

---

## Decisões de produto já tomadas

**Dois repositórios separados (`pkm` privado + `ai-pkm` público)**
O conteúdo deve ser privado e portável. Ferramentas de terceiros não precisam conhecer a lógica do sistema para consumir o acervo. Alternativa rejeitada: monorepo — exporia conteúdo privado ou acoplaria indevidamente infraestrutura e dados.

**Acesso ao `pkm` por filesystem/volume, não por submodule nem API**
Submodule cria acoplamento de versionamento; API REST adiciona latência e complexidade desnecessárias para sistema single-user. Volume montado é simples, direto e já funciona em dev e em runtime.

**Um console global, não múltiplos chats ou terminais paralelos**
O modelo é serial por design. Múltiplas sessões paralelas não fazem sentido operacional e complicariam o gerenciamento de estado.

**Banco como índice derivado e reconstruível**
A semântica essencial do conteúdo vive no frontmatter e na estrutura de pastas. Tornar o banco a fonte de verdade quebraria compatibilidade com a operação local via CLI e tornaria o sistema frágil.

**Frontmatter enxuto — sem campos derivados ou operacionais**
Campos como `topico`, `tipo`, `processado`, `maturidade` e `ambito` são deriváveis da estrutura de pastas, do padrão de nome do arquivo ou do estado do sistema. Mantê-los no frontmatter criaria inconsistências entre operação local e web. Permanecem apenas campos intrínsecos e estáveis: `url`, `modelo`, `autores`, `data_captura`, `data_publicacao`.

**SQLite na v1, sem busca vetorial**
Simplicidade máxima e zero infraestrutura extra para o caso de uso atual. Busca semântica fica para v2, quando será avaliado sqlite-vec ou migração para PostgreSQL + pgvector.

---

## Itens em aberto

- Mecanismo exato de lock para execução serial (in-memory, tabela no banco, arquivo de lock?)
- Formato e localização dos snapshots do banco
- Estratégia para "local seguro" do backup diário do banco (segundo diretório, serviço externo?)
- Autenticação da aplicação web (ou ausência intencional para uso local em rede privada)
- Notificação ao usuário quando o console tem pendência aguardando resposta (badge, som, push notification?)

---

## Fora de escopo

- Multi-usuário — nunca, por design
- Colaboração em tempo real — nunca
- Editor de Markdown inline na UI — [v2]
- Criação de tópicos e grupos diretamente pela UI sem agente — [v2]
- Busca semântica e vetorial — [v2]
- Hospedagem cloud / serverless — [v2]
- Aplicativo mobile — [v2]
