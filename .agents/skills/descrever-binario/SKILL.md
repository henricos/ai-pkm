---
name: descrever-binario
description: "Preenche o conteúdo de sidecars de binários com `estado: rascunho` — lê o arquivo original (imagem, PDF, SVG, Excalidraw, DrawIO) e gera as seções `## Descrição` e `## Conteúdo` conforme o modelo `sidecar`. Marca `estado: finalizado` ao concluir. Use esta skill sempre que o usuário quiser descrever, documentar ou preencher sidecars de arquivos binários triados — mesmo que não diga explicitamente 'descrever binário'."
command: /descrever-binario
---

# SKILL: Descrever Binário

## Instruções de Execução do Agente

Esta skill lê arquivos binários do repositório `pkm` e preenche o conteúdo dos seus sidecars. **NUNCA modifique um sidecar sem aprovação explícita do usuário.**

> Se a ferramenta oferecer widget nativo de perguntas (ex: `AskUserQuestion`), use-o para todas as perguntas com opções. Caso contrário, apresente as opções numeradas.

---

### Passo 0: Detecção do alvo

- **Com argumento** (ex: `/descrever-binario tecnologia/levels-ai-coding.jpg.md`) → use o sidecar informado diretamente. Pule para o Passo 3.
- **Sem argumento** → siga para o Passo 1.

---

### Passo 1: Buscar sidecars pendentes

1. Localize todos os arquivos que correspondam ao padrão `pkm/**/*.*.md` — excluindo `.gitkeep`.
2. Para cada arquivo encontrado, confirme que o frontmatter contém:
   - `modelo: sidecar`
   - `estado: rascunho`
3. Se nenhum sidecar pendente for encontrado, informe o usuário e encerre:

> *"Nenhum sidecar com `estado: rascunho` encontrado. Nada a processar."*

---

### Passo 2: Apresentar sidecars pendentes

Apresente os arquivos encontrados em tabela:

```text
| # | Sidecar | Binário | Tipo |
|---|---|---|---|
| 1 | tecnologia/levels-ai-coding.jpg.md | levels-ai-coding.jpg | imagem |
| 2 | carreira/diagrama-carreira.excalidraw.md | diagrama-carreira.excalidraw | excalidraw |
```

Em seguida, pergunte ao usuário:

> *Encontrados X sidecar(s) pendentes — como prosseguir?*
>
> 1. **Processar todos** *(recomendado)*
> 2. **Escolher específicos**
> 3. **Cancelar**

---

### Passo 3: Processar cada sidecar

Para cada sidecar selecionado:

#### 3.1 Derivar o caminho do binário

O binário correspondente é derivado removendo a extensão `.md` do nome do sidecar.

Exemplo: `pkm/tecnologia/levels-ai-coding.jpg.md` → `pkm/tecnologia/levels-ai-coding.jpg`

Verifique se o arquivo binário existe. Se não existir, informe o usuário e pule este item.

#### 3.2 Validar o tipo

Detecte a extensão do binário e classifique:

| Extensão | Tipo | Estratégia de leitura |
|---|---|---|
| `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif` | imagem | Read tool — visual |
| `.svg` | svg | Read tool — texto XML |
| `.pdf` | pdf | Read tool — páginas |
| `.excalidraw` | excalidraw | Read tool — JSON |
| `.drawio`, `.xml` (drawio) | drawio | Read tool — XML |

Se a extensão não estiver na lista acima, informe o usuário que o formato não é suportado e pule o item:

> *"Formato `.ext` não suportado. Adicione uma descrição manualmente ou aguarde suporte futuro."*

#### 3.3 Ler o binário

- **Imagens:** leia o arquivo com o Read tool — o conteúdo será interpretado visualmente.
- **SVG, Excalidraw, DrawIO:** leia o arquivo como texto. Interprete a estrutura para descrever elementos, relações e fluxo representado.
- **PDF:** leia todas as páginas com o Read tool. Se o PDF tiver mais de 10 páginas, leia em blocos de até 10 páginas por vez.

#### 3.4 Gerar o conteúdo

Leia `models/sidecar.md` para confirmar a estrutura esperada.

Gere o conteúdo seguindo o template — duas seções obrigatórias:

**`## Descrição`**
O que este artefato é: tipo, assunto, contexto de criação ou uso. Seja objetivo e preciso. Uma a três frases.

**`## Conteúdo`**
Representação textual fiel do conhecimento contido no artefato. A profundidade e o formato variam por tipo:

- **Imagem (PNG, JPG, WebP, GIF):** descreva o que está mostrado e o que comunica — estrutura visual, hierarquia, elementos-chave, mensagem central.
- **SVG, Excalidraw, DrawIO:** descreva os elementos presentes, as relações entre eles e o fluxo ou processo representado. Se houver rótulos textuais, transcreva-os fielmente.
- **PDF:** transcreva ou resuma de forma estruturada o conteúdo principal. Para documentos longos, produza um resumo organizado por seção ou argumento, preservando a estrutura lógica do original.

#### 3.5 Preview e aprovação

Exiba o conteúdo gerado em bloco de código Markdown antes de salvar:

```markdown
## Descrição

[conteúdo gerado]

## Conteúdo

[conteúdo gerado]
```

Em seguida, pergunte ao usuário:

> 1. **Aprovar e salvar**
> 2. **Ajustar antes de salvar** *(descreva o que mudar)*
> 3. **Pular este sidecar**

Se o usuário pedir ajuste, reelabore o conteúdo e reapresente o preview.

#### 3.6 Escrever no sidecar

Após aprovação:

1. Mantenha o frontmatter existente integralmente — **não altere nenhum campo além de `estado`**.
2. Atualize `estado: rascunho` para `estado: finalizado`.
3. Adicione o conteúdo gerado abaixo do frontmatter, seguindo exatamente o formato do template `sidecar`.

Se o sidecar já tiver conteúdo abaixo do frontmatter, pergunte ao usuário:

> 1. **Substituir o conteúdo existente**
> 2. **Adicionar abaixo do existente**
> 3. **Pular este sidecar**

---

### Passo 4: Resumo final

> **Processamento concluído.** X sidecar(s) preenchido(s), Y pulado(s), Z com erro.

Sugira: *"Se quiser, registre as alterações no histórico Git."*

---

## Regras de Comportamento

- **Aprovação obrigatória antes de salvar** — nunca escreva sem confirmação explícita.
- **Preserve o frontmatter existente** — atualize apenas o campo `estado`.
- **Idioma:** `pt-BR` para o conteúdo gerado, independente do idioma do binário original.
- **Fidelidade ao original** — descreva o que está no artefato, não o que você infere ou supõe além do visível.
- **Sem logs** — auditoria exclusivamente via histórico Git.

## Arquivos de Referência

- `models/sidecar.md` — **template do corpo do sidecar** (seções Descrição e Conteúdo)
- `reference/schemas/frontmatter-item.md` — esquema de frontmatter de itens de conhecimento
