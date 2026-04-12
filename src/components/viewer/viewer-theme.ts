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
import {
  DEFAULT_THEME,
  VIEWER_PRESETS,
  VIEWER_THEMES,
  VIEWER_THEME_BOOTSTRAP_ATTR,
  VIEWER_THEME_LABELS,
  VIEWER_THEME_SCOPE_ATTR,
  applyBootstrapThemeAttribute,
  buildViewerThemeBootstrapScript,
  isValidTheme,
  readSavedThemeFromStorage,
  writeSavedThemeToStorage,
  type ViewerPreset,
  type ViewerTheme,
} from "@/components/viewer/viewer-theme-contract";

export {
  DEFAULT_THEME,
  VIEWER_PRESETS,
  VIEWER_THEMES,
  VIEWER_THEME_BOOTSTRAP_ATTR,
  VIEWER_THEME_LABELS,
  VIEWER_THEME_SCOPE_ATTR,
  applyBootstrapThemeAttribute,
  buildViewerThemeBootstrapScript,
  isValidTheme,
  type ViewerPreset,
  type ViewerTheme,
};
/** @deprecated Use ViewerTheme */
export type ViewerThemePresetKey = ViewerTheme;

// ── Utilitários SSR-safe ─────────────────────────────────────────────────────

/**
 * Lê o tema salvo do localStorage.
 * Retorna null se indisponível ou inválido.
 * NUNCA chamar durante render (SSR) — usar apenas em useEffect ou event handlers.
 */
export function readSavedTheme(): ViewerTheme | null {
  return readSavedThemeFromStorage(localStorage);
}

export function saveTheme(theme: ViewerTheme): void {
  writeSavedThemeToStorage(localStorage, theme);
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
      [VIEWER_THEME_SCOPE_ATTR]: "",
      "data-theme": activeTheme,
      className: combinedClass || undefined,
    },
    children
  );
}
