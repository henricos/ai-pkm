/**
 * GET /api/pkm/raw/[...path]
 *
 * Serve o conteúdo raw de um arquivo do PKM para download autenticado.
 * Referenciado pelo ViewerHeader como href do botão de download (CTX-02).
 *
 * Segurança (T-3-04):
 * - auth() guard obrigatório: retorna 401 imediatamente se não autenticado
 * - resolveAndValidatePath() interno ao FsItemRepository previne path traversal
 *
 * O parâmetro [...path] captura paths multi-segmento como "tecnologia/nota.md"
 * (ViewerHeader usa encodeURIComponent no itemId inteiro, não por segmento).
 */

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { FsItemRepository } from "@/lib/pkm/fs-item-repository";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // T-3-04: verificar autenticação antes de qualquer operação de filesystem
  const session = await auth();
  if (!session) {
    return new NextResponse(null, { status: 401 });
  }

  const resolvedParams = await params;
  // Reconstruir o itemId a partir dos segmentos do path
  // (o encodeURIComponent no ViewerHeader codifica o itemId inteiro — Next.js decodifica automaticamente)
  const itemId = resolvedParams.path.join("/");

  try {
    const repo = new FsItemRepository();
    const content = repo.getItemContent(itemId);

    if (content === null || content === undefined) {
      return new NextResponse(null, { status: 404 });
    }

    const filename = path.basename(itemId);

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        // Previne que browsers interpretem o conteúdo de forma inesperada
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    // resolveAndValidatePath lança Error para path traversal
    if (err instanceof Error && err.message.includes("Path traversal")) {
      return new NextResponse(null, { status: 400 });
    }
    // Arquivo não encontrado ou outro erro
    return new NextResponse(null, { status: 404 });
  }
}
