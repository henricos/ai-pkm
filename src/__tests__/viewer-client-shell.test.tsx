/**
 * Testes do ViewerClientShell — Phase 5 (05-01) · Wave 0 · RED
 *
 * Cobre os comportamentos exigidos por PRS-01, PRS-02, PRS-07:
 * - PRS-01 / D-03: entrar em presentation mode é operação interna da app,
 *                  não simples fullscreen nativo.
 * - PRS-02 / D-08: Esc sai do modo apresentação.
 * - PRS-07 / D-02: InfoPanel fica indisponível no modo apresentação.
 *
 * ESTADO: RED — ViewerClientShell ainda não implementa estado de
 * presentationMode. O componente atual só gerencia panelOpen.
 *
 * Mocks leves: os viewers (MarkdownViewer, ImageViewer, PdfViewer) são
 * substituídos por divs com data-testid para manter o teste focado na shell.
 */

import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";

// Mock do env
vi.mock("@/lib/env", () => ({
  env: {
    PKM_PATH: "/mock/pkm",
    AUTH_USERNAME: "test",
    AUTH_PASSWORD: "testpass123",
    NEXTAUTH_SECRET: "test-secret-with-at-least-32-characters-here",
    NEXTAUTH_URL: "http://localhost:3000",
  },
}));

// Mock do ViewerHeader — expõe onEnterPresentation para acionar o modo
vi.mock("@/components/viewer/viewer-header", () => ({
  ViewerHeader: ({
    panelOpen,
    onTogglePanel,
    onEnterPresentation,
    presentationActive,
  }: {
    panelOpen: boolean;
    onTogglePanel: () => void;
    onEnterPresentation?: () => void;
    presentationActive?: boolean;
  }) => (
    <div data-testid="viewer-header" data-presentation-active={String(presentationActive)}>
      <button
        data-testid="presentation-button"
        onClick={onEnterPresentation}
        disabled={presentationActive}
      >
        Apresentação
      </button>
      <button
        data-testid="toggle-panel-button"
        aria-pressed={String(panelOpen)}
        onClick={onTogglePanel}
        disabled={presentationActive}
      >
        Painel
      </button>
    </div>
  ),
}));

// Mock do InfoPanel — expõe panelOpen como data-testid
vi.mock("@/components/viewer/info-panel", () => ({
  InfoPanel: ({
    panelOpen,
    onClose,
  }: {
    panelOpen: boolean;
    onClose: () => void;
  }) => (
    panelOpen ? (
      <aside data-testid="info-panel">
        <button data-testid="close-panel" onClick={onClose}>Fechar</button>
      </aside>
    ) : null
  ),
}));

// Import real — presentationMode ainda não existe no componente → RED
import { ViewerClientShell } from "@/components/viewer/viewer-client-shell";

const defaultProps = {
  topic: "tecnologia",
  itemId: "tecnologia/nota.md",
  estado: "finalizado" as const,
  frontmatter: { estado: "finalizado" as const },
};

const ChildContent = () => <div data-testid="main-content">Conteúdo principal</div>;

// ── PRS-01 / D-03: Modo apresentação interno ─────────────────────────────────

describe("ViewerClientShell — PRS-01: entrar em presentation mode", () => {
  /**
   * PRS-01 / D-03: entrar no modo apresentação oculta o header normal
   * e preserva o conteúdo principal.
   */
  test("PRS-01: entrar em presentation mode oculta o header e preserva o conteúdo", () => {
    render(
      <ViewerClientShell {...defaultProps}>
        <ChildContent />
      </ViewerClientShell>
    );

    // Acionar o modo apresentação via botão do header
    const presentationBtn = screen.getByTestId("presentation-button");
    fireEvent.click(presentationBtn);

    // Conteúdo principal deve continuar visível
    expect(screen.getByTestId("main-content")).toBeTruthy();

    // Header deve estar oculto ou marcado como inativo no modo apresentação
    // (o shell aplica presentationActive=true ao header)
    const header = screen.queryByTestId("viewer-header");
    if (header) {
      // Se o header ainda está no DOM, deve estar marcado como presentation ativo
      expect(header.getAttribute("data-presentation-active")).toBe("true");
    }
  });

  /**
   * PRS-07 / D-02: no modo apresentação, o InfoPanel não pode ser aberto.
   * O toggle deve estar desabilitado.
   */
  test("PRS-07: InfoPanel não pode ser aberto no modo apresentação", () => {
    render(
      <ViewerClientShell {...defaultProps}>
        <ChildContent />
      </ViewerClientShell>
    );

    // Entrar no modo apresentação
    const presentationBtn = screen.getByTestId("presentation-button");
    fireEvent.click(presentationBtn);

    // O painel de toggle deve estar desabilitado
    const toggleBtn = screen.queryByTestId("toggle-panel-button");
    if (toggleBtn) {
      expect(toggleBtn.hasAttribute("disabled")).toBe(true);
    }

    // InfoPanel não deve aparecer
    expect(screen.queryByTestId("info-panel")).toBeNull();
  });

  /**
   * PRS-01: o modo apresentação é estado interno da shell,
   * não simples toggle de CSS ou fullscreen nativo.
   * Verifica que existe uma estrutura de "palco" no DOM ao entrar.
   */
  test("PRS-01: estrutura de palco (presentation-stage) existe ao entrar no modo", () => {
    render(
      <ViewerClientShell {...defaultProps}>
        <ChildContent />
      </ViewerClientShell>
    );

    // Antes de entrar no modo, não há palco
    expect(screen.queryByTestId("presentation-stage")).toBeNull();

    // Entrar no modo apresentação
    const presentationBtn = screen.getByTestId("presentation-button");
    fireEvent.click(presentationBtn);

    // Estrutura de palco deve aparecer
    expect(screen.getByTestId("presentation-stage")).toBeTruthy();
  });
});

