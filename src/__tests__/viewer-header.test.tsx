/**
 * Testes do ViewerHeader — Phase 5 (05-01) · Wave 0 · RED
 *
 * Cobre os comportamentos exigidos por PRS-01, PRS-06, PRS-07:
 * - PRS-01: botão de apresentação deixa de ser placeholder desabilitado e
 *           passa a chamar callback explícito onEnterPresentation
 * - PRS-06: slot de tema expõe controle de preset fora do modo apresentação
 * - PRS-07: no modo apresentação ativo, o InfoPanel fica bloqueado
 *           (botão de toggle fica desabilitado ou ausente)
 *
 * Contratos legados preservados (sem regressão):
 * - CTX-01: exibe tópico › grupo no cabeçalho
 * - CTX-02: botão de download presente e funcional
 * - CTX-03: aria-pressed reflete panelOpen
 *
 * ESTADO: RED — ViewerHeader ainda não aceita onEnterPresentation nem
 * activeTheme/onChangeTheme na interface. O componente atual possui o botão
 * de apresentação como disabled sem callback.
 */

import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

// Mock necessário para componentes que usam next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Import real — novas props (onEnterPresentation, activeTheme, onChangeTheme,
// presentationActive) ainda não existem → RED
import { ViewerHeader } from "@/components/viewer/viewer-header";

// ── Contratos legados (regressão Phase 3) ────────────────────────────────────

describe("ViewerHeader — regressão Phase 3", () => {
  test("CTX-01: exibe tópico e grupo no cabeçalho (label-sm uppercase)", () => {
    render(
      <ViewerHeader
        topic="tecnologia"
        group="superapp"
        itemId="tecnologia/superapp/nota.md"
        downloadHref="/pkm/api/pkm/raw/tecnologia%2Fsuperapp%2Fnota.md"
        estado="finalizado"
        panelOpen={false}
        onTogglePanel={vi.fn()}
      />
    );

    expect(screen.getByText(/tecnologia/i)).toBeTruthy();
    expect(screen.getByText(/superapp/i)).toBeTruthy();
  });

  test("CTX-01: exibe INBOX quando topic é __inbox", () => {
    render(
      <ViewerHeader
        topic="__inbox"
        itemId="__inbox/nota-inbox.md"
        downloadHref="/pkm/api/pkm/raw/__inbox%2Fnota-inbox.md"
        estado="rascunho"
        panelOpen={false}
        onTogglePanel={vi.fn()}
      />
    );

    expect(screen.getByText(/inbox/i)).toBeTruthy();
  });

  test("CTX-02: botão de download está presente e tem href correto", () => {
    render(
      <ViewerHeader
        topic="tecnologia"
        itemId="tecnologia/nota.md"
        downloadHref="/pkm/api/pkm/raw/tecnologia%2Fnota.md"
        estado="finalizado"
        panelOpen={false}
        onTogglePanel={vi.fn()}
      />
    );

    const downloadLink = screen.getByTestId("download-link");
    expect(downloadLink).toBeTruthy();
    const href = downloadLink.getAttribute("href") ?? "";
    expect(href).toContain("/pkm");
    expect(href).toContain("/api/pkm/raw/");
    expect(href).toContain("tecnologia");
    expect(href).toContain("nota.md");
  });

  test("CTX-02: botão de toggle do painel (ℹ) chama onTogglePanel ao clicar", () => {
    const onTogglePanel = vi.fn();
    render(
      <ViewerHeader
        topic="tecnologia"
        itemId="tecnologia/nota.md"
        downloadHref="/pkm/api/pkm/raw/tecnologia%2Fnota.md"
        estado="finalizado"
        panelOpen={false}
        onTogglePanel={onTogglePanel}
      />
    );

    const toggleBtn = screen.getByRole("button", {
      name: /painel|info|informaç/i,
    });
    fireEvent.click(toggleBtn);

    expect(onTogglePanel).toHaveBeenCalledOnce();
  });

  test("CTX-03: aria-pressed=true quando panelOpen=true", () => {
    render(
      <ViewerHeader
        topic="tecnologia"
        itemId="tecnologia/nota.md"
        downloadHref="/pkm/api/pkm/raw/tecnologia%2Fnota.md"
        estado="finalizado"
        panelOpen={true}
        onTogglePanel={vi.fn()}
      />
    );

    const toggleBtn = screen.getByRole("button", {
      name: /painel|info|informaç/i,
    });
    expect(toggleBtn.getAttribute("aria-pressed")).toBe("true");
  });

  test("CTX-03: aria-pressed=false quando panelOpen=false", () => {
    render(
      <ViewerHeader
        topic="tecnologia"
        itemId="tecnologia/nota.md"
        downloadHref="/pkm/api/pkm/raw/tecnologia%2Fnota.md"
        estado="finalizado"
        panelOpen={false}
        onTogglePanel={vi.fn()}
      />
    );

    const toggleBtn = screen.getByRole("button", {
      name: /painel|info|informaç/i,
    });
    expect(toggleBtn.getAttribute("aria-pressed")).toBe("false");
  });
});

