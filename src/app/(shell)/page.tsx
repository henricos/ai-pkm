import { WorkspaceEmptyState } from "@/components/shell/workspace-empty-state";

/**
 * Rota raiz da shell — estado vazio editorial (D-21).
 *
 * Renderizada dentro do ShellLayout persistente.
 * Não exibe listagem técnica de tópicos — esse era o smoke test da fase 1.
 * O estado vazio é editorial, coerente com DESIGN.md.
 */
export default function ShellHomePage() {
  return <WorkspaceEmptyState />;
}
