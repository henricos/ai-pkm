## Readequação de Nota

**Skill:** `/readequar-nota`

**Quando usar:** Para adaptar uma nota existente (com conteúdo real) a um template novo ou atualizado. O trabalho é puramente estrutural: reposicionar seções, realocar conteúdo entre seções e marcar lacunas como TBD. Não inclui pesquisa externa nem avaliação de qualidade de conteúdo.

---

**Fluxo:**

```
LEITURA
  IA lê o arquivo completo

DETECÇÃO DE TEMPLATE
  Lê campo `tipo` do frontmatter
  Infere subtipo a partir do conteúdo
  Lista arquivos em models/ com prefixo igual ao `tipo`
  Seleciona o template correspondente ao subtipo identificado
  Lê o template selecionado
  Se subtipo ambíguo → apresenta hipótese e pergunta ao usuário antes de continuar
  Se nenhum template compatível encontrado:
    Informa ao usuário que não é possível readequar sem template
    Encerra

ANÁLISE DE DIVERGÊNCIA
  Compara a estrutura atual do documento com o template:
    - Seções obrigatórias ausentes
    - Seções presentes mas fora da ordem esperada
    - Seções extras não previstas pelo template
  Apresenta diagnóstico ao usuário antes de prosseguir
  Aguarda confirmação para prosseguir

READEQUAÇÃO (sem pesquisa externa)
  Para cada divergência estrutural identificada:
    Seções fora de ordem → reposicionar na ordem correta
    Conteúdo em seção errada → realocar para a seção correspondente no template
    Seções ausentes com conteúdo disponível em outro lugar no documento → realocar
    Seções ausentes sem conteúdo disponível → inserir marcador explícito:
      "TBD — a pesquisar" (ou similar)
  Regra: não reescreve nem expande conteúdo além do mínimo necessário
    para manter coesão após reposicionamento

APRESENTAÇÃO
  Apresenta a nota readequada completa
  Destaca explicitamente:
    - O que foi reposicionado
    - O que foi realocado de uma seção para outra
    - O que virou TBD
  Aguarda aprovação explícita antes de escrever

ESCRITA
  Escreve no arquivo após aprovação explícita (substituição completa do conteúdo)
```

---

**Comportamento:**
- Não faz pesquisa externa. O material de trabalho é exclusivamente o conteúdo já presente no documento.
- Lacunas sem conteúdo disponível são marcadas como TBD — são sinais para uma futura sessão de `/criticar-nota`.
- Nunca escreve no arquivo sem aprovação explícita.
- Não avalia qualidade de conteúdo — apenas estrutura.
- Não é interativo durante a execução: apresenta o diagnóstico, aguarda confirmação, executa e apresenta resultado.
