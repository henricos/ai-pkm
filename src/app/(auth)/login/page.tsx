import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { Suspense } from "react";
import { appBrand } from "@/lib/app-brand";
import { withBasePath } from "@/lib/base-path";

const appVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? process.env.npm_package_version ?? "2.0.0";
const gitHash = process.env.NEXT_PUBLIC_GIT_HASH;

export default async function LoginPage() {
  // Se já autenticado, redirecionar para /
  const session = await auth();
  if (session) redirect("/");

  const fallbackUrl = withBasePath("/");

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-full max-w-[400px] p-6">
        {/* Card principal — bg-surface-container-lowest sobre bg-surface (tonal layering per DESIGN.md §2) */}
        <div className="bg-surface-container-lowest p-8 rounded-sm shadow-ambient">
          {/* Header do card */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              {/* Símbolo sem dependência de Material Icons na Fase 1 */}
              <span className="text-tertiary font-mono text-lg font-bold leading-none">◈</span>
              <span className="text-[1.125rem] font-semibold tracking-tight text-on-surface">
                {appBrand.appName}
              </span>
            </div>
            <h1 className="text-[1.5rem] font-medium tracking-[-0.01em] text-on-surface">
              Acesso ao Sistema
            </h1>
            <p className="text-on-surface/60 text-[0.875rem] mt-1">
              Apenas curadores autorizados.
            </p>
          </div>

          {/* Formulário — Suspense necessário para useSearchParams() no LoginForm */}
          <Suspense>
            <LoginForm fallbackUrl={fallbackUrl} />
          </Suspense>
        </div>

        {/* Footer discreto */}
        <footer className="mt-8 text-center">
          <div className="text-on-surface/30 text-[0.6875rem] font-semibold uppercase tracking-[0.1em]">
            <span>
              v{appVersion}
              {gitHash ? ` · ${gitHash}` : ""}
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
