/**
 * Testes do ViewerPage — Phase 4 (04-01) · Wave 0 · RED
 *
 * Cobre os branches de itemKind para VIEW-04, VIEW-05 e VIEW-07:
 *
 * VIEW-04: itemKind=image renderiza ImageViewer com controles de zoom/reset,
 *          e unsupported-format NÃO aparece.
 * VIEW-05: itemKind=pdf renderiza PdfViewer com URL de preview separada da de
 *          download, e unsupported-format NÃO aparece.
 * VIEW-07: itemKind=binary e itemKind=excalidraw continuam em fallback editorial
 *          com mensagem legível e sem quebrar o shell.
 *
 * Contrato de regressão Phase 3:
 * - itemKind=markdown continua usando MarkdownViewer.
 * - ViewerPage NÃO chama getItemContent() para itens binários (evita parse UTF-8
 *   acidental de arquivo binário — T-04-05).
 *
 * ESTADO: RED — ImageViewer e PdfViewer ainda não existem nos paths:
 * - @/components/viewer/image-viewer
 * - @/components/viewer/pdf-viewer
 * Os imports abaixo causarão "Cannot find module" até que Wave 1 implemente.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock do env (obrigatório para qualquer import que use @/lib/env)
vi.mock("@/lib/env", () => ({
  env: {
    PKM_PATH: "/mock/pkm",
    AUTH_USERNAME: "test",
    AUTH_PASSWORD: "testpass123",
    NEXTAUTH_SECRET: "test-secret-with-at-least-32-characters-here",
    NEXTAUTH_URL: "http://localhost:3000",
  },
}));

// Mock do FsItemRepository — spy em getItemContent para verificar que NÃO é
// chamado em itens binários (T-04-05).
const mockGetItemContent = vi.fn().mockReturnValue("# Conteúdo markdown");
const mockGetItemFrontmatter = vi.fn().mockReturnValue({ estado: "finalizado" });
const mockGetBinaryContext = vi.fn().mockReturnValue({ sidecarContent: null, sidecarFrontmatter: null });

vi.mock("@/lib/pkm/fs-item-repository", () => ({
  FsItemRepository: vi.fn().mockImplementation(() => ({
    getItemContent: mockGetItemContent,
    getItemFrontmatter: mockGetItemFrontmatter,
    getBinaryContext: mockGetBinaryContext,
  })),
}));

// Mock do ViewerClientShell — renderiza apenas os children para simplificar o teste
vi.mock("@/components/viewer/viewer-client-shell", () => ({
  ViewerClientShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="viewer-client-shell">{children}</div>
  ),
}));

// Mock do MarkdownViewer — marcador para verificar se foi chamado
vi.mock("@/components/viewer/markdown-viewer", () => ({
  MarkdownViewer: ({ content }: { content: string }) => (
    <div data-testid="markdown-viewer">{content}</div>
  ),
}));

// Mock do ImageViewer — marcador com zoom/reset mínimos (VIEW-04, D-01, D-03, D-03b)
// Path real que Wave 1 criará
vi.mock("@/components/viewer/image-viewer", () => ({
  ImageViewer: ({ src, alt }: { src: string; alt?: string }) => (
    <div data-testid="image-viewer">
      <img src={src} alt={alt ?? ""} />
      <button data-testid="zoom-in">zoom in</button>
      <button data-testid="zoom-out">zoom out</button>
      <button data-testid="zoom-reset">reset</button>
    </div>
  ),
}));

// Mock do PdfViewer — marcador com separação inline/download (VIEW-05, D-04, D-06, D-06b)
// Path real que Wave 1 criará
vi.mock("@/components/viewer/pdf-viewer", () => ({
  PdfViewer: ({ previewUrl, downloadUrl }: { previewUrl: string; downloadUrl: string }) => (
    <div data-testid="pdf-viewer">
      <iframe title="pdf-preview" src={previewUrl} data-testid="pdf-preview-iframe" />
      <a href={downloadUrl} data-testid="pdf-download-link">Baixar PDF</a>
    </div>
  ),
}));

// Mock do UnsupportedViewer — fallback editorial (VIEW-07, D-10, D-11, D-13)
// Path real que Wave 1 criará
vi.mock("@/components/viewer/unsupported-viewer", () => ({
  UnsupportedViewer: ({ itemKind }: { itemKind: string }) => (
    <div data-testid="unsupported-format" data-item-kind={itemKind}>
      <p>Visualização não disponível para este formato</p>
      <p>Use o botão de download para acessar o arquivo</p>
    </div>
  ),
}));

// Import real após os mocks
import { ViewerPage } from "@/components/viewer/viewer-page";

// ── Item base para reutilização nos testes ───────────────────────────────────

const baseItem = {
  id: "tecnologia/_superapp/arquivo.pdf",
  label: "arquivo.pdf",
  scope: "library" as const,
  estado: "finalizado" as const,
};

// ── Testes do branch itemKind — Phase 4 ─────────────────────────────────────

describe("ViewerPage — branch itemKind (VIEW-04, VIEW-05, VIEW-07)", () => {
  /**
   * VIEW-04: imagem deve usar ImageViewer dedicado com controles de zoom/reset.
   * D-01: imagem é o protagonista — sem texto competindo.
   * D-03, D-03b: controles de zoom/reset presentes, unsupported-format ausente.
   */
  it("VIEW-04: itemKind=image renderiza ImageViewer com controles de zoom/reset, sem unsupported-format", async () => {
    const page = await ViewerPage({
      item: {
        ...baseItem,
        id: "tecnologia/_superapp/foto.png",
        label: "foto.png",
        itemKind: "image",
      },
    });
    render(page);

    // ImageViewer deve aparecer
    expect(screen.getByTestId("image-viewer")).toBeTruthy();

    // Controles mínimos de zoom/reset devem estar presentes
    expect(screen.getByTestId("zoom-in")).toBeTruthy();
    expect(screen.getByTestId("zoom-out")).toBeTruthy();
    expect(screen.getByTestId("zoom-reset")).toBeTruthy();

    // unsupported-format NÃO deve aparecer (diferente do comportamento Phase 3)
    expect(screen.queryByTestId("unsupported-format")).toBeNull();

    // MarkdownViewer NÃO deve aparecer para imagem
    expect(screen.queryByTestId("markdown-viewer")).toBeNull();
  });

  /**
   * VIEW-05: PDF deve usar PdfViewer com previewUrl separada da downloadUrl.
   * D-04: preview inline via rota dedicada /api/pkm/preview.
   * D-06, D-06b: URL de preview distinta da de download (attachment vs inline).
   */
  it("VIEW-05: itemKind=pdf renderiza PdfViewer com preview e download separados, sem unsupported-format", async () => {
    const page = await ViewerPage({
      item: {
        ...baseItem,
        id: "tecnologia/_superapp/documento.pdf",
        label: "documento.pdf",
        itemKind: "pdf",
      },
    });
    render(page);

    // PdfViewer deve aparecer
    expect(screen.getByTestId("pdf-viewer")).toBeTruthy();

    // iframe de preview deve estar presente
    expect(screen.getByTestId("pdf-preview-iframe")).toBeTruthy();

    // Link de download deve usar URL diferente da de preview
    const downloadLink = screen.getByTestId("pdf-download-link");
    const previewIframe = screen.getByTestId("pdf-preview-iframe");
    const previewSrc = previewIframe.getAttribute("src") ?? "";
    const downloadHref = downloadLink.getAttribute("href") ?? "";

    // As duas URLs devem ser distintas (D-06b: inline vs attachment são separadas)
    expect(previewSrc).not.toBe(downloadHref);
    // Preview usa /api/pkm/preview, download usa /api/pkm/raw
    expect(previewSrc).toContain("preview");
    expect(downloadHref).toContain("raw");

    // unsupported-format NÃO deve aparecer (diferente do comportamento Phase 3)
    expect(screen.queryByTestId("unsupported-format")).toBeNull();

    // MarkdownViewer NÃO deve aparecer para PDF
    expect(screen.queryByTestId("markdown-viewer")).toBeNull();
  });

  /**
   * VIEW-07: binário genérico continua em fallback editorial.
   * D-10: fallback com cópia mais legível (não "formato não suportado" genérico).
   * D-11: shell não quebra — viewer continua renderizando corretamente.
   */
  it("VIEW-07: itemKind=binary exibe UnsupportedViewer (fallback editorial), sem ImageViewer nem PdfViewer", async () => {
    const page = await ViewerPage({
      item: {
        ...baseItem,
        id: "tecnologia/_superapp/arquivo.zip",
        label: "arquivo.zip",
        itemKind: "binary",
      },
    });
    render(page);

    // Fallback editorial deve aparecer
    expect(screen.getByTestId("unsupported-format")).toBeTruthy();

    // ImageViewer e PdfViewer NÃO devem aparecer para binário genérico
    expect(screen.queryByTestId("image-viewer")).toBeNull();
    expect(screen.queryByTestId("pdf-viewer")).toBeNull();
    expect(screen.queryByTestId("markdown-viewer")).toBeNull();
  });

  /**
   * VIEW-07: excalidraw continua em fallback, read-only explicitamente fora
   * do caminho crítico.
   * D-13: preview read-only de excalidraw não é escopo desta fase.
   */
  it("VIEW-07: itemKind=excalidraw exibe UnsupportedViewer (read-only fora do caminho crítico), sem viewers específicos", async () => {
    const page = await ViewerPage({
      item: {
        ...baseItem,
        id: "tecnologia/_superapp/diagrama.excalidraw",
        label: "diagrama.excalidraw",
        itemKind: "excalidraw",
      },
    });
    render(page);

    // Fallback editorial deve aparecer
    expect(screen.getByTestId("unsupported-format")).toBeTruthy();

    // Nenhum viewer específico deve aparecer
    expect(screen.queryByTestId("image-viewer")).toBeNull();
    expect(screen.queryByTestId("pdf-viewer")).toBeNull();
    expect(screen.queryByTestId("markdown-viewer")).toBeNull();
  });

  /**
   * Regressão Phase 3: markdown continua usando MarkdownViewer.
   * A introdução dos novos branches não deve quebrar o branch existente.
   */
  it("Regressão Phase 3: itemKind=markdown continua usando MarkdownViewer, sem viewers de asset", async () => {
    const page = await ViewerPage({
      item: {
        ...baseItem,
        id: "tecnologia/_superapp/nota.md",
        label: "nota.md",
        itemKind: "markdown",
      },
    });
    render(page);

    // MarkdownViewer deve aparecer
    expect(screen.getByTestId("markdown-viewer")).toBeTruthy();

    // Nenhum viewer de asset deve aparecer para markdown
    expect(screen.queryByTestId("image-viewer")).toBeNull();
    expect(screen.queryByTestId("pdf-viewer")).toBeNull();
    expect(screen.queryByTestId("unsupported-format")).toBeNull();
  });
});

