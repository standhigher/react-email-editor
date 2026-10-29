# Changelog

English | [简体中文](./changelog.zh-CN.md)

## Unreleased — 2026-10-29

### Template preview and custom engines

- Add a synchronous `TemplateEngine` adapter through `useEmailEditorConfig({ templateEngine })`, sharing external rendering across canvas, editor preview and resolved export. `renderTemplatePreview()`, document rendering and single-block helpers accept the same `templateEngine` option.
- Export `defaultTemplateEngine` and explicitly invoked `validateTemplate()` without automatically blocking saving. Engine updates preserve documents and instances, instances remain isolated, and engines receive detached data copies.
- Support basic variables, root context and `if/range/with` in the default engine; preserve the entire render input when syntax is unsupported or control structures are incomplete. Delegate functions, pipelines and local variables to external engines without escaping their output again.
- Apply the same listed-variable dot normalization to canvas, preview and sending HTML, preserving whitespace and trim markers; JSON retains template source.
- Fix Unicode field paths and condition truthiness for Date, Map, Set and plain objects. Normalize non-`Error` render and validation exceptions while preserving the original `cause`, with error display, Retry and recovery after replacing an engine.
- Add dedicated English and Chinese template-engine documentation and integration examples; keep only documentation links in the READMEs.

### Toolchain and documentation

- Migrate project package management from pnpm to npm 11.13.0, replacing `pnpm-lock.yaml` with `package-lock.json` while preserving all direct dependency versions.
- Use `npm install` and `npm run dev` for local development and `npm ci` for locked installs. Switch validation, automatic fixes, packaging and pre-publish checks to npm, and remove pnpm-specific configuration.
- Update installation and command instructions in both READMEs, API development and local linking documentation, release guides and project collaboration rules.

### Validation

- `npm ci` succeeds; `npm run check` passes type checking, Oxlint, build and all 121 Node tests, covering engine selection, context, escaping, data isolation, variable normalization and error recovery.
- `npm run dev` starts successfully; the homepage and `main.tsx` entry module both return HTTP 200.
- Verify canvas and preview variable output, non-`Error` exception display, Retry and recovery after replacing engines in Chrome; `git diff --check` passes.

## 0.4.3 — 2026-10-28

### Fixes and improvements

- Reuse the same Personalization menu in the subject header and configuration panel, with consistent variable colors, width, border radius, shadows and hover styles.
- Move variable triggers for text, multiline text and link controls to an input suffix on the right, reserving space for content; restore input focus and cursor position after inserting a variable.
- Open menus to the left or above according to available viewport space, using native popovers to avoid scroll clipping and positioning offsets in embedded containers with `transform`.
- Complete focus handling when opening from the keyboard, Tab/Shift+Tab exit, Escape dismissal and outside-click dismissal; preserve the selected block on close and clean up observers and event listeners.
- Keep the public API, email export and `version: 4` document format unchanged.

### Validation

- `pnpm check` passed, including type checking, Oxlint, build and all 103 Node tests; add regression coverage for menu positioning, focus, dismissal and lifecycle.
- Reuse the existing development server for browser interaction checks, covering suffix clicks, cursor insertion, keyboard navigation and positioning inside containers with `transform`.

## 0.4.2 — 2026-10-28

### npm publishing and documentation

- Add the MIT license, repository, homepage and issue tracker, pin the public npm registry and pnpm 10.16.1, and recommend Node 24 LTS through `.nvmrc`.
- Add `pnpm test`, `pnpm check` and complete validation before publishing; preserve CSS through `sideEffects` and verify that consumers can remove unused JavaScript imports.
- Fix broken npm README images by using fixed absolute CDN URLs for images and viewing links from the published 0.4.1 package; newer packages retain Markdown and SVG documentation without shipping PNG originals again.
- Use absolute GitHub URLs for language switches, API references, examples, release guides, changelogs and section navigation in both READMEs, and verify target documents and anchors; remote documents must be pushed with the commit.
- Add English and Chinese release guides, package-content checks and consumer CSS validation; keep the React 18 peer range, existing public API and document format unchanged.

## 0.4.1 — 2026-10-28

