# Feature Research

**Domain:** web-based PKM/document viewer for a file-first repository
**Researched:** 2026-04-06
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users now assume in any serious PKM/document viewer. Missing these makes the product feel incomplete even if the file-first model is strong.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Collapsible tree navigation with active-item reveal | Obsidian, docs platforms, and knowledge tools all train users to browse hierarchies directly from a left sidebar | MEDIUM | Must support topics, subtopics, groups, and loose files; active item should auto-expand ancestors; keep sidecars out of the tree |
| Fast text search across titles and document bodies | Search is the primary fallback when users do not remember location in the tree | MEDIUM | Start with filename + Markdown + textual sidecars only; exclude frontmatter to avoid noisy results and indexing drift |
| High-fidelity Markdown rendering | Obsidian-class readers and modern docs tools make users expect code blocks, callouts, tables, links, footnotes, and math to render cleanly | HIGH | This is the core of perceived quality; weak rendering will make the whole product feel amateur |
| First-class image viewing | Visual PKM repos often contain screenshots, diagrams, and reference images; opening images in a cramped or raw way is unacceptable | MEDIUM | Needs zoom, fit modes, background handling, and stable sidecar access from the same viewer surface |
| Stable internal link resolution | PKM users expect wiki links and normal links to work as navigation primitives, not as dead text | MEDIUM | File-first routing must resolve repo-relative targets and preserve location changes after reindexing |
| Readable themes and typography | Light/dark is baseline now, but more importantly the reading surface must feel intentional and low-friction for long sessions | MEDIUM | Focus on reading themes, spacing, code contrast, and image framing before adding many cosmetic options |
| Responsive two-pane layout with collapsible sidebar | Desktop-first knowledge tools still need to degrade well on smaller screens and support distraction-free reading | MEDIUM | Left tree should collapse cleanly; right viewer remains primary; mobile can become stacked or drawer-based |
| Separate inbox area with pending-state visibility | Once a product exposes an inbox workflow, users expect pending material to be obvious and not buried inside the main taxonomy | LOW | Keep inbox visually distinct from the tree of curated knowledge; this is essential to the ai-pkm operating model |

### Differentiators (Competitive Advantage)

These are the features that make ai-pkm feel purpose-built instead of “another note app without editing”.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Logical item model for binaries + hidden sidecars | Turns a messy filesystem convention into a clean reading experience by showing one primary item instead of multiple technical files | HIGH | Critical differentiator for file-first repos with images and text companions; viewer should expose sidecar content in tabs/drawer, never as sibling clutter |
| Read-only, file-first workflow with safe web UI | Most tools are editor-first; ai-pkm can differentiate by being trustworthy as a viewer that never mutates the source of truth in the browser | MEDIUM | Emphasize predictability, Git compatibility, and parity with CLI workflows rather than trying to mimic Notion-like editing |
| Presentation mode for repository content | Moves the product from private viewer to “knowledge stage”: full-screen reading, cleaner chrome, and presentation-friendly controls | MEDIUM | Better as a reading/presenting mode than a slide editor; laser pointer and keyboard stepping are enough for v2 |
| Purpose-built reading themes for different content types | Generic dark/light toggles are common; curated themes for article reading, reference lookup, and presentation make the viewer feel intentional | MEDIUM | Prefer a small set of opinionated presets over open-ended theming UI |
| Inbox-first visual workflow | Distinguishes unprocessed material from curated knowledge, making the repository state legible at a glance | LOW | The inbox should feel like a separate operational lane, not just another tree folder |
| Contextual related-content panel | Gives PKM value without requiring full graph complexity: backlinks, linked mentions, sibling items, or group context beside the main document | MEDIUM | This is a better near-term investment than a full graph view for a readability-first product |
| Sidecar-aware search results | Search can surface the primary item when the textual match lives in a hidden sidecar, preserving clean navigation without losing recall | HIGH | Strong domain fit; avoids exposing implementation artifacts while keeping retrieval quality high |

