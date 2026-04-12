export type ViewerTheme = "default" | "chatgpt" | "github" | "excalidraw";

export interface ViewerPreset {
  name: string;
  className: string;
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
export const VIEWER_THEME_STORAGE_KEY = "viewer-theme";
export const VIEWER_THEME_BOOTSTRAP_ATTR = "data-viewer-theme-preload";
export const VIEWER_THEME_SCOPE_ATTR = "data-viewer-scope";

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

export function isValidTheme(value: string): value is ViewerTheme {
  return (VIEWER_THEMES as string[]).includes(value);
}

export function sanitizeTheme(value: string | null | undefined): ViewerTheme | null {
  if (!value) return null;
  return isValidTheme(value) ? value : null;
}

export function resolveBootstrapTheme(
  value: string | null | undefined
): ViewerTheme | null {
  const theme = sanitizeTheme(value);
  return theme && theme !== DEFAULT_THEME ? theme : null;
}

export interface ThemeStorageReader {
  getItem(key: string): string | null;
}

export interface ThemeStorageWriter {
  setItem(key: string, value: string): void;
}

export function readSavedThemeFromStorage(
  storage: ThemeStorageReader
): ViewerTheme | null {
  try {
    return sanitizeTheme(storage.getItem(VIEWER_THEME_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function writeSavedThemeToStorage(
  storage: ThemeStorageWriter,
  theme: ViewerTheme
): void {
  try {
    storage.setItem(VIEWER_THEME_STORAGE_KEY, theme);
  } catch {
    // Falha silenciosa por contrato.
  }
}

export interface ThemeBootstrapTarget {
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
}

export function applyBootstrapThemeAttribute(
  target: ThemeBootstrapTarget,
  theme: string | null | undefined
): void {
  const bootstrapTheme = resolveBootstrapTheme(theme);

  if (bootstrapTheme) {
    target.setAttribute(VIEWER_THEME_BOOTSTRAP_ATTR, bootstrapTheme);
    return;
  }

  target.removeAttribute(VIEWER_THEME_BOOTSTRAP_ATTR);
}

export function buildViewerThemeBootstrapScript(): string {
  const validThemes = VIEWER_THEMES.filter((theme) => theme !== DEFAULT_THEME);

  return `(function(){try{var d=document.documentElement;var v=window.localStorage.getItem(${JSON.stringify(VIEWER_THEME_STORAGE_KEY)});if(${JSON.stringify(validThemes)}.indexOf(v)!==-1){d.setAttribute(${JSON.stringify(VIEWER_THEME_BOOTSTRAP_ATTR)},v);}else{d.removeAttribute(${JSON.stringify(VIEWER_THEME_BOOTSTRAP_ATTR)});}}catch(_){document.documentElement.removeAttribute(${JSON.stringify(VIEWER_THEME_BOOTSTRAP_ATTR)});}})();`;
}
