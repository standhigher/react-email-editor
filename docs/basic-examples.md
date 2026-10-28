# Basic examples

[简体中文](./basic-examples.zh-CN.md) | [API reference](./api.md) | [Advanced examples](./advanced-examples.md)

Import `@standhigher/react-email-editor/styles.css` once from your global stylesheet entry. Each component example can live in its own `.tsx` file. Add `"use client"` with Next.js App Router.

## 1. Empty editor and JSON saving

```tsx
import { useState } from "react";
import { EmailEditor, useEmailEditor } from "@standhigher/react-email-editor";

export function EmailComposer() {
  const editor = useEmailEditor();
  const [savedJson, setSavedJson] = useState("");

  return (
    <>
      <EmailEditor editor={editor} height={720} />
      <button type="button" onClick={() => setSavedJson(editor.getJson())}>Save JSON</button>
      <output>{savedJson ? "Saved in page state" : "Not saved yet"}</output>
    </>
  );
}
```

This example saves to React state, which does not survive a page reload. Your app implements database or file persistence. getDocument() returns a detached JSON object, getJson() a formatted string, and getHtml() template HTML for a sending system.

## 2. Initial content, document switching and reset

```tsx
import {
  BLOCK_TYPES, createBlockNode, createEmailDocument,
  EmailEditor, useEmailEditor, type EmailDocument,
} from "@standhigher/react-email-editor";

const heading = createBlockNode(BLOCK_TYPES.heading);
if (heading) heading.controls.html = "<h1>Welcome to our newsletter</h1>";
const initialDocument = createEmailDocument(heading ? [heading] : []);

interface RestorableEditorProps {
  savedDocument: EmailDocument;
}

export function RestorableEditor({ savedDocument }: RestorableEditorProps) {
  const editor = useEmailEditor({ initialDocument });
  return (
    <>
      <EmailEditor editor={editor} height={640} />
      <button type="button" onClick={() => editor.setDocument(savedDocument)}>Load saved document</button>
      <button type="button" onClick={() => editor.reset()}>Restore initial content</button>
    </>
  );
}
```

Your app loads and validates savedDocument as a current v4 document. TypeScript types do not replace runtime JSON validation. initialDocument is read once; use setDocument() for later replacements. reset() restores the first initialized content, not the most recently loaded document.

## 3. Body styles, variables and preview export

```tsx
import { useState } from "react";
import {
  BLOCK_TYPES, createBlockNode, createEmailDocument, EmailEditor, useEmailEditor,
} from "@standhigher/react-email-editor";

const text = createBlockNode(BLOCK_TYPES.text);
if (text) text.controls.html = "<p>Hello, {{ customer_name }}, welcome to {{ store_name }}</p>";
const initialDocument = createEmailDocument(text ? [text] : []);

export function PersonalizedEditor() {
  const [html, setHtml] = useState("");
  const editor = useEmailEditor({
    initialDocument,
    body: { contentWidth: 640, contentPadding: "24px", backgroundColor: "#f7f7f7" },
    variables: [
      { name: "{{ store_name }}", description: "Store name", value: "Example Store" },
      { name: "{{ customer_name }}", value: "Sam" },
    ],
  });
  return (
    <>
      <EmailEditor editor={editor} height={720} />
      <button type="button" onClick={() => setHtml(editor.getHtml())}>Read template HTML</button>
      <button type="button" onClick={() => setHtml(editor.getRenderedHtml())}>Read preview HTML</button>
      <pre>{html}</pre>
    </>
  );
}
```

Template export preserves variables and dots listed tokens: {{ store_name }} becomes {{ .store_name }}. Preview export substitutes Example Store and other values. The editor includes desktop and mobile preview. This example displays source in a pre element; your app can download or upload it. See [validated saving](./advanced-examples.md#1-validate-before-async-saving) for export error handling.

## 4. Export without mounting the editor

```ts
import {
  BLOCK_TYPES, createBlockNode, createEmailDocument, documentToHtml,
} from "@standhigher/react-email-editor";

const block = createBlockNode(BLOCK_TYPES.html);
if (!block) throw new Error("HTML block is not registered");
block.controls.html = "<p>Hello, {{.customer.name}}</p>";
const document = createEmailDocument([block]);

export const templateHtml = documentToHtml(document);
export const previewHtml = documentToHtml(document, undefined, {
  resolveHtmlTemplates: true,
  templateData: { customer: { name: "Sam" } },
});
```

Each export contains one doctype, html, head and body. Custom blocks need a shared registry; see [advanced examples](./advanced-examples.md#3-business-block-with-multiple-rich-text-regions-and-a-list).