// ── PRS-02 / D-08: Saída por Esc ─────────────────────────────────────────────

describe("ViewerClientShell — PRS-02: sair com Esc", () => {
  /**
   * PRS-02 / D-08: pressionar Esc sai do modo apresentação e volta
   * ao shell normal.
   */
  test("PRS-02: Esc sai do modo apresentação e restaura o shell normal", () => {
    render(
      <ViewerClientShell {...defaultProps}>
        <ChildContent />
      </ViewerClientShell>
    );

    // Entrar no modo apresentação
    const presentationBtn = screen.getByTestId("presentation-button");
    fireEvent.click(presentationBtn);

    // Confirmar que entrou no modo
    expect(screen.getByTestId("presentation-stage")).toBeTruthy();

    // Pressionar Esc
    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

    // O palco deve desaparecer
    expect(screen.queryByTestId("presentation-stage")).toBeNull();
  });

  /**
   * PRS-02: após sair do modo apresentação via Esc, o shell
   * volta ao estado normal (header visível, toggle do painel funcional).
   */
  test("PRS-02: após Esc, o header volta ao estado normal e InfoPanel pode ser aberto", () => {
    const { container } = render(
      <ViewerClientShell {...defaultProps}>
        <ChildContent />
      </ViewerClientShell>
    );

    // Entrar e sair do modo apresentação
    const presentationBtn = screen.getByTestId("presentation-button");
    fireEvent.click(presentationBtn);
    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

    // O header deve estar em modo normal (presentation-active = false)
    const header = screen.queryByTestId("viewer-header");
    if (header) {
      expect(header.getAttribute("data-presentation-active")).toBe("false");
    }

    // O toggle do painel deve estar habilitado novamente
    const toggleBtn = screen.getByTestId("toggle-panel-button");
    expect(toggleBtn.hasAttribute("disabled")).toBe(false);
  });
});

// ── Compatibilidade com tipos de viewer ──────────────────────────────────────

describe("ViewerClientShell — presentation mode por tipo de viewer", () => {
  /**
   * PRS-01: o modo apresentação deve funcionar para qualquer tipo de conteúdo
   * (markdown, imagem, PDF), não apenas markdown.
   */
  test("PRS-01: modo apresentação funciona com conteúdo de imagem", () => {
    render(
      <ViewerClientShell {...defaultProps} itemId="tecnologia/foto.png">
        <div data-testid="image-viewer">Visualizador de imagem</div>
      </ViewerClientShell>
    );

    const presentationBtn = screen.getByTestId("presentation-button");
    fireEvent.click(presentationBtn);

    expect(screen.getByTestId("presentation-stage")).toBeTruthy();
    expect(screen.getByTestId("image-viewer")).toBeTruthy();
  });

  test("PRS-01: modo apresentação funciona com conteúdo de PDF", () => {
    render(
      <ViewerClientShell {...defaultProps} itemId="tecnologia/doc.pdf">
        <div data-testid="pdf-viewer">Visualizador de PDF</div>
      </ViewerClientShell>
    );

    const presentationBtn = screen.getByTestId("presentation-button");
    fireEvent.click(presentationBtn);

    expect(screen.getByTestId("presentation-stage")).toBeTruthy();
    expect(screen.getByTestId("pdf-viewer")).toBeTruthy();
  });
});
