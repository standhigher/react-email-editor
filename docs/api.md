# API reference

[简体中文](./api.zh-CN.md) | [Back to README](../README.md)

Import all APIs below from `@standhigher/react-email-editor`, and import `@standhigher/react-email-editor/styles.css` once. The published `dist/index.d.ts` includes English JSDoc for externally accessible fields, available through IDE hover information. See [basic examples](./basic-examples.md) and [advanced examples](./advanced-examples.md) for integration code.

## Editor component and Hooks

```tsx
import { EmailEditor, useEmailEditor } from "@standhigher/react-email-editor";
import "@standhigher/react-email-editor/styles.css";

export function EmailPage() {
  const editor = useEmailEditor();
  return <EmailEditor editor={editor} height={720} />;
}
```

### EmailEditor

| Parameter | Type | Meaning and default |
| --- | --- | --- |
| `editor` | `EmailEditorInstance` | Required instance returned by `useEmailEditor()`. |
| `height` | `number \| string` | Default `"100%"`; numbers use px; percentages require a parent with an explicit height. |

The component provides UI; the instance works independently of mounting it. Component refs, legacy configuration factories and document props are unsupported.

### useEmailEditor(options?) → EmailEditorInstance

All options are optional. Defaults to an empty document and all builtin blocks. Follow React Hook rules.

| Parameter | Type | Meaning |
| --- | --- | --- |
| `initialDocument` | `EmailDocument` | Read only during initialization; use `setDocument()` for later replacements. |
| `body` | `Partial<EmailBodySettings>` | Initial overrides; later changes merge into the current document. Omitted fields retain their values. |
| `config` | `EmailEditorConfig` | Result of `useEmailEditorConfig()`; updates preserve the document. |
| `variables` | `Variable[]` | Insertable preview variables, default `[]`; updates affect preview and export. |
| `onChange` | `(document) => void` | Detached snapshot after edits, replacements, resets and effective external body updates; no initialization call. |
| `onBodyChange` | `(body) => void` | Detached body snapshot after body edits inside the editor only. |

The instance reference is stable; instances are isolated. Configuration, variables, body and callbacks synchronize during React commit. Interrupted renders do not change the committed instance. Child layout effects can read updated options; subscriptions and external body `onChange` notifications run during layout. A component using only this Hook does not rerender on document edits.

### Instance methods

| Method | Arguments | Return and behavior |
| --- | --- | --- |
| `getData()` | None | `EmailEditorData`: `document`, formatted `json`, template `html`, and preview `renderedHtml`; rendering errors throw. |
| `getDocument()` | None | Detached `EmailDocument` snapshot to persist or modify before passing to `setDocument()`. |
| `getJson()` | None | Pretty-printed document JSON string. |
| `getHtml()` | None | Complete email HTML preserving templates. |
| `getRenderedHtml()` | None | Complete HTML using current variables and block `defaultData`. |
| `setDocument(document)` | v4 `EmailDocument` | `void`; copies and replaces the document, clears selection/focus/control state and calls `onChange`. |
| `reset()` | None | `void`; restores the initialized document, including initial body overrides, clears interaction state and calls `onChange`. |
| `validate()` | None | `ValidationIssue[]`; validates controls and missing plugins without rendering HTML. Rendering errors still need handling. |

Exports and callback arguments do not expose mutable internal state. Missing plugins, invalid controls and rendering failures throw during export; catch these in your application.

### useEmailEditorState(editor) → EmailEditorState

Requires an instance from `useEmailEditor()`. Returns cached `{ document }`, a deeply readonly snapshot, and notifies only on document changes. Use it in components that need reactive document display; update through instance methods.

## Shared configuration and plugins

### useEmailEditorConfig(options?) → EmailEditorConfig

