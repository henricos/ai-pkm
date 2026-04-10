/**
 * Testes do InfoPanel — Phase 3 (03-01) e Phase 4 (04-01)
 *
 * Cobre os comportamentos exigidos por CTX-03 e CTX-04 (Phase 3):
 * - CTX-03: painel visível quando panelOpen=true
 * - CTX-04: chip de estado (rascunho/finalizado), formatação de data_captura
 *            e data_publicacao, omissão de campos ausentes, url como link,
 *            autores como chips
 *
 * Cobre os comportamentos exigidos por CTX-05 (Phase 4, D-08, D-09):
 * - CTX-05: sidecar renderizado no slot sidecar-content-phase4 com hierarquia
 *           editorial menor que o conteúdo principal
 * - D-08: sidecar renderizado como Markdown rico, sem YAML cru e sem rehype-raw
 * - D-09: sidecar no painel lateral apenas — não duplica o header do item
 * - Navegação segue ocultando sidecar como item separado (verificação indireta
 *   via navigation-service.test.ts — sem mudança no navigation-service aqui)
 *
 * ESTADO Phase 3: GREEN (InfoPanel implementado em 03-06)
 * ESTADO Phase 4: RED — prop sidecarContent e slot sidecar-content-phase4
 *   ainda não existem. Os novos testes falham até Wave 1 implementar.
 */

import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock de next/navigation caso InfoPanel use hooks de navegação
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Import real — InfoPanel já existe desde Phase 3
import { InfoPanel } from "@/components/viewer/info-panel";

// Import do tipo — RawFrontmatter exportado em types.ts desde Phase 3
import type { RawFrontmatter } from "@/lib/pkm/types";

// ── Helpers de dados de teste ────────────────────────────────────────────────

const frontmatterBase: RawFrontmatter = {
  estado: "rascunho",
  modelo: "nota-conceito",
  data_captura: "2026-03-07",
};

const onClose = vi.fn();

// ── CTX-03: visibilidade do painel ───────────────────────────────────────────

describe("InfoPanel", () => {
  test("CTX-03: painel visível quando panelOpen=true", () => {
    render(
      <InfoPanel
        panelOpen={true}
        onClose={onClose}
        frontmatter={frontmatterBase}
        topic="tecnologia"
      />
    );

    // Painel deve existir no DOM como aside ou com data-testid="info-panel"
    const panel =
      document.querySelector("aside") ??
      screen.queryByTestId("info-panel");
    expect(panel).not.toBeNull();
  });

  // ── CTX-04: campos e formatação ─────────────────────────────────────────────

  test("CTX-04: chip de estado exibe 'rascunho' quando estado=rascunho", () => {
    render(
      <InfoPanel
        panelOpen={true}
        onClose={onClose}
        frontmatter={{ ...frontmatterBase, estado: "rascunho" }}
        topic="tecnologia"
      />
    );

    expect(screen.getByText(/rascunho/i)).toBeTruthy();
  });

  test("CTX-04: chip de estado exibe 'finalizado' quando estado=finalizado", () => {
    render(
      <InfoPanel
        panelOpen={true}
        onClose={onClose}
        frontmatter={{ ...frontmatterBase, estado: "finalizado" }}
        topic="tecnologia"
      />
    );

    expect(screen.getByText(/finalizado/i)).toBeTruthy();
  });

  test("CTX-04: data_captura formatada como '7 mar 2026' a partir de '2026-03-07'", () => {
    render(
      <InfoPanel
        panelOpen={true}
        onClose={onClose}
        frontmatter={{ ...frontmatterBase, data_captura: "2026-03-07" }}
        topic="tecnologia"
      />
    );

    // Formato esperado: "7 mar 2026" ou variante com ponto
    const dateText = screen.getByText(/7.*mar.*2026/i);
    expect(dateText).toBeTruthy();
  });

  test("CTX-04: campos ausentes (autores) são omitidos completamente", () => {
    render(
      <InfoPanel
        panelOpen={true}
        onClose={onClose}
        frontmatter={frontmatterBase} // sem autores
        topic="tecnologia"
      />
    );

    // Não deve aparecer a label "autores" quando o campo não existe
    const autoresLabel = screen.queryByText(/autores/i);
    expect(autoresLabel).toBeNull();
  });

  test("CTX-04: url exibida como link clicável quando presente", () => {
    render(
      <InfoPanel
        panelOpen={true}
        onClose={onClose}
        frontmatter={{ ...frontmatterBase, url: "https://exemplo.com" }}
        topic="tecnologia"
      />
    );

    const link = document.querySelector('a[href="https://exemplo.com"]');
    expect(link).not.toBeNull();
  });

  test("CTX-04: autores exibidos como chips quando presentes", () => {
    render(
      <InfoPanel
        panelOpen={true}
        onClose={onClose}
        frontmatter={{ ...frontmatterBase, autores: ["João Silva"] }}
        topic="tecnologia"
      />
    );

    expect(screen.getByText(/joão silva/i)).toBeTruthy();
  });

  test("CTX-04: data_publicacao formatada — 'nov. 2025' a partir de '2025-11'", () => {
    render(
      <InfoPanel
        panelOpen={true}
        onClose={onClose}
        frontmatter={{ ...frontmatterBase, data_publicacao: "2025-11" }}
        topic="tecnologia"
      />
    );

    // Formato esperado: "nov. 2025" ou "nov 2025" (com ou sem ponto abreviado)
    const pubDate = screen.getByText(/nov.*2025/i);
    expect(pubDate).toBeTruthy();
  });
});

