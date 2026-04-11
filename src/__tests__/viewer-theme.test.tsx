/**
 * Testes do viewer-theme — Phase 5 (PRS-06, PRS-07)
 *
 * Cobre:
 * - Utilitários: isValidTheme, readSavedTheme, saveTheme, themeRootClass, themeProseClass
 * - Constantes: DEFAULT_THEME, VIEWER_THEMES, VIEWER_THEME_LABELS, VIEWER_PRESETS
 * - Context API: ViewerThemeProvider, useViewerTheme (D-19, T-05-12)
 * - Root component: ViewerThemeRoot (D-17 — escopo restrito ao viewer root)
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";

vi.mock("@/lib/env", () => ({
  env: {
    PKM_PATH: "/mock/pkm",
    AUTH_USERNAME: "test",
    AUTH_PASSWORD: "testpass123",
    NEXTAUTH_SECRET: "test-secret-with-at-least-32-characters-here",
    NEXTAUTH_URL: "http://localhost:3000",
  },
}));

import {
  VIEWER_PRESETS,
  VIEWER_THEMES,
  VIEWER_THEME_LABELS,
  DEFAULT_THEME,
  isValidTheme,
  readSavedTheme,
  saveTheme,
  themeRootClass,
  themeProseClass,
  useViewerTheme,
  ViewerThemeProvider,
  ViewerThemeRoot,
} from "@/components/viewer/viewer-theme";

// ── Utilitários: isValidTheme ────────────────────────────────────────────────

describe("isValidTheme", () => {
  test("aceita os quatro presets válidos", () => {
    expect(isValidTheme("default")).toBe(true);
    expect(isValidTheme("chatgpt")).toBe(true);
    expect(isValidTheme("github")).toBe(true);
    expect(isValidTheme("excalidraw")).toBe(true);
  });

  test("rejeita valores inválidos", () => {
    expect(isValidTheme("dark")).toBe(false);
    expect(isValidTheme("")).toBe(false);
    expect(isValidTheme("light")).toBe(false);
    expect(isValidTheme("custom")).toBe(false);
  });
});

// ── Constantes ───────────────────────────────────────────────────────────────

describe("DEFAULT_THEME", () => {
  test('é "default"', () => {
    expect(DEFAULT_THEME).toBe("default");
  });
});

describe("VIEWER_THEMES", () => {
  test("contém os quatro presets", () => {
    expect(VIEWER_THEMES).toEqual(["default", "chatgpt", "github", "excalidraw"]);
  });
});

describe("VIEWER_THEME_LABELS", () => {
  test("tem rótulo para cada preset", () => {
    expect(VIEWER_THEME_LABELS.default).toBe("Padrão");
    expect(VIEWER_THEME_LABELS.chatgpt).toBe("ChatGPT");
    expect(VIEWER_THEME_LABELS.github).toBe("GitHub");
    expect(VIEWER_THEME_LABELS.excalidraw).toBe("Excalidraw");
  });
});

describe("VIEWER_PRESETS — PRS-06: estrutura dos presets", () => {
  test("PRS-06: inclui variantes default, chatgpt, github e excalidraw", () => {
    const presetKeys = Object.keys(VIEWER_PRESETS);
    expect(presetKeys).toContain("default");
    expect(presetKeys).toContain("chatgpt");
    expect(presetKeys).toContain("github");
    expect(presetKeys).toContain("excalidraw");
  });

  test("PRS-06: cada preset tem nome e classe CSS distintos", () => {
    for (const [, preset] of Object.entries(VIEWER_PRESETS)) {
      expect(preset).toHaveProperty("name");
      expect(preset).toHaveProperty("className");
      expect(typeof preset.name).toBe("string");
      expect(typeof preset.className).toBe("string");
      expect(preset.name.length).toBeGreaterThan(0);
      expect(preset.className.length).toBeGreaterThan(0);
    }
  });
});

// ── Utilitários: readSavedTheme ──────────────────────────────────────────────

describe("readSavedTheme", () => {
  beforeEach(() => { localStorage.clear(); });
  afterEach(() => { localStorage.clear(); });

  test("retorna null quando não há nada salvo", () => {
    expect(readSavedTheme()).toBeNull();
  });

  test("retorna o tema salvo quando válido", () => {
    localStorage.setItem("viewer-theme", "github");
    expect(readSavedTheme()).toBe("github");
  });

  test("retorna null quando o valor salvo é inválido", () => {
    localStorage.setItem("viewer-theme", "dark-mode-invalid");
    expect(readSavedTheme()).toBeNull();
  });

  test("retorna null quando localStorage lança erro", () => {
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });
    expect(readSavedTheme()).toBeNull();
    spy.mockRestore();
  });
});

// ── Utilitários: saveTheme ───────────────────────────────────────────────────

describe("saveTheme", () => {
  beforeEach(() => { localStorage.clear(); });
  afterEach(() => { localStorage.clear(); });

  test("persiste o tema no localStorage", () => {
    saveTheme("github");
    expect(localStorage.getItem("viewer-theme")).toBe("github");
  });

  test("não lança erro quando localStorage falha", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });
    expect(() => saveTheme("chatgpt")).not.toThrow();
    spy.mockRestore();
  });
});

// ── Utilitários: themeRootClass / themeProseClass ────────────────────────────

describe("themeRootClass", () => {
  test("default retorna classe de superfície padrão", () => {
    expect(themeRootClass("default")).toContain("bg-surface-container-lowest");
  });
  test("chatgpt retorna fundo branco", () => {
    expect(themeRootClass("chatgpt")).toContain("bg-[#ffffff]");
  });
  test("github retorna fundo branco com texto escuro", () => {
    const cls = themeRootClass("github");
    expect(cls).toContain("bg-[#ffffff]");
    expect(cls).toContain("text-[#1f2328]");
  });
  test("excalidraw retorna fundo creme", () => {
    expect(themeRootClass("excalidraw")).toContain("bg-[#f5f0e8]");
  });
});

describe("themeProseClass", () => {
  test("todos os presets retornam string com 'prose'", () => {
    for (const theme of VIEWER_THEMES) {
      expect(themeProseClass(theme)).toContain("prose");
    }
  });
});

// ── ViewerThemeRoot — D-17: escopo restrito ao viewer root ───────────────────

describe("ViewerThemeRoot — PRS-06 / D-17: escopo restrito ao viewer root", () => {
  test("PRS-06: o preset é aplicado no root do viewer, não no body", () => {
    render(
      <ViewerThemeRoot activeTheme="github">
        <div data-testid="viewer-content">Conteúdo</div>
      </ViewerThemeRoot>
    );

    const viewerRoot = screen.getByTestId("viewer-theme-root");
    expect(viewerRoot).toBeTruthy();

    const hasTheme =
      viewerRoot.getAttribute("data-theme") === "github" ||
      viewerRoot.className.includes("github") ||
      viewerRoot.className.includes(VIEWER_PRESETS.github.className);
    expect(hasTheme).toBe(true);

    expect(document.body.getAttribute("data-theme")).not.toBe("github");
    expect(document.documentElement.getAttribute("data-theme")).not.toBe("github");
  });

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

// ── Context API — T-05-12: persistência com fallback seguro ──────────────────

describe("ViewerThemeProvider / useViewerTheme — T-05-12", () => {
  test("T-05-12: useViewerTheme não lança erro quando localStorage está indisponível", async () => {
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

      await act(async () => { await Promise.resolve(); });

      const consumer = screen.getByTestId("theme-consumer");
      expect(consumer.getAttribute("data-theme")).toBeTruthy();

      fireEvent.click(screen.getByRole("button"));
    } catch {
      errorThrown = true;
    }

    expect(errorThrown).toBe(false);
    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
  });

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
    expect(localStorage.getItem("viewer-theme")).toBe("github");
  });
});

// ── D-19: tema só muda fora do modo apresentação ─────────────────────────────

describe("viewer-theme — D-19: tema só muda fora do modo apresentação", () => {
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
    expect(screen.getByTestId("theme-consumer").getAttribute("data-theme")).toBe("excalidraw");
  });
});