| Parameter | Type | Default and meaning |
| --- | --- | --- |
| `plugins` | `BlockPlugin[]` | `[]`; plugins created by `defineBlock()`. |
| `builtins` | `false \| string[]` | All by default; false hides all builtins; arrays filter and order them. Hidden blocks still render existing nodes. Custom types are appended. |
| `pickImage` | `(context: ImagePickerContext) => Promise<string \| null>` | Resolve a URL; null cancels; throwing shows retry. Context contains `value/label/signal`. |
| `templateEngine` | `TemplateEngine` | Shared synchronous template adapter; defaults to the basic engine. |

Declare plugins at module scope, or use `useMemo` when they depend on application state. Stable option references reuse configuration; inline arrays do not recreate the editor or reset its document. The returned object contains:

| Member | Arguments and meaning |
| --- | --- |
| `definitions` | Readonly list of all registered plugins, including hidden builtins. |
| `library` | Readonly list of insertable blocks in display order. |
| `pickImage` | Registered resource picker. |
| `templateEngine` | Normalized engine shared by canvas, preview and resolved export. |
| `createBlock(type)` | Registered type string → detached default `EmailBlockNode`; unknown types throw. |
| `toHtml(document, options?)` | v4 document and `DocumentHtmlOptions` → complete HTML using this registry. |
| `validate(document)` | Document → `ValidationIssue[]`, without rendering HTML. |

Duplicate custom types, duplicate builtin entries and unknown builtin names throw. Replacing a builtin requires `override: true`.

### defineBlock(input) → BlockPlugin<Schema, Type>

```ts
import { defineBlock, EmailControls } from "@standhigher/react-email-editor";

export const coupon = defineBlock({
  type: "shop.coupon",
  title: "Coupon",
  controls: { code: EmailControls.text({ label: "Code", defaultValue: "SAVE20" }) },
  renderEmail: ({ controls, email }) => email.html`<p>${controls.code}</p>`,
});
```

| Input member | Meaning |
| --- | --- |
| `type` / `title` | Required nonempty unique type and library title. |
| `renderEmail(ctx)` | Required; returns inner HTML or `EmailMarkup`; ctx contains `block/controls/style/body/mode/email`. |
| `controls` | Map of names to EmailControls declarations, default `{}`; values and defaults are inferred. |
| `icon` / `description` | Optional ReactNode/HTML string icon and description. The icon defaults to the first character of the trimmed `title`, preserving case and displaying it as text. |
| `override` | Must be true to replace a builtin with the same type. |
| `containerStyles` | Spacing and appearance enabled by default; false disables all; `{ spacing?: boolean, appearance?: boolean }` controls each group. |
| `styleControls` | Additional styles; matching IDs replace default container controls. |
| `inspectorSections` | Ordered inspector sections and content/style controls. |
| `defaultStyle` | New-node styles, taking precedence over style control defaultValue. |
| `defaultData` | Template preview data for new nodes. |
| `Canvas` / `Inspector` | Optional React editing components receiving `PluginEditorProps<ControlValues<Schema>>`. |

`Schema` infers control values; `Type` preserves the type literal. Declarations are copied and frozen. Multiple inline rich-text regions require a Canvas. See the [custom block guide](./custom-blocks.md) for detailed behavior and inherited runtime members.

### EmailControls

Each factory takes an options object and returns `ControlDefinition<T>`. Common options apply only to relevant control kinds.

| Parameter | Meaning |
| --- | --- |
| `label` | Required display label. |
| `defaultValue` | Fills only persisted undefined; does not replace `""`, `0` or false. |
| `placeholder` / `rows` | Empty hint / multiline editor rows. |
| `options` | Allowed `ControlOption[]`, each with label and value. |
| `min` / `max` / `step` / `unit` | Numeric limits, increment and unit label; list min/max limit row counts. |
| `profile` / `inline` | Rich-text feature profile / direct editing on the default canvas. |
| `component` | Custom React control receiving `ControlComponentProps<T>`. |
| `validate(value)` | Normalized value → error string, or undefined when valid. |

