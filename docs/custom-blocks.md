# Custom block API

English | [简体中文](./custom-blocks.zh-CN.md) · [Back to README](../README.md)

This guide follows “example → parameters → return values → behavior” for the three extension entry points:

| Entry point | Responsibility |
| --- | --- |
| `EmailControls` | Declare controls, value types, defaults, validation, and editing components. |
| `defineBlock()` | Combine controls, styles, editing UI, and email output into a block plugin. |
| `useEmailEditorConfig()` | Register plugins and provide block creation, document validation, and HTML export. |

Built-in blocks use the same mechanism. Configuration holds no document or selection state and can be shared by multiple editors. `EmailDocument` is the source of truth for document state; the React editing session handles selection, dragging, and updates.

## Complete integration example

```tsx
import { useState } from "react";
import {
  EmailEditor,
  EmailControls,
  createEmailDocument,
  useEmailEditorConfig,
  useEmailEditor,
  defineBlock,
} from "@standhigher/react-email-editor";
import "@standhigher/react-email-editor/styles.css";

const coupon = defineBlock({
  type: "my-app.coupon",
  title: "Coupon",
  controls: {
    code: EmailControls.text({ label: "Code", defaultValue: "SAVE20" }),
    message: EmailControls.richText({
      label: "Message",
      defaultValue: "<p>Thanks for your support.</p>",
    }),
  },
  renderEmail: ({ controls, email }) => email.html`
    ${email.richText(controls.message)}
    <p>Coupon code: ${controls.code}</p>
  `,
});

export function EmailPage() {
  const config = useEmailEditorConfig({ plugins: [coupon] });
  const [initialDocument] = useState(() => createEmailDocument([config.createBlock(coupon.type)]));
  const editor = useEmailEditor({ config, initialDocument });
  return <EmailEditor editor={editor} />;
}
```

At declaration time, `controls` contains control definitions. In nodes, Canvas/Inspector props, and render contexts, it contains their values:

```ts
// defineBlock declaration
controls: { code: EmailControls.text({ label: "Code", defaultValue: "SAVE20" }) }

// Node data returned by config.createBlock()
{ id: "…", type: "my-app.coupon", controls: { code: "SAVE20" }, style: { /* … */ } }

// Read the current value in renderEmail or Canvas / Inspector
controls.code // string
```

## 1. useEmailEditorConfig(options?)

### Example

```tsx
function useCouponConfig() {
  return useEmailEditorConfig({
    plugins: [coupon],
    builtins: ["heading", "text", "image", "button"],
    pickImage: async ({ value, label, signal }) => {
      // Open your application's asset picker; initialize with value,
      // use label as its title, and cancel requests with signal.
      // Return an image URL, or null when canceled.
      return null;
    },
  });
}
```

Call this Hook at the top level of a React component or custom Hook. Stable `plugins`, `builtins`, and `pickImage` references retain configuration identity. Updates preserve instance documents. Removing a plugin used by a document preserves its data and produces a missing-plugin validation issue. Configuration methods `toHtml(document)` and `validate(document)` accept any document; instance methods `getHtml()` and `validate()` use the current document.

### Parameters: UseEmailEditorConfigOptions

All options are optional.

| Option | Type | Default and purpose |
| --- | --- | --- |
| `plugins` | `BlockPlugin[]` | Defaults to `[]`. Registers custom blocks; duplicate types throw. |
| `builtins` | `false \| string[]` | Omit to show all built-ins; use an array to filter and order them, or false to hide all. |
| `pickImage` | `(context: ImagePickerContext) => Promise<string \| null>` | Image asset picker adapter. Manual URL input remains available without it. |

`builtins` only affects library visibility. Hidden built-ins can still be created, loaded, and rendered. The array accepts built-in types only and rejects duplicates. Custom types are appended in plugins order. A plugin overriding a built-in follows that built-in's position and visibility rules. Overrides require `override: true` on the plugin.

Built-in types are heading, text, button, image, divider, spacer, and html, available through `BLOCK_TYPES`.

