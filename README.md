# @standhigher/react-email-editor

JSON-driven React email template editor. Zero UI framework, CSS-variable themed
(`ree-` prefix). Three-panel layout: blocks / canvas / inspector.

- Drag & drop: `@dnd-kit`
- Inline rich text: TipTap
- Output: JSON (single source of truth) + HTML (deliverable)
- Render contract: dual-mode `render(ctx)` — `canvas` (static demo) vs `email`
  (Go template directives like `{{range}}` / `{{.customer_name}}`)

## Status

Day 1 — `text` block end-to-end (drag in → inline edit → inspector style
binding → HTML → JSON save/restore).

## Development

```bash
pnpm install
pnpm typecheck
```

Consumed by the Shopify admin app via a local `file:` dependency.
