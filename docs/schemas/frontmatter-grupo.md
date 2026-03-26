# Metadados (Frontmatter) — Grupos (`_grupo.md`)

Cada grupo dentro de um tópico deve conter um arquivo `_grupo.md` na raiz da sua pasta, com o seguinte cabeçalho formatado em *YAML Frontmatter*:

```yaml
---
descricao: "porquê deste grupo"
topico: tecnologia
ambito: pessoal                       # pessoal | trabalho | ambos (opcional)
---
```

## Atributos do Grupo

- `descricao`: Descrição livre e otimizada para busca do propósito do grupo. Usada pelo agente de triagem para inferir correspondência com itens da inbox.
- `topico`: Tópico da taxonomia ao qual o grupo pertence. Obrigatório. Deve coincidir com um `id` em `sistema/indices/topicos.json`.
- `ambito`: Domínio de vida ao qual o grupo pertence. Opcional. `pessoal`, `trabalho` ou `ambos`. **Omitir** quando não relevante.

## Exemplo completo

```yaml
---
descricao: "Framework de agentes para LLMs usando padrões de composição"
topico: tecnologia
ambito: pessoal
---
```

## Regras de uso

- O arquivo `_grupo.md` é o **manifest** do grupo. Abaixo do frontmatter, adicione livremente notas, contexto, links internos e checklists relevantes.
- O caminho da pasta é o identificador do grupo — não há campo `id`.
- Grupos são **atemporais**: não representam tarefas, projetos com vencimento nem unidades operacionais com ciclo de vida. Servem como agrupadores persistentes de conhecimento.
- Grupos não possuem campos temporais (`deadline`, `status`, `data_inicio`) nem noção implícita de "ativo" ou "encerrado". O grupo existe enquanto a pasta fizer sentido como unidade de organização.
- A pasta do grupo fica dentro do tópico, **sem** prefixo `_` (ex: `_tecnologia/meu-framework/`).
