/**
 * GET /api/pkm/preview/[...path]
 *
 * Serve o conteúdo de um arquivo do PKM para preview inline autenticado.
 * Distinto de /api/pkm/raw: usa Content-Disposition: inline para permitir
 * visualização embutida no browser (VIEW-05, D-04, D-06b).
 *
 * Segurança (T-04-01, T-04-02, T-04-03):
 * - auth() guard obrigatório: retorna 401 imediatamente se não autenticado
 * - resolveItemPath() delega para resolveAndValidatePath() interno ao FsItemRepository,
 *   prevenindo path traversal (T-04-01)
 * - X-Content-Type-Options: nosniff presente (T-04-03)
 *
 * Separação semântica:
 * - /api/pkm/preview → Content-Disposition: inline  (visualização embutida)
 * - /api/pkm/raw     → Content-Disposition: attachment (força download)
 */

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { FsItemRepository } from "@/lib/pkm/fs-item-repository";
import fs from "fs";
import path from "path";

// Mapa de extensão → Content-Type (espelhado de raw route para consistência)
const CONTENT_TYPE_MAP: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".excalidraw": "application/json",
  ".md": "text/plain; charset=utf-8",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // T-04-02: verificar autenticação antes de qualquer operação de filesystem
  const session = await auth();
  if (!session) {
    return new NextResponse(null, { status: 401 });
  }

  const resolvedParams = await params;
  const itemId = resolvedParams.path.join("/");

  try {
    // Reusar resolveItemPath() como boundary de segurança (T-04-01)
    const repo = new FsItemRepository();
    const absPath = repo.resolveItemPath(itemId);

    if (!fs.existsSync(absPath)) {
      return new NextResponse(null, { status: 404 });
    }

    const ext = path.extname(itemId).toLowerCase();
    // Sanitizar filename para Content-Disposition: remover aspas e caracteres de controle
    // que permitem CRLF injection ou quebra do valor do header (CR-01)
    const rawFilename = path.basename(itemId);
    const filename = rawFilename.replace(/["\r\n\\]/g, "_");
    const contentType = CONTENT_TYPE_MAP[ext] ?? "application/octet-stream";

    // Ler como Buffer binário — sem encoding, sem gray-matter
    const buffer = fs.readFileSync(absPath);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // inline: permite visualização embutida (VIEW-05, D-06b)
        // attachment seria download — separação semântica explícita (T-04-03)
        "Content-Disposition": `inline; filename="${filename}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    // resolveAndValidatePath lança Error para path traversal (T-04-01)
    if (err instanceof Error && err.message.includes("Path traversal")) {
      return new NextResponse(null, { status: 400 });
    }
    return new NextResponse(null, { status: 404 });
  }
}