| Factory | Value and fallback | Additional behavior |
| --- | --- | --- |
| `text/textarea/html/url/image/color/select` | string, default `""` | URL/image protocol validation; select options validation. |
| `richText` | HTML string, default `"<p></p>"` | profile text/heading/button, inline editing. |
| `number` | number, default 0 | Invalid input becomes NaN and fails validation. |
| `boolean` | boolean, default false | Only actual booleans are accepted; other values normalize to false. |
| `list` | Inferred row array, default [] | Required `controls: ControlSchema`; recursive parsing and validation. |
| `custom<T>` | Application-defined | Required defaultValue, pure `read(value: unknown): T`, and component; values must be JSON-persistable. |

### Plugin React components

`PluginEditorProps` provides `block/controls/style/body/variables` snapshots, selected, renderedHtml, select(), setControl(name, value), setControls(patch), and setStyle(id, value). Batch control updates shallow-merge once and notify once; replace nested objects entirely. renderedHtml contains resolved inner HTML in Canvas and is empty in Inspector.

| Component | Parameters |
| --- | --- |
| `ControlEditor` | Required control string, reusing its declaration, validation and resource adapter. Unknown names throw. |
| `EditableRichText` | Required control string referencing richText; optional profile and placeholder overrides. |

Use these components only within a plugin Canvas or Inspector.

### Style control factories

`createDimensionControls(overrides?)`, `createDecorationControls(overrides?)`, and `createTypographyControls(overrides?)` return independent StyleControlConfig objects keyed by capability name. Overrides are `Partial<Record<Name, Partial<StyleControlConfig>>>`, modifying labels, defaults, units and ranges. Add selected entries to plugin styleControls.

| Factory / name type | Capability names |
| --- | --- |
| `createDimensionControls` / `DimensionControlName` | padding/margin/height. |
| `createDecorationControls` / `DecorationControlName` | backgroundColor/borderWidth/borderStyle/borderColor/borderRadius. |
| `createTypographyControls` / `TypographyControlName` | fontFamily/fontSize/fontWeight/lineHeight/color/textAlign/paragraphSpacing/listSpacing/listIndent/linkColor/linkDecoration. |

## Document model and creation

| API | Arguments | Return and limitations |
| --- | --- | --- |
| `createEmailDocument(blocks = [])` | Ordered EmailBlockNode array | v4 document with full default body. Retains the supplied array; does not deep-clone it. |
| `resolveEmailBody(body?)` | `Partial<EmailBodySettings> \| null` | Complete normalized body; invalid values fall back; width is clamped to 320–900px. |
| `createBlockNode(type, definitions?)` | Type and optional registry, default builtins | Detached default node; unknown type returns null. Prefer config.createBlock for application plugins. |
| `getBlockDefinition(type, definitions?)` | Type and optional registry, default builtins | Matching runtime definition or undefined. Do not mutate frozen configuration definitions. |
| `generateId(prefix = "block")` | String ID prefix | String with a random suffix; applications must still ensure IDs are unique within a document. |

EmailDocument contains version/body/blocks/subject?; EmailBlockNode contains id/type/controls/style?/defaultData?. Only DOCUMENT_VERSION = 4 is supported; older documents are not migrated. JSON stores no components or render functions; register matching plugins again when loading it.

Canvas, preview and email HTML share body settings:

| EmailBodySettings member | Default and meaning |
| --- | --- |
| textColor | #000000; default text color. |
| backgroundColor | #ffffff; centered content background; outside remains white. |
| contentWidth | 600; maximum content width in px. |
| fontFamily | `""`; the inspector shows `Default`. Omitted or empty values render with Arial, Helvetica, sans-serif. |
| fontWeight | normal; also supports bold. |
| linkColor / linkDecoration | #005bd3 / underline. |
| contentPadding | 0px; CSS padding inside the border. |
| blockGap | 4px; spacing between adjacent blocks. |
| borderWidth / borderStyle / borderColor | 0px / solid / transparent. |

