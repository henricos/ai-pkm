import { notFound } from "next/navigation";
import { decodeLibraryParams } from "@/lib/navigation/route-helpers";
import { getItemById } from "@/lib/navigation/navigation-service";
import { WorkspaceItemState } from "@/components/shell/workspace-item-state";

/**
 * Página de item da biblioteca — entrada URL-driven (D-22, D-26).
 *
 * Segurança (T-02-06): decodifica params apenas via helper canônico
 * decodeLibraryParams — nenhuma concatenação livre de path.
 *
 * Segurança (T-02-07): mostra apenas título/tipo/estado nesta fase —
 * nenhum conteúdo bruto, path absoluto ou sidecar é exposto.
 *
 * A autenticação já foi verificada no ShellLayout (T-02-05).
 * A resolução do item passa obrigatoriamente por getItemById (helper canônico).
 */
export default async function LibraryItemPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const resolvedParams = await params;

  // T-02-06: decode via helper canônico — não via concatenação ad hoc
  const itemId = decodeLibraryParams(resolvedParams);

  // Resolução canônica do item — nunca ad hoc a partir dos segmentos
  const item = await getItemById(itemId);

  if (!item || item.scope !== "library") {
    notFound();
  }

  return <WorkspaceItemState item={item} />;
}
