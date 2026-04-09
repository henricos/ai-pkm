/**
 * Testes do InfoPanel — Phase 3 (03-01) · Wave 0 · RED
 *
 * Cobre os comportamentos exigidos por CTX-03 e CTX-04:
 * - CTX-03: painel visível quando panelOpen=true
 * - CTX-04: chip de estado (rascunho/finalizado), formatação de data_captura
 *            e data_publicacao, omissão de campos ausentes, url como link,
 *            autores como chips
 *
 * ESTADO: RED — InfoPanel e RawFrontmatter ainda não existem nos paths:
 * - @/components/viewer/info-panel
 * - @/lib/pkm/types (RawFrontmatter não exportado ainda)
 * Os imports abaixo causarão "Cannot find module" até que Wave 3 implemente.
 */

import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock de next/navigation caso InfoPanel use hooks de navegação
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Import real — InfoPanel ainda não existe → causa RED (module not found)
import { InfoPanel } from "@/components/viewer/info-panel";

// Import do tipo — RawFrontmatter ainda não exportado em types.ts → RED adicional
import type { RawFrontmatter } from "@/lib/pkm/types";

// ── Helpers de dados de teste ────────────────────────────────────────────────

const frontmatterBase: RawFrontmatter = {
  estado: "rascunho",
  modelo: "nota-conceito",
  data_captura: "2026-03-07",
};

// ── CTX-03: visibilidade do painel ───────────────────────────────────────────

describe("InfoPanel", () => {
  test("CTX-03: painel visível quando panelOpen=true", () => {
    render(
      <InfoPanel
        panelOpen={true}
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
        frontmatter={{ ...frontmatterBase, data_publicacao: "2025-11" }}
        topic="tecnologia"
      />
    );

    // Formato esperado: "nov. 2025" ou "nov 2025" (com ou sem ponto abreviado)
    const pubDate = screen.getByText(/nov.*2025/i);
    expect(pubDate).toBeTruthy();
  });
});