### Documentation and type hints

- Simplify both READMEs, add module architecture diagrams, and move detailed integration instructions into separate API reference, basic example and advanced example documents.
- Add examples for saving and restoring documents, body settings and variables, multiple-instance subscriptions, custom blocks, multiple rich-text regions, image resource pickers and individual block template previews; update navigation in the custom block guides.
- Add English JSDoc for editor instances, document models, plugins and controls, email rendering helpers, rich text and basic UI components, shipped with TypeScript declarations for IDE hover details on parameters, defaults and behavior boundaries.
- Update only documentation, type comments and the package version, without changing runtime behavior, the public API or the persisted document version; documents remain at `version: 4`.

### Validation

- Type checking, Oxlint, build and all 96 Node tests passed.
- All 34 TypeScript/TSX example files from both READMEs, API references and scenario documents passed type checking; all local documentation link targets exist.

## 0.4.0 — 2026-10-28

### Features and improvements

- Standardize React integration on `useEmailEditorConfig()`, `useEmailEditor()` and `<EmailEditor editor={editor}>`; add `useEmailEditorState(editor)` for on-demand subscriptions to cached, read-only document snapshots.
- Keep editor instance references stable and isolated, allowing reading, validation and export without mounting the UI; add `setDocument()` and `reset()`, clearing selection, focus and control state from the previous document on replacement or reset.
- Preserve the current document when configuration or variables change; merge external body input when its value changes, avoid initialization callbacks, and keep document reads and callback arguments as independent snapshots.
- Add export, new-document, reset and subscription examples to the playground, and update English and Chinese integration documentation.

### Fixes and validation

- Synchronize configuration, variables, body settings and callbacks during commit so child layout effects can read new values; defer subscription notifications and body callbacks to the layout phase, keeping interrupted concurrent renders from changing existing instances.
- Use instance-specific IDs for subject inputs so labels, inputs and character-count hints remain independently associated across multiple editors.
- Add coverage for configuration update timing, concurrent interruption, subject associations across multiple instances, negative type contracts for removed APIs and checks for compatibility entry points in source.

### Breaking changes

- Remove public `createEmailEditorConfig`, `EmailEditorConfigOptions`, `EmailEditorHandle`, component refs and previous state Props, without aliases or compatibility layers. Pass configuration and state to `useEmailEditor()`; the component accepts only `editor` and `height`.
- The fourth argument of `blockToHtml()` and `renderBlockContent()` accepts only a `BlockRenderOptions` object; remove boolean adaptation and explicitly reject booleans passed from JavaScript. Template previews use `{ resolveHtmlTemplate: true }`.
- Persisted documents remain at `version: 4`, without migration of older versions; this package version change affects only the package API and behavior.

## 0.3.0 — 2026-10-28

### Features and improvements

- Add `defineBlock()`, `EmailControls` and `createEmailEditorConfig()`, sharing plugin configuration between the editor and standalone email export; support filtering, sorting and explicit overrides in the built-in block library.
- Support custom control components, React Canvas/Inspector components, multiple `EditableRichText` regions, `ControlEditor`, declarative nested lists, image resource pickers and shared email HTML helpers in block plugins.
- Add `config.validate()` to collect issues with numeric ranges, options, URL/image protocols, list counts and business validation; support updating several related controls at once through `setControls()`.
- Add English and Chinese custom block API documentation, coupon and product card examples, and component regression tests.

### Fixes

- Preserve explicit colors and underlines when changing link URLs or opening behavior, and restore BODY inheritance on reset.
- Use the same base typography for the canvas body, preview and email export, fixing differences in calculations for `em` padding, borders and other dimensions.
- Fix asynchronous list updates overwriting subsequent edits or sorting; merge the latest values by stable row identifiers, ignore stale results after deletion or unmount, and avoid reusing deleted row identifiers for new rows.
- Give custom controls independent snapshots of values, body settings and variables to prevent parameter mutations from affecting the host; isolate variable synchronization for custom Canvas/Inspector components as well.
- Show an empty option in optional selects and support clearing them; associate control labels correctly with selects.
- Make inspector rich text inherit body settings and enabled block typography, paragraph, list and link styles, updating when body configuration changes.
- Report missing plugins and email export failures explicitly; isolate canvas and inspector errors per block and preserve original node data.