The body is centered without body radius or extra outer padding. Explicit rich-text formats override body defaults; internal defaults provide 16px font size and 1.5 line height. HTML blocks retain their internal links/lists. Block container styles live in dimension/decorations, inner elements in element, and custom blocks can enable typography. Only enabled styles are read.

## HTML rendering and templates

### documentToHtml(document, definitions?, options?) → string

The required document must use v4. Definitions default to DEFAULT_BLOCKS; for custom plugins pass config.definitions or use config.toHtml. Returns a complete email document with one doctype/html/head/body, tables and inline styles.

| DocumentHtmlOptions member | Default and meaning |
| --- | --- |
| resolveHtmlTemplates | false preserves templates; true resolves preview data. |
| variables | [] of exact inserted tokens and preview values. |
| templateData | Optional TemplateData for global objects and arrays. |
| templateEngine | Optional TemplateEngine; defaults to the basic engine. |

Data is shallow-merged at the top level: node defaultData > templateData > variables. Default export only adds missing dots to tokens exactly matching variables[].name, preserving spaces: `{{ store_name }}` → `{{ .store_name }}`. Unlisted Go templates stay unchanged. Empty variable descriptions are hidden; value is only preview data.

### Single-block and low-level helpers

| API | Arguments and defaults | Output |
| --- | --- | --- |
| `renderBlock(node, definitions = DEFAULT_BLOCKS, mode = "email", body = DEFAULT_EMAIL_BODY)` | Node, registry, RenderMode, full body | Plugin inner HTML without template resolution or dot normalization. |
| `renderBlockContent(node, definitions = DEFAULT_BLOCKS, mode = "email", options = {})` | Final argument is BlockRenderOptions | Inner HTML with dot normalization or template resolution. |
| `blockToHtml(node, definitions = DEFAULT_BLOCKS, mode = "email", options = {})` | Same | Email table fragment with container styles and spacing, not a complete document. |
| `buildRenderContext(node, mode, body = DEFAULT_EMAIL_BODY, definition = builtin lookup)` | Required mode; explicitly pass a custom definition | Detached normalized BlockRenderContext without rendering. |
| `variablesToTemplateData(variables)` | Required Variable[] | TemplateData keyed by token paths with value as preview data; ignores absent values. |
| `mergeTemplateData(variables, defaultData?)` | Variables and optional object | Shallow merge, defaultData wins; undefined if both contain no data. |
| `renderTemplatePreview(template, data?, options?)` | Template, data and TemplateEngineOptions | Synchronous preview with the selected engine. The basic engine preserves the entire input when it contains unsupported syntax. |
| `validateTemplate(template, options?)` | Template and TemplateEngineOptions | TemplateValidationIssue[]; undefined when validation is unavailable. Never invoked automatically. |

Both DocumentHtmlOptions and BlockRenderOptions accept templateEngine?: TemplateEngine. BlockRenderOptions contains resolveHtmlTemplate?: boolean (singular), templateData?: TemplateData, variables?: Variable[], body?: EmailBodySettings. Body defaults to DEFAULT_EMAIL_BODY; templates are preserved by default. Single-block preview uses templateData ?? node.defaultData and does not merge variables automatically; call mergeTemplateData explicitly when needed. The fourth argument must be an object; boolean or null throws TypeError.

config.toHtml() uses the configured engine unless options.templateEngine explicitly overrides it. Passing config.definitions alone does not carry engine configuration.

Mode selects the consumer: canvas for editing, email for control validation. It does not enable template resolution. Preview is a subset of Go templates, not a complete Go engine, HTML sanitizer or security sandbox.

### Custom template engines

