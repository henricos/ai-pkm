# ai-pkm

Plataforma de gestão de conhecimento pessoal operada por IA.

## O que é

O ai-pkm é uma plataforma web file-first para operar um PKM pessoal com IA. O acervo de conhecimento — notas, URLs processadas, conceitos, referências — vive num repositório Git separado e privado (`pkm`), acessado por volume de filesystem. Este repositório contém apenas a plataforma: aplicação web, agente de IA, skills operacionais e toda a lógica do sistema.

O modelo de colaboração é claro: o humano deposita material bruto, navega o acervo e aprova mudanças. A IA é a escritora exclusiva da base estruturada — toda movimentação, criação e edição de conteúdo acontece via skills. Nada é escrito manualmente na base.

O sistema opera em dois modos em paralelo: pela interface web, que é o ambiente principal de uso, e via agentes CLI rodando diretamente sobre o repositório `pkm`. Os dois mundos se sincronizam por Git. O ciclo operacional — captura, triagem, processamento, criação e agrupamento de conhecimento — acontece inteiramente via skills acionadas pelo operador.

A documentação técnica do projeto vive em `docs/`: visão e propósito, requisitos de produto, decisões de arquitetura, convenções do PKM e especificações detalhadas de cada fluxo operacional.

## Por que construir isso

Em 2026, a receita mais popular para quem quer um "Second Brain com IA" é clara: Obsidian ou Notion, conectados ao Claude Code ou outro agente via MCP. Há cursos, tutoriais e comunidades inteiras em torno desses combos. Funcionam, e têm seu lugar.

O problema é que são ferramentas genéricas coladas com integração. A IA entra como visitante — um plugin, um conector, uma camada sobre um produto que foi projetado para outra coisa. O Notion é SaaS: os dados não ficam com você. O Obsidian tem seu próprio modelo de vault, seus plugins, sua UX. Você se adapta à ferramenta.

O ai-pkm parte do princípio inverso: a IA foi projetada como escritora desde o início, não adicionada depois. O acervo é um repositório Git comum — você tem soberania total sobre os dados. A interface é sua, não do produto: web, CLI e mobile no seu fluxo de trabalho, com a navegação e a apresentação que fazem sentido para você, não para uma base de usuários genérica. É uma solução tailor-made, construída para atender exatamente um conjunto de necessidades — sem os 80% de features de uma ferramenta de mercado que você nunca vai usar.

Outro ponto: o sistema não cria dependência de nenhum agente CLI específico. As regras operacionais vivem em `AGENTS.md` e as skills em `.agents/skills/` — convenções agnósticas que qualquer ferramenta compatível consegue ler. Claude Code, Cursor, Codex CLI ou qualquer outro agente pode operar o sistema sem reescrever instruções. Sem lock-in.

Com IA disponível como co-desenvolvedora, construir isso é acessível. Faz mais sentido ter exatamente o que você precisa do que se adaptar ao que existe.

## Também é

Um laboratório. O ai-pkm serve como espaço de experimentação para abordagens de desenvolvimento com IA: o projeto adota Spec-Driven Development (SDD), onde cada fluxo é especificado antes de implementado, e experimenta frameworks como OpenSpec para estruturar essas especificações. É uma forma de explorar, na prática, como construir software real com IA como parceira de desenvolvimento — não só como assistente de código.

## Configuração do ambiente

O repositório `pkm` (privado) não faz parte deste repo e precisa ser montado manualmente como pasta `pkm/` na raiz do projeto. Sem ela, nenhuma skill operacional funciona.

**Desenvolvimento local**

Assumindo que `pkm` e `ai-pkm` estão em pastas irmãs:

```bash
ln -s ../pkm pkm
```

**Produção**

Monte o diretório equivalente ao `pkm` via Docker volume:

```
docker run ... -v /caminho/para/pkm:/app/pkm ...
```

Em ambos os casos, a plataforma lê e escreve em `pkm/` sem precisar saber como a pasta chegou lá.

## Licença

Distribuído sob a licença MIT. Consulte `LICENSE` para detalhes.
