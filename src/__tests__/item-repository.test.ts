import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock do módulo env para não requerer variáveis reais em teste
vi.mock("@/lib/env", () => ({
  env: {
    PKM_PATH: "/mock/pkm",
    AUTH_USERNAME: "test",
    AUTH_PASSWORD: "testpass123",
    NEXTAUTH_SECRET: "test-secret-with-at-least-32-characters-here",
    NEXTAUTH_URL: "http://localhost:3000",
  },
}));

// Mock do fs
vi.mock("fs");

import fs from "fs";
import { FsItemRepository } from "@/lib/pkm/fs-item-repository";
import type { ItemRepository } from "@/lib/pkm/item-repository";

const mockTopicos = JSON.stringify([
  { id: "tecnologia", descricao: "Tecnologia e engenharia" },
]);
const mockGrupos = JSON.stringify([
  { caminho: "pkm/tecnologia/_superapp/", descricao: "Superapps", topico: "tecnologia" },
]);

describe("FsItemRepository", () => {
  beforeEach(() => {
    vi.mocked(fs.readFileSync).mockImplementation((p: unknown) => {
      if (String(p).endsWith("topicos.json")) return mockTopicos;
      if (String(p).endsWith("grupos.json")) return mockGrupos;
      return "";
    });
    vi.mocked(fs.existsSync).mockReturnValue(true);
  });

  test("ARC-01: listTopics() retorna array de Topic[] a partir do index/topicos.json", () => {
    const repo = new FsItemRepository();
    const topics = repo.listTopics();
    expect(topics).toHaveLength(1);
    expect(topics[0]?.id).toBe("tecnologia");
    expect(typeof topics[0]?.descricao).toBe("string");
  });

  test("ARC-01: listGroups() retorna grupos filtrados por tópico", () => {
    const repo = new FsItemRepository();
    const groups = repo.listGroups("tecnologia");
    expect(groups).toHaveLength(1);
    expect(groups[0]?.topico).toBe("tecnologia");
  });

  test("ARC-02: getItem() resolve ID estável (path relativo URL-decoded)", () => {
    vi.mocked(fs.readFileSync).mockReturnValue("---\nestado: rascunho\nmodelo: nota-conceito\ndata_captura: 2026-01-01\n---");
    const repo = new FsItemRepository();
    const item = repo.getItem("tecnologia/superapp/nota.md");
    expect(item?.id).toBe("tecnologia/superapp/nota.md");
  });

  test("ARC-03: getItem retorna Item com type 'url' para arquivos com prefixo url_", () => {
    vi.mocked(fs.readFileSync).mockReturnValue("---\nestado: rascunho\nmodelo: url-extrato\ndata_captura: 2026-01-01\nurl: https://exemplo.com\n---");
    const repo = new FsItemRepository();
    const item = repo.getItem("tecnologia/url_exemplo.md");
    expect(item?.type).toBe("url");
  });

  test("ARC-04: FsItemRepository implementa interface ItemRepository", () => {
    // Verificação em nível de tipo — se compilar, o contrato está satisfeito
    const repo: ItemRepository = new FsItemRepository();
    expect(typeof repo.listTopics).toBe("function");
    expect(typeof repo.listGroups).toBe("function");
    expect(typeof repo.getItem).toBe("function");
    expect(typeof repo.searchByName).toBe("function");
  });

  test("RUN-02: usa PKM_PATH do env, não path hardcoded", () => {
    const repo = new FsItemRepository();
    // getItem com path traversal deve lançar erro (prova que pkm root é usado como boundary)
    expect(() => repo.getItem("../../../etc/passwd")).toThrow("Path traversal detectado");
  });
});

describe("FsItemRepository — Phase 3 methods", () => {
  test("VIEW-01: getItemContent() retorna conteúdo Markdown sem frontmatter", () => {
    vi.mocked(fs.readFileSync).mockReturnValue(
      "---\nestado: rascunho\nmodelo: nota-conceito\ndata_captura: 2026-01-01\n---\n# Meu Conteúdo\n\nTexto aqui."
    );
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const repo = new FsItemRepository();
    const content = repo.getItemContent("tecnologia/nota.md");
    expect(content).toContain("# Meu Conteúdo");
    expect(content).not.toContain("estado:");
    expect(content).not.toContain("---");
  });

  test("T-3-01: getItemContent() lança Path traversal para id com ../", () => {
    const repo = new FsItemRepository();
    expect(() => repo.getItemContent("../../../etc/passwd")).toThrow("Path traversal detectado");
  });

  test("CTX-04: getItemFrontmatter() retorna campos do frontmatter incluindo tipo", () => {
    vi.mocked(fs.readFileSync).mockReturnValue(
      "---\ntipo: url-extrato\nestado: finalizado\nmodelo: url-extrato\ndata_captura: 2026-03-07\nurl: https://exemplo.com\nautores: [\"Autor Um\"]\n---\nConteúdo."
    );
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const repo = new FsItemRepository();
    const fm = repo.getItemFrontmatter("tecnologia/url_exemplo.md");
    expect(fm?.estado).toBe("finalizado");
    expect(fm?.tipo).toBe("url-extrato");
    expect(fm?.url).toBe("https://exemplo.com");
    expect(fm?.autores).toEqual(["Autor Um"]);
  });

  test("T-3-01: getItemFrontmatter() lança Path traversal para id com ../", () => {
    const repo = new FsItemRepository();
    expect(() => repo.getItemFrontmatter("../../../etc/passwd")).toThrow("Path traversal detectado");
  });

  test("CTX-04: getItemFrontmatter() retorna null para arquivo inexistente", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const repo = new FsItemRepository();
    const fm = repo.getItemFrontmatter("tecnologia/inexistente.md");
    expect(fm).toBeNull();
  });
});