### Return value: EmailEditorConfig

| Property / method | Type | Meaning and purpose |
| --- | --- | --- |
| `definitions` | `readonly BlockPlugin[]` | All registered definitions, including hidden built-ins, used for loading, creation, validation, and rendering. |
| `library` | `readonly BlockPlugin[]` | Visible library entries after filtering, ordering, and merging plugins. |
| `pickImage` | Same as the optional input | Registered image picker adapter. |
| `createBlock(type)` | `(type: string) => EmailBlockNode` | Creates an independent node and ID, cloning default values, styles, and sample data. Unknown types throw. |
| `toHtml(document, options?)` | `(...) => string` | Synchronously generates a complete email document. Validation and rendering failures throw. |
| `validate(document)` | `(...) => ValidationIssue[]` | Collects control issues and missing plugins without invoking renderers or changing the document. |

`createBlock()` returns a node; it does not insert it into a mounted editor. Configuration and plain declaration metadata are copied and frozen. Functions, React elements, and non-plain objects retain identity; business state captured by closures is not isolated. Recreate plugins and configuration to change declarations.

### toHtml options: DocumentHtmlOptions

| Option | Type | Purpose |
| --- | --- | --- |
| `resolveHtmlTemplates` | `boolean` | Defaults to preserving templates; true resolves supported Go template expressions using preview data. |
| `variables` | `Variable[]` | Original variable tokens, optional descriptions, and preview values. Export adds dots only to exactly matching listed tokens. |
| `templateData` | `Record<string, unknown>` | Data for this template preview. |

Preview precedence is node defaultData > templateData > variables, merged by top-level keys. Normal export preserves templates. For example, a listed `{{ store_name }}` becomes `{{ .store_name }}` while preserving whitespace; expressions outside the list remain unchanged.

### validate result items: ValidationIssue

| Property | Type | Purpose |
| --- | --- | --- |
| `blockId` | `string` | ID of the affected block. |
| `blockType` | `string` | Type of the affected block. |
| `controlPath` | `string` | Control path, such as terms[0].text; empty when the plugin is missing. |
| `message` | `string` | Reason validation failed. |

Unsupported document versions throw directly. validate() does not check renderer execution; export can still fail due to a rendering error.

## 2. defineBlock(options)

### Example: controls, container styles, and inspector sections

```ts
const banner = defineBlock({
  type: "my-app.banner",
  title: "Banner",
  description: "A notice with a link",
  controls: {
    title: EmailControls.text({ label: "Title", defaultValue: "Limited offer" }),
    href: EmailControls.url({ label: "Link" }),
  },
  containerStyles: { spacing: true, appearance: true },
  defaultStyle: { dimension: { padding: "16px" } },
  inspectorSections: [
    { title: "Content", controlNames: ["title", "href"] },
    { title: "Spacing", styleIds: ["dimension.padding", "dimension.margin"] },
  ],
  renderEmail: ({ controls, email }) => email.button({
    href: controls.href,
    label: controls.title,
  }),
});
```

### Parameters: BlockPluginOptions

| Property | Required | Meaning and purpose |
| --- | --- | --- |
| `type` | Yes | Stable unique type. Use an application namespace, such as my-app.banner. Do not casually change persisted types. |
| `title` | Yes | Library and inspector name. type/title cannot be blank. |
| `icon` | No | A string or ReactNode icon. |
| `description` | No | Block description. |
| `override` | No | Defaults to false; allows replacing a built-in with the same type during registration. |
| `controls` | No | ControlSchema object defining content controls in declaration order, with inferred value types. Defaults to an empty object. |
| `containerStyles` | No | Enables spacing and appearance by default. false disables both; `{ spacing?: boolean; appearance?: boolean }` controls them separately. |
| `styleControls` | No | StyleControlConfig[] adding or replacing style controls with matching IDs. |
| `inspectorSections` | No | BlockInspectorSection[] ordering content and style controls. Omit for automatic grouping. |
| `defaultStyle` | No | EmailBlockStyle providing defaults for enabled styles only; takes precedence over a style control's defaultValue. |
| `defaultData` | No | Template preview sample data, cloned into newly created nodes. Separate from control defaults. |
| `Canvas` | No | Custom React canvas. Otherwise uses the default HTML canvas or a single rich-text editing region. |
| `Inspector` | No | Custom React content inspector. Replaces default content editing while keeping style panels. |
| `renderEmail` | Yes | Synchronous function returning an HTML string or EmailMarkup containing the block's inner content. |

