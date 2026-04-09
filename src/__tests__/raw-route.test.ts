/**
 * Testes do Route Handler GET /api/pkm/raw/[...path] — Phase 3 (03-01) · Wave 0 · RED
 *
 * Cobre os comportamentos exigidos por T-3-04 e CTX-02:
 * - T-3-04: Route Handler verifica auth() antes de servir conteúdo (401 se não autenticado)
 * - CTX-02: retorna 200 com conteúdo e Content-Disposition attachment quando autenticado
 *
 * ESTADO: RED — Route Handler ainda não existe em
 * @/app/api/pkm/raw/[...path]/route. O import abaixo causará
 * "Cannot find module" até que Wave 3 crie o handler.
 */

import { describe, test, expect, vi, beforeEach } from "vitest";

// Mocks necessários antes do import do route handler
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/pkm/fs-item-repository", () => ({
  FsItemRepository: vi.fn().mockImplementation(() => ({
    getItemContent: vi.fn().mockReturnValue("# Conteúdo raw do arquivo"),
  })),
}));

vi.mock("@/lib/env", () => ({
  env: {
    PKM_PATH: "/mock/pkm",
    AUTH_USERNAME: "test",
    AUTH_PASSWORD: "testpass123",
    NEXTAUTH_SECRET: "test-secret-with-at-least-32-characters-here",
    NEXTAUTH_URL: "http://localhost:3000",
  },
}));

// Import real — route handler ainda não existe → causa RED (module not found)
import { GET } from "@/app/api/pkm/raw/[...path]/route";

// Import do mock de auth para controlar retorno nos testes
import { auth } from "@/lib/auth";

// ── T-3-04: autenticação obrigatória ─────────────────────────────────────────

describe("GET /api/pkm/raw/[...path]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("T-3-04: retorna 401 quando não autenticado", async () => {
    // Simula sessão nula (usuário não autenticado)
    vi.mocked(auth).mockResolvedValue(null);

    const request = new Request(
      "http://localhost:3000/api/pkm/raw/tecnologia/nota.md"
    );
    const params = { path: ["tecnologia", "nota.md"] };

    const response = await GET(request, { params });

    expect(response.status).toBe(401);
  });

  // ── CTX-02: download autenticado ────────────────────────────────────────────

  test("CTX-02: retorna 200 com conteúdo quando autenticado", async () => {
    // Simula sessão autenticada
    vi.mocked(auth).mockResolvedValue({
      user: { id: "1", name: "Henrico", email: "user@example.com" },
      expires: "2099-01-01",
    });

    const request = new Request(
      "http://localhost:3000/api/pkm/raw/tecnologia/nota.md"
    );
    const params = { path: ["tecnologia", "nota.md"] };

    const response = await GET(request, { params });

    expect(response.status).toBe(200);

    // Deve incluir Content-Disposition com attachment para forçar download
    const contentDisposition = response.headers.get("Content-Disposition");
    expect(contentDisposition).not.toBeNull();
    expect(contentDisposition).toContain("attachment");
  });
});
