/**
 * viewer-theme — Module (Phase 5, PRS-06, PRS-07)
 *
 * Define os presets de tema do viewer e expõe:
 * - VIEWER_PRESETS: catálogo dos presets disponíveis (nome + classe CSS)
 * - ViewerThemeProvider: Context provider para estado compartilhado do tema
 * - useViewerTheme: hook para ler e alterar o preset ativo
 * - ViewerThemeRoot: wrapper que aplica o preset ao root do viewer (data-theme + className)
 *
 * Requisitos:
 * - PRS-06 / D-17: o preset afeta apenas o root do viewer, nunca <html> ou <body>
 * - PRS-06 / D-18: diferenças moderadas — identidade perceptível sem skins radicais
 * - PRS-06 / D-19: setTheme ignora mudanças quando presentationActive=true
 * - T-05-12: fallback silencioso quando localStorage não estiver disponível
 *
 * Estratégia: data-attribute `data-theme="<preset>"` no root do viewer.
 * Os estilos derivados são controlados no globals.css por seletores
 * `[data-theme="chatgpt"] .prose`, `[data-theme="github"] .prose`, etc.
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

// ── Contratos de preset ─────────────────────────────────────────────────────

export type ViewerThemePresetKey = "default" | "chatgpt" | "github" | "excalidraw";

export interface ViewerPreset {
  /** Nome legível exibido no seletor de tema */
  name: string;
  /** Classe CSS aplicada ao root do viewer (data-theme="<key>" é o mecanismo primário) */
  className: string;
  /** Descrição breve da identidade visual */
  description: string;
}

/**
 * Catálogo dos presets disponíveis.
 *
 * Identidades visuais (D-18 — diferenças moderadas):
 * - default: composição atual do viewer, sem alteração visual extra
 * - chatgpt: leitura limpa e neutra — sans-serif, fundo quase-branco, coluna estreita
 * - github: documentação técnica — fonte levemente maior, code blocks com bordas tênues
 * - excalidraw: atmosfera diagrama — fundo suave off-white, texto menos denso
 */
export const VIEWER_PRESETS: Record<ViewerThemePresetKey, ViewerPreset> = {
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
const DEFAULT_PRESET: ViewerThemePresetKey = "default";

// ── Utilitário de localStorage resiliente ───────────────────────────────────

function readStoredTheme(): ViewerThemePresetKey {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in VIEWER_PRESETS) {
      return stored as ViewerThemePresetKey;
    }
  } catch {
    // T-05-12: localStorage indisponível ou restrito — continua com default
  }
  return DEFAULT_PRESET;
}

function writeStoredTheme(preset: ViewerThemePresetKey): void {
  try {
    localStorage.setItem(STORAGE_KEY, preset);
  } catch {
    // T-05-12: falha silenciosa — o viewer continua funcional
  }
}

// ── Context ──────────────────────────────────────────────────────────────────

interface ViewerThemeContextValue {
  activeTheme: ViewerThemePresetKey;
  setTheme: (
    preset: ViewerThemePresetKey,
    options?: { presentationActive?: boolean }
  ) => void;
}

const ViewerThemeContext = createContext<ViewerThemeContextValue>({
  activeTheme: DEFAULT_PRESET,
  setTheme: () => {},
});

// ── Provider ─────────────────────────────────────────────────────────────────

interface ViewerThemeProviderProps {
  children: ReactNode;
  /** Preset inicial — se omitido, lê do localStorage ou usa default */
  initialTheme?: ViewerThemePresetKey;
}

export function ViewerThemeProvider({
  children,
  initialTheme,
}: ViewerThemeProviderProps) {
  const [activeTheme, setActiveTheme] = useState<ViewerThemePresetKey>(
    () => initialTheme ?? readStoredTheme()
  );

  const setTheme = useCallback(
    (
      preset: ViewerThemePresetKey,
      options?: { presentationActive?: boolean }
    ) => {
      // D-19: ignorar mudança durante o modo apresentação
      if (options?.presentationActive) return;

      setActiveTheme(preset);
      writeStoredTheme(preset);
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

/**
 * Retorna o preset ativo e um setter que:
 * - Persiste no localStorage
 * - Ignora mudanças quando `presentationActive=true` (D-19)
 * - Não lança erro quando localStorage estiver indisponível (T-05-12)
 */
export function useViewerTheme(): ViewerThemeContextValue {
  return useContext(ViewerThemeContext);
}

// ── ViewerThemeRoot ──────────────────────────────────────────────────────────

interface ViewerThemeRootProps {
  activeTheme: ViewerThemePresetKey;
  children: ReactNode;
  className?: string;
}

/**
 * Aplica o preset ativo como data-attribute e className no root do viewer.
 *
 * D-17: nunca aplica em <html> ou <body>.
 * O seletor CSS `[data-theme="<key>"] .prose` derivará os estilos.
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
