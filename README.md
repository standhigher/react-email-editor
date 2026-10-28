# @standhigher/react-email-editor

English | [简体中文](./README.zh-CN.md)

A React email template editor with drag-and-drop blocks, inline rich text, desktop/mobile previews, JSON storage, and HTML export.

## Installation

Requires React 18 and React DOM 18. Includes ESM and TypeScript declarations.

```bash
pnpm add @standhigher/react-email-editor
```

## Quick start

Import the stylesheet once. Create an editor instance with `useEmailEditor()` and read its document or HTML when saving. Your application handles persistence.

```tsx
import {
  BLOCK_TYPES,
  EmailEditor,
  createBlockNode,
  createEmailDocument,
  useEmailEditor,
  useEmailEditorConfig,
  type Variable,
} from "@standhigher/react-email-editor";
import "@standhigher/react-email-editor/styles.css";

const text = createBlockNode(BLOCK_TYPES.text);
if (text) text.controls.html = "<p>Hello, {{ store_name }}</p>";
const initialDocument = createEmailDocument(text ? [text] : []);
const variables: Variable[] = [
  { name: "{{ store_name }}", description: "Store name", value: "Example Store" },
];

export function EmailPage() {
  const editor = useEmailEditor({ initialDocument, variables });

  function save() {
    const data = editor.getData();
    // Persist data.document in your app; use data.html to export the template.
    console.log(data);
  }

  return (
    <>
      <EmailEditor
        editor={editor}
        height={720}
      />
      <button type="button" onClick={save}>Save</button>
    </>
  );
}
```

Omit `initialDocument` to start empty. In Next.js App Router, add `"use client"` to the integration component and import CSS from an allowed global stylesheet entry. When using `height="100%"`, give the parent a definite height.

## Hooks and component props

`<EmailEditor editor={editor} height={720} />` accepts a required `editor` instance and optional `height`. Height defaults to `"100%"`; numbers are pixels.

`useEmailEditor(options?)` creates a stable, isolated instance. Reading, validation, and export work without mounting `<EmailEditor>`.

| Option | Type | Behavior |
| --- | --- | --- |
| `initialDocument` | `EmailDocument` | Read only during initialization. Switch documents with `editor.setDocument(document)`. |
| `body` | `Partial<EmailBodySettings>` | Overrides initial body settings; changed input values merge into the current document. Omitting a field does not restore its default. |
| `variables` | `Variable[]` | Insertion and preview variables, default `[]`; updates apply to previews and subsequent exports. |
| `config` | `EmailEditorConfig` | From `useEmailEditorConfig()`; defaults to all built-in blocks. Updating configuration preserves the document. |
| `onChange` | `(document: EmailDocument) => void` | Receives an independent snapshot after editing, replacement, reset, or effective external body updates; not called on initialization. |
| `onBodyChange` | `(body: EmailBodySettings) => void` | Receives an independent snapshot for body edits inside the editor only. |

`useEmailEditorConfig({ plugins, builtins, pickImage })` registers plugins, library order, and an image picker. Multiple independent instances can share one configuration. Declare plugins at module scope, or use `useMemo` for declarations depending on business state. Keep `plugins`, `builtins`, and `pickImage` references stable to reuse the configuration. Inline options do not recreate the editor instance or reset its document.

Configuration, variables, body, and callbacks synchronize during the React commit phase, before child layout effects. Interrupted concurrent renders do not change the committed instance. Subscriptions and `onChange` for external body updates run during the layout phase.

Use `useEmailEditorState(editor)` in a child component for reactive document display. It returns `{ document }`, a cached read-only snapshot, and subscribes only to document changes. Edit through instance methods. Components that only call `useEmailEditor()` do not rerender on document input.

Body style example: `useEmailEditor({ body: { contentWidth: 640, contentPadding: "24px" } })`. Defaults are exported as `DEFAULT_EMAIL_BODY`; normalize a partial configuration with `resolveEmailBody()`.

The **BODY** panel stores its settings in `EmailDocument.body` and applies them to the canvas, preview, and HTML export:

