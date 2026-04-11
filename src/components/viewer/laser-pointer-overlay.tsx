/**
 * LaserPointerOverlay — Ponteiro laser com rastro temporal (Phase 5)
 *
 * Overlay transversal ao viewer que implementa rastro temporal com
 * dissipação progressiva e efeito de cauda de cometa (afunilamento).
 *
 * Comportamento do rastro:
 * - O rastro só é desenhado enquanto o botão do mouse está pressionado (pointerdown)
 * - Ao soltar o mouse (pointerup), o rastro congela e inicia fade baseado em releaseTime
 * - Sem retração: pontos não são prunados durante o fade — somem juntos
 *
 * Efeito cauda de cometa:
 * - Renderizado como polígono SVG preenchido (ribbon) via buildTaperedRibbonPath
 * - Tail (ponto mais antigo) = largura zero; head (ponto mais recente) = MAX_STROKE_WIDTH
 * - Fade: opacidade total por 60% da vida, depois fade linear para zero nos últimos 40%
 *
 * Proteções:
 * - pointer-events: none quando inativo (T-05-09)
 * - Trilha limpa ao desligar e ao desmontar (T-05-10)
 * - Loop RAF pausa quando documento oculto (T-05-08)
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
  /** Janela de dissipação do rastro em ms (padrão: 400). Hold: ~100ms, fade: ~300ms. */
  trailDurationMs?: number;
  /** Passado pelo shell — sem efeito funcional no overlay em si. */
  presentationMode?: boolean;
  children: React.ReactNode;
}

let pointIdCounter = 0;

/** Espessura máxima do traço no ponto mais recente (em px) */
const MAX_STROKE_WIDTH = 5;
/** Distância mínima entre pontos consecutivos (px) */
const MIN_POINT_DIST = 3;

/**
 * Constrói um polígono SVG afunilado (ribbon) para o rastro laser.
 * Tail (index 0) → ponto de largura zero; Head (último) → MAX_STROKE_WIDTH.
 * Produz um único <path> fill sem artifacts de linecap.
 */
function buildTaperedRibbonPath(points: TrailPoint[]): string {
  const n = points.length;
  const left: Array<{ x: number; y: number }> = [];
  const right: Array<{ x: number; y: number }> = [];

  for (let i = 0; i < n; i++) {
    const halfW = (MAX_STROKE_WIDTH / 2) * (i / (n - 1));

    let dx: number, dy: number;
    if (i === 0) {
      dx = points[1].x - points[0].x;
      dy = points[1].y - points[0].y;
    } else if (i === n - 1) {
      dx = points[i].x - points[i - 1].x;
      dy = points[i].y - points[i - 1].y;
    } else {
      // Tangente central para suavidade
      dx = points[i + 1].x - points[i - 1].x;
      dy = points[i + 1].y - points[i - 1].y;
    }

    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    dx /= len;
    dy /= len;

    // Perpendicular (rotação 90°)
    const px = -dy;
    const py = dx;

    left.push({ x: points[i].x + px * halfW, y: points[i].y + py * halfW });
    right.push({ x: points[i].x - px * halfW, y: points[i].y - py * halfW });
  }

  // Caminho: lado esquerdo para frente + lado direito para trás (fechando o polígono)
  let d = `M ${left[0].x.toFixed(1)} ${left[0].y.toFixed(1)}`;
  for (let i = 1; i < left.length; i++) {
    d += ` L ${left[i].x.toFixed(1)} ${left[i].y.toFixed(1)}`;
  }
  for (let i = right.length - 1; i >= 0; i--) {
    d += ` L ${right[i].x.toFixed(1)} ${right[i].y.toFixed(1)}`;
  }
  return d + " Z";
}

