/**
 * Testes da AppShell — Phase 2 (02-02)
 *
 * Cobre os comportamentos críticos exigidos pelo plano:
 * 1. Rail recolhível sem perda do item atual (filho permanece montado)
 * 2. Destaque do item ativo derivado da URL (href match)
 * 3. Namespaces library/inbox mantidos no chrome persistente
 * 4. decodeLibraryParams e decodeInboxParam (helpers canônicos)
 */

import { describe, test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { AppShell } from "@/components/shell/app-shell";
import { decodeLibraryParams, decodeInboxParam, itemToHref } from "@/lib/navigation/route-helpers";
import type { NavigationSnapshot } from "@/lib/navigation/navigation-types";

// ── Snapshot mínimo para testes ──────────────────────────────────────────────

const snapshotVazio: NavigationSnapshot = {
  inbox: [],
  tree: [],
  ancestorsByItemId: {},
};

const snapshotComInbox: NavigationSnapshot = {
  inbox: [
    {
      id: "__inbox/nota-importante.md",
      label: "nota-importante",
      scope: "inbox",
      itemKind: "markdown",
      estado: "rascunho",
      href: "/inbox/nota-importante.md",
    },
  ],
  tree: [
    {
      id: "tecnologia",
      label: "Tecnologia",
      kind: "topic",
      count: 1,
      children: [],
      items: [
        {
          id: "tecnologia/ferramenta.md",
          label: "ferramenta",
          scope: "library",
          itemKind: "markdown",
          estado: "finalizado",
          href: "/library/tecnologia/ferramenta.md",
        },
      ],
    },
  ],
  ancestorsByItemId: {
    "tecnologia/ferramenta.md": ["tecnologia"],
  },
};

// ── Testes do rail recolhível ────────────────────────────────────────────────

describe("AppShell — rail recolhível", () => {
  test("rail começa aberto por padrão", () => {
    render(
      <AppShell snapshot={snapshotVazio}>
        <div>workspace</div>
      </AppShell>
    );

    const rail = screen.getByTestId("navigation-rail");
    expect(rail).toBeTruthy();
    // Rail aberto: aria-hidden=false no conteúdo interno
    const content = document.getElementById("rail-content");
    expect(content?.getAttribute("aria-hidden")).toBe("false");
  });

  test("toggle recolhe o rail e oculta o conteúdo", () => {
    render(
      <AppShell snapshot={snapshotVazio}>
        <div data-testid="workspace-child">workspace</div>
      </AppShell>
    );

    const toggleBtn = screen.getByRole("button", { name: /Recolher painel/i });
    fireEvent.click(toggleBtn);

    const content = document.getElementById("rail-content");
    expect(content?.getAttribute("aria-hidden")).toBe("true");
  });

  test("filho (workspace) permanece montado ao recolher o rail", () => {
    render(
      <AppShell snapshot={snapshotVazio}>
        <div data-testid="workspace-child">conteúdo atual</div>
      </AppShell>
    );

    const toggleBtn = screen.getByRole("button", { name: /Recolher painel/i });
    fireEvent.click(toggleBtn);

    // O filho deve ainda estar no DOM — rail recolhido não desmonta o workspace
    expect(screen.getByTestId("workspace-child")).toBeTruthy();
    expect(screen.getByTestId("workspace-child").textContent).toBe("conteúdo atual");
  });

  test("toggle reabre o rail após recolher", () => {
    render(
      <AppShell snapshot={snapshotVazio}>
        <div>workspace</div>
      </AppShell>
    );

    const toggleBtn = screen.getByRole("button", { name: /Recolher painel/i });
    fireEvent.click(toggleBtn);

    const expandBtn = screen.getByRole("button", { name: /Expandir painel/i });
    fireEvent.click(expandBtn);

    const content = document.getElementById("rail-content");
    expect(content?.getAttribute("aria-hidden")).toBe("false");
  });
});

// ── Testes do namespace chrome ────────────────────────────────────────────────

describe("AppShell — namespaces library e inbox", () => {
  test("exibe seção inbox quando há itens", () => {
    render(
      <AppShell snapshot={snapshotComInbox}>
        <div>workspace</div>
      </AppShell>
    );

    // Deve haver rótulo "Inbox" no rail
    const labels = screen.getAllByText(/inbox/i);
    expect(labels.length).toBeGreaterThan(0);
  });

  test("exibe seção biblioteca no rail", () => {
    render(
      <AppShell snapshot={snapshotComInbox}>
        <div>workspace</div>
      </AppShell>
    );

    const labels = screen.getAllByText(/biblioteca/i);
    expect(labels.length).toBeGreaterThan(0);
  });

  test("exibe cabeçalho inbox mas sem itens quando snapshot está vazio", () => {
    render(
      <AppShell snapshot={snapshotVazio}>
        <div>workspace</div>
      </AppShell>
    );

    // Cabeçalho "Inbox" sempre visível (seção permanente)
    const inboxLabels = screen.queryAllByText(/^inbox$/i);
    expect(inboxLabels.length).toBeGreaterThan(0);

    // Nenhum item de lista renderizado
    const listItems = screen.queryAllByRole("listitem");
    expect(listItems.length).toBe(0);
  });

  test("item da inbox usa namespace /inbox/ na URL", () => {
    const entry = snapshotComInbox.inbox[0]!;
    expect(entry.href).toMatch(/^\/inbox\//);
    expect(entry.scope).toBe("inbox");
  });

  test("item da biblioteca usa namespace /library/ na URL", () => {
    const item = snapshotComInbox.tree[0]!.items[0]!;
    expect(item.href).toMatch(/^\/library\//);
    expect(item.scope).toBe("library");
  });
});

// ── Testes dos helpers canônicos de rota ─────────────────────────────────────

describe("route-helpers — decode canônico", () => {
  test("decodeLibraryParams reconstrói ID lógico a partir de segmentos", () => {
    const params = { path: ["tecnologia", "ferramenta.md"] };
    const itemId = decodeLibraryParams(params);
    expect(itemId).toBe("tecnologia/ferramenta.md");
  });

  test("decodeLibraryParams lida com path de um único segmento", () => {
    const params = { path: ["arquivo.md"] };
    const itemId = decodeLibraryParams(params);
    expect(itemId).toBe("arquivo.md");
  });

  test("decodeLibraryParams decodifica caracteres URL-encoded", () => {
    const params = { path: ["tecnologia", "nota%20com%20espaco.md"] };
    const itemId = decodeLibraryParams(params);
    expect(itemId).toBe("tecnologia/nota com espaco.md");
  });

  test("decodeInboxParam reconstrói ID com prefixo __inbox/", () => {
    const itemId = decodeInboxParam("nota-importante.md");
    expect(itemId).toBe("__inbox/nota-importante.md");
  });

  test("decodeInboxParam decodifica caracteres URL-encoded", () => {
    const itemId = decodeInboxParam("nota%20com%20espaco.md");
    expect(itemId).toBe("__inbox/nota com espaco.md");
  });

  test("itemToHref gera href /library/ para scope library", () => {
    const href = itemToHref({ id: "tecnologia/ferramenta.md", scope: "library" });
    expect(href).toMatch(/^\/library\//);
    expect(href).toContain("tecnologia");
  });

  test("itemToHref gera href /inbox/ para scope inbox", () => {
    const href = itemToHref({ id: "__inbox/nota.md", scope: "inbox" });
    expect(href).toMatch(/^\/inbox\//);
  });
});

// ── Testes de integração: decode → namespace consistente ─────────────────────

describe("decode → namespace round-trip", () => {
  test("round-trip library: itemToHref → decodeLibraryParams retorna ID original", () => {
    const originalId = "tecnologia/ferramenta.md";
    const href = itemToHref({ id: originalId, scope: "library" });

    // Simula o que Next.js passa para params.path (segmentos decodificados)
    const segments = href.replace("/library/", "").split("/");
    const decoded = decodeLibraryParams({ path: segments });

    expect(decoded).toBe(originalId);
  });

  test("round-trip inbox: itemToHref → decodeInboxParam retorna ID original", () => {
    const originalId = "__inbox/nota-importante.md";
    const href = itemToHref({ id: originalId, scope: "inbox" });

    // Simula o slug da URL
    const slug = decodeURIComponent(href.replace("/inbox/", ""));
    const decoded = decodeInboxParam(slug);

    expect(decoded).toBe(originalId);
  });
});

// ── NAV-04: Item ativo destacado corretamente (T-02-10) ───────────────────────

describe("AppShell — item ativo (NAV-04)", () => {
  test("item da inbox com href correspondente recebe aria-current=page", () => {
    const inboxItemHref = snapshotComInbox.inbox[0]!.href; // "/inbox/nota-importante.md"

    render(
      <AppShell snapshot={snapshotComInbox} activeHref={inboxItemHref}>
        <div>workspace</div>
      </AppShell>
    );

    // O link que representa o item ativo deve ter aria-current="page"
    const activeLink = document.querySelector(`a[href="${inboxItemHref}"]`);
    expect(activeLink).not.toBeNull();
    expect(activeLink?.getAttribute("aria-current")).toBe("page");
  });

  test("item da biblioteca com href correspondente recebe aria-current=page", () => {
    const libraryItemHref = snapshotComInbox.tree[0]!.items[0]!.href; // "/library/tecnologia/ferramenta.md"

    render(
      <AppShell snapshot={snapshotComInbox} activeHref={libraryItemHref}>
        <div>workspace</div>
      </AppShell>
    );

    // O ancestral "tecnologia" deve ser auto-expandido, tornando o item visível
    const activeLink = document.querySelector(`a[href="${libraryItemHref}"]`);
    expect(activeLink).not.toBeNull();
    expect(activeLink?.getAttribute("aria-current")).toBe("page");
  });

  test("nenhum item recebe aria-current=page quando activeHref não corresponde a nenhum item", () => {
    render(
      <AppShell snapshot={snapshotComInbox} activeHref="/inbox/inexistente.md">
        <div>workspace</div>
      </AppShell>
    );

    const activeLinks = document.querySelectorAll("a[aria-current='page']");
    expect(activeLinks.length).toBe(0);
  });
});
