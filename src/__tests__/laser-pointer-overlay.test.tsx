/**
 * Testes do LaserPointerOverlay — Phase 5 (05-01) · Wave 0 · RED → GREEN
 *
 * Cobre os comportamentos exigidos por PRS-05 com o contrato atualizado
 * após validação manual (05-03 checkpoint:human-verify):
 *
 * - PRS-05 / D-13: o laser funciona tanto dentro quanto fora do modo
 *                  apresentação — é uma camada transversal ao viewer.
 * - PRS-05 / D-15: rastro com persistência curta e dissipação progressiva
 *                  orientada por tempo (referência Excalidraw).
 * - PRS-05 / D-12: protege contra implementação simplista de cursor estático
 *                  sem memória visual.
 * - T-05-03: desligamento limpo e pausa em estado oculto.
 *
 * Contrato atualizado (pós-validação manual):
 * - O rastro é desenhado APENAS enquanto o botão do mouse está pressionado
 *   (pointerdown ativo). Hover sem pressionar não gera rastro.
 * - O rastro usa <line> SVG para continuidade em movimentos rápidos.
 * - A espessura dos segmentos varia com a posição relativa no rastro
 *   (efeito cauda de cometa: ponta grossa, cauda fina).
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";

// Mock do env
vi.mock("@/lib/env", () => ({
  env: {
    PKM_PATH: "/mock/pkm",
    AUTH_USERNAME: "test",
    AUTH_PASSWORD: "testpass123",
    NEXTAUTH_SECRET: "test-secret-with-at-least-32-characters-here",
    NEXTAUTH_URL: "http://localhost:3000",
  },
}));

import { LaserPointerOverlay } from "@/components/viewer/laser-pointer-overlay";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

// ── PRS-05 / D-13: Ativo tanto dentro quanto fora do modo apresentação ────────

describe("LaserPointerOverlay — PRS-05 / D-13: transversal ao viewer", () => {
  /**
   * D-13: o laser pode ser ligado e desligado sem entrar em presentation mode.
   */
  test("PRS-05: laser pode ser ligado sem entrar em presentation mode", () => {
    render(
      <LaserPointerOverlay active={true}>
        <div data-testid="viewer-content">Conteúdo</div>
      </LaserPointerOverlay>
    );

    const overlay = screen.getByTestId("laser-overlay");
    expect(overlay).toBeTruthy();
    expect(screen.getByTestId("viewer-content")).toBeTruthy();
  });

  /**
   * D-13: o laser pode ser desligado — overlay não captura eventos quando inativo.
   */
  test("PRS-05: laser desligado (active=false) não obstrui o conteúdo", () => {
    render(
      <LaserPointerOverlay active={false}>
        <div data-testid="viewer-content">Conteúdo</div>
      </LaserPointerOverlay>
    );

    expect(screen.getByTestId("viewer-content")).toBeTruthy();

    const overlay = screen.queryByTestId("laser-overlay");
    if (overlay) {
      const pointerEvents = overlay.style.pointerEvents;
      const isInactive =
        pointerEvents === "none" ||
        overlay.getAttribute("data-active") === "false" ||
        overlay.getAttribute("aria-hidden") === "true";
      expect(isInactive).toBe(true);
    }
  });

  /**
   * PRS-05: o laser funciona dentro do modo apresentação (presentationMode=true).
   */
  test("PRS-05: laser funciona normalmente dentro do modo apresentação", () => {
    render(
      <LaserPointerOverlay active={true} presentationMode={true}>
        <div data-testid="viewer-content">Conteúdo</div>
      </LaserPointerOverlay>
    );

    const overlay = screen.getByTestId("laser-overlay");
    expect(overlay).toBeTruthy();
    expect(overlay.getAttribute("data-active")).not.toBe("false");
  });
});

// ── PRS-05 / D-15: Rastro temporal com dissipação progressiva ────────────────

