/**
 * Testes do PresentationOverlay — Phase 5 (05-01) · Wave 0 · RED
 *
 * Cobre os comportamentos exigidos por PRS-02, PRS-03, PRS-04:
 * - PRS-02 / D-08: Esc sai do modo apresentação
 * - PRS-03 / D-05, D-06: controles não reaparecem com movimento global;
 *                         somente a região inferior esquerda os revela
 * - PRS-04 / D-07: controles são discretos e auto-ocultáveis após inatividade
 *
 * O componente PresentationOverlay ainda não existe:
 * @/components/viewer/presentation-overlay
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
import { PresentationOverlay } from "@/components/viewer/presentation-overlay";

const defaultProps = {
  onExit: vi.fn(),
};

const ChildContent = () => <div data-testid="stage-content">Conteúdo do palco</div>;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

// ── PRS-02 / D-08: Saída por Esc ─────────────────────────────────────────────

describe("PresentationOverlay — PRS-02: saída por Esc", () => {
  /**
   * D-08: a saída do modo apresentação acontece por Esc.
   */
  test("PRS-02: pressionar Esc chama onExit", () => {
    const onExit = vi.fn();
    render(
      <PresentationOverlay onExit={onExit}>
        <ChildContent />
      </PresentationOverlay>
    );

    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
    expect(onExit).toHaveBeenCalledOnce();
  });

  /**
   * D-10: o botão de sair dentro dos controles também chama onExit.
   */
  test("PRS-02: botão de sair nos controles chama onExit", () => {
    const onExit = vi.fn();
    render(
      <PresentationOverlay onExit={onExit}>
        <ChildContent />
      </PresentationOverlay>
    );

    // Revelar os controles via hit area inferior esquerda
    const hitArea = screen.getByTestId("controls-hit-area");
    fireEvent.mouseEnter(hitArea);

    // Clicar no botão de sair
    const exitBtn = screen.getByTestId("exit-presentation-button");
    fireEvent.click(exitBtn);
    expect(onExit).toHaveBeenCalledOnce();
  });

  /**
   * O conteúdo principal deve estar presente no palco.
   */
  test("PRS-02: o conteúdo principal está visível no palco", () => {
    render(
      <PresentationOverlay onExit={vi.fn()}>
        <ChildContent />
      </PresentationOverlay>
    );

    expect(screen.getByTestId("stage-content")).toBeTruthy();
  });
});

// ── PRS-03 / D-05, D-06: Hit area e revelação dos controles ──────────────────

describe("PresentationOverlay — PRS-03: hit area inferior esquerda", () => {
  /**
   * D-05: os controles NÃO reaparecem com movimento global de mouse
   * pela tela inteira — somente a região de ativação os revela.
   */
  test("PRS-03: movimento global de mouse NÃO revela os controles", () => {
    render(
      <PresentationOverlay onExit={vi.fn()}>
        <ChildContent />
      </PresentationOverlay>
    );

    // Movimento global de mouse (fora da hit area)
    fireEvent.mouseMove(document.body);

    // Os controles não devem aparecer por movimento global
    const controls = screen.queryByTestId("presentation-controls");
    if (controls) {
      // Se existem, devem estar ocultos (aria-hidden ou hidden)
      const isHidden =
        controls.getAttribute("aria-hidden") === "true" ||
        controls.getAttribute("data-visible") === "false" ||
        controls.hasAttribute("hidden");
      expect(isHidden).toBe(true);
    }
    // Alternativa: os controles simplesmente não existem no DOM quando ocultos
  });

  /**
   * D-06: existe uma região no canto inferior esquerdo que revela os controles.
   */
  test("PRS-03: hover na hit area inferior esquerda revela os controles", () => {
    render(
      <PresentationOverlay onExit={vi.fn()}>
        <ChildContent />
      </PresentationOverlay>
    );

    // Entrar na hit area inferior esquerda
    const hitArea = screen.getByTestId("controls-hit-area");
    fireEvent.mouseEnter(hitArea);

    // Os controles devem aparecer
    const controls = screen.getByTestId("presentation-controls");
    expect(controls).toBeTruthy();

    const isVisible =
      controls.getAttribute("aria-hidden") !== "true" &&
      controls.getAttribute("data-visible") !== "false" &&
      !controls.hasAttribute("hidden");
    expect(isVisible).toBe(true);
  });

  /**
   * D-06: a hit area deve estar posicionada no canto inferior esquerdo.
   * Verificamos via data-position atributo.
   */
  test("PRS-03: hit area está no canto inferior esquerdo", () => {
    render(
      <PresentationOverlay onExit={vi.fn()}>
        <ChildContent />
      </PresentationOverlay>
    );

    const hitArea = screen.getByTestId("controls-hit-area");
    expect(hitArea).toBeTruthy();

    // Deve ter posicionamento declarado (bottom-left)
    const position = hitArea.getAttribute("data-position");
    expect(position).toBe("bottom-left");
  });
});

// ── PRS-04 / D-07: Controles discretos e auto-ocultáveis ─────────────────────

describe("PresentationOverlay — PRS-04: controles auto-ocultáveis", () => {
  /**
   * D-07: os controles ficam discretos e se ocultam automaticamente
   * após um período de inatividade.
   */
  test("PRS-04: controles se ocultam após inatividade (auto-hide)", () => {
    render(
      <PresentationOverlay onExit={vi.fn()}>
        <ChildContent />
      </PresentationOverlay>
    );

    // Revelar os controles
    const hitArea = screen.getByTestId("controls-hit-area");
    fireEvent.mouseEnter(hitArea);
    expect(screen.getByTestId("presentation-controls")).toBeTruthy();

    // Sair da hit area (inatividade)
    fireEvent.mouseLeave(hitArea);

    // Avançar o tempo — após o timeout de auto-hide, os controles devem ocultar
    act(() => {
      vi.advanceTimersByTime(3000); // 3 segundos de inatividade
    });

    const controls = screen.queryByTestId("presentation-controls");
    if (controls) {
      const isHidden =
        controls.getAttribute("aria-hidden") === "true" ||
        controls.getAttribute("data-visible") === "false" ||
        controls.hasAttribute("hidden");
      expect(isHidden).toBe(true);
    }
    // Alternativa: elemento removido do DOM após auto-hide
  });

  /**
   * D-09: os controles têm interação normal quando visíveis —
   * hover sobre os controles mantém a visibilidade (não auto-oculta enquanto
   * o mouse está sobre eles).
   */
  test("PRS-04: controles permanecem visíveis enquanto o mouse está sobre eles", () => {
    render(
      <PresentationOverlay onExit={vi.fn()}>
        <ChildContent />
      </PresentationOverlay>
    );

    // Revelar os controles via hit area
    const hitArea = screen.getByTestId("controls-hit-area");
    fireEvent.mouseEnter(hitArea);

    const controls = screen.getByTestId("presentation-controls");

    // Mover o mouse para os próprios controles
    fireEvent.mouseEnter(controls);
    fireEvent.mouseLeave(hitArea);

    // Avançar o tempo — controles não devem sumir enquanto o mouse está neles
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Os controles ainda devem estar visíveis
    const stillVisible = screen.queryByTestId("presentation-controls");
    if (stillVisible) {
      const isHidden =
        stillVisible.getAttribute("aria-hidden") === "true" ||
        stillVisible.getAttribute("data-visible") === "false";
      expect(isHidden).toBe(false);
    }
  });
});
