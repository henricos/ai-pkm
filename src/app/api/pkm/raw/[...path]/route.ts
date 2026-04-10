/**
 * GET /api/pkm/raw/[...path]
 *
 * Serve o conteúdo raw de um arquivo do PKM para download autenticado.
 * Referenciado pelo ViewerHeader como href do botão de download (CTX-02).
 *
 * Segurança (T-3-04):
 * - auth() guard obrigatório: retorna 401 imediatamente se não autenticado
 * - resolveItemPath() delega para resolveAndValidatePath() interno ao FsItemRepository,
 *   prevenindo path traversal (T-3-06-01)
 *
 * Binários (gap UAT #3 — T-3-06-02):
 * - Arquivos não-.md são lidos como Buffer sem encoding para evitar corrupção
 * - Content-Type é inferido da extensão do arquivo
 * - X-Content-Type-Options: nosniff presente (T-3-06-03)
 *
 * O parâmetro [...path] captura paths multi-segmento como "tecnologia/nota.md"
 * (ViewerHeader usa encodeURIComponent no itemId inteiro, não por segmento).
 */

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { FsItemRepository } from "@/lib/pkm/fs-item-repository";
import fs from "fs";
import path from "path";

// Mapa de extensão → Content-Type
const CONTENT_TYPE_MAP: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".excalidraw": "application/json",
  ".svg": "image/svg+xml",
  ".md": "text/plain; charset=utf-8",
};

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
    // Usar FsItemRepository apenas para validação de path (resolveItemPath → resolveAndValidatePath)
    // A leitura em si é feita diretamente para suportar binários.
    const repo = new FsItemRepository();
    const absPath = repo.resolveItemPath(itemId);

    if (!fs.existsSync(absPath)) {
      return new NextResponse(null, { status: 404 });
    }

    const ext = path.extname(itemId).toLowerCase();
    const isBinary = ext !== ".md" && ext !== ".txt";
    const filename = path.basename(itemId);
    const contentType = CONTENT_TYPE_MAP[ext] ?? "application/octet-stream";

    if (isBinary) {
      // Ler como Buffer — sem encoding, sem gray-matter (gap UAT #3)
      const buffer = fs.readFileSync(absPath);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${filename}"`,
          "X-Content-Type-Options": "nosniff",
        },
      });
    } else {
      // Arquivos .md: usar getItemContent() existente (strip frontmatter)
      const content = repo.getItemContent(itemId);
      return new NextResponse(content, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
  } catch (err) {
    // resolveAndValidatePath lança Error para path traversal
    if (err instanceof Error && err.message.includes("Path traversal")) {
      return new NextResponse(null, { status: 400 });
    }
    // Arquivo não encontrado ou outro erro
    return new NextResponse(null, { status: 404 });
  }
}