// ── PRS-01: Botão de apresentação — gatilho real (Phase 5) ───────────────────

describe("ViewerHeader — PRS-01: botão de apresentação real", () => {
  /**
   * PRS-01: o botão de apresentação não é mais disabled.
   * Deve ser clicável e chamar onEnterPresentation.
   */
  test("PRS-01: botão de apresentação está habilitado e chama onEnterPresentation ao clicar", () => {
    const onEnterPresentation = vi.fn();
    render(
      <ViewerHeader
        topic="tecnologia"
        itemId="tecnologia/nota.md"
        downloadHref="/pkm/api/pkm/raw/tecnologia%2Fnota.md"
        estado="finalizado"
        panelOpen={false}
        onTogglePanel={vi.fn()}
        onEnterPresentation={onEnterPresentation}
      />
    );

    // O botão de apresentação NÃO deve ser disabled
    const presentationBtn = screen.getByTestId("presentation-button");
    expect(presentationBtn).toBeTruthy();
    expect(presentationBtn.hasAttribute("disabled")).toBe(false);
    expect(presentationBtn.getAttribute("aria-disabled")).not.toBe("true");

    // Clicar deve acionar o callback
    fireEvent.click(presentationBtn);
    expect(onEnterPresentation).toHaveBeenCalledOnce();
  });

  /**
   * PRS-01: sem onEnterPresentation (prop opcional), o botão ainda existe
   * mas não causa erro ao clicar.
   */
  test("PRS-01: botão de apresentação sem callback não lança erro ao clicar", () => {
    render(
      <ViewerHeader
        topic="tecnologia"
        itemId="tecnologia/nota.md"
        downloadHref="/pkm/api/pkm/raw/tecnologia%2Fnota.md"
        estado="finalizado"
        panelOpen={false}
        onTogglePanel={vi.fn()}
      />
    );

    const presentationBtn = screen.getByTestId("presentation-button");
    expect(() => fireEvent.click(presentationBtn)).not.toThrow();
  });
});

// ── PRS-06: Seletor de tema — fora do modo apresentação ──────────────────────

