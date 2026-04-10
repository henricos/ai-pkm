import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { decodeInboxParam } from "@/lib/navigation/route-helpers";
import { getItemById } from "@/lib/navigation/navigation-service";
import { ViewerPage } from "@/components/viewer/viewer-page";

/**
 * Página de item da inbox — entrada URL-driven (D-23, D-26).
 *
 * Segurança (T-02-06): decodifica params apenas via helper canônico
 * decodeInboxParam — nenhuma concatenação livre.
 *
 * A autenticação já foi verificada no ShellLayout (T-02-05).
 * Cada item aberto entra no histórico normal do browser (D-24).
 * O conteúdo raw é lido server-side via ViewerPage → FsItemRepository.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ item: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const itemId = decodeInboxParam(resolvedParams.item);
  const item = await getItemById(itemId);

  if (!item || item.scope !== "inbox") {
    return {};
  }

  return {
    title: item.label,
  };
}

export default async function InboxItemPage({
  params,
}: {
  params: Promise<{ item: string }>;
}) {
  const resolvedParams = await params;

  // T-02-06: decode via helper canônico — não via concatenação ad hoc
  const itemId = decodeInboxParam(resolvedParams.item);

  // Resolução canônica do item — nunca ad hoc a partir do slug
  const item = await getItemById(itemId);

  if (!item || item.scope !== "inbox") {
    notFound();
  }

  return <ViewerPage item={item} />;
}
