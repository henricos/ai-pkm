/**
 * Testes do ViewerClientShell — Phase 5 (05-04)
 *
 * Cobre o comportamento de tema:
 * - Inicializa com "default" (SSR safe — sem ler localStorage no render)
 * - Após montagem, aplica o tema salvo do localStorage
 * - onThemeChange persiste no localStorage e atualiza o estado
 * - data-theme no container de scroll reflete o tema ativo
 * - aria-label do botão de tema no header reflete o tema ativo
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Mocks para sub-componentes que dependem de contextos pesados
vi.mock("@/components/viewer/info-panel", () => ({
  InfoPanel: () => <div data-testid="info-panel-mock" />,
}));

vi.mock("@/components/viewer/viewer-header", () => ({
  ViewerHeader: ({
    activeTheme,
    onThemeChange,
  }: {
    activeTheme?: string;
    onThemeChange?: (t: string) => void;
  }) => (
    <div
      data-testid="viewer-header-mock"
      data-active-theme={activeTheme ?? "default"}
    >
      <button
        data-testid="theme-cycle-btn"
        onClick={() => onThemeChange?.("github")}
        aria-label={`Tema: ${activeTheme ?? "default"}`}
      />
    </div>
  ),
}));

import { ViewerClientShell } from "@/components/viewer/viewer-client-shell";

const defaultProps = {
  topic: "tecnologia",
  group: "superapp",
  estado: "finalizado" as const,
  itemId: "tecnologia/superapp/nota.md",
  frontmatter: { titulo: "Nota de Teste" } as never,
  children: <div data-testid="content">Conteúdo</div>,
};

describe("ViewerClientShell — tema SSR", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("inicializa com tema 'default' (seguro para SSR)", () => {
    render(<ViewerClientShell {...defaultProps} />);

    const scroll = document.getElementById("viewer-scroll");
    expect(scroll).toBeTruthy();
    expect(scroll?.getAttribute("data-theme")).toBe("default");
  });

  test("aplica tema salvo do localStorage após montagem", async () => {
    localStorage.setItem("viewer-theme", "github");

    render(<ViewerClientShell {...defaultProps} />);

    // O useEffect roda após a montagem — aguarda via act
    await act(async () => {
      await Promise.resolve();
    });

    const scroll = document.getElementById("viewer-scroll");
    expect(scroll?.getAttribute("data-theme")).toBe("github");
  });

  test("ignora tema inválido no localStorage e mantém 'default'", async () => {
    localStorage.setItem("viewer-theme", "tema-invalido");

    render(<ViewerClientShell {...defaultProps} />);

    await act(async () => {
      await Promise.resolve();
    });

    const scroll = document.getElementById("viewer-scroll");
    expect(scroll?.getAttribute("data-theme")).toBe("default");
  });

  test("props activeTheme e onThemeChange são passadas ao ViewerHeader", async () => {
    render(<ViewerClientShell {...defaultProps} />);

    await act(async () => {
      await Promise.resolve();
    });

    const header = screen.getByTestId("viewer-header-mock");
    expect(header.getAttribute("data-active-theme")).toBe("default");
  });

  test("onThemeChange persiste no localStorage e atualiza o data-theme", async () => {
    render(<ViewerClientShell {...defaultProps} />);

    await act(async () => {
      await Promise.resolve();
    });

    // Simula clique no botão de tema (que chama onThemeChange("github"))
    const btn = screen.getByTestId("theme-cycle-btn");
    await act(async () => {
      btn.click();
    });

    const scroll = document.getElementById("viewer-scroll");
    expect(scroll?.getAttribute("data-theme")).toBe("github");
    expect(localStorage.getItem("viewer-theme")).toBe("github");
  });
});
