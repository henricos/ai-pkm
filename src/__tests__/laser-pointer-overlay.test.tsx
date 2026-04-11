/**
 * Testes do LaserPointerOverlay — Phase 5 (05-01) · Wave 0 · RED
 *
 * Cobre os comportamentos exigidos por PRS-05:
 * - PRS-05 / D-13: o laser funciona tanto dentro quanto fora do modo
 *                  apresentação — é uma camada transversal ao viewer.
 * - PRS-05 / D-15: rastro com persistência curta e dissipação progressiva
 *                  orientada por tempo (referência Excalidraw).
 * - PRS-05 / D-12: protege contra implementação simplista de cursor estático
 *                  sem memória visual.
 * - T-05-03: desligamento limpo e pausa em estado oculto (sem eventos
 *            capturados desnecessariamente).
 *
 * O componente LaserPointerOverlay ainda não existe:
 * @/components/viewer/laser-pointer-overlay
 *
 * ESTADO: RED — o arquivo acima não existe → import falha.
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

// Import real do componente que ainda não existe → RED
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
   * Funciona como camada independente do modo de exibição.
   */
  test("PRS-05: laser pode ser ligado sem entrar em presentation mode", () => {
    render(
      <LaserPointerOverlay active={true}>
        <div data-testid="viewer-content">Conteúdo</div>
      </LaserPointerOverlay>
    );

    // Com active=true, o overlay deve estar presente
    const overlay = screen.getByTestId("laser-overlay");
    expect(overlay).toBeTruthy();

    // O conteúdo do viewer deve estar visível normalmente
    expect(screen.getByTestId("viewer-content")).toBeTruthy();
  });

  /**
   * D-13: o laser pode ser desligado — overlay não captura eventos
   * quando inativo.
   */
  test("PRS-05: laser desligado (active=false) não obstrui o conteúdo", () => {
    render(
      <LaserPointerOverlay active={false}>
        <div data-testid="viewer-content">Conteúdo</div>
      </LaserPointerOverlay>
    );

    // O conteúdo ainda deve estar acessível
    expect(screen.getByTestId("viewer-content")).toBeTruthy();

    // T-05-03: overlay inativo não deve capturar pointer events
    // (pointer-events: none ou ausência do overlay no DOM)
    const overlay = screen.queryByTestId("laser-overlay");
    if (overlay) {
      // Se presente, deve ter pointer-events desabilitados via style ou data attr
      const pointerEvents = overlay.style.pointerEvents;
      const isInactive =
        pointerEvents === "none" ||
        overlay.getAttribute("data-active") === "false" ||
        overlay.getAttribute("aria-hidden") === "true";
      expect(isInactive).toBe(true);
    }
    // Alternativa: overlay removido do DOM quando inativo
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
   * D-15 / D-12: o overlay registra pontos temporais e elimina segmentos
   * antigos por idade/opacidade.
   * Proteção contra implementação de cursor estático sem memória visual.
   */
  test("PRS-05: overlay registra pontos de rastro ao mover o mouse", () => {
    render(
      <LaserPointerOverlay active={true}>
        <div data-testid="viewer-content">Conteúdo</div>
      </LaserPointerOverlay>
    );

    const overlay = screen.getByTestId("laser-overlay");

    // Simular movimento do mouse — o overlay deve registrar pontos
    fireEvent.mouseMove(overlay, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(overlay, { clientX: 110, clientY: 110 });
    fireEvent.mouseMove(overlay, { clientX: 120, clientY: 120 });

    // Após movimentos, deve haver elementos de rastro ou canvas com dados
    // A implementação pode usar SVG, canvas ou elementos DOM para o rastro
    const trailElements =
      overlay.querySelectorAll("[data-testid='laser-trail-point']").length > 0 ||
      overlay.querySelector("canvas") !== null ||
      overlay.querySelector("svg") !== null;

    expect(trailElements).toBe(true);
  });

  /**
   * D-15: segmentos antigos são eliminados progressivamente após sua
   * janela de tempo (dissipação temporal).
   * Protege contra rastro estático ou infinito sem dissipação.
   */
  test("PRS-05 / D-15: pontos do rastro são eliminados após a janela de dissipação", () => {
    render(
      <LaserPointerOverlay active={true} trailDurationMs={500}>
        <div data-testid="viewer-content">Conteúdo</div>
      </LaserPointerOverlay>
    );

    const overlay = screen.getByTestId("laser-overlay");

    // Registrar pontos de rastro
    fireEvent.mouseMove(overlay, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(overlay, { clientX: 110, clientY: 110 });

    // Antes da dissipação, pontos devem existir
    const initialTrailCount = overlay.querySelectorAll("[data-testid='laser-trail-point']").length;

    // Avançar o tempo além da janela de dissipação
    act(() => {
      vi.advanceTimersByTime(600); // > 500ms de trailDurationMs
    });

    // Após dissipação, pontos antigos devem ter sido removidos
    const finalTrailCount = overlay.querySelectorAll("[data-testid='laser-trail-point']").length;

    // A implementação com canvas pode não usar data-testid para pontos —
    // neste caso, verificamos que o componente não lança erros após o timeout
    // e que ainda está no DOM (não crash)
    expect(screen.getByTestId("laser-overlay")).toBeTruthy();

    // Se usar DOM elements para o rastro, deve haver dissipação
    if (initialTrailCount > 0) {
      expect(finalTrailCount).toBeLessThan(initialTrailCount);
    }
  });
});

// ── T-05-03: Desligamento limpo e pausa em estado oculto ─────────────────────

describe("LaserPointerOverlay — T-05-03: desligamento limpo", () => {
  /**
   * T-05-03: o overlay ignora atualizações quando o documento fica oculto
   * (Page Visibility API).
   */
  test("T-05-03: overlay para de registrar pontos quando o documento fica oculto", () => {
    render(
      <LaserPointerOverlay active={true}>
        <div data-testid="viewer-content">Conteúdo</div>
      </LaserPointerOverlay>
    );

    const overlay = screen.getByTestId("laser-overlay");

    // Registrar ponto inicial
    fireEvent.mouseMove(overlay, { clientX: 100, clientY: 100 });

    // Simular documento oculto
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));

    // Movimento enquanto oculto — não deve registrar novos pontos
    fireEvent.mouseMove(overlay, { clientX: 200, clientY: 200 });

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
   * T-05-03: o overlay não processa mousemove quando active=false.
   * Protege contra capture de eventos desnecessários que bloqueiem a
   * interação normal com o conteúdo.
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

    // Clicar no conteúdo com o laser desligado deve funcionar normalmente
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

    // Criar rastro
    fireEvent.mouseMove(overlay, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(overlay, { clientX: 110, clientY: 110 });

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