describe("ViewerHeader — PRS-06: seletor de tema", () => {
  /**
   * PRS-06: o slot de tema expõe controle real de preset quando
   * presentationActive=false (modo normal).
   */
  test("PRS-06: seletor de tema está visível e funcional fora do modo apresentação", () => {
    const onChangeTheme = vi.fn();
    render(
      <ViewerHeader
        topic="tecnologia"
        itemId="tecnologia/nota.md"
        downloadHref="/pkm/api/pkm/raw/tecnologia%2Fnota.md"
        estado="finalizado"
        panelOpen={false}
        onTogglePanel={vi.fn()}
        activeTheme="default"
        onChangeTheme={onChangeTheme}
        presentationActive={false}
      />
    );

    // O controle de tema deve estar presente
    const themeControl = screen.getByTestId("theme-selector");
    expect(themeControl).toBeTruthy();
  });

  /**
   * PRS-06 / D-19: a troca de tema acontece pelo header, fora do modo
   * apresentação. O seletor de tema deve ficar oculto ou desabilitado
   * quando presentationActive=true.
   */
  test("PRS-06 / D-19: seletor de tema ausente ou desabilitado no modo apresentação ativo", () => {
    render(
      <ViewerHeader
        topic="tecnologia"
        itemId="tecnologia/nota.md"
        downloadHref="/pkm/api/pkm/raw/tecnologia%2Fnota.md"
        estado="finalizado"
        panelOpen={false}
        onTogglePanel={vi.fn()}
        activeTheme="default"
        onChangeTheme={vi.fn()}
        presentationActive={true}
      />
    );

    // No modo apresentação, o header normal fica oculto —
    // o seletor de tema não deve estar presente ou deve ser inacessível
    const themeControl = screen.queryByTestId("theme-selector");
    if (themeControl) {
      // Se presente, deve estar desabilitado ou não interativo
      const isDisabled =
        themeControl.hasAttribute("disabled") ||
        themeControl.getAttribute("aria-disabled") === "true" ||
        themeControl.getAttribute("aria-hidden") === "true";
      expect(isDisabled).toBe(true);
    }
    // Alternativa aceitável: o elemento simplesmente não existe no DOM
    // (header oculto no modo apresentação)
  });
});

// ── PRS-07: InfoPanel indisponível no modo apresentação ──────────────────────

describe("ViewerHeader — PRS-07: InfoPanel bloqueado no modo apresentação", () => {
  /**
   * PRS-07 / D-02: no modo apresentação, o InfoPanel fica indisponível.
   * O botão de toggle do painel deve estar desabilitado ou ausente.
   */
  test("PRS-07: botão de toggle do painel fica desabilitado quando presentationActive=true", () => {
    render(
      <ViewerHeader
        topic="tecnologia"
        itemId="tecnologia/nota.md"
        downloadHref="/pkm/api/pkm/raw/tecnologia%2Fnota.md"
        estado="finalizado"
        panelOpen={false}
        onTogglePanel={vi.fn()}
        presentationActive={true}
      />
    );

    // No modo apresentação, o toggle de painel deve estar desabilitado ou ausente
    const toggleBtn = screen.queryByTestId("toggle-panel-button");
    if (toggleBtn) {
      const isDisabled =
        toggleBtn.hasAttribute("disabled") ||
        toggleBtn.getAttribute("aria-disabled") === "true";
      expect(isDisabled).toBe(true);
    }
    // Alternativa aceitável: botão ausente no modo apresentação
    // (header oculto ou simplificado)
  });

  /**
   * PRS-07: fora do modo apresentação, o botão de toggle do painel
   * permanece funcional (sem regressão).
   */
  test("PRS-07: botão de toggle do painel permanece funcional fora do modo apresentação", () => {
    const onTogglePanel = vi.fn();
    render(
      <ViewerHeader
        topic="tecnologia"
        itemId="tecnologia/nota.md"
        downloadHref="/pkm/api/pkm/raw/tecnologia%2Fnota.md"
        estado="finalizado"
        panelOpen={false}
        onTogglePanel={onTogglePanel}
        presentationActive={false}
      />
    );

    const toggleBtn = screen.getByTestId("toggle-panel-button");
    expect(toggleBtn).toBeTruthy();
    expect(toggleBtn.hasAttribute("disabled")).toBe(false);

    fireEvent.click(toggleBtn);
    expect(onTogglePanel).toHaveBeenCalledOnce();
  });
});