- **General**: text color, link color, font family, font weight, and a link underline switch.
- **Content**: Background, content width, Padding (`contentPadding`), and block gap. **Advanced: Border** is collapsed by default and contains border color, width, and style. Background is the single background color of the email content container; the surrounding area is white. The container is always centered. Padding applies inside the content border and is the only body padding setting; `outerPadding` has been removed.

Text and links inherit BODY defaults unless explicitly formatted in the rich-text toolbar. Editing only a link URL or target preserves explicit link styles; resetting a link style restores BODY inheritance. Base font size (16px), line height (1.5), and paragraph/list spacing use internal defaults. HTML blocks preserve their source formatting; their wrapper inherits body typography without rewriting links or lists. BODY does not expose alignment or corner radius.

Built-in blocks: `heading`, `text`, `button`, `image`, `divider`, `spacer`, and `html`, available through `BLOCK_TYPES`.

## Save and export

| Instance method | Returns |
| --- | --- |
| `getData()` | `{ document, json, html, renderedHtml }` |
| `getDocument()` | An independent `EmailDocument` snapshot to persist and pass back as `initialDocument`. |
| `getJson()` | A formatted document JSON string. |
| `getHtml()` | A complete email HTML document preserving template expressions. |
| `getRenderedHtml()` | A complete email HTML document with templates resolved using preview data. |
| `setDocument(document)` | Replaces the document, clears selection, focus, and old document control state, and calls `onChange`. |
| `reset()` | Restores the initialized document, including initial `body` overrides, clears editing state, and calls `onChange`. |
| `validate()` | Current document `ValidationIssue[]`, without rendering HTML. |

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

The fourth argument of `blockToHtml()` and `renderBlockContent()` accepts only a `BlockRenderOptions` object, such as `{ resolveHtmlTemplate: true }`. Boolean arguments are removed and throw `TypeError` in JavaScript.

The document format is under development. Only `version: 4` is accepted, with no automatic migration of older documents. Create data with `createEmailDocument()` and `createBlockNode()`. See [CHANGELOG](./CHANGELOG.md) for upgrade notes.

## Custom blocks

Declare controls and email output with `defineBlock()`, then register once:

```tsx
const coupon = defineBlock({
  type: "my-app.coupon",
  title: "Coupon",
  controls: {
    code: EmailControls.text({ label: "Code", defaultValue: "SAVE20" }),
  },
  renderEmail: ({ controls, email }) => email.html`<p>${controls.code}</p>`,
});
function CouponEditor() {
  const config = useEmailEditorConfig({ plugins: [coupon] });
  const editor = useEmailEditor({ config });
  return <EmailEditor editor={editor} />;
}
```

Import `defineBlock`, `EmailControls`, `useEmailEditor`, and `useEmailEditorConfig` from the package. Control values are inferred; the inspector and canvas work automatically. Plugins support rich text, editable lists, image resource adapters, custom control components, and optional React `Inspector` / `Canvas` components. `EditableRichText` supports multiple editing regions, while `ControlEditor` reuses declared controls inside custom inspectors.

`config.validate(document)` returns `ValidationIssue[]` with block IDs and control paths for export preflight. Number ranges, options, URL/image protocols, list counts, and custom validation also apply to the inspector and email export. Custom Canvas/Inspector components can call `setControls(patch)` to update related controls in one document change and one `onChange` callback. Declaration metadata is copied and frozen, parsed controls are reused within each context, and `useEmailEditor` callbacks `onChange` / `onBodyChange` receive independent data snapshots.

The editor and standalone export share one configuration. Use `builtins` to filter and order the library; replacing a built-in requires `override: true`. Declarations, runtime contexts, and persisted nodes all use `controls`. Documents use v4, with no old-data compatibility. The old `blocks`, `defaultFields`, `inlineEdit`, and `render()` integration is removed. See the [custom block API guide](./docs/custom-blocks.md) ([简体中文](./docs/custom-blocks.zh-CN.md)) and runnable `playground/plugins/` examples.

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
