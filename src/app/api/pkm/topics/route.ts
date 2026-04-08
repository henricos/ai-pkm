import { auth } from "@/lib/auth";
import { FsItemRepository } from "@/lib/pkm/fs-item-repository";
import { NextResponse } from "next/server";

/**
 * GET /api/pkm/topics
 * Endpoint de validação do read model — retorna lista de tópicos.
 * Protegido por auth (middleware universal já bloqueia sem sessão).
 * Dupla verificação de sessão no Route Handler (T-1-11).
 */
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const repo = new FsItemRepository();
    const topics = repo.listTopics();
    return NextResponse.json({ topics });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
