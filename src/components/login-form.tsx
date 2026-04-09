"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      redirect: false,
      callbackUrl,
    });
    setIsLoading(false);
    if (!result?.error) {
      router.push(callbackUrl);
      router.refresh();
    } else {
      setAuthError("Credenciais inválidas. Verifique usuário e senha.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Campo username */}
        <div className="space-y-1.5">
          <Label
            htmlFor="username"
            className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/60"
          >
            Username
          </Label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="curator_id"
            required
            autoComplete="username"
            className="rounded-sm bg-surface-container-low focus-visible:bg-surface-container-lowest focus-visible:border-b-2 focus-visible:border-b-tertiary"
          />
        </div>

        {/* Campo password */}
        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/60"
          >
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className="rounded-sm bg-surface-container-low focus-visible:bg-surface-container-lowest focus-visible:border-b-2 focus-visible:border-b-tertiary"
          />
        </div>
      </div>

      {/* Alerta de erro de autenticação — mensagem genérica sem revelar qual campo está errado (T-1-06) */}
      {authError && (
        <div className="flex items-center gap-3 p-3 bg-destructive/8 rounded-sm border border-destructive/25">
          <p className="text-[0.75rem] font-medium text-destructive">
            Credenciais inválidas. Verifique usuário e senha.
          </p>
        </div>
      )}

      {/* Botão submit — gradient-cta conforme DESIGN.md §2 Signature Textures */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full gradient-cta text-on-tertiary py-3 font-semibold text-[0.875rem] rounded-sm hover:opacity-90 active:scale-[0.98] transition-all"
      >
        {isLoading ? "Aguarde..." : "Entrar"}
      </Button>
    </form>
  );
}
