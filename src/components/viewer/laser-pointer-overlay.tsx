/**
 * LaserPointerOverlay — Ponteiro laser com rastro temporal (Phase 5)
 *
 * Overlay transversal ao viewer que implementa rastro temporal com
 * dissipação progressiva, sem integrar o editor Excalidraw inteiro.
 *
 * Implementação local com SVG + requestAnimationFrame:
 * - Registra amostras de posição com timestamp via PointerEvents
 * - Descarta amostras antigas por idade (trailDurationMs)
 * - Loop RAF pausa quando documento oculto (T-05-08)
 * - pointer-events: none quando inativo (T-05-09)
 * - Trilha limpa ao desligar e ao desmontar (T-05-10)
 *
 * Contratos:
 * - active=true: overlay captura movimentos e desenha rastro
 * - active=false: pointer-events desabilitados, sem captura de eventos
 * - trailDurationMs: janela de dissipação em ms (padrão: 700ms)
 * - presentationMode: sem efeito direto aqui (laser é transversal)
 *
 * Requisitos: PRS-05 / D-13, D-15, T-05-03
 */

"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface TrailPoint {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

interface LaserPointerOverlayProps {
  /** Liga/desliga o laser. Quando false, overlay não captura eventos. */
  active: boolean;
  /** Janela de dissipação do rastro em ms (padrão: 700). */
  trailDurationMs?: number;
  /** Passado pelo shell — sem efeito funcional no overlay em si. */
  presentationMode?: boolean;
  children: React.ReactNode;
}

let pointIdCounter = 0;

export function LaserPointerOverlay({
  active,
  trailDurationMs = 700,
  children,
}: LaserPointerOverlayProps) {
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const trailRef = useRef<TrailPoint[]>([]);
  const rafRef = useRef<number | null>(null);
  const isHiddenRef = useRef(false);
  const activeRef = useRef(active);

  // Sincronizar ref com prop (evita stale closure no RAF)
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // T-05-10: limpar trilha ao desligar
  useEffect(() => {
    if (!active) {
      trailRef.current = [];
      setTrail([]);
    }
  }, [active]);

  // Dissipação por RAF — pausa quando documento oculto (T-05-08)
  useEffect(() => {
    const tick = () => {
      if (!isHiddenRef.current && activeRef.current) {
        const now = performance.now();
        const cutoff = now - trailDurationMs;
        const pruned = trailRef.current.filter((p) => p.timestamp > cutoff);
        if (pruned.length !== trailRef.current.length) {
          trailRef.current = pruned;
          setTrail([...pruned]);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [trailDurationMs]);

  // Page Visibility API — pausa RAF quando aba oculta (T-05-08)
  useEffect(() => {
    const handleVisibilityChange = () => {
      isHiddenRef.current = document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // T-05-10: limpar ao desmontar
  useEffect(() => {
    return () => {
      trailRef.current = [];
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!active || isHiddenRef.current) return;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const point: TrailPoint = {
        id: ++pointIdCounter,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        timestamp: performance.now(),
      };
      trailRef.current = [...trailRef.current, point];
      setTrail([...trailRef.current]);
    },
    [active]
  );

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {children}

      {/* Overlay SVG do laser — posicionado absolutamente sobre o conteúdo */}
      <div
        data-testid="laser-overlay"
        data-active={active ? "true" : "false"}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: active ? "auto" : "none",
          zIndex: 40,
          overflow: "hidden",
        }}
        onMouseMove={active ? handleMouseMove : undefined}
      >
        <svg
          width="100%"
          height="100%"
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          {trail.map((point, index) => {
            const age = performance.now() - point.timestamp;
            const opacity = Math.max(0, 1 - age / trailDurationMs);
            // Pontos mais recentes são maiores
            const radius = 3 + (index / Math.max(trail.length - 1, 1)) * 3;
            return (
              <circle
                key={point.id}
                data-testid="laser-trail-point"
                cx={point.x}
                cy={point.y}
                r={radius}
                fill="#ef4444"
                opacity={opacity}
              />
            );
          })}

          {/* Ponto de cursor ativo */}
          {active && trail.length > 0 && (
            <circle
              cx={trail[trail.length - 1].x}
              cy={trail[trail.length - 1].y}
              r={6}
              fill="#ef4444"
              opacity={0.95}
              style={{ filter: "drop-shadow(0 0 4px #ef444488)" }}
            />
          )}
        </svg>
      </div>
    </div>
  );
}