Default container controls include padding, margin, background color, border color/width/style, and corner radius. They exclude fixed height and typography. `containerStyles: false` disables automatic controls; explicitly supplied styleControls can still enable individual capabilities.

When inspectorSections is specified, only listed default content and style controls appear. Omitted controls remain in the schema but are not appended automatically.

### Return value: BlockPlugin

Pass the result directly to plugins rather than constructing a runtime definition manually.

| Returned property | Purpose |
| --- | --- |
| `type/title/icon/description/override` | Identification, display, and registration metadata. |
| `schema` | Frozen control declaration object for lookup and type inference. |
| `controls` | Normalized control definition array, with a name on each entry. These are definitions; a node's controls contains values. |
| `readControls(source)` | Normalizes values, fills missing defaults, and preserves unknown business properties. |
| `styleControls/inspectorSections` | Merged style capabilities and inspector layout. |
| `defaultStyle/defaultData` | Default styles and template sample data. |
| `inlineControl` | Rich-text control edited by the default canvas; unused with a custom Canvas. |
| `canvas/inspector` | Adapted React components corresponding to the capitalized Canvas/Inspector declaration options. |
| `renderEmail(context)` | Wrapped renderer performing control validation in email mode and converting output to a string. |

### renderEmail context: PluginRenderContext

| Property | Meaning and purpose |
| --- | --- |
| `block` | Complete node snapshot, including ID, type, controls, styles, and template sample data. |
| `controls` | Normalized values inferred from the control declarations. |
| `style` | Enabled block styles. |
| `body` | Email body layout, appearance, and default typography. |
| `mode` | canvas or email. Preview resolves templates after email rendering; it is not a third mode. |
| `email` | Email HTML helpers described below. |

Render synchronously without side effects. Fetch business data in the application or editing components, not during export. Return inner HTML only: shared renderers provide outer tables, container spacing, and the full document. Custom Canvas DOM is not exported; preview and export always use renderEmail().

## 3. EmailControls

### Example: text, options, and lists

```ts
const productControls = {
  name: EmailControls.text({ label: "Name", defaultValue: "Mug" }),
  price: EmailControls.number({ label: "Price", min: 0, step: 0.01 }),
  visible: EmailControls.boolean({ label: "Visible", defaultValue: true }),
  variant: EmailControls.select({
    label: "Variant",
    defaultValue: "small",
    options: [{ label: "Small", value: "small" }, { label: "Large", value: "large" }],
  }),
  terms: EmailControls.list({
    label: "Terms",
    controls: {
      text: EmailControls.text({ label: "Term", defaultValue: "One use per customer" }),
    },
  }),
};
```

EmailControls is a collection of control factories using camelCase method names. Each call creates a declaration combining editing UI, value type, defaults, and validation.

### Methods

Each method takes an options object and returns ControlDefinition<T>.

| Method | Value type | Default when omitted | Default editing UI |
| --- | --- | --- | --- |
| `text(options)` | string | `""` | Single-line input with variable insertion. |
| `textarea(options)` | string | `""` | Multiline input with variable insertion. |
| `richText(options)` | string | `"<p></p>"` | Rich-text HTML inheriting body typography. |
| `html(options)` | string | `""` | HTML source editor. |
| `url(options)` | string | `""` | URL input, protocol validation, variable insertion. |
| `image(options)` | string | `""` | Image URL, preview, and optional asset picker. |
| `number(options)` | number | 0 | Numeric input. |
| `color(options)` | string | `""` | Color picker. |
| `select(options)` | string | `""` | Select menu with a clearable empty option, labeled by placeholder or None by default. |
| `boolean(options)` | boolean | false | Checkbox. |
| `list(options)` | Array of child value objects | [] | Add, remove, move up/down, and nest items. Requires controls. |
| `custom(options)` | read() return type | Explicitly required | Custom React component. Requires defaultValue/read/component. |