/**
 * T-04-05: ViewerPage NÃO deve chamar getItemContent() para itens binários.
 * Evita regressão de leitura UTF-8 acidental sobre arquivo binário.
 */
describe("ViewerPage — segurança de leitura (T-04-05)", () => {
  it("T-04-05: getItemContent() NÃO é chamado para itemKind=image", async () => {
    mockGetItemContent.mockClear();

    await ViewerPage({
      item: {
        ...baseItem,
        id: "tecnologia/_superapp/foto.png",
        label: "foto.png",
        itemKind: "image",
      },
    });

    expect(mockGetItemContent).not.toHaveBeenCalled();
  });

  it("T-04-05: getItemContent() NÃO é chamado para itemKind=pdf", async () => {
    mockGetItemContent.mockClear();

    await ViewerPage({
      item: {
        ...baseItem,
        id: "tecnologia/_superapp/documento.pdf",
        label: "documento.pdf",
        itemKind: "pdf",
      },
    });

    expect(mockGetItemContent).not.toHaveBeenCalled();
  });

  it("T-04-05: getItemContent() NÃO é chamado para itemKind=binary", async () => {
    mockGetItemContent.mockClear();

    await ViewerPage({
      item: {
        ...baseItem,
        id: "tecnologia/_superapp/arquivo.zip",
        label: "arquivo.zip",
        itemKind: "binary",
      },
    });

    expect(mockGetItemContent).not.toHaveBeenCalled();
  });

  it("T-04-05: getItemContent() é chamado normalmente para itemKind=markdown", async () => {
    mockGetItemContent.mockClear();

    await ViewerPage({
      item: {
        ...baseItem,
        id: "tecnologia/_superapp/nota.md",
        label: "nota.md",
        itemKind: "markdown",
      },
    });

    expect(mockGetItemContent).toHaveBeenCalledOnce();
  });
});