### Anti-Features (Commonly Requested, Often Problematic)

These will create scope creep or break the product model if added in v2.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Inline web editing of notes/files | Users reflexively expect note apps to allow quick edits everywhere | Breaks the rule that the AI is the sole writer, introduces sync/conflict complexity, and drags the product toward full editor semantics | Keep the web experience read-only in v2 and route structural/content changes through CLI or future agent workflows |
| Drag-and-drop tree reorganization in the browser | Feels natural in file explorers and knowledge apps | Hides consequential filesystem mutations behind casual gestures and makes Git history harder to reason about | Show structure clearly, but keep reorganization outside the web viewer for now |
| Showing every raw sidecar, index, or helper file in the tree | Feels “honest” to the filesystem and easier to implement | Makes the navigation noisy, exposes implementation details, and punishes readability | Build a canonical item layer that hides technical artifacts while preserving access from the viewer |
| Full graph view early in v2 | PKM tools market graph heavily, so users ask for it | High implementation and UX cost for limited day-to-day reading value; easy to become novelty UI | Start with related-content/backlinks panels; revisit graph only if navigation patterns prove insufficient |
| Semantic/RAG search in the first viewer release | AI-flavored search sounds modern and powerful | Adds indexing complexity and infrastructure before basic retrieval quality and viewer UX are proven | Ship precise lexical search first; defer semantic retrieval to a later milestone |
| Web-based agent execution/console in this milestone | The broader product vision includes agent workflows, so it is tempting to bring them in early | Conflates viewer scope with orchestration scope and substantially increases state-management complexity | Keep v2 focused on navigation, readability, and repository presentation; reserve agent UX for a later version |
| Extensive user-customizable layout builder | Seems flexible and “power-user friendly” | Produces design sprawl, more settings than value, and weaker defaults | Offer a small number of strong layout/theme presets tuned for reading and presentation |

## Feature Dependencies

```text
Canonical repository model
    └──requires──> Tree navigation
    └──requires──> Hidden sidecar mapping

Hidden sidecar mapping
    └──requires──> Viewer tabs/drawer for companion text
    └──enhances──> Search result quality

High-fidelity Markdown/image rendering
    └──requires──> Readable themes and typography
    └──enables──> Presentation mode

Text extraction/indexing
    └──requires──> Search across filenames, Markdown, and sidecars

Separate inbox lane
    └──requires──> Repository model that distinguishes curated tree vs pending intake

Inline web editing
    └──conflicts──> Read-only file-first workflow

Raw sidecar exposure in tree
    └──conflicts──> Clean logical item model
```

### Dependency Notes

- **Canonical repository model requires tree navigation:** the UI cannot be trustworthy until the web app represents topics, groups, inbox, and loose files the same way the repository does.
- **Hidden sidecar mapping requires viewer tabs/drawer:** once sidecars disappear from the tree, the viewer must still expose them predictably from the primary item.
- **High-fidelity rendering enables presentation mode:** presentation is not a separate product surface; it is the same viewer with stronger chrome control and readability defaults.
- **Text extraction/indexing is required for useful search:** sidecar-aware search only works if indexing understands the canonical item relationship.
- **Separate inbox lane requires repository-state distinction:** the product must know what is pending triage versus what belongs to the curated knowledge tree.
- **Inline web editing conflicts with the read-only workflow:** this is a product-model conflict, not just an implementation detail.
- **Raw sidecar exposure conflicts with the logical item model:** showing sidecars directly would undo one of the main readability advantages of the viewer.

## MVP Definition

### Launch With (v2)

Minimum viable product for validating the web viewer.

- [ ] Collapsible tree navigation — core browsing model for the repository
- [ ] Separate inbox lane — makes pending intake visible without polluting the main tree
- [ ] High-fidelity Markdown rendering — core reading quality bar
- [ ] First-class image viewing — required for visual knowledge assets
- [ ] Stable internal link resolution — necessary for PKM-style navigation
- [ ] Fast lexical search over filenames, Markdown, and textual sidecars — practical retrieval baseline
- [ ] Hidden sidecar handling with viewer access — core domain-specific polish
- [ ] Readable theme baseline with collapsible sidebar — enough to support daily use

