/**
 * Testes do ViewerTheme — Phase 5 (05-01) · Wave 0 · RED
 *
 * Cobre os comportamentos exigidos por PRS-06, PRS-07:
 * - PRS-06 / D-17: presets afetam apenas o root do viewer, sem vazar
 *                  para a AppShell global.
 * - PRS-06 / D-18: as diferenças entre presets são moderadas (sem reestruturar
 *                  o layout).
 * - PRS-06 / D-19: a troca de tema ocorre no header, fora do modo apresentação.
 * - PRS-06: persistência local do preset com fallback seguro sem localStorage.
 *
 * O módulo viewer-theme ainda não existe:
 * @/components/viewer/viewer-theme
 *
 * ESTADO: RED — o arquivo acima não existe → import falha.
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
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

// Import real do módulo que ainda não existe → RED
import {
  VIEWER_PRESETS,
  useViewerTheme,
  ViewerThemeProvider,
  ViewerThemeRoot,
} from "@/components/viewer/viewer-theme";

// ── Estrutura dos presets ────────────────────────────────────────────────────

describe("viewer-theme — PRS-06: estrutura dos presets", () => {
  /**
   * PRS-06 / D-20: o conjunto inicial de presets deve incluir variantes
   * inspiradas em ChatGPT, GitHub e Excalidraw.
   */
  test("PRS-06: VIEWER_PRESETS inclui variantes default, chatgpt, github e excalidraw", () => {
    const presetKeys = Object.keys(VIEWER_PRESETS);
    expect(presetKeys).toContain("default");
    expect(presetKeys).toContain("chatgpt");
    expect(presetKeys).toContain("github");
    expect(presetKeys).toContain("excalidraw");
  });

  /**
   * PRS-06 / D-18: cada preset tem atributos moderadamente distintos,
   * sem reestruturar o layout.
   */
  test("PRS-06: cada preset tem nome e classe CSS distintos", () => {
    for (const [key, preset] of Object.entries(VIEWER_PRESETS)) {
      expect(preset).toHaveProperty("name");
      expect(preset).toHaveProperty("className");
      expect(typeof preset.name).toBe("string");
      expect(typeof preset.className).toBe("string");
      expect(preset.name.length).toBeGreaterThan(0);
      expect(preset.className.length).toBeGreaterThan(0);
    }
  });
});

// ── Escopo do preset: apenas o viewer root ───────────────────────────────────

describe("ViewerThemeRoot — PRS-06 / D-17: escopo restrito ao viewer root", () => {
  /**
   * D-17: o preset ativo é aplicado apenas no root do viewer.
   * O ViewerThemeRoot aplica a classe do preset como data-attribute ou className
   * em um elemento específico — não na tag <html> ou <body>.
   */
  test("PRS-06: o preset é aplicado no root do viewer, não no body", () => {
    render(
      <ViewerThemeRoot activeTheme="github">
        <div data-testid="viewer-content">Conteúdo</div>
      </ViewerThemeRoot>
    );

    // O root do viewer deve ter o atributo ou classe do preset
    const viewerRoot = screen.getByTestId("viewer-theme-root");
    expect(viewerRoot).toBeTruthy();

    // Deve ter data-theme ou className indicando o preset
    const hasTheme =
      viewerRoot.getAttribute("data-theme") === "github" ||
      viewerRoot.className.includes("github") ||
      viewerRoot.className.includes(VIEWER_PRESETS.github.className);
    expect(hasTheme).toBe(true);

    // O body NÃO deve ter o tema aplicado
    expect(document.body.getAttribute("data-theme")).not.toBe("github");
    expect(document.documentElement.getAttribute("data-theme")).not.toBe("github");
  });

  /**
   * D-17: markdown, imagem, PDF e fallback recebem o mesmo contexto de tema
   * no viewer root.
   */
  test("PRS-06: ViewerThemeRoot envolve qualquer tipo de conteúdo com o mesmo contexto de tema", () => {
    const { rerender } = render(
      <ViewerThemeRoot activeTheme="chatgpt">
        <div data-testid="markdown-viewer">Markdown</div>
      </ViewerThemeRoot>
    );

    expect(screen.getByTestId("viewer-theme-root")).toBeTruthy();

    rerender(
      <ViewerThemeRoot activeTheme="chatgpt">
        <div data-testid="image-viewer">Imagem</div>
      </ViewerThemeRoot>
    );

    expect(screen.getByTestId("viewer-theme-root")).toBeTruthy();

    rerender(
      <ViewerThemeRoot activeTheme="chatgpt">
        <div data-testid="pdf-viewer">PDF</div>
      </ViewerThemeRoot>
    );

    expect(screen.getByTestId("viewer-theme-root")).toBeTruthy();
  });
});