### Parameters: ControlOptions

| Option | Type | Purpose |
| --- | --- | --- |
| `label` | string, required | Control label. |
| `defaultValue` | T | Default for new nodes and missing values. Mutable data is independently cloned. |
| `placeholder` | string | Placeholder for controls that support it. |
| `options` | `{ label: string; value: string }[]` | Select choices. |
| `rows` | number | Textarea/HTML editor row count; textarea defaults to 4. |
| `min/max` | number | Numeric range or list item count. |
| `step` | number | Numeric input step, not a separate validation constraint. |
| `unit` | string | Unit hint in the input label; does not change values or append CSS units. |
| `profile` | `"text" \| "heading" \| "button"` | Rich-text editing capabilities. |
| `inline` | boolean | Edit richText directly in the default canvas. Use Canvas for composite layouts. |
| `component` | `ComponentType<ControlComponentProps<T>>` | Replaces this control's default React editor. |
| `validate` | `(value: T) => string \| undefined` | Receives a normalized value; return a nonempty error or undefined. |

list additionally requires `controls: ControlSchema` for each row. custom requires a pure `read: (value: unknown) => T` to parse unknown persisted values. Values must support JSON persistence; do not store React nodes, functions, or editor instances.

### Defaults, reading, and validation

- Defaults apply only to undefined, preserving empty strings, 0, and false. String controls convert null to an empty string. Invalid numbers become NaN and fail validation. Boolean controls accept actual booleans and normalize other values to false. Non-array lists become [].
- Values are read once per context and reused by rendering, components, and validation. read() should be pure. Undeclared business IDs and metadata in list rows are preserved.
- Numbers must be finite and within min/max. Nonempty selects must match options. URLs/images validate protocols. List min/max limits item count; child controls are validated recursively.
- Empty URLs and selects are optional unless a business validate() requires them. Inspectors show errors; drafts can retain invalid values, but email export refuses them. Preview also validates through email rendering.

### Return value: ControlDefinition

| Property | Purpose |
| --- | --- |
| `kind` | Control type, such as text, richText, or list. |
| `defaultValue` | Resolved default. |
| `read(value)` | Normalizes an unknown value into the control's value type. |
| `validateValue(value)` | Runs built-in and business constraints on normalized values without reading again. |
| `renderControl(props)` | Optional custom rendering entry generated from component. |
| `itemControls` | Optional child schema for list controls. |
| Other metadata | Retains label, placeholder, options, profile, and related configuration. |

### Example: a custom value type

```tsx
import { TextInput, type ControlComponentProps } from "@standhigher/react-email-editor";

function TagInput({ value, onChange, label }: ControlComponentProps<string[]>) {
  return <label>{label}<TextInput value={value.join(", ")} onChange={(event) => onChange(event.target.value.split(",").map((tag) => tag.trim()))} /></label>;
}

const tags = EmailControls.custom<string[]>({
  label: "Tags",
  defaultValue: [],
  read: (value) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [],
  component: TagInput,
});
```

## 4. Custom React editing components

### A single control: component

```tsx
import { TextInput, type ControlComponentProps } from "@standhigher/react-email-editor";

function CouponInput({ value, onChange, label }: ControlComponentProps<string>) {
  return <label>{label}<TextInput value={value} onChange={(event) => onChange(event.target.value.toUpperCase())} /></label>;
}

const code = EmailControls.text({ label: "Code", component: CouponInput });
```

| Prop | Purpose |
| --- | --- |
| `value` | Current control value. |
| `onChange(value)` | Submit a new value. |
| `label` | Control label. |
| `body` | Body settings. |
| `variables` | Available template variables. |

