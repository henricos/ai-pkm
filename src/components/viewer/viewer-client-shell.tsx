/**
 * ViewerClientShell — Client Component (Phase 3 + Phase 5)
 *
 * Orquestra o estado cliente do viewer:
 * - panelOpen/onTogglePanel/onClose — painel de informações (Phase 3)
 * - isPresentationMode — modo apresentação interno (Phase 5, PRS-01, PRS-02)
 * - activeTheme — preset de tema do viewer (Phase 5, PRS-06)
 * - laserEnabled — toggle do ponteiro laser (Phase 5, PRS-05)
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

import { useState, useCallback } from "react";
import { ViewerHeader } from "@/components/viewer/viewer-header";
import { InfoPanel } from "@/components/viewer/info-panel";
import { PresentationOverlay } from "@/components/viewer/presentation-overlay";
import { LaserPointerOverlay } from "@/components/viewer/laser-pointer-overlay";
import type { RawFrontmatter } from "@/lib/pkm/types";
import type { ViewerThemePreset } from "@/components/viewer/viewer-header";

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
  // Phase 3: painel de informações
  const [panelOpen, setPanelOpen] = useState(false);
  const togglePanel = useCallback(() => setPanelOpen((p) => !p), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);

  // Phase 5: modo apresentação interno (PRS-01, PRS-02)
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  // Phase 5: preset de tema do viewer (PRS-06)
  const [activeTheme, setActiveTheme] = useState<ViewerThemePreset>("default");

  // Phase 5: toggle do ponteiro laser (PRS-05)
  const [laserEnabled, setLaserEnabled] = useState(false);
  const toggleLaser = useCallback(() => setLaserEnabled((v) => !v), []);

  // Entrar em presentation mode: fecha e bloqueia o InfoPanel (D-02, T-05-05)
  const enterPresentationMode = useCallback(() => {
    setPanelOpen(false);
    setIsPresentationMode(true);
  }, []);

  // Sair do presentation mode: restaura shell normal
  const exitPresentationMode = useCallback(() => {
    setIsPresentationMode(false);
    setLaserEnabled(false);
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
            panelOpen={panelOpen}
            onTogglePanel={togglePanel}
            onEnterPresentation={enterPresentationMode}
            activeTheme={activeTheme}
            onChangeTheme={setActiveTheme}
            presentationActive={isPresentationMode}
            laserEnabled={laserEnabled}
            onToggleLaser={toggleLaser}
          />
          {/* Conteúdo por tipo — oculto visualmente no modo apresentação (T-05-07: não duplicar) */}
          {/* LaserPointerOverlay: camada transversal ao viewer fora do modo apresentação (PRS-05 / D-13) */}
          {!isPresentationMode && (
            <LaserPointerOverlay active={laserEnabled}>
              {children}
            </LaserPointerOverlay>
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
      {isPresentationMode && (
        <PresentationOverlay
          onExit={exitPresentationMode}
          laserEnabled={laserEnabled}
          onToggleLaser={toggleLaser}
        >
          {children}
        </PresentationOverlay>
      )}
    </>
  );
}
