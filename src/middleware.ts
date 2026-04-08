// Edge Runtime — apenas verificação de sessão aqui.
// NUNCA usar fs, path ou qualquer API Node.js neste arquivo.
// (middleware roda no Edge Runtime — RESEARCH.md Pitfall 1)
export { auth as middleware } from "@/lib/auth";

export const config = {
  // Protege todas as rotas exceto NextAuth handler e assets estáticos
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
