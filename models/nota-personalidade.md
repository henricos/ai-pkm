# Template — Documento de Personalidade

Este template define a estrutura, tom e regras de escrita para documentos sobre pessoas notáveis — programadores, empreendedores, pensadores, ativistas ou qualquer personalidade relevante para o contexto do PKM.

---

## Estrutura de seções

```
# [Nome]
[LinkedIn oficial, site pessoal ou perfil principal]

> **Nacionalidade:** ...
> **Nascimento:** ...
> **Área de atuação:** ...

## Quem é
## Trajetória
## Grandes feitos
### [Nome do Feito]
## Impacto e alcance
## Referências
### Perfis
### Entrevistas e vídeos
### Biografias e leituras
```

---

## Cabeçalho

```
# [Nome]
[link — LinkedIn oficial, site pessoal ou perfil principal mais relevante]
```

Seguido imediatamente de um blockquote com os campos de identidade:

```
> **Nacionalidade:** [país ou origem — ex: "americano", "brasileiro", "irlandês-americano"]
> **Nascimento:** [ano ou data completa — omitir se não encontrado]
> **Área de atuação:** [campo(s) principal(is) — ex: "engenharia de software, IA"]
```

**Regras do campo `Nascimento`:** usar a data ou ano mais preciso disponível em fontes confiáveis. Se apenas o ano for confiável, usar só o ano. Se não encontrado, omitir o campo inteiro — nunca inventar ou usar "c." sem base.

**Regras do link de cabeçalho:** preferir, nesta ordem: site pessoal oficial → LinkedIn → perfil mais ativo. O link é apresentado como URL limpa linkada para si mesma — sem texto descritivo separado.

---

## Seções

### `## Quem é` — obrigatória

- 1-2 parágrafos
- Define quem é a pessoa, em que campo atua e qual é seu posicionamento ou papel
- Não repetir dados do card (nacionalidade, nascimento, área)
- Foco na identidade e no que torna a pessoa notável — sem superlativo sem evidência

---

### `## Trajetória` — obrigatória, seção principal

- 3-5 parágrafos — é a seção mais desenvolvida do documento
- Estrutura narrativa em três fases:
  1. Origem e formação (contexto, educação, primeiros passos)
  2. Marcos de carreira (posições relevantes, pivots, momentos de inflexão)
  3. Momento de consolidação ou fase atual
- Incluir datas e organizações com links quando confiáveis
- Não inventar informações não encontradas em fontes confiáveis — quando isso ocorrer, interromper, avisar o usuário e aguardar direção

---

### `## Grandes feitos` — obrigatória

- Um H3 por contribuição relevante: livros, ferramentas, projetos, textos icônicos, empresas fundadas, movimentos liderados
- Dentro de cada H3:
  - Bullets para dados curtos: ano, categoria, status
  - Parágrafo(s) para descrição do que é e resumo do impacto ou relevância
- Impacto pode ser qualitativo; se citar números, ancorar com data

---

### `## Impacto e alcance` — obrigatória

- 2-3 parágrafos qualitativos descrevendo a influência da pessoa no campo, nas comunidades e no tempo
- Ao final, bloco separado por `---` com números de referência para dar noção de escala:
  ```
  *Números de referência (YYYY):* X seguidores no X; Y livros vendidos; Z anos de carreira; etc.
  ```
- Âncoras temporais obrigatórias nos números — nunca cite métricas sem data de referência

---

### `## Referências` — obrigatória

- Dividida em até três subseções conforme o que estiver disponível:
  - `### Perfis` — links para contas verificadas (site, LinkedIn, X, Instagram, GitHub, etc.)
  - `### Entrevistas e vídeos` — entrevistas em vídeo relevantes, de preferência no YouTube com boa audiência ou de fontes com autoridade
  - `### Biografias e leituras` — Wikipedia, bios oficiais, perfis em publicações confiáveis
- Omitir subseções sem conteúdo
- Tente ter entre 2 e 6 links no total — somente links verificados

---

## Regras gerais de escrita

- Tom: direto e informativo; sem floreio ou superlativo
- **Negrito** na primeira menção de termos-chave, nomes de organizações e títulos de obras
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
- Afirmações sobre importância ou qualidade sem fonte ou evidência
- Seções com apenas 1-2 frases quando o conteúdo claramente precisa de mais substância
- Repetição de informação entre seções — cada seção tem recorte exclusivo
- Dados que se desatualizam rapidamente sem âncora temporal
- Inventar informações não encontradas em fontes confiáveis
