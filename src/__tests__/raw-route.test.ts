/**
 * Testes do Route Handler GET /api/pkm/raw/[...path] — Phase 3 (03-01) · Wave 0 · RED
 *
 * Cobre os comportamentos exigidos por T-3-04 e CTX-02:
 * - T-3-04: Route Handler verifica auth() antes de servir conteúdo (401 se não autenticado)
 * - CTX-02: retorna 200 com conteúdo e Content-Disposition attachment quando autenticado
 *
 * Atualizado em 03-06 para suportar o route handler refatorado (gap UAT #3):
 * - Mock de FsItemRepository inclui resolveItemPath (método novo)
 * - Mock do módulo fs para evitar acesso ao filesystem real
 * - Testes de arquivo binário verificam Content-Type correto por extensão
 */

import { describe, test, expect, vi, beforeEach, type Mock } from "vitest";

// Mocks necessários antes do import do route handler
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/pkm/fs-item-repository", () => ({
  FsItemRepository: vi.fn().mockImplementation(() => ({
    getItemContent: vi.fn().mockReturnValue("# Conteúdo raw do arquivo"),
    resolveItemPath: vi.fn().mockReturnValue("/mock/pkm/path/to/file.md"),
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

// Mock do módulo fs para evitar acesso ao filesystem real
vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn().mockReturnValue(true),
    readFileSync: vi.fn().mockReturnValue(Buffer.from("mock binary content")),
  },
}));

// Import real do route handler
import { GET } from "@/app/api/pkm/raw/[...path]/route";

// Import dos mocks para controlar retorno nos testes
import { auth } from "@/lib/auth";
import { FsItemRepository } from "@/lib/pkm/fs-item-repository";
import fs from "fs";
import type { Session } from "next-auth";

const mockedAuth = auth as unknown as Mock<() => Promise<Session | null>>;

function createSession(): Session {
  return {
    user: { id: "1", name: "Henrico", email: "user@example.com" },
    expires: "2099-01-01",
  };
}

// ── T-3-04: autenticação obrigatória ─────────────────────────────────────────

describe("GET /api/pkm/raw/[...path]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Defaults após clearAllMocks — restaurar comportamentos base
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from("mock binary content"));
    // Restaurar mocks do repo após clearAllMocks
    const mockRepo = {
      getItemContent: vi.fn().mockReturnValue("# Conteúdo raw do arquivo"),
      resolveItemPath: vi.fn().mockReturnValue("/mock/pkm/tecnologia/nota.md"),
    };
    vi.mocked(FsItemRepository).mockImplementation(() => mockRepo as never);
  });

  test("T-3-04: retorna 401 quando não autenticado", async () => {
    // Simula sessão nula (usuário não autenticado)
    mockedAuth.mockResolvedValue(null);

    const request = new Request(
      "http://localhost:3000/api/pkm/raw/tecnologia/nota.md"
    );
    const params = Promise.resolve({ path: ["tecnologia", "nota.md"] });

    const response = await GET(request as never, { params });

    expect(response.status).toBe(401);
  });

  // ── CTX-02: download autenticado — arquivo .md ──────────────────────────────

  test("CTX-02: retorna 200 com conteúdo quando autenticado (arquivo .md)", async () => {
    // Simula sessão autenticada
    mockedAuth.mockResolvedValue(createSession());

    const request = new Request(
      "http://localhost:3000/api/pkm/raw/tecnologia/nota.md"
    );
    const params = Promise.resolve({ path: ["tecnologia", "nota.md"] });

    const response = await GET(request as never, { params });

    expect(response.status).toBe(200);

    // Deve incluir Content-Disposition com attachment para forçar download
    const contentDisposition = response.headers.get("Content-Disposition");
    expect(contentDisposition).not.toBeNull();
    expect(contentDisposition).toContain("attachment");
  });

  // ── CTX-02: download de arquivo binário — PDF ───────────────────────────────

  test("CTX-02: retorna 200 com Content-Type application/pdf para arquivo .pdf", async () => {
    mockedAuth.mockResolvedValue(createSession());

    const mockRepo = {
      getItemContent: vi.fn().mockReturnValue(""),
      resolveItemPath: vi.fn().mockReturnValue("/mock/pkm/tecnologia/documento.pdf"),
    };
    vi.mocked(FsItemRepository).mockImplementation(() => mockRepo as never);

    const request = new Request(
      "http://localhost:3000/api/pkm/raw/tecnologia/documento.pdf"
    );
    const params = Promise.resolve({ path: ["tecnologia", "documento.pdf"] });

    const response = await GET(request as never, { params });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toContain("attachment");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  // ── Arquivo não encontrado ───────────────────────────────────────────────────

  test("retorna 404 quando arquivo não existe no filesystem", async () => {
    mockedAuth.mockResolvedValue(createSession());
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const request = new Request(
      "http://localhost:3000/api/pkm/raw/tecnologia/inexistente.md"
    );
    const params = Promise.resolve({ path: ["tecnologia", "inexistente.md"] });

    const response = await GET(request as never, { params });

    expect(response.status).toBe(404);
  });

  // ── Path traversal ───────────────────────────────────────────────────────────

  test("retorna 400 para tentativa de path traversal", async () => {
    mockedAuth.mockResolvedValue(createSession());

    const mockRepo = {
      getItemContent: vi.fn(),
      resolveItemPath: vi.fn().mockImplementation(() => {
        throw new Error("Path traversal detectado: ../etc/passwd");
      }),
    };
    vi.mocked(FsItemRepository).mockImplementation(() => mockRepo as never);

    const request = new Request(
      "http://localhost:3000/api/pkm/raw/../etc/passwd"
    );
    const params = Promise.resolve({ path: ["..", "etc", "passwd"] });

    const response = await GET(request as never, { params });

    expect(response.status).toBe(400);
  });
});