See [Template preview and custom engines](https://github.com/standhigher/react-email-editor/blob/main/docs/template-engines.md) for supported syntax, adapter behavior and integration examples.

### email helpers in renderEmail

| Method | Arguments and output |
| --- | --- |
| ``email.html`…${value}…` `` | Escapes ordinary interpolations; composes EmailMarkup and arrays; preserves template tokens. |
| `email.raw(html)` | Raw HTML → EmailMarkup, without sanitization. |
| `email.richText(html)` | Rich-text HTML → EmailMarkup with body defaults. |
| `email.table(rows)` | EmailMarkup[][] → email table fragment. |
| `email.image({ src, alt?, width? })` | Required src; alt defaults empty, width to 100%; validates image protocols. |
| `email.button({ href, label })` | Required URL and plain-text label; empty/invalid URL produces no link. |
| `email.url(value, image = false)` | Allowed URL or empty string; true selects image protocol rules. |

Links allow http/https/mailto/tel, anchors or templates; images allow http/https/cid or templates. Validate protocols before escaping attributes; plugins returning plain strings handle escaping themselves.

## Base UI components

Use these in business inspectors. They provide UI without automatically binding document state. Callbacks receive values, except TextInput which uses native React events.

| Component | Parameters and defaults |
| --- | --- |
| TextInput | Native React input attributes and ref; type=text, allowing text/url/email/search/tel/password/number. |
| SelectControl | Required value/options/onChange(value); optional id, accessible label, emptyLabel, compact=false, disabled. |
| CheckboxControl | Required label/checked/onChange(checked); optional disabled, className, variant=checkbox or switch. |
| ColorControl | Required value/onChange(value); fallback=#000000, label=Color, resetTo=fallback. |
| RangeControl | Required value/onChange(value); optional id/label; min=0, max=100, step=1. |
| Button | Native React button attributes, type=button; variant=default/primary/solid/icon; optional tooltip. |
| RichText | Required initialHtml, variables, selected, toolbarId, toolbarCollapsed, onCommit(html), onSelect(); optional profile=text, placeholder, inherited. toolbarId must be unique. Prefer EditableRichText for plugin binding. |

Props and `RichText.inherited` fields are documented in the published `.d.ts`; use IDE hover information or go to definition. Native attributes follow React types; props interfaces are not added as named package exports.

## Constants and public types

| Export | Purpose |
| --- | --- |
| BLOCK_TYPES / BuiltinBlockType | heading/text/button/image/divider/spacer/html. |
| DEFAULT_BLOCKS | All builtin BlockPlugin definitions; custom registries use config.definitions. |
| DEFAULT_EMAIL_BODY / DOCUMENT_VERSION | Default body / document version 4. Do not mutate the default object. |
| FONT_FAMILIES | Readonly label/value font options. |
| STYLE_GROUPS / StyleGroup | general/dimension/typography/decorations identifiers and display names. |
| BORDER_STYLES / BorderStyle | none/solid/dashed/dotted. |
| FONT_WEIGHTS / FontWeight | normal/bold. |
| HORIZONTAL_ALIGNS / HorizontalAlign | left/center/right. |
| TEXT_ALIGNS / TextAlign | left/center/right/justify. |
| LINK_DECORATIONS / LinkDecoration | underline/none. |

Fields in editor, document, control, plugin, style, rendering and template types are documented through JSDoc in the published `.d.ts`. BlockDefinition is internal and not exported from the package entry; use BlockPlugin for public plugin definitions.

## Development and local linking

```bash
npm run typecheck
npm run lint
npm run build
node --test tests/*.test.mjs tests/*.test.ts
```

Use `npm run check` to run all four checks in order, or `npm test` after building to run only the Node tests. Node 24 LTS and npm 11.13.0 are the repository defaults. See the [release guide](./release.md) for package verification and publishing.

Build before tests that depend on dist. Internal TypeScript tests require Node 22.18+. The package ships ESM, declarations and flattened CSS. React/React DOM are peer dependencies; TipTap, dnd-kit, CodeMirror and Lezer are dependencies, externalized during builds rather than bundled.

Local consumers can run `npm install ../react-email-editor`. Run `npm run build` first and `npm run build:watch` to update dist. Both projects must share one React instance: Vite can use resolve.dedupe: ["react", "react-dom"]; Next.js can use transpilePackages: ["@standhigher/react-email-editor"], with Turbopack root covering the linked directory.
