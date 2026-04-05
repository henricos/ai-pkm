## Crítica de Nota

**Skill:** `/criticar-nota`

**Quando usar:** Para avaliar a qualidade do conteúdo de uma nota existente — identificar o que está incorreto, mal escrito, raso ou desatualizado — e, com aprovação, entrar numa sessão interativa de revisão e complemento. A pesquisa externa é central nesta etapa.

---

**O que faz:**
- Localiza o modelo do documento a partir do campo `modelo` no frontmatter
- Usa o template como régua de qualidade — não como mandato estrutural
- Assume o papel de alguém tentando aprender com o conteúdo — avalia se é didático, direto e claro
- Gera uma crítica de qualidade por seção
- Oferece validação opcional de fatos e datas via pesquisa
- Pergunta se o usuário quer entrar numa sessão de revisão e complemento; se sim, conduz sessão interativa de pesquisa e reescrita
- Nunca edita arquivos sem aprovação explícita do usuário

---

**Localização do modelo:**

O campo `modelo` no frontmatter aponta diretamente para o arquivo de modelo em `models/`. Exemplo: `modelo: nota-ferramenta` → `models/nota-ferramenta.md`. O catálogo completo está em `index/models.json`.

---

**Fluxo:**

```
DETECÇÃO DO ALVO
  Se argumento fornecido → usa o arquivo informado
  Se sem argumento → pergunta ao usuário qual arquivo deseja criticar

LEITURA
  IA lê o arquivo completo

LOCALIZAÇÃO DO MODELO
  IA lê o campo `modelo` do frontmatter
  Se campo presente → constrói caminho models/[valor].md e lê o arquivo
  Se campo ausente → prossegue com análise livre (ver abaixo)

ANÁLISE LIVRE (quando sem template)
  IA avalia o documento sem referência a template fixo
  Foco em: clareza, coesão, progressão lógica, profundidade, tom
  Não emite críticas estruturais — apenas qualitativas

LEITURA DO TEMPLATE (quando template disponível)
  IA lê o template selecionado

CRÍTICA DE QUALIDADE (por seção presente)
  O template é usado como régua de qualidade, não como mandato estrutural
  A IA assume o papel de alguém tentando aprender com o conteúdo:
  avalia se cada seção é didática, direta e clara para esse leitor
  Tom e estilo (aderência às regras gerais do template)
  Extensão (dentro da faixa orientativa)
  Profundidade mínima (conforme regras do template)
  Completude (o que a seção deveria cobrir e não cobre)
  Incorreções, desatualização, afirmações sem suporte
  Violações do campo "Proibido"

VALIDAÇÃO DE FATOS (passo opcional)
  Ao final da crítica, perguntar ao usuário:
  "Quer que eu valide fatos, datas ou afirmações do documento via pesquisa?"
  Se sim → IA pesquisa e aponta divergências ou confirmações

APRESENTAÇÃO DA CRÍTICA
  IA apresenta a crítica consolidada de forma direta e acionável
  Crítica é específica: aponta seção ou trecho concreto e explica o problema

PROPOSTA DE REVISÃO
  Perguntar ao usuário (via AskUserQuestion):
  "Quer entrar numa sessão de revisão e complemento agora?"
  Opções:
    → Sim — entrar na sessão de revisão
    → Não — só a crítica (encerra aqui)
    → Criticar outro arquivo

SESSÃO DE REVISÃO E COMPLEMENTO (só se o usuário aprovou)
  Natureza: interativa, pesquisa-intensiva, complementa o fio do documento existente
  A nota existente é o ponto de partida — o objetivo é complementar e melhorar, não substituir
  Calibração de esforço ao longo da sessão:
    Após cada rodada de pesquisa/reescrita, IA pergunta:
      "Já parece bom ou quer pesquisar mais? Podemos aprofundar X ou mudar para Y."
    Usuário direciona: continuar, aprofundar, mudar direção ou encerrar
  Execução:
    1. Preservar seções que passaram na crítica sem alteração.
    2. Melhorar qualidade por seção conforme regras do template.
    3. Pesquisar o que realmente faltar (WebSearch/WebFetch):
       - Seções com conteúdo factual genuinamente ausente
       - Seções rasas sem material suficiente no documento original
       - Referências já citadas são pontos de partida; a IA pode ir além,
         mantendo a linha de raciocínio do documento original.
    4. Sinalizar ao usuário se as mudanças forem tão extensas que alterariam
       fundamentalmente o ângulo ou tese do documento; aguardar confirmação.
    5. Apresentar o documento revisado completo, destacando:
       seções novas, seções expandidas, seções alteradas.
    6. Aguardar aprovação explícita antes de escrever no arquivo.
    7. Escrever no arquivo após aprovação (mesmo arquivo, substituição completa).
    8. Perguntar se quer marcar como estado: finalizado.
```

---

**Interação:**
- Usar `AskUserQuestion` (widget nativo) sempre que possível para perguntas com opções
- Fallback: opções numeradas quando o widget não estiver disponível
- Preferir múltipla escolha a perguntas abertas sempre que a resposta esperada for previsível

**Comportamento:**
- Nunca escreve em arquivos sem aprovação explícita do usuário.
- Crítica é específica e acionável — não genérica.
- Se o subtipo não for identificável, tenta resolver com o usuário antes de prosseguir.
- Análise livre (sem template) é explicitamente sinalizada como tal.
- Na sessão de revisão: preservar a voz e a linha de raciocínio do documento original; nunca inventar informações — sinalizar lacuna se não encontrar via pesquisa.
- Sessão de revisão disponível somente quando há template (não se aplica à análise livre).