export function LaserPointerOverlay({
  active,
  trailDurationMs = 400,
  children,
}: LaserPointerOverlayProps) {
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [isPressed, setIsPressed] = useState(false);
  const trailRef = useRef<TrailPoint[]>([]);
  const rafRef = useRef<number | null>(null);
  const isHiddenRef = useRef(false);
  const activeRef = useRef(active);
  const isPressedRef = useRef(false);
  /** Timestamp de quando o mouse foi solto — base estável para o fade. Null enquanto desenhando. */
  const releaseTimeRef = useRef<number | null>(null);

  // Sincronizar ref com prop (evita stale closure no RAF)
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // T-05-10: limpar trilha ao desligar
  useEffect(() => {
    if (!active) {
      isPressedRef.current = false;
      releaseTimeRef.current = null;
      setIsPressed(false);
      trailRef.current = [];
      setTrail([]);
    }
  }, [active]);

  // RAF: única fonte de setTrail (T-05-08)
  // Enquanto pressionado: pruna pontos antigos para limitar o comprimento do rastro.
  // Após soltar: congela os pontos (sem pruning) e limpa tudo ao fim do fade.
  useEffect(() => {
    const tick = () => {
      if (!isHiddenRef.current) {
        const now = performance.now();

        if (isPressedRef.current) {
          // Enquanto desenhando: pruna pontos mais velhos que trailDurationMs
          const cutoff = now - trailDurationMs;
          trailRef.current = trailRef.current.filter((p) => p.timestamp > cutoff);
        } else if (releaseTimeRef.current !== null) {
          // Fade em andamento: não pruna — limpa tudo quando o fade termina
          if (now - releaseTimeRef.current >= trailDurationMs) {
            trailRef.current = [];
            releaseTimeRef.current = null;
          }
        }

        setTrail([...trailRef.current]);
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

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!active || isHiddenRef.current) return;
      isPressedRef.current = true;
      releaseTimeRef.current = null; // cancela fade pendente ao recomeçar
      setIsPressed(true);
      const el = e.currentTarget as HTMLElement;
      if (typeof el.setPointerCapture === "function") {
        el.setPointerCapture(e.pointerId);
      }
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (!isFinite(x) || !isFinite(y)) return;
      trailRef.current = [{ id: ++pointIdCounter, x, y, timestamp: performance.now() }];
    },
    [active]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!active || !isPressedRef.current || isHiddenRef.current) return;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (!isFinite(x) || !isFinite(y)) return;
      const last = trailRef.current[trailRef.current.length - 1];
      if (last) {
        const dx = x - last.x;
        const dy = y - last.y;
        if (Math.sqrt(dx * dx + dy * dy) < MIN_POINT_DIST) return;
      }
      trailRef.current = [...trailRef.current, { id: ++pointIdCounter, x, y, timestamp: performance.now() }];
    },
    [active]
  );

  const handlePointerUp = useCallback(() => {
    isPressedRef.current = false;
    setIsPressed(false);
    // Inicia o fade a partir de agora (referência estável, não muda com pruning)
    if (trailRef.current.length > 0) {
      releaseTimeRef.current = performance.now();
    }
  }, []);

  /**
   * Renderiza o rastro como polígono SVG afunilado (ribbon).
   * - 0 pontos: null
   * - 1 ponto: <circle> (sem ribbon possível)
   * - 2+ pontos: <path> fill via buildTaperedRibbonPath
   *
   * Opacidade: 1.0 por 60% da vida após soltar, fade linear para 0 nos últimos 40%.
   * Sem floor — some de vez ao invés de ficar translúcido.
   */
  const renderTrail = () => {
    if (trail.length < 2) {
      if (trail.length === 1) {
        return (
          <circle
            key={trail[0].id}
            data-testid="laser-trail-point"
            cx={trail[0].x}
            cy={trail[0].y}
            r={MAX_STROKE_WIDTH / 2}
            fill="#ef4444"
            opacity={0.9}
          />
        );
      }
      return null;
    }

    // Opacidade baseada no tempo desde o mouseup (releaseTimeRef — ref estável)
    let opacity = 1.0;
    const releaseTime = releaseTimeRef.current;
    if (releaseTime !== null) {
      const t = Math.min(1, (performance.now() - releaseTime) / trailDurationMs);
      const holdFraction = 100 / 400; // ~100ms intacto, ~300ms fade
      const fadeProgress = Math.max(0, (t - holdFraction) / (1 - holdFraction));
      opacity = 1 - fadeProgress;
    }

    const d = buildTaperedRibbonPath(trail);

    return (
      <path
        key="laser-trail"
        data-testid="laser-trail-point"
        d={d}
        fill="#ef4444"
        stroke="none"
        opacity={opacity}
      />
    );
  };

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
          cursor: active ? "crosshair" : "default",
        }}
        onPointerDown={active ? handlePointerDown : undefined}
        onPointerMove={active ? handlePointerMove : undefined}
        onPointerUp={active ? handlePointerUp : undefined}
        onPointerLeave={active ? handlePointerUp : undefined}
      >
        <svg
          width="100%"
          height="100%"
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          {renderTrail()}

          {/* Ponto de cursor ativo — visível apenas enquanto pressionado */}
          {active && trail.length > 0 && isPressed && (
            <circle
              cx={trail[trail.length - 1].x}
              cy={trail[trail.length - 1].y}
              r={MAX_STROKE_WIDTH / 2 + 1}
              fill="#ef4444"
              opacity={0.95}
              style={{ filter: "drop-shadow(0 0 3px #ef444488)" }}
            />
          )}
        </svg>
      </div>
    </div>
  );
}
