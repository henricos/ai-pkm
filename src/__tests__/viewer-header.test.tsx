/**
 * Testes do ViewerHeader — Phase 3 (03-01) · Wave 0 · RED
 *
 * Cobre os comportamentos exigidos por CTX-01, CTX-02 e CTX-03:
 * - CTX-01: exibe tópico › grupo no cabeçalho (label-sm uppercase);
 *            itens inbox exibem "INBOX"
 * - CTX-02: botões de ação presentes: download (href correto),
 *            apresentação (desabilitado), toggle do painel ℹ️
 * - CTX-03: aria-pressed reflete estado panelOpen
 *
 * ESTADO: RED — ViewerHeader ainda não existe em
 * @/components/viewer/viewer-header. O import abaixo causará
 * "Cannot find module" até que Wave 2 crie o componente.
 */

import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

// Mock necessário para componentes que usam next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Import real — componente ainda não existe → causa RED (module not found)
import { ViewerHeader } from "@/components/viewer/viewer-header";

// ── CTX-01: contexto estrutural tópico › grupo ───────────────────────────────

describe("ViewerHeader", () => {
  test("CTX-01: exibe tópico e grupo no cabeçalho (label-sm uppercase)", () => {
    render(
      <ViewerHeader
        topic="tecnologia"
        group="superapp"
        itemId="tecnologia/superapp/nota.md"
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
        estado="rascunho"
        panelOpen={false}
        onTogglePanel={vi.fn()}
      />
    );

    expect(screen.getByText(/inbox/i)).toBeTruthy();
  });

  // ── CTX-02: ações no cabeçalho ─────────────────────────────────────────────

  test("CTX-02: botão de download está presente e tem href correto", () => {
    render(
      <ViewerHeader
        topic="tecnologia"
        itemId="tecnologia/nota.md"
        estado="finalizado"
        panelOpen={false}
        onTogglePanel={vi.fn()}
      />
    );

    // O href codifica o itemId como path para o raw endpoint
    const downloadLink = document.querySelector(
      'a[href="/api/pkm/raw/tecnologia%2Fnota.md"]'
    );
    expect(downloadLink).not.toBeNull();
  });

  test("CTX-02: botão de apresentação está presente e desabilitado", () => {
    render(
      <ViewerHeader
        topic="tecnologia"
        itemId="tecnologia/nota.md"
        estado="finalizado"
        panelOpen={false}
        onTogglePanel={vi.fn()}
      />
    );

    // Botão de apresentação deve existir e estar desabilitado (Phase 5 implementa)
    const presentationBtn = document.querySelector(
      "button[aria-label*='apresenta' i], button[disabled][aria-label], button[aria-disabled='true']"
    );
    // Verifica que não está ativo — disabled ou aria-disabled
    if (presentationBtn) {
      const isDisabled =
        presentationBtn.hasAttribute("disabled") ||
        presentationBtn.getAttribute("aria-disabled") === "true";
      expect(isDisabled).toBe(true);
    } else {
      // Alternativa: verificar via role
      const allButtons = document.querySelectorAll("button[disabled]");
      expect(allButtons.length).toBeGreaterThan(0);
    }
  });

  test("CTX-02: botão de toggle do painel (ℹ) chama onTogglePanel ao clicar", () => {
    const onTogglePanel = vi.fn();
    render(
      <ViewerHeader
        topic="tecnologia"
        itemId="tecnologia/nota.md"
        estado="finalizado"
        panelOpen={false}
        onTogglePanel={onTogglePanel}
      />
    );

    // Clica no botão de toggle do painel de informações
    const toggleBtn = screen.getByRole("button", {
      name: /painel|info|informaç/i,
    });
    fireEvent.click(toggleBtn);

    expect(onTogglePanel).toHaveBeenCalledOnce();
  });

  // ── CTX-03: aria-pressed reflete panelOpen ──────────────────────────────────

  test("CTX-03: aria-pressed=true quando panelOpen=true", () => {
    render(
      <ViewerHeader
        topic="tecnologia"
        itemId="tecnologia/nota.md"
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
