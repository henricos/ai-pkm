import { redirect } from "next/navigation";
import { withBasePath } from "@/lib/base-path";
import { auth } from "@/lib/auth";
import { warmMarkdownPipeline } from "@/lib/markdown/shiki";
import { getNavigationSnapshot } from "@/lib/navigation/navigation-service";
import { AppShell } from "@/components/shell/app-shell";

/**
 * Layout persistente autenticado da shell — Phase 2.
 *
 * Responsabilidades:
 * - Dupla proteção: auth() antes de qualquer snapshot (T-02-05)
 * - Carregar getNavigationSnapshot() server-side e injetar na AppShell
 * - Garantir que nenhum filho do grupo (shell) seja acessível sem sessão
 *
 * Arquitetura App Router: este layout persiste entre as rotas /, /library/... e /inbox/...
 * sem troca perceptível de página (D-21 a D-25).
 */
export default async function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // T-02-05: autenticação obrigatória — redireciona antes de qualquer snapshot
  const session = await auth();
  if (!session) {
    redirect(withBasePath("/login"));
  }

  // Carrega snapshot server-side — nenhum path absoluto é exposto ao cliente
  const snapshot = await getNavigationSnapshot();
  warmMarkdownPipeline();

  return <AppShell snapshot={snapshot}>{children}</AppShell>;
}
