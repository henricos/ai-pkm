/**
 * Testes do Route Handler GET /api/pkm/preview/[...path] — Phase 4 (04-01) · Wave 0 · RED
 *
 * Cobre os comportamentos exigidos por VIEW-05, T-04-01, T-04-02 e T-04-03:
 * - T-04-01: path traversal retorna 400, nunca toca o filesystem real
 * - T-04-02: rota retorna 401 sem sessão (auth obrigatório antes de qualquer fs op)
 * - T-04-03: separação semântica entre preview inline e download attachment
 * - VIEW-05: Content-Disposition: inline para preview; /api/pkm/raw usa attachment
 *
 * Este teste explicita a separação entre as duas rotas:
 * - /api/pkm/preview/[...path] → Content-Disposition: inline (para visualização)
 * - /api/pkm/raw/[...path]     → Content-Disposition: attachment (para download)
 *
 * resolveItemPath() é reaproveitado como boundary de segurança em ambas as rotas.
 *
 * ESTADO: RED — a rota /api/pkm/preview/[...path] ainda não existe.
 * O import abaixo causará "Cannot find module" até que Wave 1 implemente.
 */

import { describe, test, expect, vi, beforeEach, type Mock } from "vitest";

// Mocks necessários antes do import do route handler
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/pkm/fs-item-repository", () => ({
  FsItemRepository: vi.fn().mockImplementation(() => ({
    resolveItemPath: vi.fn().mockReturnValue("/mock/pkm/path/to/file.pdf"),
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

// Import real do route handler de preview
// RED: este módulo ainda não existe — o teste falha com "Cannot find module"
import { GET } from "@/app/api/pkm/preview/[...path]/route";

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

// ── T-04-02: autenticação obrigatória ────────────────────────────────────────

describe("GET /api/pkm/preview/[...path]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restaurar comportamentos base após clearAllMocks
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from("mock pdf content"));
    // Restaurar mock do repo
    const mockRepo = {
      resolveItemPath: vi.fn().mockReturnValue("/mock/pkm/tecnologia/documento.pdf"),
    };
    vi.mocked(FsItemRepository).mockImplementation(() => mockRepo as never);
  });

  test("T-04-02: retorna 401 sem sessão, bloqueando bypass de auth", async () => {
    // Simula sessão nula (usuário não autenticado)
    mockedAuth.mockResolvedValue(null);

    const request = new Request(
      "http://localhost:3000/api/pkm/preview/tecnologia/documento.pdf"
    );
    const params = Promise.resolve({ path: ["tecnologia", "documento.pdf"] });

    const response = await GET(request as never, { params });

    expect(response.status).toBe(401);
  });

  // ── T-04-03 / VIEW-05: preview inline vs download attachment ─────────────────

  test("T-04-03, VIEW-05: retorna Content-Disposition: inline para arquivo .pdf autenticado", async () => {
    mockedAuth.mockResolvedValue(createSession());

    const request = new Request(
      "http://localhost:3000/api/pkm/preview/tecnologia/documento.pdf"
    );
    const params = Promise.resolve({ path: ["tecnologia", "documento.pdf"] });

    const response = await GET(request as never, { params });

    expect(response.status).toBe(200);

    // Preview usa inline — distingue desta rota da rota de download (/api/pkm/raw)
    const contentDisposition = response.headers.get("Content-Disposition");
    expect(contentDisposition).not.toBeNull();
    expect(contentDisposition).toContain("inline");
    // Garante que attachment NÃO foi usado (separação semântica D-06b)
    expect(contentDisposition).not.toContain("attachment");
  });

  test("T-04-03: Content-Type correto para .pdf na rota de preview", async () => {
    mockedAuth.mockResolvedValue(createSession());

    const request = new Request(
      "http://localhost:3000/api/pkm/preview/tecnologia/documento.pdf"
    );
    const params = Promise.resolve({ path: ["tecnologia", "documento.pdf"] });

    const response = await GET(request as never, { params });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    // nosniff obrigatório para prevenir content sniffing (T-04-03)
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  test("T-04-03: Content-Type correto para .png na rota de preview", async () => {
    mockedAuth.mockResolvedValue(createSession());

    const mockRepo = {
      resolveItemPath: vi.fn().mockReturnValue("/mock/pkm/tecnologia/foto.png"),
    };
    vi.mocked(FsItemRepository).mockImplementation(() => mockRepo as never);

    const request = new Request(
      "http://localhost:3000/api/pkm/preview/tecnologia/foto.png"
    );
    const params = Promise.resolve({ path: ["tecnologia", "foto.png"] });

    const response = await GET(request as never, { params });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(response.headers.get("Content-Disposition")).toContain("inline");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  // ── T-04-01: path traversal ──────────────────────────────────────────────────

  test("T-04-01: path traversal retorna 400 e não toca o filesystem real", async () => {
    mockedAuth.mockResolvedValue(createSession());

    const mockRepo = {
      resolveItemPath: vi.fn().mockImplementation(() => {
        throw new Error("Path traversal detectado: ../etc/passwd");
      }),
    };
    vi.mocked(FsItemRepository).mockImplementation(() => mockRepo as never);

    const request = new Request(
      "http://localhost:3000/api/pkm/preview/../etc/passwd"
    );
    const params = Promise.resolve({ path: ["..", "etc", "passwd"] });

    const response = await GET(request as never, { params });

    // 400 — input inválido, não chega ao filesystem
    expect(response.status).toBe(400);

    // Garantir que o filesystem não foi acessado após a falha de validação
    expect(fs.readFileSync).not.toHaveBeenCalled();
  });

  // ── 404 sem vazar path absoluto ──────────────────────────────────────────────

  test("arquivo inexistente retorna 404 sem vazar path absoluto na resposta", async () => {
    mockedAuth.mockResolvedValue(createSession());

    // Arquivo não existe no filesystem
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const request = new Request(
      "http://localhost:3000/api/pkm/preview/tecnologia/inexistente.pdf"
    );
    const params = Promise.resolve({ path: ["tecnologia", "inexistente.pdf"] });

    const response = await GET(request as never, { params });

    expect(response.status).toBe(404);

    // Corpo da resposta não deve vazar path absoluto do servidor
    const body = await response.text();
    expect(body).not.toContain("/mock/pkm");
    expect(body).not.toContain("/home/");
    expect(body).not.toContain("/var/");
  });

  // ── Separação semântica explicita entre as duas rotas ────────────────────────

  test("rota preview NÃO usa attachment — separação semântica com /api/pkm/raw", async () => {
    /**
     * Este teste documenta explicitamente a separação de rotas:
     * - /api/pkm/raw  → attachment (força download pelo browser)
     * - /api/pkm/preview → inline (permite visualização embutida no browser)
     *
     * Isso previne que alguém reutilize /api/pkm/raw como rota de preview
     * simplesmente mudando o parâmetro, quebrando o contrato de segurança.
     */
    mockedAuth.mockResolvedValue(createSession());

    const request = new Request(
      "http://localhost:3000/api/pkm/preview/tecnologia/documento.pdf"
    );
    const params = Promise.resolve({ path: ["tecnologia", "documento.pdf"] });

    const response = await GET(request as never, { params });

    const contentDisposition = response.headers.get("Content-Disposition");
    // A separação semântica é garantida: inline, nunca attachment
    expect(contentDisposition).toContain("inline");
    expect(contentDisposition).not.toContain("attachment");
  });
});