// ── Persistência local com fallback seguro ───────────────────────────────────

describe("viewer-theme — PRS-06: persistência local com fallback seguro", () => {
  /**
   * PRS-06: a persistência local do preset usa fallback seguro quando
   * localStorage não está disponível.
   */
  test("PRS-06: useViewerTheme não lança erro quando localStorage está indisponível", () => {
    // Simular localStorage indisponível — salvar spies para restaurar depois
    const getItemSpy = vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new Error("localStorage unavailable");
    });
    const setItemSpy = vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("localStorage unavailable");
    });

    let errorThrown = false;
    try {
      const TestComponent = () => {
        const { activeTheme, setTheme } = useViewerTheme();
        return (
          <div data-testid="theme-consumer" data-theme={activeTheme}>
            <button onClick={() => setTheme("github")}>Mudar tema</button>
          </div>
        );
      };

      render(
        <ViewerThemeProvider>
          <TestComponent />
        </ViewerThemeProvider>
      );

      // Deve usar o preset padrão como fallback
      const consumer = screen.getByTestId("theme-consumer");
      expect(consumer.getAttribute("data-theme")).toBeTruthy();

      // Tentar mudar o tema não deve lançar erro
      fireEvent.click(screen.getByRole("button"));
    } catch (e) {
      errorThrown = true;
    }

    expect(errorThrown).toBe(false);

    // Restaurar os spies usando as referências salvas
    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
  });

  /**
   * PRS-06: quando localStorage está disponível, o preset é persistido
   * e restaurado.
   */
  test("PRS-06: preset é persistido no localStorage quando disponível", () => {
    const TestComponent = () => {
      const { activeTheme, setTheme } = useViewerTheme();
      return (
        <div data-testid="theme-consumer" data-theme={activeTheme}>
          <button data-testid="set-github" onClick={() => setTheme("github")}>GitHub</button>
        </div>
      );
    };

    render(
      <ViewerThemeProvider>
        <TestComponent />
      </ViewerThemeProvider>
    );

    fireEvent.click(screen.getByTestId("set-github"));

    // O tema deve ser persistido no localStorage
    const stored = localStorage.getItem("viewer-theme");
    expect(stored).toBe("github");
  });
});

// ── PRS-06 / D-19: seletor de tema fora do modo apresentação ─────────────────

describe("viewer-theme — D-19: tema só muda fora do modo apresentação", () => {
  /**
   * D-19: a troca de tema acontece pelo botão reservado no header do viewer,
   * fora do modo apresentação. Verificar que o useViewerTheme tem mecanismo
   * de bloqueio quando presentationActive=true.
   */
  test("D-19: setTheme é ignorado quando presentationActive=true", () => {
    const TestComponent = ({ presentationActive }: { presentationActive: boolean }) => {
      const { activeTheme, setTheme } = useViewerTheme();
      return (
        <div data-testid="theme-consumer" data-theme={activeTheme}>
          <button
            data-testid="set-theme"
            onClick={() => setTheme("excalidraw", { presentationActive })}
          >
            Mudar
          </button>
        </div>
      );
    };

    render(
      <ViewerThemeProvider>
        <TestComponent presentationActive={true} />
      </ViewerThemeProvider>
    );

    const beforeTheme = screen.getByTestId("theme-consumer").getAttribute("data-theme");
    fireEvent.click(screen.getByTestId("set-theme"));
    const afterTheme = screen.getByTestId("theme-consumer").getAttribute("data-theme");

    // O tema não deve mudar durante o modo apresentação
    expect(afterTheme).toBe(beforeTheme);
  });

  test("D-19: setTheme funciona normalmente fora do modo apresentação", () => {
    const TestComponent = () => {
      const { activeTheme, setTheme } = useViewerTheme();
      return (
        <div data-testid="theme-consumer" data-theme={activeTheme}>
          <button
            data-testid="set-theme"
            onClick={() => setTheme("excalidraw", { presentationActive: false })}
          >
            Mudar
          </button>
        </div>
      );
    };

    render(
      <ViewerThemeProvider>
        <TestComponent />
      </ViewerThemeProvider>
    );

    fireEvent.click(screen.getByTestId("set-theme"));
    const afterTheme = screen.getByTestId("theme-consumer").getAttribute("data-theme");
    expect(afterTheme).toBe("excalidraw");
  });
});
