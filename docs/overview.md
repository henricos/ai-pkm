# ai-pkm — Visão Geral do Sistema

## O problema

Conhecimento pessoal se acumula em fontes dispersas — URLs, notas, documentos, diagramas, ideias — mas as ferramentas disponíveis ou são passivas demais (repositórios de texto sem estrutura) ou prescritivas demais (apps que impõem seu próprio modelo de dados). Manter um PKM organizado e navegável exige trabalho editorial contínuo que o humano não tem tempo nem consistência para fazer sozinho. A alternativa — deixar a IA fazer esse trabalho — só funciona se o sistema for construído para isso desde o início.

## Quem usa

Um único operador técnico. Ele captura material bruto de diversas fontes, define direção intelectual e aprova mudanças, mas não escreve nem organiza a base manualmente. Está confortável com ferramentas de desenvolvimento e hoje já opera o PKM via CLI (Claude Code, Cursor), mas quer uma interface web como ambiente principal de uso cotidiano.

## O que o sistema faz

O ai-pkm é a plataforma que sustenta um PKM file-first: ele expõe o acervo de conhecimento através de uma interface web com navegação em árvore, e executa os fluxos operacionais (captura, triagem, criação, crítica, processamento, reorganização) via um agente de IA rodando no backend. A IA é a escritora exclusiva da base estruturada. O humano captura, navega e aprova.

O acervo em si vive num repositório Git separado e privado (`pkm`), acessado por volume de filesystem. Este repositório contém apenas a plataforma: aplicação web, BFF, agente, skills, regras e automações.

O sistema suporta dois modos de operação em paralelo: via interface web (caminho principal) e via agentes CLI operando diretamente sobre o repositório `pkm`. A sincronização entre os dois mundos acontece por Git.

## O que está fora de escopo

O ai-pkm não é um editor de notas, um app de produtividade genérico, nem uma ferramenta multi-usuário. Ele não substitui o repositório `pkm` — apenas o opera. Busca semântica, hospedagem cloud e aplicativo mobile não fazem parte da v1.

## Critério de sucesso da v1

O operador consegue, sem sair do navegador: navegar toda a base PKM, disparar qualquer skill existente, acompanhar a execução em tempo real e aprovar ou rejeitar mudanças propostas pelo agente. Operações feitas localmente via CLI são refletidas automaticamente na interface web após sincronização.
