# Template — Documento de Empresa

Este template define a estrutura, tom e regras de escrita para documentos sobre empresas, organizações e grupos corporativos.

---

## Estrutura de seções

```
# [Nome da Empresa]
[URL oficial]

> **País:** ...
> **Fundado em:** ...
> **Vínculo corporativo:** ...

## O que faz
## Como surgiu
## Modelo de negócios
## Principais produtos
### [Nome do Produto]
## Escala e porte
## Referências
```

---

## Cabeçalho

```
# [Nome da Empresa]
[URL oficial — seguir regra de URL das regras gerais]
```

Seguido imediatamente de um blockquote com os campos de identidade:

```
> **País:** [país de origem — mesmo se multinacional, usar a "nacionalidade" original]
> **Fundado em:** [ano ou data de estabelecimento como entidade]
> **Vínculo corporativo:** [ver regras abaixo — omitir se independente]
```

**Regras do campo `Fundado em`:** usar a data em que a empresa foi estabelecida como a entidade que é hoje. Em casos de rebrand com continuidade legal (ex: Facebook → Meta em 2021), usar a data original (2004); a transformação entra em `## Como surgiu`.

**Regras do campo `Vínculo corporativo`:** omitir quando a empresa for independente. Quando houver vínculo, usar uma das formas:
- Subsidiária de [Empresa] (adquirida em [ano])
- Spin-off de [Empresa] ([ano])
- Investimento estratégico de [Empresa] ([%] stake)

---

## Seções

### `## O que faz` — obrigatória

- 2-3 parágrafos
- Define o que a empresa faz, em que setor atua e qual é seu posicionamento de mercado
- Não repetir dados do card (país, fundação, vínculo)
- Público-alvo específico fica nos produtos individuais, não aqui

---

### `## Como surgiu` — obrigatória, seção principal

- 3-5 parágrafos — é a seção mais desenvolvida do documento
- Estrutura narrativa em três fases:
  1. Contexto e motivação dos fundadores (quem são, por que criaram a empresa)
  2. Marcos de desenvolvimento (lançamentos relevantes, pivots, aquisições)
  3. Momento de inflexão, escala ou consolidação
- Incluir nomes dos fundadores com links quando confiáveis
- Não inventar informações não encontradas em fontes confiáveis — quando isso ocorrer, interromper, avisar o usuário e aguardar direção

---

### `## Modelo de negócios` — obrigatória

- 2-3 parágrafos
- Como a empresa gera receita: assinatura, publicidade, licenciamento, B2B, marketplace, etc.
- Recorte exclusivo desta seção: não repetir o que a empresa faz (isso está em `## O que faz`), focar em como monetiza

---

### `## Principais produtos` — obrigatória

- Um H3 por produto relevante
- Dentro de cada H3:
  - Bullets para dados curtos: ano de lançamento, categoria, status (ativo / descontinuado / adquirido)
  - Parágrafo(s) para descrição do que o produto faz e resumo do impacto ou popularidade
- Popularidade pode ser qualitativa; se citar números, ancorar com data

---

### `## Escala e porte` — obrigatória

- 1 parágrafo curto contextualizando o porte e a importância da empresa
- Seguido de bullets, todos com data de referência:
  - Usuários / clientes (distinguir B2C de B2B quando relevante)
  - Funcionários
  - Valuation (empresas públicas: market cap; privadas: última rodada conhecida)

---

### `## Referências` — obrigatória

- Tente ter entre 2 e 5 links (não obrigatório atingir mínimo ou máximo)
- Somente links verificados: devem existir e ser boas referências (página oficial, fontes confiáveis)
- Seguir a regra de URL das regras gerais
- **Vídeos do YouTube:** além de links textuais, a IA deve buscar e sugerir vídeos do YouTube com boa aderência ao conteúdo do documento — priorizar vídeos com muitos likes, de canais com autoridade no tema ou de publicadores reconhecidos. A sugestão deve ser apresentada ao usuário para validação na revisão final antes de incluir

---

## Regras gerais de escrita

- Tom: direto e informativo; sem floreio ou superlativo
- **Negrito** na primeira menção de termos-chave
- Bullet para listas de 3+ itens; tabelas para comparações estruturadas
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
- Dados que se desatualizam rapidamente sem âncora temporal — se for importante citar (ex: número de funcionários, valuation), incluir a data: "tinha 10 mil funcionários em março de 2026"
- Inventar informações não encontradas em fontes confiáveis — quando isso ocorrer, interromper, avisar o usuário e aguardar direção
