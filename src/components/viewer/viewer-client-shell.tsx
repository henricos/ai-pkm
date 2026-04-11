/**
 * ViewerClientShell — Client Component para estado do painel de informações e tema.
 *
 * Gerencia panelOpen/onTogglePanel/onClose sem precisar tornar ViewerPage um Client Component.
 * Gerencia o preset de tema ativo (Phase 5, 05-04) com persistência local.
 * Usa id="viewer-scroll" no container de scroll para ViewerHeader detectar scroll.
 *
 * SSR Safety: o tema NUNCA é lido do localStorage durante o render inicial.
 * Inicializa com DEFAULT_THEME para que servidor e cliente concordem.
 * Após a montagem (useEffect), aplica o tema salvo — evita erro de hidratação.
 *
 * Layout push (D-14):
 * AppShell > main (h-full overflow-y-auto)
 *   ViewerClientShell (flex h-full overflow-hidden)
 *     div#viewer-scroll (flex-1 overflow-y-auto) — scroll real acontece aqui
 *       ViewerHeader (sticky top-0)
 *       MarkdownViewer (article prose)
 *     InfoPanel (w-[280px] aside, quando panelOpen)
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { ViewerHeader } from "@/components/viewer/viewer-header";
import { InfoPanel } from "@/components/viewer/info-panel";
import type { RawFrontmatter } from "@/lib/pkm/types";
import {
  DEFAULT_THEME,
  readSavedTheme,
  saveTheme,
  themeRootClass,
  type ViewerTheme,
} from "@/components/viewer/viewer-theme";

interface ViewerClientShellProps {
  topic: string;
  group?: string;
  estado: "rascunho" | "finalizado";
  itemId: string;
  frontmatter: RawFrontmatter;
  children: React.ReactNode;
  /** Corpo Markdown do sidecar adjacente — Phase 4, CTX-05 */
  sidecarContent?: string | null;
}

export function ViewerClientShell({
  topic,
  group,
  estado,
  itemId,
  frontmatter,
  children,
  sidecarContent,
}: ViewerClientShellProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const togglePanel = useCallback(() => setPanelOpen((p) => !p), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);

  // SSR Safety: inicializa com DEFAULT_THEME para servidor e cliente concordarem.
  // Lê o localStorage apenas após a montagem (useEffect), evitando erro de hidratação.
  const [activeTheme, setActiveTheme] = useState<ViewerTheme>(DEFAULT_THEME);

  useEffect(() => {
    const saved = readSavedTheme();
    if (saved) {
      setActiveTheme(saved);
    }
  }, []);

  const handleThemeChange = useCallback((theme: ViewerTheme) => {
    setActiveTheme(theme);
    saveTheme(theme);
  }, []);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Container de scroll do conteúdo — id fixo para ViewerHeader detectar scroll */}
      <div
        id="viewer-scroll"
        className={`flex-1 min-w-0 overflow-y-auto ${themeRootClass(activeTheme)}`}
        data-theme={activeTheme}
      >
        <ViewerHeader
          topic={topic}
          group={group}
          estado={estado}
          itemId={itemId}
          panelOpen={panelOpen}
          onTogglePanel={togglePanel}
          activeTheme={activeTheme}
          onThemeChange={handleThemeChange}
        />
        {/* Conteúdo Markdown (children = <MarkdownViewer content={...} />) */}
        {children}
      </div>

      {/* D-14: Painel push — ao lado do conteúdo, não overlay */}
      <InfoPanel
        panelOpen={panelOpen}
        onClose={closePanel}
        frontmatter={frontmatter}
        topic={topic}
        group={group}
        sidecarContent={sidecarContent}
      />
    </div>
  );
}
