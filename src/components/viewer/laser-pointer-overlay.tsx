/**
 * LaserPointerOverlay — Ponteiro laser com rastro temporal (Phase 5)
 *
 * Overlay transversal ao viewer que implementa rastro temporal com
 * dissipação progressiva e efeito de cauda de cometa (espessura variável).
 *
 * Comportamento do rastro:
 * - O rastro só é desenhado enquanto o botão do mouse está pressionado (pointerdown)
 * - Ao soltar o mouse (pointerup), o rastro começa a dissipar normalmente
 * - O cursor muda para crosshair quando o laser está ativo mas o mouse não está pressionado
 *
 * Efeito cauda de cometa:
 * - Os pontos são conectados por segmentos de linha SVG para garantir continuidade
 * - A espessura de cada segmento varia proporcionalmente à idade: ponto novo = grosso,
 *   ponto antigo = fino (até zero)
 * - Usa stroke-linecap e stroke-linejoin round para suavidade
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
  /** Janela de dissipação do rastro em ms (padrão: 700). */
  trailDurationMs?: number;
  /** Passado pelo shell — sem efeito funcional no overlay em si. */
  presentationMode?: boolean;
  children: React.ReactNode;
}

let pointIdCounter = 0;

/** Espessura máxima do traço no ponto mais recente (em px) */
const MAX_STROKE_WIDTH = 5;
/** Espessura mínima abaixo da qual o segmento fica transparente */
const MIN_STROKE_WIDTH = 0.5;

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
  const isPressedRef = useRef(false);

  // Sincronizar ref com prop (evita stale closure no RAF)
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // T-05-10: limpar trilha ao desligar
  useEffect(() => {
    if (!active) {
      isPressedRef.current = false;
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

  // Rastro apenas com mouse pressionado (pointerdown ativo)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!active || isHiddenRef.current) return;
      isPressedRef.current = true;
      // setPointerCapture pode não estar disponível em ambientes de teste (jsdom)
      const el = e.currentTarget as HTMLElement;
      if (typeof el.setPointerCapture === "function") {
        el.setPointerCapture(e.pointerId);
      }
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (!isFinite(x) || !isFinite(y)) return;
      const point: TrailPoint = {
        id: ++pointIdCounter,
        x,
        y,
        timestamp: performance.now(),
      };
      trailRef.current = [point];
      setTrail([point]);
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
      const point: TrailPoint = {
        id: ++pointIdCounter,
        x,
        y,
        timestamp: performance.now(),
      };
      trailRef.current = [...trailRef.current, point];
      setTrail([...trailRef.current]);
    },
    [active]
  );

  const handlePointerUp = useCallback(() => {
    isPressedRef.current = false;
  }, []);

  /**
   * Renderiza o rastro como uma série de segmentos de linha SVG,
   * cada um com espessura proporcional à posição relativa no rastro
   * (efeito cauda de cometa: grosso na ponta, fino na cauda).
   */
  const renderTrail = () => {
    if (trail.length < 2) {
      // Único ponto: renderizar como círculo
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

    const now = performance.now();
    const segments: React.ReactNode[] = [];

    for (let i = 1; i < trail.length; i++) {
      const prev = trail[i - 1];
      const curr = trail[i];

      // Posição relativa no rastro: 0 = cauda mais antiga, 1 = ponta mais nova
      const relativePos = i / (trail.length - 1);

      // Espessura proporcional à posição: ponta = MAX, cauda = MIN
      const strokeWidth =
        MIN_STROKE_WIDTH + (MAX_STROKE_WIDTH - MIN_STROKE_WIDTH) * relativePos;

      // Opacidade baseada na idade do ponto atual
      const age = now - curr.timestamp;
      const opacity = Math.max(0, 1 - age / trailDurationMs);

      if (opacity < 0.01) continue;

      segments.push(
        <line
          key={`seg-${prev.id}-${curr.id}`}
          data-testid="laser-trail-point"
          x1={prev.x}
          y1={prev.y}
          x2={curr.x}
          y2={curr.y}
          stroke="#ef4444"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={opacity}
        />
      );
    }

    return segments;
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
          {active && trail.length > 0 && isPressedRef.current && (
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
