---
name: criticar-nota
description: Avalia a qualidade do conteúdo de uma nota existente — identifica o que está incorreto, mal escrito, raso ou desatualizado — e, com aprovação, conduz sessão interativa de revisão e complemento com pesquisa externa. Use esta skill sempre que o usuário quiser criticar uma nota, checar se o conteúdo está bom, identificar problemas de qualidade, atualizar algo desatualizado, ou pedir que o conteúdo de uma nota seja melhorado — mesmo que não diga explicitamente "criticar nota".
command: /criticar-nota
---

# SKILL: Crítica de Nota

## Instruções de Execução do Agente

Esta skill implementa o fluxo descrito em `docs/flows/criticar-nota.md`. Lê, analisa e critica a qualidade do conteúdo — e, com aprovação do usuário, entra numa sessão interativa de revisão e complemento com pesquisa externa.

> Se a ferramenta oferecer widget nativo de perguntas (ex: `AskUserQuestion`), use-o para todas as perguntas com opções. Caso contrário, apresente as opções numeradas. Prefira sempre múltipla escolha a perguntas abertas quando a resposta esperada for previsível.

---

## Passo 1: Detecção do Alvo

- **Com argumento** (ex: `/criticar-nota _tecnologia/claude-code-web.md`) → usa o arquivo informado diretamente.
- **Sem argumento** → pergunte ao usuário qual arquivo deseja criticar.

---

## Passo 2: Leitura

Leia o arquivo completo, incluindo o frontmatter.

---

## Passo 3: Localização do Template

Leia o campo `template` do frontmatter da nota.

- **Campo presente**: construa o caminho `docs/schemas/[valor].md` e leia o arquivo. Prossiga para Passo 5a.
- **Campo ausente**: informe ao usuário que a nota não tem template associado e prossiga com análise livre (Passo 5b).

---

## Passo 5a: Crítica de Qualidade (com template)

O template é usado como régua de qualidade — não como mandato estrutural.

Assuma o papel de alguém tentando aprender com o conteúdo pela primeira vez. Para cada seção presente, avalie:

- **Clareza e didatismo**: a seção é compreensível para quem não conhece o assunto?
- **Tom e estilo**: está de acordo com as regras gerais do template?
- **Extensão**: está dentro da faixa orientativa do template?
- **Profundidade**: atende às regras de profundidade mínima do template?
- **Completude**: o que a seção deveria cobrir e não cobre?
- **Atualização**: há afirmações desatualizadas, incorretas ou sem suporte?
- **Proibições**: alguma violação do campo "Proibido" do template?

---

## Passo 5b: Análise Livre (sem template)

Quando não houver template disponível, avalie o documento sem referência a estrutura fixa. Sinalize explicitamente que a análise é livre. Foque em:

- Clareza e progressão lógica do conteúdo
- Coesão entre as partes
- Tom e adequação ao público esperado
- Profundidade e completude geral
- Afirmações desatualizadas ou sem suporte

Não emita críticas estruturais — apenas qualitativas.

---

## Passo 6: Validação de Fatos (opcional)

Após apresentar a crítica, pergunte ao usuário:

> "Quer que eu valide fatos, datas ou afirmações do documento via pesquisa?"

Se sim: pesquise e aponte divergências ou confirmações para os pontos factuais relevantes.

> Se a ferramenta oferecer widget nativo de perguntas (ex: `AskUserQuestion`), use-o. Caso contrário, apresente as opções numeradas.

---

## Passo 7: Apresentação da Crítica e Proposta de Revisão

Apresente a crítica consolidada de forma direta e acionável. Evite críticas genéricas — sempre aponte o trecho ou seção específica e explique o problema.

Em seguida, pergunte ao usuário (via `AskUserQuestion`):

> "Quer entrar numa sessão de revisão e complemento agora?"

Opções:
- **Sim — entrar na sessão de revisão** (usa o conteúdo existente como base, pesquisa para complementar e melhorar)
- **Não — só a crítica** (encerra aqui)
- **Criticar outro arquivo**

> Esta opção só aparece quando há template disponível (não se aplica à análise livre).

---

## Passo 8: Sessão de Revisão e Complemento (somente se o usuário escolheu "entrar na sessão")

**Natureza:** interativa, pesquisa-intensiva. A nota existente é o fio condutor — o objetivo é complementar e melhorar, não substituir a voz e a linha de raciocínio originais.

**Calibração de esforço ao longo da sessão:**

Após cada rodada de pesquisa ou reescrita, pergunte:

> *"Já parece bom ou quer pesquisar mais? Podemos aprofundar [tema X] ou mudar para [direção Y]."*

Aguarde direção do usuário: continuar, aprofundar, mudar de direção ou encerrar.

**Execução:**

1. **Preservar** o conteúdo das seções que passaram na crítica sem alteração.
2. **Melhorar qualidade por seção**: expandir ou reescrever seções com problemas de qualidade conforme as regras do template.
3. **Pesquisar o que realmente faltar** (use `WebSearch`/`WebFetch` somente para o que não puder ser resolvido com o conteúdo existente):
   - Seções com conteúdo factual genuinamente ausente ou desatualizado
   - Seções rasas sem material suficiente no documento original
   - As referências já citadas no documento são pontos de partida — vá além delas, mas mantenha a linha de raciocínio do documento original.
4. **Sinalizar mudanças transformadoras**: se as mudanças forem tão extensas que alterariam fundamentalmente o ângulo ou a tese do documento, pausar e perguntar ao usuário antes de prosseguir.
5. **Apresentar o documento revisado completo**, destacando explicitamente: seções novas, seções expandidas, seções alteradas.
6. **Aguardar aprovação explícita** antes de escrever no arquivo.
7. **Escrever no arquivo** após aprovação (mesmo arquivo, substituição completa do conteúdo).
8. **Transição de maturidade**: perguntar se quer marcar como `maturidade: maduro`.

**Regras da sessão de revisão:**
- Nunca inventar informações — se não encontrar via pesquisa, sinalizar a lacuna ao usuário e aguardar direção.
- Preservar a voz e a linha de raciocínio do documento original.
- Template como régua de qualidade — não como mandato estrutural.

---

## Arquivos de Referência

- `docs/flows/criticar-nota.md` — especificação do fluxo
- `sistema/indices/templates.json` — catálogo de templates disponíveis (campo `template` do frontmatter aponta para um deles)
