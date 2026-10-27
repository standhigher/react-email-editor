# @standhigher/react-email-editor

English | [简体中文](./README.zh-CN.md)

A React email editor with drag-and-drop blocks, inline rich text, and desktop/mobile previews. Store content as JSON and export email HTML through a component ref.

## Installation and integration

Requires React 18 and React DOM 18. The package provides an ESM entry and TypeScript declarations.

```bash
pnpm add @standhigher/react-email-editor
```

Import the stylesheet once in your application. This example renders an empty editor and reads its current data:

```tsx
import { useRef } from "react";
import {
  EmailEditor,
  type EmailEditorHandle,
} from "@standhigher/react-email-editor";
import "@standhigher/react-email-editor/styles.css";

export function EmailPage() {
  const editorRef = useRef<EmailEditorHandle>(null);

  function readData() {
    const data = editorRef.current?.getData();
    if (!data) return;
    // Pass data.document, data.json, data.html, or data.renderedHtml
    // to your application's save or export handler.
    console.log(data);
  }

  return (
    <>
      <EmailEditor ref={editorRef} height={720} />
      <button type="button" onClick={readData}>Read data</button>
    </>
  );
}
```

Saving is handled by your application. In Next.js App Router, put this integration in a Client Component with `"use client"`. When using `height="100%"`, give its parent a definite height.

## Local development

Use pnpm and a current Node.js LTS release; Node.js 22.18+ is recommended for the repository's tooling and TypeScript tests.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173). The playground loads `src/` directly with hot reload; no initial build is needed. It is not included in the published package. Reuse an existing development server when one is already running.

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the local playground on port 5173. |
| `pnpm build` | Generate ESM, type declarations, and CSS in `dist/`. |
| `pnpm build:watch` | Rebuild `dist/` when files in `src/` change; does not start a preview server. |
| `pnpm typecheck` | Type-check the library and playground. |
| `pnpm lint` | Check source, playground, scripts, configuration, and tests with Oxlint; warnings and unused disable directives fail the check. |
| `pnpm lint:fix` | Apply safe Oxlint automatic fixes. |

Oxlint uses `.oxlintrc.json` with native TypeScript, Unicorn, Oxc, and React correctness rules, plus explicit checks for `any` and Hook call order. React checks include Hook dependencies, refs, and effects; they do not cover every rule in the official React Compiler plugin. JavaScript uses `no-undef`; `pnpm typecheck` checks undefined TypeScript identifiers and component props. Generated output and the local pnpm store are excluded.

To integrate with another local project, set its dependency to the library's root directory, adjusting the relative path as needed:

```json
{
  "dependencies": {
    "@standhigher/react-email-editor": "link:../react-email-editor"
  }
}
```

Run `pnpm build` in this repository first, then keep `pnpm build:watch` running during development. In the consuming project, run `pnpm install` and use its development server. Package imports, including CSS, resolve to `dist/`.

Both projects must resolve the same React instance. For Vite consumers, use `resolve.dedupe: ["react", "react-dom"]` if needed. Next.js consumers can use `transpilePackages: ["@standhigher/react-email-editor"]`; when an external link is used with Turbopack, `turbopack.root` must include both projects.

## Component props

All props are optional. Types are exported from `@standhigher/react-email-editor`.

| Prop | Type | Default / behavior |
| --- | --- | --- |
| `initialDocument` | `EmailDocument` | Empty document. Read only on the first mount. |
| `global` | `Partial<EmailGlobalSettings>` | No external overrides. Supplied fields override the initial document's global settings; later updates merge into the current document. |
| `blocks` | `BlockDefinition[]` | `[]`. Adds custom block types; matching types replace built-in definitions. Other built-in blocks remain available. |
| `variables` | `Variable[]` | `[]`. Variables available for insertion and preview substitution. |
| `height` | `number \| string` | `"100%"`. A number is interpreted as pixels; a string is a CSS height. |
| `onChange` | `(document: EmailDocument) => void` | Called when the document changes, including edits, reset, and external global updates that change its values. |
| `onGlobalChange` | `(global: EmailGlobalSettings) => void` | Called when global settings are edited in the editor. External `global` updates and reset do not call it. |

Reset restores the initial document snapshot and reapplies the current `global` overrides. To load a different document, remount with a new React `key`, for example `<EmailEditor key={documentId} initialDocument={document} />`. Changing `initialDocument` alone does not replace the open document. Omitting a previously supplied `global` field does not restore its default.