/**
 * Phase 4 — Sidecar no InfoPanel (CTX-05, D-08, D-09)
 *
 * D-08: sidecar renderizado como Markdown rico no slot final do painel.
 *       Sem YAML cru (frontmatter não deve aparecer), sem rehype-raw.
 * D-09: hierarquia editorial menor que o conteúdo principal —
 *       sidecar no slot data-testid="sidecar-content-phase4".
 *
 * ESTADO: RED — prop sidecarContent ainda não existe em InfoPanel.
 * Estes testes travam o contrato antes da implementação em planos posteriores.
 */
describe("InfoPanel — sidecar editorial (CTX-05, D-08, D-09)", () => {
  const sidecarContent = "# Contexto editorial\n\nEsta imagem mostra a arquitetura do sistema em **março de 2026**.";

  test("CTX-05, D-08: sidecar aparece no slot sidecar-content-phase4 quando fornecido", () => {
    render(
      <InfoPanel
        panelOpen={true}
        onClose={onClose}
        frontmatter={frontmatterBase}
        topic="tecnologia"
        sidecarContent={sidecarContent}
      />
    );

    // Slot dedicado ao sidecar deve existir
    const slot = screen.queryByTestId("sidecar-content-phase4");
    expect(slot).not.toBeNull();

    // Conteúdo Markdown renderizado deve aparecer no slot
    expect(slot?.textContent).toContain("Contexto editorial");
  });

  test("D-08: sidecar renderiza Markdown rico (formatação preservada, sem YAML cru)", () => {
    render(
      <InfoPanel
        panelOpen={true}
        onClose={onClose}
        frontmatter={frontmatterBase}
        topic="tecnologia"
        sidecarContent={sidecarContent}
      />
    );

    const slot = screen.queryByTestId("sidecar-content-phase4");
    expect(slot).not.toBeNull();

    // YAML cru (frontmatter) NÃO deve aparecer no sidecar renderizado
    expect(slot?.textContent).not.toContain("estado:");
    expect(slot?.textContent).not.toContain("---");

    // Conteúdo principal deve estar presente
    expect(slot?.textContent).toContain("março de 2026");
  });

  test("D-09: slot sidecar-content-phase4 aparece DEPOIS dos metadados do item principal", () => {
    const { container } = render(
      <InfoPanel
        panelOpen={true}
        onClose={onClose}
        frontmatter={{ ...frontmatterBase, estado: "finalizado" }}
        topic="tecnologia"
        sidecarContent={sidecarContent}
      />
    );

    // O chip de estado (metadado principal) deve aparecer no DOM antes do slot de sidecar
    const allElements = container.querySelectorAll("[data-testid]");
    const testIds = Array.from(allElements).map((el) => el.getAttribute("data-testid"));

    // Estado/metadados aparecem antes do sidecar (ordem editorial)
    const sidecarIndex = testIds.indexOf("sidecar-content-phase4");
    expect(sidecarIndex).toBeGreaterThan(-1);

    // Deve existir pelo menos um elemento de metadado antes do sidecar
    const elementsBeforeSidecar = testIds.slice(0, sidecarIndex);
    expect(elementsBeforeSidecar.length).toBeGreaterThan(0);
  });

  test("CTX-05: sidecar-content-phase4 NÃO aparece quando sidecarContent não é fornecido", () => {
    render(
      <InfoPanel
        panelOpen={true}
        onClose={onClose}
        frontmatter={frontmatterBase}
        topic="tecnologia"
        // sem sidecarContent
      />
    );

    // Slot não deve aparecer quando não há sidecar
    const slot = screen.queryByTestId("sidecar-content-phase4");
    expect(slot).toBeNull();
  });

  test("CTX-05: sidecar-content-phase4 NÃO aparece quando sidecarContent é null", () => {
    render(
      <InfoPanel
        panelOpen={true}
        onClose={onClose}
        frontmatter={frontmatterBase}
        topic="tecnologia"
        sidecarContent={null}
      />
    );

    const slot = screen.queryByTestId("sidecar-content-phase4");
    expect(slot).toBeNull();
  });
});
