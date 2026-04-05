# Template — Documento de Ferramenta

Este template define a estrutura, tom e regras de escrita para documentos sobre ferramentas, aplicações, sistemas, serviços, frameworks e bibliotecas.

**Subtipos e particularidades:**
- **Ferramenta/aplicação/serviço** (ex: Claude Code, Figma, Notion) — modelo funciona integralmente sem ajustes.
- **Framework** (ex: Django, React, Spring) — "Visão geral" foca em paradigma e API; "Como surgiu" pode ser mais curto.
- **Biblioteca** (ex: numpy, requests, lodash) — "Visão geral" foca em API e integração; "Preços" pode ser reduzido; "Como surgiu" pode ser 1 parágrafo.
- **Sistema** (ex: PostgreSQL, Kubernetes, Linux) — "Visão geral" foca em arquitetura e componentes.

---

## Estrutura de seções

```
# [Nome da Ferramenta]
[URL oficial]

## O que é
## Como surgiu
## Qual problema resolve
## Público-alvo
## Visão geral do funcionamento
## Funcionamento em detalhe   ← opcional
## Histórico de funcionalidades  ← opcional
## Preços e licenciamento
## Referências
```

---

## Cabeçalho

```
# [Nome da Ferramenta]
[URL oficial — seguir regra de URL das regras gerais]
```

---

## Seções

### `## O que é` — obrigatória

- 2-3 parágrafos
- Define o que a ferramenta é, em que categoria se encaixa e o que faz
- Diferenciais comparativos não são obrigatórios; se surgirem naturalmente no contexto, podem entrar

---

### `## Como surgiu` — obrigatória

- 1-3 parágrafos
- Deve incluir, quando encontrado em fontes confiáveis:
  - Nome do criador ou criadores
  - Cronologia do desenvolvimento (marcos relevantes, não lista exaustiva de versões)
  - Data de lançamento público
  - Se houver empresa por trás: nome da empresa + link externo confiável seguindo a regra de URL
- Para bibliotecas ou projetos onde o histórico de origem é desconhecido ou irrelevante para o entendimento do item, 1 parágrafo é suficiente. Não preencher artificialmente quando não há informação substancial disponível.
- Não inventar informações não encontradas em fontes confiáveis — quando isso ocorrer, a IA deve interromper, avisar o usuário e aguardar direção (ver comportamento da skill)

---

### `## Qual problema resolve` — obrigatória

- 2-3 parágrafos
- Foca na fricção que a ferramenta remove
- Deve incluir pelo menos um cenário concreto (não abstrato)
- Comparações com alternativas podem entrar aqui quando fizerem sentido contextual

---

### `## Público-alvo` — obrigatória

- 3-5 bullets de personas ou cenários de uso
- Cada bullet descreve quem usa e em que contexto
- Para frameworks e bibliotecas, evitar bullets genéricos como "desenvolvedores Python" — especificar o contexto de uso e tipo de problema (ex: "engenheiros de ML que precisam manipular arrays numéricos de alta performance")

---

### `## Visão geral do funcionamento` — obrigatória

- 2-3 parágrafos
- O foco varia por subtipo:
  - **Ferramenta/serviço**: cobre o fluxo de uso ponta a ponta (não lista features)
  - **Framework**: cobre o paradigma central e como ele estrutura o código do usuário; snippet de uso básico é especialmente importante aqui
  - **Biblioteca**: cobre a API de uso e como a lib se integra no ecossistema; snippet de uso é obrigatório
  - **Sistema**: cobre a arquitetura de componentes principais e o fluxo de dados/requests
- Inclui snippet de uso básico quando aplicável (code block)

---

### `## Funcionamento em detalhe` — opcional

- H3s por componente ou funcionalidade
- Cada H3 tem pelo menos um parágrafo substantivo (não apenas bullets)
- Tabelas para comparações estruturadas (ex: flags de CLI)

---

### `## Histórico de funcionalidades` — opcional

