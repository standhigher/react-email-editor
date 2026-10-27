# @standhigher/react-email-editor

English | [简体中文](./README.zh-CN.md)

A React email template editor with drag-and-drop blocks, inline rich text, desktop/mobile previews, JSON storage, and HTML export.

## Installation

Requires React 18 and React DOM 18. Includes ESM and TypeScript declarations.

```bash
pnpm add @standhigher/react-email-editor
```

## Quick start

Import the stylesheet once in your application and use a ref to read the document and HTML. Your application handles persistence.

```tsx
import { useRef } from "react";
import {
  BLOCK_TYPES,
  EmailEditor,
  createBlockNode,
  createEmailDocument,
  type EmailEditorHandle,
  type Variable,
} from "@standhigher/react-email-editor";
import "@standhigher/react-email-editor/styles.css";

const text = createBlockNode(BLOCK_TYPES.text);
if (text) text.fields.html = "<p>Hello, {{ store_name }}</p>";
const initialDocument = createEmailDocument(text ? [text] : []);
const variables: Variable[] = [
  { name: "{{ store_name }}", description: "Store name", value: "Example Store" },
];

export function EmailPage() {
  const editorRef = useRef<EmailEditorHandle>(null);

  function save() {
    const data = editorRef.current?.getData();
    if (!data) return;
    // Persist data.document in your app; use data.html to export the template.
    console.log(data);
  }

  return (
    <>
      <EmailEditor
        ref={editorRef}
        initialDocument={initialDocument}
        variables={variables}
        height={720}
      />
      <button type="button" onClick={save}>Save</button>
    </>
  );
}
```

Omit `initialDocument` to start empty. In Next.js App Router, add `"use client"` to the integration component and import CSS from an allowed global stylesheet entry. When using `height="100%"`, give the parent a definite height.

## Props

All props are optional.

| Prop | Type | Behavior |
| --- | --- | --- |
| `initialDocument` | `EmailDocument` | Read on first mount only. Remount with a new React `key` to switch documents. |
| `height` | `number \| string` | Defaults to `"100%"`; numbers are pixels. |
| `global` | `Partial<EmailGlobalSettings>` | Overrides global styles; later changes merge into the current document. Omitting a field does not restore its default. |
| `variables` | `Variable[]` | Variables for insertion and preview. Defaults to `[]`; Personalization controls are hidden when empty. |
| `blocks` | `BlockDefinition[]` | Adds custom blocks; matching types replace built-in definitions. |
| `onChange` | `(document: EmailDocument) => void` | Called on document changes, including external `global` updates that change document values. |
| `onGlobalChange` | `(global: EmailGlobalSettings) => void` | Called for global style edits inside the editor, excluding external `global` updates. |

Global style example: `global={{ contentWidth: 640, outerPadding: "24px" }}`. Defaults are exported as `DEFAULT_EMAIL_GLOBAL`.

Built-in blocks: `heading`, `text`, `button`, `image`, `divider`, `spacer`, and `html`, available through `BLOCK_TYPES`.

## Save and export

| Ref method | Returns |
| --- | --- |
| `getData()` | `{ document, json, html, renderedHtml }` |
| `getDocument()` | An independent `EmailDocument` snapshot to persist and pass back as `initialDocument`. |
| `getJson()` | A formatted document JSON string. |
| `getHtml()` | A complete email HTML document preserving template expressions. |
| `getRenderedHtml()` | A complete email HTML document with templates resolved using preview data. |

Render a document without mounting the editor:

```ts
import { documentToHtml } from "@standhigher/react-email-editor";

const html = documentToHtml(initialDocument, undefined, { variables });
const previewHtml = documentToHtml(initialDocument, undefined, {
  variables,
  resolveHtmlTemplates: true,
});
```

A variable's `name` is inserted verbatim; `description` and preview `value` are optional. Export adds a missing dot only to tokens matching `variables[].name` exactly, preserving whitespace: `{{ store_name }}` → `{{ .store_name }}`. Other Go template expressions remain unchanged. Preview supports a subset of Go template syntax; data precedence is block `defaultData` > `templateData` (`documentToHtml` option) > `variables`.

The document format is under development. Only `version: 2` is accepted, with no automatic migration of older documents. Create data with `createEmailDocument()` and `createBlockNode()`. See [CHANGELOG](./CHANGELOG.md) for upgrade notes.

## Custom blocks

Pass `BlockDefinition[]` through `blocks`. Required fields are `type`, `title`, and `render(ctx)`, which returns HTML. Use `fields` / `styleFields` for inspector controls and `defaultFields` / `defaultStyle` / `defaultData` for initial values. The render context includes `mode: "canvas" | "email"`.

Built-in text formatting lives in `fields.html`, container styles in `style.dimension` / `style.decorations`, and button, image, and divider element styles in `style.element`. Rendering uses only enabled style fields. See [BlockDefinition](https://github.com/standhigher/react-email-editor/blob/main/src/types/block.ts) and [EmailDocument](https://github.com/standhigher/react-email-editor/blob/main/src/types/document.ts) for full types. When calling `documentToHtml` directly, pass the complete definition list including custom blocks as its second argument.

## Local development

Node.js 22.18+ and pnpm are recommended:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173). The playground loads `src/` directly; reuse an existing server. Validation:

```bash
pnpm typecheck
pnpm lint
pnpm build
node --test tests/*.test.mjs tests/*.test.ts
```

For local consumers, use `link:../react-email-editor`, run `pnpm build` first, and keep `pnpm build:watch` running to update `dist/`. Both projects must share one React instance. Vite can use `resolve.dedupe: ["react", "react-dom"]`; Next.js can use `transpilePackages: ["@standhigher/react-email-editor"]`, with Turbopack's `root` covering the linked directory.
