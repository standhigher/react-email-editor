# Template preview and custom engines

English | [简体中文](https://github.com/standhigher/react-email-editor/blob/main/docs/template-engines.zh-CN.md)

Inject a synchronous `TemplateEngine` with `useEmailEditorConfig({ templateEngine })`. Canvas `renderedHtml`, editor preview, `getRenderedHtml()` and `getData().renderedHtml` share it. Rich-text editing regions keep editable source tokens.

```ts
interface TemplateEngine {
  render: (template: string, data: TemplateData) => string;
  validate?: (template: string) => TemplateValidationIssue[];
}

interface TemplateValidationIssue {
  message: string;
  offset?: number; // Zero-based character offset in the original template
}

interface TemplateEngineOptions {
  templateEngine?: TemplateEngine;
}
```

Wrap your own engine; this package does not bundle a complete Go engine. `renderTemplatePreview(template, data?, { templateEngine })` and `validateTemplate(template, { templateEngine })` use the same engine selection. Omitted engines use the exported `defaultTemplateEngine`. Replacing the engine refreshes rendering without resetting the document or invoking document-change callbacks.

- Each block's complete `renderEmail` HTML is sent to the selected engine after the same listed-token dot normalization used by sending HTML: exact `variables` tokens gain a leading dot while whitespace and trim markers are preserved. Other expressions pass through unchanged. Standalone preview passes the caller's template directly. No default parser runs first. Variables cannot span blocks because blocks execute separately.
- Preview data must be structured-cloneable. The engine receives a detached copy; mutating it does not change caller data or stored documents.
- The engine owns functions, pipelines, scope and escaping. Output is not escaped again. Match the backend's `text/template` or `html/template` behavior and escaping policy; the adapter alone does not guarantee equivalent engines.
- Rendering returns a string synchronously; Promises are unsupported. Existing `Error` objects propagate unchanged; other thrown values become an `Error` with a nonempty message and the original `cause`, for both rendering and validation. There is no fallback. The UI uses its existing error and Retry display; explicit API calls throw.
- Without data, the basic engine preserves source. An explicitly selected external engine still runs with `{}`.
- `validateTemplate()` only invokes the selected optional validator on explicit calls. `[]` means no issues were found; `undefined` means validation is unavailable. The basic engine has no Go validator. Rendering, `editor.validate()` and saving never invoke template validation automatically.
- `getHtml()`, `getJson()` and default `documentToHtml()` preserve templates. Existing listed-token dot normalization still applies. Engines only run when template resolution is requested.

The basic engine supports field paths, dot context, `$` / `$.field`, legacy bare paths, booleans/nil, decimal numbers, JSON-compatible double-quoted strings, basic `if/else if/else`, `range/else`, `with/else` and whitespace trimming. Arrays retain order; object keys are sorted. Missing fields produce empty strings and interpolated values are HTML-escaped.

Field names support Unicode letters, digits and underscores, starting with a letter or underscore. Conditions treat `null/undefined/false/0/empty strings`, empty arrays, plain objects without own enumerable keys and empty `Map/Set` values as false; nonempty collections and other objects such as `Date` are true. This only defines `Map/Set` truthiness, without adding field-access or iteration semantics.

Functions (including `eq/ne/and/or/not/len/index/printf/html`), pipelines, parentheses, local variables, template definitions/calls, comments and other full Go features require an external engine. Unsupported syntax or incomplete control structures preserve the **entire input for that render**, without partial evaluation. In the editor this preserves that block's HTML template.

## Switching between editing and preview

The editing canvas stays mounted, so switching modes preserves rich-text editors and HTML block iframes. Editing and preview retain their own scroll positions. While preview is requested, the canvas is excluded from focus, keyboard and drag interactions, and rich-text toolbars are hidden.

Changes to the document, configuration, variables or device width schedule a complete email preview after a 400ms debounce, using an idle callback with a maximum wait of 2 seconds during continuous changes. Browsers without `requestIdleCallback` use a timer. Clicking Preview or Retry bypasses the wait and prepares the latest revision; subsequent changes in preview mode still use the same debounce. HTML generation still runs synchronously on the main thread; custom engines and `renderEmail` should be pure and allow repeated background calls.

Two iframe buffers keep loading and measurement in the standby layer. A buffer becomes visible only after it has loaded and its height has been measured. Until the latest revision is ready, the current view remains visible with a preparation status. Stale revisions cannot replace newer content. Identical HTML and width reuse a ready or loading buffer to avoid unnecessary reloads. Generation, load or measurement failures, including a 15-second load/measurement timeout, show an error and Retry while retaining any existing preview. Retry forces a new load. Preview iframes use `sandbox="allow-same-origin"` to block scripts and event handlers while allowing the host to measure height; this is not complete HTML sanitization and does not rewrite exported HTML. This cache only serves the UI; explicit export APIs synchronously generate from the latest document at call time.

## Integration example

Wrap your template library as TemplateEngine and pass the same adapter to editing and standalone preview. The caller provides templateEngine in this example:

```tsx
import {
  EmailEditor, useEmailEditor, useEmailEditorConfig,
  renderTemplatePreview, validateTemplate,
  type TemplateEngine, type TemplateData,
} from "@standhigher/react-email-editor";

interface EmailPageProps {
  templateEngine: TemplateEngine;
}

export function EmailPage({ templateEngine }: EmailPageProps) {
  const config = useEmailEditorConfig({ templateEngine });
  const editor = useEmailEditor({ config });
  return <EmailEditor editor={editor} height={720} />;
}

export function previewHtml(
  template: string,
  data: TemplateData,
  templateEngine: TemplateEngine,
) {
  return renderTemplatePreview(template, data, { templateEngine });
}

export function inspectTemplate(template: string, templateEngine: TemplateEngine) {
  return validateTemplate(template, { templateEngine });
}
```

validateTemplate() returns undefined when validation is unavailable and [] when no issues are found. It never blocks saving automatically. Rendering is per block and synchronous; the engine owns escaping. The basic engine preserves the entire input when it contains unsupported functions or pipelines.