Components receive independent value, body, and variables snapshots and can use hooks. Business async interactions handle loading, error/retry, empty states, and unmount cancellation. The shared image picker already handles these states: null cancels, thrown errors allow retry, and unmount aborts signal and ignores stale results. Async list updates merge into the latest data by stable row identity, preserving intervening edits and reordering; deleted rows no longer receive results.

### Canvas / Inspector

```tsx
import {
  ControlEditor, EditableRichText,
  type ControlValues, type PluginEditorProps,
} from "@standhigher/react-email-editor";

const cardControls = {
  title: EmailControls.text({ label: "Title", defaultValue: "New arrivals" }),
  description: EmailControls.richText({ label: "Description" }),
  footer: EmailControls.richText({ label: "Footer" }),
};
type CardValues = ControlValues<typeof cardControls>;

function CardCanvas({ controls }: PluginEditorProps<CardValues>) {
  return <div>
    <strong>{controls.title}</strong>
    <EditableRichText control="description" />
    <EditableRichText control="footer" />
  </div>;
}

function CardInspector() {
  return <>
    <ControlEditor control="title" />
    <ControlEditor control="description" />
    <ControlEditor control="footer" />
  </>;
}

const card = defineBlock({
  type: "my-app.card", title: "Card", controls: cardControls,
  Canvas: CardCanvas, Inspector: CardInspector,
  renderEmail: ({ controls, email }) => email.html`
    <h2>${controls.title}</h2>
    ${email.richText(controls.description)}
    ${email.richText(controls.footer)}
  `,
});
```

Canvas/Inspector receive PluginEditorProps<ControlValues<Schema>>:

| Prop | Meaning and purpose |
| --- | --- |
| `block/controls/style/body` | Snapshots of the node, normalized values, block styles, and body. Submit changes through update methods. |
| `variables` | Template variables. |
| `selected` | Whether the block is selected; true in Inspector. |
| `renderedHtml` | Resolved inner HTML in Canvas; an empty string in Inspector. |
| `select()` | Requests block selection; unnecessary in Inspector. |
| `setControl(name, value)` | Type-safe update to one value. |
| `setControls(patch)` | Shallow-merges multiple values with one document update and one onChange. Replace nested objects in full. |
| `setStyle(id, value)` | Updates a style path, such as setStyle("dimension.padding", "12px"). |

ControlEditor takes only a required `control: string` and reuses declared editing UI, validation, and resource adapters. EditableRichText takes a required control and optional profile/placeholder. It connects value updates, selection, toolbars, variables, and body typography, and requires a richText control. Both are used inside a block Canvas/Inspector only.

A single richText({ inline: true }) replaces the entire default canvas with that editing region and removes the control from the default inspector. It does not insert an editor into part of the renderEmail layout. Multiple inline regions require Canvas or definition throws. With Canvas, that component composes all editing regions.

## 5. Style controls and inspector sections

### Example

```ts
import { createDimensionControls } from "@standhigher/react-email-editor";

const spacing = createDimensionControls({ padding: { defaultValue: "12px" } });
// Pass these options to defineBlock:
const layoutBlock = defineBlock({
  type: "my-app.layout",
  title: "Layout",
  controls: { title: EmailControls.text({ label: "Title" }) },
  containerStyles: false,
  styleControls: [spacing.padding, spacing.margin],
  inspectorSections: [{
    title: "Content and spacing",
    controlNames: ["title"],
    styleIds: ["dimension.padding", "dimension.margin"],
  }],
  renderEmail: ({ controls, email }) => email.html`<p>${controls.title}</p>`,
});
```

createDimensionControls(), createDecorationControls(), and createTypographyControls() return style configuration objects indexed by capability names. Pass overrides keyed by name, then select entries for styleControls.

| StyleControlConfig property | Purpose |
| --- | --- |
| `id` | Style path, such as dimension.padding, typography.fontSize, or element.width. |
| `group` | general/dimension/typography/decorations for default inspector grouping. |
| `label` | Control label. |
| `control` | text/color/alignment/select/number/range/spacing/corners. |
| `options` | Select choices. |
| `unit/units` | Unit suffix or available units; use email-compatible CSS units. |
| `min/max/step` | Numeric and range parameters. |
| `defaultValue` | Default style string, below defaultStyle in precedence. |
| `placeholder` | Input hint. |

