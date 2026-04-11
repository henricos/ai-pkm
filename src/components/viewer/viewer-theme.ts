/**
 * viewer-theme.ts — Presets de tema do viewer (Phase 5, 05-04)
 *
 * Define os três presets inspirados em ChatGPT, GitHub e Excalidraw.
 * O tema é aplicado apenas ao root do viewer — a shell global nunca muda.
 *
 * Presets:
 * - default:    experiência atual, fundo neutro, prose padrão
 * - chatgpt:    leitura limpa e neutra, tipografia ampla, espaçamento generoso
 * - github:     composição e contraste de documentação técnica
 * - excalidraw: atmosfera leve e diagramática, bordas suaves
 *
 * Persistência: localStorage com fallback silencioso (T-05-12).
 * Escopo:       data-theme no root do viewer — nunca afeta o layout global (T-05-11).
 */

export type ViewerTheme = "default" | "chatgpt" | "github" | "excalidraw";

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

const STORAGE_KEY = "viewer-theme";

/**
 * Verifica se um valor é um preset de tema válido.
 * Usado para validar o que vier do localStorage (T-05-12).
 */
export function isValidTheme(value: string): value is ViewerTheme {
  return (VIEWER_THEMES as string[]).includes(value);
}

/**
 * Lê o tema salvo do localStorage.
 * Retorna null se o storage não estiver disponível ou o valor for inválido.
 * NUNCA chamar durante render (SSR) — usar apenas em useEffect ou event handlers.
 */
export function readSavedTheme(): ViewerTheme | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && isValidTheme(saved)) return saved;
  } catch {
    // localStorage pode não estar disponível (modo privado, SSR, etc.)
  }
  return null;
}

/**
 * Persiste o tema escolhido no localStorage.
 * Falha silenciosamente se o storage não estiver disponível (T-05-12).
 */
export function saveTheme(theme: ViewerTheme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Falha silenciosa — viewer continua funcional sem persistência
  }
}

/**
 * Retorna as classes Tailwind de superfície para o preset ativo.
 * Aplicadas no root do viewer (div#viewer-scroll).
 */
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

/**
 * Retorna as classes de prosa Tailwind para o preset ativo.
 * Aplicadas no <article> do MarkdownViewer via prop.
 */
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
