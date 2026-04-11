/**
 * PresentationOverlay — Palco puro de apresentação (Phase 5)
 *
 * Camada de composição sobre o conteúdo atual do viewer.
 * Renderizada pelo ViewerClientShell quando isPresentationMode=true.
 *
 * Responsabilidades:
 * - Palco puro: fundo escuro/limpo sobre o viewer, sem chrome de manutenção
 * - Hit area inferior esquerda: única região que revela os controles (D-05, D-06)
 * - Auto-hide dos controles após inatividade (D-07)
 * - Saída por Esc (D-08)
 * - Controles visíveis permanecem enquanto o mouse está sobre eles (D-09)
 *
 * Atenção:
 * - Movimento global de mouse NÃO revela os controles (D-05)
 * - Somente mouseEnter na hit area revela o cluster de controles (D-06)
 *
 * Decisões (05-CONTEXT.md):
 * - D-03: modo apresentação é superfície interna da app
 * - D-05: movimento global não ressuscita controles
 * - D-06: região de ativação no canto inferior esquerdo
 * - D-07: controles discretos, semi-transparentes, auto-ocultáveis
 * - D-08: saída por Esc ou botão dedicado
 * - T-05-05: InfoPanel fechado e bloqueado (gerenciado pelo shell pai)
 * - T-05-06: hit area dedicada e auto-hide por contrato
 * - T-05-07: não duplica viewers nem troca de rota
 */

"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { PresentationControls } from "@/components/viewer/presentation-controls";

interface PresentationOverlayProps {
  onExit: () => void;
  laserEnabled?: boolean;
  onToggleLaser?: () => void;
  children: React.ReactNode;
}

/** Tempo de inatividade até os controles se ocultarem automaticamente (ms) */
const CONTROLS_HIDE_DELAY = 3000;

export function PresentationOverlay({
  onExit,
  laserEnabled = false,
  onToggleLaser,
  children,
}: PresentationOverlayProps) {
  const [controlsVisible, setControlsVisible] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mouseOverControlsRef = useRef(false);

  // D-08: saída por Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onExit();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onExit]);

  // Limpeza do timer ao desmontar
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = setTimeout(() => {
      // Só oculta se o mouse não estiver sobre os controles
      if (!mouseOverControlsRef.current) {
        setControlsVisible(false);
      }
    }, CONTROLS_HIDE_DELAY);
  }, []);

  // D-06: hover na hit area inferior esquerda revela controles
  const handleHitAreaEnter = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    setControlsVisible(true);
  }, []);

  // D-07: ao sair da hit area, agenda o auto-hide
  const handleHitAreaLeave = useCallback(() => {
    scheduleHide();
  }, [scheduleHide]);

  // D-09: mouse sobre os controles impede auto-hide
  const handleControlsEnter = useCallback(() => {
    mouseOverControlsRef.current = true;
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
  }, []);

  const handleControlsLeave = useCallback(() => {
    mouseOverControlsRef.current = false;
    scheduleHide();
  }, [scheduleHide]);

  return (
    <div
      data-testid="presentation-stage"
      className="fixed inset-0 z-50 bg-surface-container-lowest flex items-center justify-center"
      // D-05: movimento global de mouse NÃO revela controles — sem onMouseMove aqui
    >
      {/* Conteúdo do palco — preserva o viewer atual sem duplicar */}
      <div className="w-full h-full overflow-auto">
        {children}
      </div>

      {/* Hit area inferior esquerda — única zona que revela controles (D-06) */}
      <div
        data-testid="controls-hit-area"
        data-position="bottom-left"
        className="absolute bottom-0 left-0 w-24 h-16"
        onMouseEnter={handleHitAreaEnter}
        onMouseLeave={handleHitAreaLeave}
        aria-hidden="true"
      />

      {/* Cluster de controles — visível apenas quando controlsVisible=true */}
      {controlsVisible && (
        <div
          className="absolute bottom-4 left-4"
          onMouseEnter={handleControlsEnter}
          onMouseLeave={handleControlsLeave}
        >
          <PresentationControls
            onExit={onExit}
            laserEnabled={laserEnabled}
            onToggleLaser={onToggleLaser}
          />
        </div>
      )}
    </div>
  );
}
