/**
 * viewer-theme — Presets de tema do viewer (Phase 5, PRS-06, PRS-07)
 *
 * Define os presets de tema e expõe:
 * - Tipos e constantes: ViewerTheme, VIEWER_THEMES, VIEWER_THEME_LABELS, DEFAULT_THEME, VIEWER_PRESETS
 * - Utilitários SSR-safe: isValidTheme, readSavedTheme, saveTheme, themeRootClass, themeProseClass
 * - Context API: ViewerThemeProvider, useViewerTheme
 * - Root component: ViewerThemeRoot
 *
 * Requisitos:
 * - PRS-06 / D-17: o preset afeta apenas o root do viewer, nunca <html> ou <body>
 * - PRS-06 / D-18: diferenças moderadas — identidade perceptível sem skins radicais
 * - PRS-06 / D-19: setTheme ignora mudanças quando presentationActive=true
 * - T-05-12: fallback silencioso quando localStorage não estiver disponível
 *
 * SSR Safety: localStorage NUNCA é lido durante render.
 * Inicializa com DEFAULT_THEME; aplica tema salvo em useEffect após montagem.
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

// ── Tipos e constantes ───────────────────────────────────────────────────────

export type ViewerTheme = "default" | "chatgpt" | "github" | "excalidraw";
/** @deprecated Use ViewerTheme */
export type ViewerThemePresetKey = ViewerTheme;

export interface ViewerPreset {
  /** Nome legível exibido no seletor de tema */
  name: string;
  /** Classe CSS aplicada ao root do viewer */
  className: string;
  /** Descrição breve da identidade visual */
  description: string;
}

export const VIEWER_THEMES: ViewerTheme[] = [
  "default",
  "chatgpt",
  "github",
  "excalidraw",
];

export const VIEWER_THEME_LABELS: Record<ViewerTheme, string> = {
  default: "Padrão",
  chatgpt: "ChatGPT",
  github: "GitHub",
  excalidraw: "Excalidraw",
};

export const DEFAULT_THEME: ViewerTheme = "default";

/**
 * Catálogo dos presets disponíveis.
 * Identidades visuais (D-18 — diferenças moderadas):
 * - default: composição atual do viewer, sem alteração visual extra
 * - chatgpt: leitura limpa e neutra — sans-serif, fundo quase-branco, coluna estreita
 * - github: documentação técnica — code blocks com bordas tênues
 * - excalidraw: atmosfera diagrama — fundo suave off-white, texto menos denso
 */
export const VIEWER_PRESETS: Record<ViewerTheme, ViewerPreset> = {
  default: {
    name: "Padrão",
    className: "viewer-theme-default",
    description: "Composição padrão do viewer",
  },
  chatgpt: {
    name: "ChatGPT",
    className: "viewer-theme-chatgpt",
    description: "Leitura limpa e neutra",
  },
  github: {
    name: "GitHub",
    className: "viewer-theme-github",
    description: "Documentação técnica",
  },
  excalidraw: {
    name: "Excalidraw",
    className: "viewer-theme-excalidraw",
    description: "Atmosfera diagrama leve",
  },
};

const STORAGE_KEY = "viewer-theme";

// ── Utilitários SSR-safe ─────────────────────────────────────────────────────

export function isValidTheme(value: string): value is ViewerTheme {
  return (VIEWER_THEMES as string[]).includes(value);
}

/**
 * Lê o tema salvo do localStorage.
 * Retorna null se indisponível ou inválido.
 * NUNCA chamar durante render (SSR) — usar apenas em useEffect ou event handlers.
 */
export function readSavedTheme(): ViewerTheme | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && isValidTheme(saved)) return saved;
  } catch {
    // T-05-12: localStorage pode não estar disponível
  }
  return null;
}

export function saveTheme(theme: ViewerTheme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // T-05-12: falha silenciosa
  }
}

export function themeRootClass(theme: ViewerTheme): string {
  switch (theme) {
    case "chatgpt":
      return "bg-[#ffffff] text-[#0d0d0d]";
    case "github":
      return "bg-[#ffffff] text-[#1f2328]";
    case "excalidraw":
      return "bg-[#f5f0e8] text-[#1b1b1f]";
    default:
      return "bg-surface-container-lowest";
  }
}

export function themeProseClass(theme: ViewerTheme): string {
  switch (theme) {
    case "chatgpt":
      return "prose prose-neutral max-w-none";
    case "github":
      return "prose prose-sm prose-github max-w-none";
    case "excalidraw":
      return "prose prose-sm prose-stone max-w-none";
    default:
      return "prose prose-sm max-w-none bg-surface-container-lowest";
  }
}

// ── Context ──────────────────────────────────────────────────────────────────

interface ViewerThemeContextValue {
  activeTheme: ViewerTheme;
  setTheme: (
    preset: ViewerTheme,
    options?: { presentationActive?: boolean }
  ) => void;
}

const ViewerThemeContext = createContext<ViewerThemeContextValue>({
  activeTheme: DEFAULT_THEME,
  setTheme: () => {},
});

// ── Provider ─────────────────────────────────────────────────────────────────

interface ViewerThemeProviderProps {
  children: ReactNode;
  /** Preset inicial — se omitido, lê do localStorage após montagem */
  initialTheme?: ViewerTheme;
}

export function ViewerThemeProvider({
  children,
  initialTheme,
}: ViewerThemeProviderProps) {
  // SSR Safety: inicializa com o default para que servidor e cliente concordem.
  // O tema salvo é aplicado em useEffect, após a hidratação.
  const [activeTheme, setActiveTheme] = useState<ViewerTheme>(
    initialTheme ?? DEFAULT_THEME
  );

  useEffect(() => {
    if (!initialTheme) {
      const saved = readSavedTheme();
      if (saved) setActiveTheme(saved);
    }
  }, [initialTheme]);

  const setTheme = useCallback(
    (
      preset: ViewerTheme,
      options?: { presentationActive?: boolean }
    ) => {
      // D-19: ignorar mudança durante o modo apresentação
      if (options?.presentationActive) return;
      setActiveTheme(preset);
      saveTheme(preset);
    },
    []
  );

  return React.createElement(
    ViewerThemeContext.Provider,
    { value: { activeTheme, setTheme } },
    children
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useViewerTheme(): ViewerThemeContextValue {
  return useContext(ViewerThemeContext);
}

// ── ViewerThemeRoot ──────────────────────────────────────────────────────────

interface ViewerThemeRootProps {
  activeTheme: ViewerTheme;
  children: ReactNode;
  className?: string;
}

/**
 * Aplica o preset ativo como data-attribute e className no root do viewer.
 * D-17: nunca aplica em <html> ou <body>.
 */
export function ViewerThemeRoot({
  activeTheme,
  children,
  className = "",
}: ViewerThemeRootProps) {
  const preset = VIEWER_PRESETS[activeTheme];
  const combinedClass = [preset.className, className].filter(Boolean).join(" ");

  return React.createElement(
    "div",
    {
      "data-testid": "viewer-theme-root",
      "data-theme": activeTheme,
      className: combinedClass || undefined,
    },
    children
  );
}