id/group/label/control are required; other properties are optional.

| BlockInspectorSection property | Purpose |
| --- | --- |
| `title` | Required section title. |
| `controlNames` | Content control names in display order. |
| `styleIds` | Style IDs in display order. |
| `advancedStyleIds` | Style IDs placed in a collapsed section. |

Body settings live in body; container styles in style.dimension/decorations; button/image element styles in style.element; explicit rich-text formatting in HTML strings inside controls. Only enabled block styles are read. Apply custom element styles explicitly in renderEmail.

## 6. Email rendering helpers: email

```ts
renderEmail: ({ controls, email }) => email.html`
  <p>${controls.title}</p>
  ${email.richText(controls.description)}
  ${email.button({ href: controls.url, label: "Learn more" })}
`
```

| Helper | Purpose |
| --- | --- |
| `email.html` tagged template | Escapes ordinary interpolations, supports EmailMarkup fragments and arrays, and preserves Go template tokens. |
| `email.raw(html)` | Explicit raw HTML insertion without sanitization. |
| `email.richText(html)` | Preserves explicit formatting and adds body defaults for paragraphs, lists, and links. |
| `email.table(rows)` | Generates email tables from a two-dimensional EmailMarkup array. |
| `email.image({ src, alt?, width? })` | Validates the image protocol and normalizes width, defaulting to 100%. |
| `email.button({ href, label })` | Email table button; validates protocol and omits links for empty or invalid addresses. |
| `email.url(value, image?)` | Returns allowed URLs or an empty string. image defaults to false. |

Links allow http/https/mailto/tel, anchors, or templates; images allow http/https/cid or templates. When assembling attributes, validate the protocol with email.url() and escape attribute values. Plugins returning plain strings are responsible for escaping. Raw HTML, rich text, and template preview are not security sandboxes for arbitrary untrusted content.

## 7. Documents, errors, and public types

EmailBlockNode contains required id, type, controls and optional style/defaultData. EmailDocument contains version, body, blocks, and optional subject. Register matching plugins after JSON reload; JSON does not store components or renderers.

The current document version is **4**. The entire API uses controls, with no old API aliases, old-data compatibility, or automatic migration. Unsupported versions throw. Create new data with createEmailDocument() and config.createBlock(); do not merely change an old JSON version number.

Missing plugins produce a canvas placeholder and preserve the node; email export throws. Canvas, Inspector, and canvas rendering errors are isolated by block with retry. Email rendering errors identify the block type, ID, and reason. getData()/getDocument() and onChange/onBodyChange arguments provide independent snapshots.

| Public type | Purpose |
| --- | --- |
| `ControlKind/ControlDefinition<T>/ControlOptions<T>` | Control kinds, factory results, and options. |
| `ControlSchema/ControlValues<Schema>` | Control schema and inferred value object. |
| `ControlComponentProps<T>` | Single-control React editor props. |
| `BlockPlugin/BlockPluginOptions` | Block definition and declaration options. |
| `PluginEditorProps/PluginRenderContext` | Editing component props and rendering context. |
| `EmailEditorConfig/UseEmailEditorConfigOptions` | Registration configuration and options. |
| `ImagePickerContext/ValidationIssue` | Image picker context and validation results. |
| `ControlOption/StyleControlConfig/BlockInspectorSection` | Options, style controls, and inspector sections. |
| `ControlEditorProps/EditableRichTextProps` | Reusable control and rich-text component props. |
| `EmailMarkup/EmailTools` | Email fragments and rendering helpers. |

See [README](../README.md) for editor Hooks, instance methods, body, and variables. Runnable examples: [coupon](../playground/plugins/coupon.ts), [product card](../playground/plugins/product.ts), and [shared configuration](../playground/plugins/config.ts).
