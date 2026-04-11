/**
 * Testes do viewer-theme.ts — Phase 5 (05-04)
 *
 * Cobre:
 * - isValidTheme: rejeita valores inválidos, aceita os presets
 * - readSavedTheme: lê do localStorage, retorna null em caso de erro
 * - saveTheme: persiste no localStorage, falha silenciosamente
 * - themeRootClass: retorna classes corretas por preset
 * - themeProseClass: retorna classes corretas por preset
 * - DEFAULT_THEME é "default"
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isValidTheme,
  readSavedTheme,
  saveTheme,
  themeRootClass,
  themeProseClass,
  DEFAULT_THEME,
  VIEWER_THEMES,
  VIEWER_THEME_LABELS,
} from "@/components/viewer/viewer-theme";

describe("viewer-theme", () => {
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

  describe("readSavedTheme", () => {
    let originalGetItem: typeof localStorage.getItem;

    beforeEach(() => {
      originalGetItem = localStorage.getItem.bind(localStorage);
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

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
      const errorGetItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("storage unavailable");
      });
      expect(readSavedTheme()).toBeNull();
      errorGetItem.mockRestore();
    });
  });

  describe("saveTheme", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    test("persiste o tema no localStorage", () => {
      saveTheme("github");
      expect(localStorage.getItem("viewer-theme")).toBe("github");
    });

    test("não lança erro quando localStorage falha", () => {
      const errorSetItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("quota exceeded");
      });
      expect(() => saveTheme("chatgpt")).not.toThrow();
      errorSetItem.mockRestore();
    });
  });

  describe("themeRootClass", () => {
    test("default retorna classe de superfície padrão", () => {
      const cls = themeRootClass("default");
      expect(cls).toContain("bg-surface-container-lowest");
    });

    test("chatgpt retorna fundo branco", () => {
      const cls = themeRootClass("chatgpt");
      expect(cls).toContain("bg-[#ffffff]");
    });

    test("github retorna fundo branco com texto escuro", () => {
      const cls = themeRootClass("github");
      expect(cls).toContain("bg-[#ffffff]");
      expect(cls).toContain("text-[#1f2328]");
    });

    test("excalidraw retorna fundo creme", () => {
      const cls = themeRootClass("excalidraw");
      expect(cls).toContain("bg-[#f5f0e8]");
    });
  });

  describe("themeProseClass", () => {
    test("todos os presets retornam string com 'prose'", () => {
      for (const theme of VIEWER_THEMES) {
        expect(themeProseClass(theme)).toContain("prose");
      }
    });
  });
});
