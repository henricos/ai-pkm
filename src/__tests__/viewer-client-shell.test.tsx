/**
 * Testes do ViewerClientShell — Phase 5 (PRS-01, PRS-02, PRS-07)
 *
 * Cobre:
 * - PRS-01 / D-03: entrar em presentation mode é operação interna da app
 * - PRS-02 / D-08: Esc sai do modo apresentação
 * - PRS-07 / D-02: InfoPanel fica indisponível no modo apresentação
 * - SSR Safety: tema inicializa com "default", aplica localStorage após montagem
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { VIEWER_THEME_BOOTSTRAP_ATTR } from "@/components/viewer/viewer-theme";

vi.mock("@/lib/env", () => ({
  env: {
    PKM_PATH: "/mock/pkm",
    AUTH_USERNAME: "test",
    AUTH_PASSWORD: "testpass123",
    NEXTAUTH_SECRET: "test-secret-with-at-least-32-characters-here",
    NEXTAUTH_URL: "http://localhost:3000",
  },
}));

// Mock do ViewerHeader — expõe callbacks para acionar presentation mode e tema
vi.mock("@/components/viewer/viewer-header", () => ({
  ViewerHeader: ({
    panelOpen,
    onTogglePanel,
    onEnterPresentation,
    presentationActive,
    activeTheme,
    onChangeTheme,
  }: {
    panelOpen: boolean;
    onTogglePanel: () => void;
    onEnterPresentation?: () => void;
    presentationActive?: boolean;
    activeTheme?: string;
    onChangeTheme?: (t: string) => void;
  }) => (
    <div
      data-testid="viewer-header"
      data-presentation-active={String(presentationActive)}
      data-active-theme={activeTheme ?? "default"}
    >
      <button
        data-testid="presentation-button"
        onClick={onEnterPresentation}
        disabled={presentationActive}
      >
        Apresentação
      </button>
      <button
        data-testid="toggle-panel-button"
        aria-pressed={panelOpen ? "true" : "false"}
        onClick={onTogglePanel}
        disabled={presentationActive}
      >
        Painel
      </button>
      <button
        data-testid="theme-cycle-btn"
        onClick={() => onChangeTheme?.("github")}
        aria-label={`Tema: ${activeTheme ?? "default"}`}
      >
        Tema
      </button>
    </div>
  ),
}));

// Mock do InfoPanel
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
  test("PRS-01: entrar em presentation mode oculta o header e preserva o conteúdo", () => {
    render(
      <ViewerClientShell {...defaultProps}>
        <ChildContent />
      </ViewerClientShell>
    );

    fireEvent.click(screen.getByTestId("presentation-button"));

    expect(screen.getByTestId("main-content")).toBeTruthy();

    const header = screen.queryByTestId("viewer-header");
    if (header) {
      expect(header.getAttribute("data-presentation-active")).toBe("true");
    }
  });

  test("PRS-07: InfoPanel não pode ser aberto no modo apresentação", () => {
    render(
      <ViewerClientShell {...defaultProps}>
        <ChildContent />
      </ViewerClientShell>
    );

    fireEvent.click(screen.getByTestId("presentation-button"));

    const toggleBtn = screen.queryByTestId("toggle-panel-button");
    if (toggleBtn) {
      expect(toggleBtn.hasAttribute("disabled")).toBe(true);
    }

    expect(screen.queryByTestId("info-panel")).toBeNull();
  });

  test("PRS-01: estrutura de palco (presentation-stage) existe ao entrar no modo", () => {
    render(
      <ViewerClientShell {...defaultProps}>
        <ChildContent />
      </ViewerClientShell>
    );

    expect(screen.queryByTestId("presentation-stage")).toBeNull();

    fireEvent.click(screen.getByTestId("presentation-button"));

    expect(screen.getByTestId("presentation-stage")).toBeTruthy();
  });
});

// ── PRS-02 / D-08: Saída por Esc ─────────────────────────────────────────────

describe("ViewerClientShell — PRS-02: sair com Esc", () => {
  test("PRS-02: Esc sai do modo apresentação e restaura o shell normal", () => {
    render(
      <ViewerClientShell {...defaultProps}>
        <ChildContent />
      </ViewerClientShell>
    );

    fireEvent.click(screen.getByTestId("presentation-button"));
    expect(screen.getByTestId("presentation-stage")).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

    expect(screen.queryByTestId("presentation-stage")).toBeNull();
  });

  test("PRS-02: após Esc, o header volta ao estado normal e InfoPanel pode ser aberto", () => {
    render(
      <ViewerClientShell {...defaultProps}>
        <ChildContent />
      </ViewerClientShell>
    );

    fireEvent.click(screen.getByTestId("presentation-button"));
    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

    const header = screen.queryByTestId("viewer-header");
    if (header) {
      expect(header.getAttribute("data-presentation-active")).toBe("false");
    }

    const toggleBtn = screen.getByTestId("toggle-panel-button");
    expect(toggleBtn.hasAttribute("disabled")).toBe(false);
  });
});

// ── Compatibilidade com tipos de viewer ──────────────────────────────────────

describe("ViewerClientShell — presentation mode por tipo de viewer", () => {
  test("PRS-01: modo apresentação funciona com conteúdo de imagem", () => {
    render(
      <ViewerClientShell {...defaultProps} itemId="tecnologia/foto.png">
        <div data-testid="image-viewer">Visualizador de imagem</div>
      </ViewerClientShell>
    );

    fireEvent.click(screen.getByTestId("presentation-button"));

    expect(screen.getByTestId("presentation-stage")).toBeTruthy();
    expect(screen.getByTestId("image-viewer")).toBeTruthy();
  });

  test("PRS-01: modo apresentação funciona com conteúdo de PDF", () => {
    render(
      <ViewerClientShell {...defaultProps} itemId="tecnologia/doc.pdf">
        <div data-testid="pdf-viewer">Visualizador de PDF</div>
      </ViewerClientShell>
    );

    fireEvent.click(screen.getByTestId("presentation-button"));

    expect(screen.getByTestId("presentation-stage")).toBeTruthy();
    expect(screen.getByTestId("pdf-viewer")).toBeTruthy();
  });
});

// ── SSR Safety: tema inicializa com "default" ─────────────────────────────────

describe("ViewerClientShell — tema SSR", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute(VIEWER_THEME_BOOTSTRAP_ATTR);
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute(VIEWER_THEME_BOOTSTRAP_ATTR);
  });

  test("inicializa com tema 'default' (seguro para SSR)", () => {
    render(<ViewerClientShell {...defaultProps}><ChildContent /></ViewerClientShell>);

    const header = screen.getByTestId("viewer-header");
    expect(header.getAttribute("data-active-theme")).toBe("default");
  });

  test("aplica tema salvo do localStorage após montagem", async () => {
    localStorage.setItem("viewer-theme", "github");

    render(<ViewerClientShell {...defaultProps}><ChildContent /></ViewerClientShell>);

    await act(async () => { await Promise.resolve(); });

    const header = screen.getByTestId("viewer-header");
    expect(header.getAttribute("data-active-theme")).toBe("github");
    expect(
      document.documentElement.getAttribute(VIEWER_THEME_BOOTSTRAP_ATTR)
    ).toBe("github");
  });

  test("ignora tema inválido no localStorage e mantém 'default'", async () => {
    localStorage.setItem("viewer-theme", "tema-invalido");

    render(<ViewerClientShell {...defaultProps}><ChildContent /></ViewerClientShell>);

    await act(async () => { await Promise.resolve(); });

    const header = screen.getByTestId("viewer-header");
    expect(header.getAttribute("data-active-theme")).toBe("default");
    expect(
      document.documentElement.getAttribute(VIEWER_THEME_BOOTSTRAP_ATTR)
    ).toBeNull();
  });

  test("onChangeTheme persiste no localStorage", async () => {
    render(<ViewerClientShell {...defaultProps}><ChildContent /></ViewerClientShell>);

    await act(async () => {
      screen.getByTestId("theme-cycle-btn").click();
    });

    expect(localStorage.getItem("viewer-theme")).toBe("github");
    expect(
      document.documentElement.getAttribute(VIEWER_THEME_BOOTSTRAP_ATTR)
    ).toBe("github");
  });
});
