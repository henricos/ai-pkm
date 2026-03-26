# Template — Documento de Conceito

Este template define a estrutura, tom e regras de escrita para documentos sobre conceitos, métodos ou técnicas.

---

## Regras gerais de escrita

- Tom: narrativo, progressão do simples ao complexo; não começa com jargão
- **Negrito** na primeira menção de termos-chave
- Bullet para listas de 3+ itens; tabelas para comparações binárias ou de espectro
- Code blocks para snippets quando aplicável
- Parágrafos de 3-5 frases
- Português brasileiro natural
- Exemplos concretos são obrigatórios nas seções de fundamentos e detalhamento
- Títulos de seção são descritivos, não perguntas

### Formato de URL

Aplicado em qualquer ponto do documento onde um link for necessário:

```
[https://url-limpa.com/caminho](https://url-limpa.com/caminho) — descrição resumida do que tem no link
```

- A URL é o próprio label do link (não texto descritivo separado)
- URL deve ser limpa: sem parâmetros de rastreamento, sem redirects desnecessários

### Proibido

- Títulos-gancho no subtítulo ("tudo que você precisa saber", "o guia definitivo", "por que isso vai mudar tudo")
- Afirmações sobre importância ou popularidade sem fonte ou evidência
- Seções com apenas 1-2 frases quando o conteúdo precisa de mais substância
- Repetição de informação entre seções — cada seção tem recorte exclusivo
- Dados que se desatualizam rapidamente sem âncora temporal — se for importante citar, incluir a data: "em março de 2026"
- Inventar informações não encontradas em fontes confiáveis — quando isso ocorrer, a IA deve interromper, avisar o usuário e aguardar direção

---

## Estrutura de seções

```
# [Nome do Conceito]
## [subtítulo sóbrio que descreve o conceito]

## Contexto
## Origem
## Fundamentos
## Detalhamento          ← opcional, título livre
## Confusões frequentes  ← opcional
## Estado atual          ← opcional
## Conceitos relacionados  ← opcional
## Referências
```

---

## Seções

### Cabeçalho — obrigatório

```
# [Nome do Conceito]
## [subtítulo]
```

- H1: nome do conceito
- H2 imediatamente abaixo: subtítulo sóbrio que descreve o que é o conceito — sem gancho, estilo próximo ao acadêmico; resume o conceito, não tenta seduzir o leitor

---

### `## Contexto` — obrigatória

- 2-3 parágrafos
- Contextualiza o problema ou lacuna que deu origem ao conceito
- Não começa com definição — começa com o problema ou motivação

---

### `## Origem` — obrigatória

- 1-3 parágrafos
- Deve incluir, quando encontrado em fontes confiáveis:
  - Nome do criador ou criadores
  - Cronologia do desenvolvimento (marcos relevantes)
  - Data de publicação ou lançamento público
  - Se houver organização por trás: nome da organização + link externo confiável seguindo a regra de URL
- Não inventar informações não encontradas em fontes confiáveis — quando isso ocorrer, a IA deve interromper, avisar o usuário e aguardar direção

---

### `## Fundamentos` — obrigatória

- Seção mais densa do documento
- H3s por pilar quando necessário
- Cada pilar deve ser explicado, não apenas nomeado
- Exemplos concretos obrigatórios

---

### `## Detalhamento` — opcional

- Propósito: aprofundamento dos fundamentos — como o conceito se materializa, suas partes, variações ou aplicações
- Título padrão: "Detalhamento"; variações livres conforme o que o conceito exige
- H3s por subdivisão; cada um com pelo menos um exemplo concreto

---

### `## Confusões frequentes` — opcional

- H3 por confusão específica
- Cada H3 inclui argumento direto e explícito ("Não. Porque...")
- Usar quando o conceito é frequentemente mal entendido ou confundido com outro

---

### `## Estado atual` — opcional

- Incluir apenas quando o conceito está em evolução ativa ou quando sua maturidade ou nível de adoção é não-óbvio para o leitor
- Para conceitos estáveis e bem estabelecidos: omitir
- Dados com âncora temporal quando necessário

---

### `## Conceitos relacionados` — opcional

- Lista de conceitos com breve nota por item: o que é e como se relaciona (derivação, influência mútua, concorrência, sobreposição)
- Sem links internos para outros arquivos do PKM
- Requer pesquisa expandida — não listar conceitos sem entender e descrever a relação

---

### `## Referências` — obrigatória

- Tente ter entre 2 e 5 links (não obrigatório atingir mínimo ou máximo)
- Somente links verificados: devem existir E ser boas referências (página oficial, publicação acadêmica, site de organização relevante; raramente uma página pessoal desconhecida — na dúvida, interromper e perguntar ao usuário antes de incluir)
- Seguir a regra de URL das regras gerais
- **Vídeos do YouTube:** além de links textuais, a IA deve buscar e sugerir vídeos do YouTube com boa aderência ao conteúdo do documento — priorizar vídeos com muitos likes, de canais com autoridade no tema ou de publicadores reconhecidos. A sugestão deve ser apresentada ao usuário para validação na revisão final antes de incluir