```
## Histórico de funcionalidades
[link para release notes — seguir regra de URL — omitir se não houver página pública]

- **[Mês Ano]** — **[Nome da feature ou versão]**: descrição curta do impacto
- **[Mês Ano]** — **[Nome da feature ou versão]**: ...
```

- A IA deve avaliar o perfil da ferramenta:
  - Se a ferramenta é conhecida por versionar com majors (v2, v5...) — focar nas versões major como âncoras do histórico
  - Se não tem ciclo de majors evidente — focar nas mudanças de paradigma: funcionalidades que alteraram significativamente o produto ou o uso
- **Peso de impacto público:** independentemente do critério acima, a IA deve garantir que momentos de grande repercussão estejam no histórico — lançamentos amplamente citados na mídia especializada, em redes sociais ou em comparações com concorrentes. Se um anúncio gerou buzz notável no momento do lançamento, ele não pode ficar de fora mesmo que não seja uma versão major nem a maior funcionalidade técnica
- Excluir patches e atualizações incrementais sem repercussão
- Um bullet por item: data em negrito + nome/versão em negrito + 1 frase descrevendo o impacto
- Data no formato `Mês Ano` quando conhecida, ou só `Ano` quando o mês não for encontrado
- Seção omitida quando a ferramenta for muito nova ou não tiver histórico público relevante

---

### `## Preços e licenciamento` — obrigatória

- **Open-source**: informar que é gratuito, nome da licença (MIT, Apache 2.0, GPL, etc.) e o que ela permite ou restringe (uso comercial, fork, redistribuição)
- **Comercial/freemium**: planos, preços, limitações do plano gratuito se houver
- Incluir data de referência dos preços pesquisados (ex: "preços verificados em março de 2026")
- Para bibliotecas ou itens puramente open-source sem planos comerciais e sem nuances de licença relevantes, 1-2 frases são suficientes — não é necessário preencher artificialmente

---

### `## Referências` — obrigatória

- Tente ter entre 2 e 5 links (não obrigatório atingir mínimo ou máximo)
- Somente links verificados: devem existir E ser boas referências (página oficial, site de empresa relevante; raramente uma página pessoal desconhecida — na dúvida, interromper e perguntar ao usuário antes de incluir)
- Seguir a regra de URL das regras gerais
- **Vídeos do YouTube:** além de links textuais, a IA deve buscar e sugerir vídeos do YouTube com boa aderência ao conteúdo do documento — priorizar vídeos com muitos likes, de canais com autoridade no tema ou de publicadores reconhecidos. A sugestão deve ser apresentada ao usuário para validação na revisão final antes de incluir

---

## Regras gerais de escrita

- Tom: direto e informativo; sem floreio ou superlativo
- **Negrito** na primeira menção de termos-chave
- Bullet para listas de 3+ itens; tabelas para comparações estruturadas
- Code blocks para snippets e comandos
- Parágrafos de 3-5 frases
- Português brasileiro natural (não acadêmico, não jornalístico)

### Formato de URL

Aplicado em qualquer ponto do documento onde um link for necessário:

```
[https://url-limpa.com/caminho](https://url-limpa.com/caminho) — descrição resumida do que tem no link
```

- A URL é o próprio label do link (não texto descritivo separado)
- URL deve ser limpa: sem parâmetros de rastreamento, sem redirects desnecessários

### Proibido

- Introduções genéricas ("No mundo atual...", "Nos dias de hoje...")
- Afirmações sobre popularidade ou qualidade sem fonte ou evidência
- Seções com apenas 1-2 frases quando o conteúdo claramente precisa de mais substância
- Repetição de informação entre seções — cada seção tem recorte exclusivo
- Dados que se desatualizam rapidamente sem âncora temporal — se for importante citar (ex: número de estrelas no GitHub, downloads), incluir a data: "tinha 45 mil estrelas em março de 2026"
- Inventar informações não encontradas em fontes confiáveis — quando isso ocorrer, a IA deve interromper, avisar o usuário e aguardar direção
