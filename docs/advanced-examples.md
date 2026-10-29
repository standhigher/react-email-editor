# Advanced examples

[简体中文](./advanced-examples.zh-CN.md) | [API reference](./api.md) | [Basic examples](./basic-examples.md)

Save each named code block in its own file and import package CSS once. Business requests are injected through props; these examples assume no backend routes.

## 1. Validate before async saving

Validation can expose control issues early; export still needs to catch plugin rendering errors. Implement saveDocument(data) in your app, returning a Promise. Failures remain retryable.

```tsx
// ValidatedEditor.tsx
import { useState } from "react";
import {
  EmailEditor, useEmailEditor, type EmailEditorData,
} from "@standhigher/react-email-editor";

interface ValidatedEditorProps {
  saveDocument: (data: EmailEditorData) => Promise<void>;
}

export function ValidatedEditor({ saveDocument }: ValidatedEditorProps) {
  const editor = useEmailEditor();
  const [status, setStatus] = useState("Not saved yet");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const issues = editor.validate();
      if (issues.length) {
        setStatus(issues.map((issue) => `${issue.controlPath}: ${issue.message}`).join("; "));
        return;
      }
      const data = editor.getData();
      await saveDocument(data);
      setStatus("Snapshot saved; edits made during saving need another save");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Save failed; retry");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <EmailEditor editor={editor} height={720} />
      <button type="button" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save / retry"}</button>
      <output aria-live="polite">{status}</output>
    </>
  );
}
```

getData() generates both template and preview HTML. For JSON-only drafts use getDocument(), which avoids blocking persistence on invalid controls or rendering failures. Editing remains enabled during saving; the result corresponds to the detached snapshot taken on click.

## 2. Share configuration between isolated instances and subscribe locally

```tsx
// DocumentSummary.tsx
import { useEmailEditorState, type EmailEditorInstance } from "@standhigher/react-email-editor";

interface DocumentSummaryProps {
  editor: EmailEditorInstance;
}

export function DocumentSummary({ editor }: DocumentSummaryProps) {
  const { document } = useEmailEditorState(editor);
  return <output>{document.blocks.length} blocks</output>;
}
```

```tsx
// ComparisonEditors.tsx
import { EmailEditor, useEmailEditor, useEmailEditorConfig } from "@standhigher/react-email-editor";
import { DocumentSummary } from "./DocumentSummary";

const builtins = ["heading", "text", "button", "image"];

export function ComparisonEditors() {
  const config = useEmailEditorConfig({ builtins });
  const left = useEmailEditor({ config, body: { contentWidth: 640 } });
  const right = useEmailEditor({ config, body: { contentWidth: 480 } });
  return (
    <>
      <DocumentSummary editor={left} /><EmailEditor editor={left} height={600} />
      <DocumentSummary editor={right} /><EmailEditor editor={right} height={600} />
    </>
  );
}
```

Documents, selection and reset are isolated. Only summary components subscribe to document changes. Shared configuration describes block capabilities without sharing mutable documents.

## 3. Business block with multiple rich-text regions and a list

This recommendation block combines two rich-text regions and a product list. Controls are the source of truth for types and defaults. Canvas defines editing UI; renderEmail defines email HTML.

```ts
// recommendation-controls.ts
import { EmailControls, type ControlValues } from "@standhigher/react-email-editor";

export const recommendationControls = {
  intro: EmailControls.richText({ label: "Introduction", defaultValue: "<p>This week's picks</p>" }),
  footer: EmailControls.richText({ label: "Footer", defaultValue: "<p>Thanks for subscribing</p>" }),
  products: EmailControls.list({
    label: "Products", min: 1, max: 8,
    controls: {
      name: EmailControls.text({ label: "Name", validate: (value) => value.trim() ? undefined : "Enter a name" }),
      image: EmailControls.image({ label: "Image" }),
      url: EmailControls.url({ label: "Link" }),
    },
    defaultValue: [{ name: "Example product", image: "", url: "https://example.com/product" }],
  }),
};
export type RecommendationValues = ControlValues<typeof recommendationControls>;
```

```tsx
// RecommendationCanvas.tsx
import { EditableRichText, type PluginEditorProps } from "@standhigher/react-email-editor";
import type { RecommendationValues } from "./recommendation-controls";

export function RecommendationCanvas({ controls }: PluginEditorProps<RecommendationValues>) {
  return (
    <div>
      <EditableRichText control="intro" />
      <ul>{controls.products.map((product, index) => <li key={index}>{product.name}</li>)}</ul>
      <EditableRichText control="footer" />
    </div>
  );
}
```

```tsx
// RecommendationInspector.tsx
import { ControlEditor } from "@standhigher/react-email-editor";

export function RecommendationInspector() {
  return <ControlEditor control="products" />;
}
```