## Configuration

### Document

Use `createEmailDocument()` and `createBlockNode()` to populate defaults:

```tsx
import {
  BLOCK_TYPES,
  EmailEditor,
  createBlockNode,
  createEmailDocument,
  type Variable,
} from "@standhigher/react-email-editor";

const text = createBlockNode(BLOCK_TYPES.text);
if (text) text.fields.html = "<p>Hello {{  store_name }}</p>";

export const initialDocument = createEmailDocument(text ? [text] : []);
initialDocument.subject = "Welcome";

const variables: Variable[] = [
  { name: "{{  store_name }}", description: "Store name", value: "Demo Store" },
];

export function TemplateEmailPage() {
  return (
    <EmailEditor
      initialDocument={initialDocument}
      variables={variables}
      height={720}
    />
  );
}
```

Pass both `initialDocument` and `variables` as shown so the token has a preview value and can gain its missing dot on export. `createBlockNode()` returns `null` for an unknown block type. Built-in types are `heading`, `text`, `button`, `image`, `divider`, `spacer`, and `html`, also available through `BLOCK_TYPES`.

| Document field | Type | Description |
| --- | --- | --- |
| `version` | `typeof DOCUMENT_VERSION` | Current version: `1`. Set by `createEmailDocument()`. |
| `subject` | `string` (optional) | Email subject. The editor input is limited to 128 characters. |
| `global` | `EmailGlobalSettings` | Global email appearance; defaults are populated by the helper. |
| `blocks` | `EmailBlockNode[]` | Ordered nodes, each with a unique `id`, a `type`, and `fields`, plus optional `style` and preview `defaultData`. |

The document format is under development; older block fields are not migrated automatically. See the [document types](./src/types/document.ts) for the full model.

### Global styles

Pass partial settings through `global`, for example `<EmailEditor global={{ contentWidth: 640, outerPadding: "24px" }} />`. `DEFAULT_EMAIL_GLOBAL` exposes all defaults; `resolveEmailGlobal()` fills missing values and normalizes input.

These settings control email content. Editor selection outlines and toolbars are not included in exported HTML.

| Parameter | Type / values | Default | Description |
| --- | --- | --- | --- |
| `contentWidth` | `number` | `600` | Content width in pixels, rounded and clamped to 320–900. |
| `contentAlign` | `"left" \| "center" \| "right"` | `"center"` | Horizontal position of the content. |
| `backgroundColor` | `string` | `"#ffffff"` | Outer email background. |
| `contentBackgroundColor` | `string` | `"#ffffff"` | Content background. |
| `contentPadding` | `string` | `"0px"` | Content inner spacing. |
| `outerPadding` | `string` | `"0px"` | Spacing outside the content. |
| `blockGap` | `string` | `"4px"` | Gap between blocks. |
| `textColor` | `string` | `"#000000"` | Default text color. |
| `textAlign` | `"left" \| "center" \| "right" \| "justify"` | `"left"` | Default text alignment. |
| `fontFamily` | `string` | `"Arial, Helvetica, sans-serif"` | Default font stack. |
| `fontWeight` | `"normal" \| "bold"` | `"normal"` | Default font weight. |
| `defaultFontSize` | `string` | `"16px"` | Default font size. |
| `defaultLineHeight` | `string` | `"1.5"` | Default line height. |
| `paragraphSpacing` | `string` | `"6px"` | Gap between adjacent top-level paragraphs. |
| `listSpacing` | `string` | `"4px"` | Top and bottom margins of the entire list (`ul` / `ol`). |
| `listIndent` | `string` | `"22px"` | List indentation. |
| `linkColor` | `string` | `"#005bd3"` | Default link color. |
| `linkDecoration` | `"underline" \| "none"` | `"underline"` | Default link decoration. |
| `borderWidth` | `string` | `"0px"` | Content border width. |
| `borderStyle` | `"none" \| "solid" \| "dashed" \| "dotted"` | `"solid"` | Content border style. |
| `borderColor` | `string` | `"#000000"` | Content border color. |
| `borderRadius` | `string` | `"0px"` | One radius or four, ordered top-left, top-right, bottom-right, bottom-left. |

