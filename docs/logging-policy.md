# Convenção: Política de Logs e Rastreabilidade

> [!NOTE]
> Esta política define o uso da pasta `sistema/logs/` e a estratégia de rastreabilidade do Second Brain.

## Fase Atual: Fase 1 (Colaborativa)

Atualmente, o Second Brain opera de forma colaborativa entre humanos e agentes de IA. Nesta fase, a rastreabilidade lógica (o *porquê* de uma classificação ou mudança) deve ser registrada **exclusivamente e diretamente na mensagem de commit do Git**.

A pasta `sistema/logs/` encontra-se em **inatividade funcional**. Não devem ser gerados arquivos de log redundantes aqui durante esta fase para evitar poluição do repositório.

## Fase Futura: Fase 2 (Automação)

Na Fase 2, processos em lote (*Jobs* de IA contínuos) passarão a operar sem supervisão humana direta (ex: movendo notas da `__inbox/` para tópicos).

Nesta fase, a pasta `sistema/logs/` passará a ser mandatória:
- **Recibos de Ação**: Cada operação automatizada deve depositar uma linha de log *(append-only)* servindo como "recibo" da decisão tomada.
- **Auditabilidade**: Os logs servirão para que o humano possa auditar e corrigir o comportamento dos agentes automatizados.
