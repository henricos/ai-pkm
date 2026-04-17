/**
 * ViewerClientShell — Client Component (Phase 3 + Phase 5)
 *
 * Orquestra o estado cliente do viewer:
 * - panelOpen/onTogglePanel/onClose — painel de informações (Phase 3)
 * - isPresentationMode — modo apresentação interno (Phase 5, PRS-01, PRS-02)
 * - activeTheme — preset de tema do viewer (Phase 5, PRS-06)
 * - laserEnabled — toggle do ponteiro laser (Phase 5, PRS-05)
 *
 * SSR Safety: o tema NUNCA é lido do localStorage durante o render inicial.
 * Inicializa com DEFAULT_THEME para que servidor e cliente concordem.
 * Após a montagem (useEffect), aplica o tema salvo — evita erro de hidratação.
 *
 * Layout push (D-14, Phase 3):
 * AppShell > main (h-full overflow-y-auto)
 *   ViewerClientShell (flex h-full overflow-hidden)
 *     div#viewer-scroll (flex-1 overflow-y-auto) — scroll real acontece aqui
 *       ViewerHeader (sticky top-0)
 *       [children — viewer por tipo]
 *     InfoPanel (w-[280px] aside, quando panelOpen e não em presentationMode)
 *
 * Modo apresentação (Phase 5):
 * - Ao entrar, PresentationOverlay é renderizado como camada fixa sobre tudo (z-50)
 * - InfoPanel é fechado e bloqueado enquanto o modo está ativo (T-05-05)
 * - Saída por Esc ou botão dedicado dentro do overlay (D-08)
 * - Não troca de rota nem duplica viewers (T-05-07)
 *
 * Decisões (05-CONTEXT.md):
 * - D-02: InfoPanel indisponível no modo apresentação
 * - D-03: modo apresentação é estado interno, não fullscreen nativo
 * - D-08: saída por Esc e botão dedicado
 */

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ViewerHeader } from "@/components/viewer/viewer-header";
import { InfoPanel } from "@/components/viewer/info-panel";
import { PresentationOverlay } from "@/components/viewer/presentation-overlay";
import { LaserPointerOverlay } from "@/components/viewer/laser-pointer-overlay";
import { ViewerThemeRoot } from "@/components/viewer/viewer-theme";
import {
  DEFAULT_THEME,
  applyBootstrapThemeAttribute,
  readSavedTheme,
  saveTheme,
  type ViewerTheme,
} from "@/components/viewer/viewer-theme";
import type { RawFrontmatter } from "@/lib/pkm/types";

interface ViewerClientShellProps {
  topic: string;
  group?: string;
  estado: "rascunho" | "finalizado";
  itemId: string;
  /** URL de download calculada com withBasePath() em viewer-page.tsx (D-06, D-07) */
  downloadHref: string;
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
  downloadHref,
  frontmatter,
  children,
  sidecarContent,
}: ViewerClientShellProps) {
  // Phase 3: painel de informações
  const [panelOpen, setPanelOpen] = useState(false);
  const togglePanel = useCallback(() => setPanelOpen((p) => !p), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);

  // Phase 5: modo apresentação interno (PRS-01, PRS-02)
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  // Phase 5: preset de tema do viewer (PRS-06)
  // SSR Safety: inicializa com DEFAULT_THEME — servidor e cliente concordam no render inicial.
  // Lê o localStorage apenas após a montagem (useEffect).
  const [activeTheme, setActiveTheme] = useState<ViewerTheme>(DEFAULT_THEME);
  const hydratedThemeRef = useRef(false);

  useEffect(() => {
    if (!hydratedThemeRef.current) {
      hydratedThemeRef.current = true;

      const saved = readSavedTheme();
      applyBootstrapThemeAttribute(document.documentElement, saved);

      if (saved) {
        setActiveTheme(saved);
      }

      return;
    }

    applyBootstrapThemeAttribute(document.documentElement, activeTheme);
  }, [activeTheme]);

  // Phase 5: toggle do ponteiro laser (PRS-05)
  const [laserEnabled, setLaserEnabled] = useState(false);
  const toggleLaser = useCallback(() => setLaserEnabled((v) => !v), []);

  // Entrar em presentation mode: fecha e bloqueia o InfoPanel (D-02, T-05-05)
  const enterPresentationMode = useCallback(() => {
    setPanelOpen(false);
    setIsPresentationMode(true);
  }, []);

  // Sair do presentation mode: restaura shell normal
  // O estado do laser é preservado — entrar/sair do modo não interfere com laser ligado/desligado
  const exitPresentationMode = useCallback(() => {
    setIsPresentationMode(false);
  }, []);

  return (
    <>
      <div className="flex h-full overflow-hidden">
        {/* Container de scroll do conteúdo — id fixo para ViewerHeader detectar scroll */}
        <div
          id="viewer-scroll"
          className="flex-1 min-w-0 overflow-y-auto bg-surface-container-lowest"
        >
          <ViewerHeader
            topic={topic}
            group={group}
            estado={estado}
            itemId={itemId}
            downloadHref={downloadHref}
            panelOpen={panelOpen}
            onTogglePanel={togglePanel}
            onEnterPresentation={enterPresentationMode}
            activeTheme={activeTheme}
            onChangeTheme={(theme) => {
              setActiveTheme(theme);
              saveTheme(theme);
            }}
            presentationActive={isPresentationMode}
            laserEnabled={laserEnabled}
            onToggleLaser={toggleLaser}
          />
          {/* Conteúdo por tipo — oculto visualmente no modo apresentação (T-05-07: não duplicar) */}
          {/* ViewerThemeRoot: aplica preset apenas ao viewer root, não na shell (D-17, T-05-11) */}
          {/* LaserPointerOverlay: camada transversal ao viewer fora do modo apresentação (PRS-05 / D-13) */}
          {!isPresentationMode && (
            <ViewerThemeRoot activeTheme={activeTheme}>
              <LaserPointerOverlay active={laserEnabled}>
                {children}
              </LaserPointerOverlay>
            </ViewerThemeRoot>
          )}
        </div>

        {/* D-14: Painel push — ao lado do conteúdo, não overlay */}
        {/* D-02: InfoPanel bloqueado no modo apresentação */}
        <InfoPanel
          panelOpen={panelOpen && !isPresentationMode}
          onClose={closePanel}
          frontmatter={frontmatter}
          topic={topic}
          group={group}
          sidecarContent={sidecarContent}
        />
      </div>

      {/* Modo apresentação: palco puro como camada fixa sobre tudo (T-05-07) */}
      {/* ViewerThemeRoot: preset preservado no modo apresentação (D-17) */}
      {isPresentationMode && (
        <PresentationOverlay
          onExit={exitPresentationMode}
          laserEnabled={laserEnabled}
          onToggleLaser={toggleLaser}
        >
          <ViewerThemeRoot activeTheme={activeTheme}>
            {children}
          </ViewerThemeRoot>
        </PresentationOverlay>
      )}
    </>
  );
}