Use CSS length strings such as `"16px"` for spacing and sizes. Padding accepts shorthand such as `"12px 24px"`; line height also accepts a unitless value. Desktop canvas and preview follow `contentWidth`; mobile uses a 360px viewport.

Global spacing and length settings accept non-negative values in `px`, `em`, `rem`, or `%`; unitless lengths are normalized to px, except for line height. Unsupported values such as negative lengths, `calc()`, `var()`, `vh`, or `vw` fall back to the corresponding global default.

### Variables and template data

```tsx
import type { Variable } from "@standhigher/react-email-editor";

export const variables: Variable[] = [
  { name: "{{  store_name }}", description: "Store name", value: "Demo Store" },
];
```

Pass this array through `variables` on `EmailEditor`.

| Field | Type | Description |
| --- | --- | --- |
| `name` | `string` | Required. Token displayed and inserted as written, including spaces. Example: `{{  store_name }}`. |
| `description` | `string` (optional) | Secondary text in the variable menu; omitted when empty or absent. |
| `value` | `string` (optional) | Replacement text used in previews. |

Tokens may include a leading dot. Template HTML export preserves spaces and adds a missing dot only when the token exactly matches `variables[].name`, including spaces: `{{  store_name }}` becomes `{{  .store_name }}`. Other Go template actions are left unchanged. Export does not substitute preview values by default.

Use a block node's `defaultData: Record<string, unknown>` for structured preview data, including arrays for `{{range .products}}`. Block data overrides variables with the same name. Preview resolution applies to every block's rendered HTML, including custom blocks. Write template expressions directly in an HTML block's `fields.html`; the preview renderer supports a subset of Go template syntax.

### Block configuration

Block node styles are grouped by purpose:

| Style group | Purpose |
| --- | --- |
| `style.dimension` | Container `padding`, outer spacing via `margin`, and optional `height` in px. Height acts as a minimum including padding. |
| `style.decorations` | Container background, border, and corner radius. |
| `style.typography` | Block text styles overriding global typography. |
| `style.element` | Element-specific styles for buttons, images, and dividers, such as size and alignment. |

Heading and Text blocks start with `16px` padding. HTML blocks retain explicitly authored inline styles. See [EmailBlockStyle](./src/types/document.ts) for individual fields.

To add a custom block, pass a stable `BlockDefinition[]` through `blocks`. `type`, `title`, and `render(ctx)` are required. Optional `fields` and `styleFields` configure the inspector; `defaultFields`, `defaultStyle`, and `defaultData` initialize new nodes. `render(ctx)` returns HTML and receives `mode: "canvas" | "email"`.

```tsx
import { EmailEditor, type BlockDefinition } from "@standhigher/react-email-editor";

const customBlocks: BlockDefinition[] = [{
  type: "notice",
  title: "Notice",
  defaultStyle: { dimension: { padding: "16px" } },
  render: () => '<p style="margin:0;color:#555555;">Thanks for subscribing.</p>',
}];

export function CustomEmailPage() {
  return <EmailEditor blocks={customBlocks} height={720} />;
}
```

By default, common container spacing and decoration controls are added to custom blocks. Set `exactStyleFields: true` to show only the supplied style fields; existing node styles still apply when rendering. Full definitions: [BlockDefinition, FieldConfig, and StyleFieldConfig](./src/types/block.ts).

## Reading and exporting data

Call these methods through `useRef<EmailEditorHandle>(null)`:

| Method | Return type | Description |
| --- | --- | --- |
| `getData()` | `EmailEditorData` | Returns `{ document, json, html, renderedHtml }`. |
| `getDocument()` | `EmailDocument` | Independent document snapshot for storage or later editing. |
| `getJson()` | `string` | Formatted document JSON. |
| `getHtml()` | `string` | Complete email HTML. Template actions stay in place; only tokens from `variables` gain a missing dot. |
| `getRenderedHtml()` | `string` | Complete email HTML with templates resolved using variables and block preview data. |

Mutating a returned document snapshot does not change the editor. Use `onChange` to subscribe to document changes.

For rendering without mounting the editor, use `documentToHtml(document, definitions?, options?)`. Definitions default to `DEFAULT_BLOCKS`; include custom definitions when the document uses them. `options` accepts `resolveHtmlTemplates` (default `false`), `variables`, and `templateData`. When templates stay unresolved, `variables` supplies the only tokens that gain a missing dot. When resolving, data precedence is block `defaultData` over `templateData` over `variables`.