```ts
// recommendation.ts
import { defineBlock } from "@standhigher/react-email-editor";
import { recommendationControls } from "./recommendation-controls";
import { RecommendationCanvas } from "./RecommendationCanvas";
import { RecommendationInspector } from "./RecommendationInspector";

export const recommendation = defineBlock({
  type: "shop.recommendation",
  title: "Recommendations",
  controls: recommendationControls,
  Canvas: RecommendationCanvas,
  Inspector: RecommendationInspector,
  defaultStyle: { dimension: { padding: "16px" } },
  renderEmail: ({ controls, email }) => email.html`
    ${email.richText(controls.intro)}
    ${controls.products.map((product) => email.html`
      <p><strong>${product.name}</strong></p>
      ${product.image ? email.image({ src: product.image, alt: product.name }) : email.raw("")}
      ${email.button({ href: product.url, label: "View product" })}
    `)}
    ${email.richText(controls.footer)}
  `,
});
```

```tsx
// RecommendationEditor.tsx
import { useMemo, useState } from "react";
import {
  createEmailDocument, EmailEditor, useEmailEditor, useEmailEditorConfig,
} from "@standhigher/react-email-editor";
import { recommendation } from "./recommendation";

const plugins = [recommendation];

export function RecommendationEditor() {
  const config = useEmailEditorConfig({ plugins });
  const initialDocument = useMemo(
    () => createEmailDocument([config.createBlock(recommendation.type)]),
    [config],
  );
  const editor = useEmailEditor({ config, initialDocument });
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");

  function exportHtml() {
    try {
      // The same configuration works for export without mounting the UI.
      setHtml(config.toHtml(editor.getDocument()));
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Export failed");
    }
  }
  return (
    <>
      <EmailEditor editor={editor} height={720} />
      <button type="button" onClick={exportHtml}>Export</button>
      {error ? <p role="alert">{error}</p> : null}
      <pre>{html}</pre>
    </>
  );
}
```

config.toHtml() and the editor share the same registry; loading saved JSON requires the plugin again. ControlEditor provides list additions, deletions and child editing; Canvas only displays product names. Business pickers can use PluginEditorProps.setControls(patch) to fill related values in one update; submit a complete array for nested lists.

## 4. Integrate an existing image resource picker

```tsx
// ResourceEditor.tsx
import { useCallback } from "react";
import {
  EmailEditor, useEmailEditor, useEmailEditorConfig, type ImagePickerContext,
} from "@standhigher/react-email-editor";

interface ResourceEditorProps {
  openLibrary: (request: { currentUrl: string; signal: AbortSignal }) => Promise<string | null>;
}

export function ResourceEditor({ openLibrary }: ResourceEditorProps) {
  const pickImage = useCallback(
    ({ value, signal }: ImagePickerContext) => openLibrary({ currentUrl: value, signal }),
    [openLibrary],
  );
  const config = useEmailEditorConfig({ pickImage });
  const editor = useEmailEditor({ config });
  return <EmailEditor editor={editor} height={720} />;
}
```

Your resource library implements its dialog, search, empty results, uploads and cancellation. Pass signal to requests. Return an allowed URL, null to cancel, or throw to show retry. The editor provides loading/error/retry for image requests, ignores stale results and cancels on unmount.

## 5. Structured template data and single-block preview

```ts
// template-preview.ts
import {
  BLOCK_TYPES, blockToHtml, createBlockNode, createEmailDocument, documentToHtml,
  mergeTemplateData, type Variable,
} from "@standhigher/react-email-editor";

const block = createBlockNode(BLOCK_TYPES.html);
if (!block) throw new Error("HTML block is not registered");
block.controls.html = `<p>Hello, {{.customer}}</p>
  {{range .products}}<p>{{.name}}</p>{{end}}`;
const variables: Variable[] = [{ name: "{{.customer}}", value: "Sam" }];
const templateData = { products: [{ name: "Tea" }, { name: "Coffee" }] };
const document = createEmailDocument([block]);

export const template = documentToHtml(document, undefined, { variables });
export const preview = documentToHtml(document, undefined, {
  variables, templateData, resolveHtmlTemplates: true,
});
export const fragment = blockToHtml(block, undefined, "email", {
  resolveHtmlTemplate: true,
  templateData: mergeTemplateData(variables, { ...templateData, ...block.defaultData }),
});
```

Complete documents shallow-merge variables → templateData → block.defaultData, with later data winning. Preview and sending apply listed-variable dot normalization while preserving the stored template source. Single-block rendering does not merge variables automatically; this example merges explicitly and uses the singular resolveHtmlTemplate option. Your application chooses the actual sending engine. The default preview supports basic syntax; inject templateEngine for complete Go semantics.

## Custom template engine and standalone preview

See [Template preview and custom engines](https://github.com/standhigher/react-email-editor/blob/main/docs/template-engines.md) for supported syntax, adapter behavior and integration examples.