### Breaking changes

- Switch custom blocks to `defineBlock` + `EmailControls` + `createEmailEditorConfig`, with the component receiving `config`; remove the old `blocks` Prop, public `BlockDefinition/FieldConfig/FieldType` and `resolveBlockStyleFields`, without an adaptation layer. Control factories use `EmailControls.text(...)`, and blocks and lists declare controls through `controls` (without `field` / `fields` aliases); runtime and persisted nodes use `controls`, style declarations use `styleControls`, and update methods use `setControl/setControls`, with corresponding renames for types, `ControlEditor` and `controlPath`. Content defaults come from control declarations, rendering uses `renderEmail`, and the document format advances to v4, without compatibility or automatic migration for old data.
- Standardize email body settings on `body`: documents use `EmailDocument.body`, the component uses `body` / `onBodyChange`, and types and helpers use `EmailBodySettings`, `DEFAULT_EMAIL_BODY` and `resolveEmailBody`; block rendering contexts and `BlockRenderOptions` also use `body`. Remove the previous Global API without aliases or migration code.
- Advance the document version to `4`, without support for older versions. BODY General provides text color, link color, font, font weight and a link underline toggle; Content provides a single body Background, content width, Padding and block spacing, with border color, width and style grouped under Advanced: Border, collapsed by default. Apply configuration consistently to canvas, preview and export while preserving explicit content formatting. Keep only `contentPadding`, removing `outerPadding`, body alignment, outer background and border radius; center the body and keep the outer area white.

## 0.2.0 — 2026-10-27

### Breaking changes

- Advance the document format from `version: 1` to `version: 2`, rejecting older versions without automatic migration. Use `createEmailDocument()` to create current-version documents; upgrading existing data requires updating block fields and styles as well as the version number.
- Store text formatting for Heading, Text and Button in `fields.html`; Button no longer reads `fields.label` or typography from `style.element`. `EmailElementStyle` no longer extends `EmailTypographyStyle`.
- Make built-in blocks declare `styleFields` according to their capabilities and ignore disabled styles; remove `dimension.height` and block-level `typography` from built-in blocks. Custom blocks can still enable these fields explicitly, with `exactStyleFields` constraining defaults, canvas and email output.
- Preserve paragraphs, lists, links and explicit styles inside HTML block source without injecting body typography; undeclared properties can still inherit global styles.

### Features and improvements

- Support inline rich-text editing for Button with a single paragraph, joining multiple pasted paragraphs with spaces; preserve basic inline formatting in email output and generate only one outer button link.
- Add `BlockInspectorSection`, `inspectorSections`, `RichTextProfile` and `inlineEditProfile` for custom inspector groups and rich-text capabilities; standalone `RichText` supports `profile`.
- Unify color panels, HEX input and color reset; use a centered dialog for link editing, with color, underline and opening behavior options.
- Improve block action bars, drag feedback, the three-column layout, toolbar wrapping and preview height; let previews follow document content.
- Change the default button fill to black and default button/image links to empty, with no navigation for blank links; default global content, block, button and image borders to transparent.
- Simplify both READMEs, add npm keywords, and include the Chinese README and changelog in the published package.

### Fixes and validation

- Fix cursor, selection and formatting preservation after rich-text formatting operations, and preserve spacing and indentation when switching lists.
- Fix button export handling of quotes, comparison operators, comments and spaces inside template expressions.
- Add Oxlint and regression tests for block configuration, rich text, lists, buttons and color conversion.

## 0.1.0 — 2026-10-27

First official release (commit `48011d9`).

- Provide a React 18 editor, draggable blocks, rich-text editing, an inspector and desktop/mobile previews.
- Support JSON documents, global and block styles, HTML source editing, custom blocks and Go template previews.
- Provide data access through component refs, standalone HTML rendering, ESM, TypeScript declarations and a separate CSS entry point.
- Provide a Vite playground, build tooling and a local linking workflow.

## 0.0.0-stage — 2026-10-27

- Package distribution verification version before the first release.