### Add After Validation (v2.x)

- [ ] Presentation mode — add once the base viewer is stable and pleasant
- [ ] Curated reading/presentation theme presets — add when core tokens and rendering feel solid
- [ ] Contextual related-content panel — add after basic navigation/search behavior is validated
- [ ] Sidecar-aware result snippets — add after search indexing and canonical item mapping are correct

### Future Consideration (v3+)

- [ ] Semantic search — only after lexical search proves insufficient in real usage
- [ ] Web agent execution/console — later milestone, separate from viewer validation
- [ ] Graph visualization — only if related-content navigation still leaves discovery gaps

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Collapsible tree navigation | HIGH | MEDIUM | P1 |
| High-fidelity Markdown rendering | HIGH | HIGH | P1 |
| First-class image viewing | HIGH | MEDIUM | P1 |
| Separate inbox lane | HIGH | LOW | P1 |
| Hidden sidecar handling | HIGH | HIGH | P1 |
| Fast lexical search | HIGH | MEDIUM | P1 |
| Readable themes baseline | MEDIUM | MEDIUM | P1 |
| Stable internal link resolution | HIGH | MEDIUM | P1 |
| Presentation mode | MEDIUM | MEDIUM | P2 |
| Contextual related-content panel | MEDIUM | MEDIUM | P2 |
| Theme presets for reading/presentation | MEDIUM | MEDIUM | P2 |
| Semantic search | MEDIUM | HIGH | P3 |
| Graph view | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have after core validation
- P3: Defer until the base viewer proves itself

## Competitor Feature Analysis

| Feature | Competitor A | Competitor B | Our Approach |
|---------|--------------|--------------|--------------|
| Filesystem-derived navigation | Obsidian uses a file explorer over local vault structure | VitePress/Docusaurus derive navigation from file structure and sidebars | Keep tree-based navigation, but add PKM-specific treatment for groups, inbox, and hidden sidecars |
| Reading quality | Obsidian sets the bar for Markdown readability in local knowledge bases | Modern docs tools emphasize clean typography, search, and structured navigation | Optimize for reading first, not editing first; the viewer is the product surface |
| Linked knowledge context | Obsidian and Logseq popularized backlinks/graph as discovery aids | Anytype emphasizes related objects and structured context in the sidebar | Prefer related-content panels and lightweight backlink context before full graph complexity |
| Presentation/reading modes | Obsidian supports slide-style presentation through its Slides capability | Docs tools commonly support distraction-free reading, dark mode, and full-width layouts | Build a repository presentation mode from the viewer itself, with fullscreen, reduced chrome, and laser pointer |

## Sources

- Obsidian Help — Backlinks: https://help.obsidian.md/plugins/backlinks (official, HIGH)
- Obsidian Help — Accepted file formats: https://help.obsidian.md/file-formats (official, HIGH)
- Obsidian Help home: https://help.obsidian.md/ (official, HIGH)
- Logseq GitHub README: https://github.com/logseq/logseq (official project source, MEDIUM)
- Anytype Docs — All Objects: https://doc.anytype.io/anytype-docs/getting-started/customize-and-edit-the-sidebar/anytype-library (official, MEDIUM)
- Docusaurus docs — sidebar items: https://docusaurus.io/docs/3.8.1/sidebar/items (official, HIGH)
- Docusaurus docs — Markdown features: https://docusaurus.io/docs/2.x/markdown-features (official, HIGH)
- VitePress docs — file-based routing: https://vitepress.dev/guide/routing (official, HIGH)
- OpenAlternative comparison pages for ecosystem signal only: https://openalternative.co/compare/anytype/vs/logseq (secondary, LOW)

---
*Feature research for: ai-pkm v2 web PKM/document viewer*
*Researched: 2026-04-06*
