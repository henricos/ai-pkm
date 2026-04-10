import { getSingletonHighlighter } from "shiki";
import type { Root } from "hast";

const SHIKI_THEME = "github-light";

const SHIKI_LANGUAGES = [
  "text",
  "plaintext",
  "markdown",
  "md",
  "bash",
  "shell",
  "sh",
  "json",
  "yaml",
  "yml",
  "toml",
  "diff",
  "js",
  "jsx",
  "ts",
  "tsx",
  "javascript",
  "typescript",
  "html",
  "css",
  "sql",
  "python",
] as const;

const shikiCache = new Map<string, Root>();

const highlighterPromise = getSingletonHighlighter({
  themes: [SHIKI_THEME],
  langs: [...SHIKI_LANGUAGES],
});

export function warmMarkdownPipeline() {
  void highlighterPromise;
}

export const shikiRehypeOptions = {
  theme: SHIKI_THEME,
  langs: [...SHIKI_LANGUAGES],
  cache: shikiCache,
} as const;