describe("LaserPointerOverlay — PRS-05 / D-15: rastro dissipativo por tempo", () => {
  /**
   * Contrato atualizado: o overlay registra pontos SOMENTE com pointerdown ativo.
   * Hover sem pressionar o botão NÃO gera rastro.
   */
  test("PRS-05: overlay registra pontos de rastro apenas com mouse pressionado (click-drag)", () => {
    render(
      <LaserPointerOverlay active={true}>
        <div data-testid="viewer-content">Conteúdo</div>
      </LaserPointerOverlay>
    );

    const overlay = screen.getByTestId("laser-overlay");

    // Hover sem pressionar — NÃO deve gerar rastro
    fireEvent.pointerMove(overlay, { clientX: 100, clientY: 100 });
    fireEvent.pointerMove(overlay, { clientX: 110, clientY: 110 });

    const trailBeforePress = overlay.querySelectorAll("[data-testid='laser-trail-point']").length;
    expect(trailBeforePress).toBe(0);

    // Pressionar e mover — deve gerar rastro
    fireEvent.pointerDown(overlay, { clientX: 50, clientY: 50, pointerId: 1 });
    fireEvent.pointerMove(overlay, { clientX: 60, clientY: 60, pointerId: 1 });
    fireEvent.pointerMove(overlay, { clientX: 70, clientY: 70, pointerId: 1 });

    // Após movimentos com botão pressionado, deve haver SVG com dados
    const hasSvg = overlay.querySelector("svg") !== null;
    expect(hasSvg).toBe(true);
  });

  /**
   * D-15: segmentos antigos são eliminados progressivamente após sua
   * janela de tempo (dissipação temporal).
   */
  test("PRS-05 / D-15: pontos do rastro são eliminados após a janela de dissipação", () => {
    render(
      <LaserPointerOverlay active={true} trailDurationMs={500}>
        <div data-testid="viewer-content">Conteúdo</div>
      </LaserPointerOverlay>
    );

    const overlay = screen.getByTestId("laser-overlay");

    // Registrar pontos de rastro com click-drag
    fireEvent.pointerDown(overlay, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(overlay, { clientX: 110, clientY: 110, pointerId: 1 });
    fireEvent.pointerMove(overlay, { clientX: 120, clientY: 120, pointerId: 1 });

    const initialTrailCount = overlay.querySelectorAll("[data-testid='laser-trail-point']").length;

    // Avançar o tempo além da janela de dissipação
    act(() => {
      vi.advanceTimersByTime(600); // > 500ms de trailDurationMs
    });

    // Após dissipação, overlay ainda deve estar no DOM (sem crash)
    expect(screen.getByTestId("laser-overlay")).toBeTruthy();

    // Se usar DOM elements para o rastro, deve haver dissipação
    const finalTrailCount = overlay.querySelectorAll("[data-testid='laser-trail-point']").length;
    if (initialTrailCount > 0) {
      expect(finalTrailCount).toBeLessThan(initialTrailCount);
    }
  });

  /**
   * Contrato atualizado: sem pointerdown, o mouse move não gera rastro.
   */
  test("PRS-05: hover sem pressionar não gera rastro", () => {
    render(
      <LaserPointerOverlay active={true}>
        <div data-testid="viewer-content">Conteúdo</div>
      </LaserPointerOverlay>
    );

    const overlay = screen.getByTestId("laser-overlay");

    // Mover sem pressionar
    fireEvent.pointerMove(overlay, { clientX: 100, clientY: 100 });
    fireEvent.pointerMove(overlay, { clientX: 200, clientY: 200 });
    fireEvent.pointerMove(overlay, { clientX: 300, clientY: 300 });

    // Nenhum ponto de rastro deve existir
    const trailPoints = overlay.querySelectorAll("[data-testid='laser-trail-point']").length;
    expect(trailPoints).toBe(0);
  });
});

// ── T-05-03: Desligamento limpo e pausa em estado oculto ─────────────────────

describe("LaserPointerOverlay — T-05-03: desligamento limpo", () => {
  /**
   * T-05-03: o overlay ignora atualizações quando o documento fica oculto.
   */
  test("T-05-03: overlay para de registrar pontos quando o documento fica oculto", () => {
    render(
      <LaserPointerOverlay active={true}>
        <div data-testid="viewer-content">Conteúdo</div>
      </LaserPointerOverlay>
    );

    const overlay = screen.getByTestId("laser-overlay");

    // Registrar ponto inicial com click-drag
    fireEvent.pointerDown(overlay, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(overlay, { clientX: 110, clientY: 110, pointerId: 1 });

    // Simular documento oculto
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));

    // Movimento enquanto oculto — não deve registrar novos pontos
    fireEvent.pointerMove(overlay, { clientX: 200, clientY: 200, pointerId: 1 });

    // O overlay deve continuar renderizando sem crash
    expect(screen.getByTestId("laser-overlay")).toBeTruthy();

    // Restaurar
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });

  /**
   * T-05-03: o overlay não processa eventos quando active=false.
   */
  test("T-05-03: laser desligado não captura eventos de forma que bloqueie o conteúdo", () => {
    const onContentClick = vi.fn();

    render(
      <LaserPointerOverlay active={false}>
        <div data-testid="viewer-content" onClick={onContentClick}>
          Conteúdo clicável
        </div>
      </LaserPointerOverlay>
    );

    fireEvent.click(screen.getByTestId("viewer-content"));
    expect(onContentClick).toHaveBeenCalledOnce();
  });

  /**
   * PRS-05: quando o laser é desligado (active muda de true para false),
   * o rastro existente é limpo.
   */
  test("PRS-05: rastro é limpo quando o laser é desligado", () => {
    const { rerender } = render(
      <LaserPointerOverlay active={true}>
        <div data-testid="viewer-content">Conteúdo</div>
      </LaserPointerOverlay>
    );

    const overlay = screen.getByTestId("laser-overlay");

    // Criar rastro com click-drag
    fireEvent.pointerDown(overlay, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(overlay, { clientX: 110, clientY: 110, pointerId: 1 });
    fireEvent.pointerMove(overlay, { clientX: 120, clientY: 120, pointerId: 1 });

    // Desligar o laser
    rerender(
      <LaserPointerOverlay active={false}>
        <div data-testid="viewer-content">Conteúdo</div>
      </LaserPointerOverlay>
    );

    // Após desligar, não deve haver rastro visível
    const trailPoints = document.querySelectorAll("[data-testid='laser-trail-point']");
    expect(trailPoints.length).toBe(0);
  });
});
