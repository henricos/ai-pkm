# Template — Documento de Procedimento

Este template define a estrutura, tom e regras de escrita para documentos que ensinam como fazer alguma coisa — guias práticos, passo a passos, how-tos.

---

## Regras gerais de escrita

- Tom: direto e instrucional; verbos no infinitivo ("instalar", "configurar", "executar")
- Code blocks obrigatórios para comandos, snippets e outputs esperados
- **Negrito** para termos-chave, flags, nomes de arquivos e configurações importantes na primeira menção
- Bullet para listas de 3+ itens dentro de um passo
- Parágrafos de 3-5 frases (exceto `## Resultado esperado`, que pode ser mais curto)
- Português brasileiro natural (não acadêmico, não jornalístico)

### Formato de URL

Aplicado em qualquer ponto do documento onde um link for necessário:

```
[https://url-limpa.com/caminho](https://url-limpa.com/caminho) — descrição resumida do que tem no link
```

- A URL é o próprio label do link (não texto descritivo separado)
- URL deve ser limpa: sem parâmetros de rastreamento, sem redirects desnecessários

### Proibido

- Passos vagos sem ação concreta ("configure conforme necessário", "ajuste os parâmetros")
- Misturar explicação de por que algo funciona dentro dos Passos — isso vai em `## Contexto`
- Introduções genéricas ("No mundo atual...", "Nos dias de hoje...")
- Inventar informações não encontradas em fontes confiáveis — quando isso ocorrer, a IA deve interromper, avisar o usuário e aguardar direção

---

## Estrutura de seções

```
# [Como fazer X] ou [Título descritivo da tarefa]

## Contexto
## Pré-requisitos     ← opcional
## Passos
### Passo 1 — [descrição]
### Passo 2 — ...
## Resultado esperado
## Problemas comuns   ← opcional
## Próximos passos    ← opcional
## Referências
```

---

## Cabeçalho

```
# [Como fazer X] ou [Título descritivo da tarefa]
```

- H1: título descritivo — pode seguir o padrão `Como [fazer X]` ou ser nominal sem prefixo fixo
- Não há H2 de subtítulo imediatamente abaixo do H1

---

## Seções

### `## Contexto` — obrigatória

- 2-3 parágrafos
- Deve cobrir três ângulos:
  1. **Desafio** — o problema que leva alguém a precisar deste procedimento
  2. **Motivação** — por que vale a pena fazer
  3. **O que resolve** — resultado obtido ao seguir o procedimento
- Não começa com os passos — começa com o cenário que justifica o procedimento
- Explicações de por que algo funciona ficam aqui, não dentro dos Passos

---

### `## Pré-requisitos` — opcional

- Bullets com o que precisa estar instalado, configurado ou conhecido antes de começar
- Cada bullet pode ter link quando a instalação ou configuração tiver documentação relevante
- Incluir quando o procedimento exige estado ou ferramentas que não são óbvios

---

### `## Passos` — obrigatória

- H3 por passo: `### Passo N — [descrição curta da ação]`
- Dentro de cada H3: parágrafo ou bullets descrevendo o que fazer + code block quando aplicável
- Passos atômicos: uma ação por passo
- Não misturar a explicação de "por que funciona" com o "o que fazer"

---

### `## Resultado esperado` — obrigatória

- 1-2 parágrafos descrevendo o estado final e como verificar que deu certo
- Code block quando o resultado é um output de terminal ou arquivo

---

### `## Problemas comuns` — opcional

- H3 por problema
- Dentro de cada H3: sintoma + causa provável + solução
- Incluir quando há falhas frequentes conhecidas que interrompem o procedimento

---

### `## Próximos passos` — opcional

- Bullets com o que fazer depois; links quando aplicável
- Incluir quando o procedimento naturalmente abre caminho para outros

---

### `## Referências` — obrigatória

- Tente ter entre 2 e 5 links (não obrigatório atingir mínimo ou máximo)
- Somente links verificados: devem existir E ser boas referências (documentação oficial, repositório do projeto, artigo de referência; raramente uma página pessoal desconhecida — na dúvida, interromper e perguntar ao usuário antes de incluir)
- Seguir a regra de URL das regras gerais
- **Vídeos do YouTube:** além de links textuais, a IA deve buscar e sugerir vídeos do YouTube com boa aderência ao conteúdo do documento — priorizar vídeos com muitos likes, de canais com autoridade no tema ou de publicadores reconhecidos. A sugestão deve ser apresentada ao usuário para validação na revisão final antes de incluir
