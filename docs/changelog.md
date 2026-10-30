# Changelog

English | [简体中文](./changelog.zh-CN.md)

## 0.7.1 — 2026-10-30

### Fixes and improvements

- Fix the brief English UI shown when initially selecting a non-English locale. Preserve the editor height in an empty container with `aria-busy` until the language pack is ready, then display the target language directly. English and cached languages display immediately.
- Show only an error and retry action when the initial language load fails, continuing to wait during retry. Subsequent switches retain the current UI and editing state. Update error messages in all five languages to remove the claim that the current language remains available, which does not apply to an initial failure.
- Update both API references while retaining on-demand loading, caching, request deduplication, and stale-request protection. Bump the npm package from `0.7.0` to `0.7.1` as a patch; public APIs, persisted document format `4`, and email export remain unchanged.

### Validation

- `npm run check` passes type checking, Oxlint, the build, and all 162 Node tests, covering initial waiting, failure and retry, successful display, retaining the UI after subsequent switch failures, caching, rapid switching, unmounting, instance isolation, and unchanged documents and exports. `git diff --check` passes.
- For this fix, reused Chrome and the existing service on port 5173 with controlled delays and failures to verify no English controls during loading, a preserved 720px container height, direct Chinese display after retry, retained inspector collapse state while French loads, and immediate English and cached Chinese display. Removed temporary verification files and the tab.

## 0.7.0 — 2026-10-30

### Added and improved

- Add a nearly full-screen native dialog to HTML controls, with line numbers, syntax highlighting, variable insertion, responsive sizing, and focus restoration after closing. Edits immediately update the editor document. Ctrl+S or Command+S prevents browser Save As and briefly confirms automatic updates; integrators remain responsible for persistence.
- Preserve the same CodeMirror session, cursor, selection, and undo/redo history when opening and closing the dialog. External value synchronization does not create local undo entries.
- Share the personalization menu across the subject bar, rich-text toolbar, inspector, and HTML dialog, with consistent variable names, descriptions, hover, and keyboard focus. Fix Esc dismissal when focus remains in the associated rich-text editor, preserving isolation from other editors. Keep menu portals within the nearest editor or HTML-dialog theme container, including consumer-native-dialog embedding.
- Show the canvas toolbar toggle only when a rich-text toolbar is active, preserve block selection during portal-menu interactions, and use shared tooltips for editing/preview and device controls. Add corresponding UI text in all five languages and update both API references.
- Rewrite `AGENTS.md` in English while explicitly requiring Chinese user responses and retaining the project collaboration rules. Bump the npm package from `0.6.0` to `0.7.0` for backward-compatible editor capabilities. Public APIs, persisted document format `4`, and email export remain unchanged.

### Validation

- `npm run check` passes type checking, Oxlint, the build, and all 161 Node tests, including dialog shortcut handling, timer cleanup, editing-session reuse, associated-editor Esc dismissal, and isolation from other editors. `git diff --check` passes.
- Reused Chrome and the existing preview service to verify variable insertion, undo/redo across dialog transitions, selection retention, focus restoration, Command+S feedback, Esc handling, theme inheritance inside consumer-native-dialog embedding, hover and keyboard focus, and desktop/390×700 layouts. Restored the original page state and removed temporary probes.

## 0.6.0 — 2026-10-30

### Added and improved

- Language resources are split into module JSON files with short semantic keys such as `common.save` and `preview.timeout`. Shared terms and repeated builtin style labels are reused while preserving dynamic loading per language, key typing and translation completeness checks.
- `useEmailEditorConfig({ locale })` selects the editor UI language: supports `en` (default), `zh-CN`, `es`, `pt-PT` and `fr`, with all other locales falling back to English. Existing Chinese aliases, case and underscore normalization are retained. Minimal internal lookup, English fallback and simple interpolation require no i18next dependency; language packs and message overrides are not public APIs.
- Translations cover the subject bar, block library, builtin inspectors, rich-text toolbars, dialogs, placeholders, preview and accessibility messages. Integrators retain ownership of custom block and builtin override metadata. Email content, default content, document version and HTML export behavior remain unchanged.
- Locale loading caches resources, deduplicates concurrent requests, supports failure recovery and retry, and ignores stale or unmounted results. Instances select languages independently. Switching preserves documents, selection and undo history without document `onChange`. Inspector sections gain an optional stable `id`.
- ESM code splitting publishes four non-English language chunks and shared JavaScript chunks; consumers must retain dynamically emitted files. The playground includes a five-language selector and both API documents are updated. Bump the npm package from `0.5.2` to `0.6.0` for the backward-compatible UI language capability; the document format remains `4`.
- Fix builtin image errors remaining in the previous language by storing translation keys and translating during rendering, including switches after an error and during an image request. Preserve external picker `Error.message` text, reject invalid URLs without changing the document, and clear errors after a successful retry.

### Validation

- `npm run check` passes type checking, Oxlint, the build and all 155 Node tests covering five-language key and interpolation completeness, minimal translation fallback and argument boundaries, locale normalization, loading, retry, deduplication, races, unmounting, instance isolation, metadata ownership, section state, snapshots and actual consumer bundling, plus language switches after image errors and during requests, external error preservation and successful retries.
- Reused Chrome and the local preview service to verify no Chinese requests with default English, failure fallback and retry recovery, unchanged JSON after switching, undo history, dynamic placeholders, translated toolbars, link dialogs and errors, color panels, and desktop/mobile previews. Temporary network blocking was removed.
- In this update, reused Chrome and the original preview service to verify all five languages, French rich-text tools and the link dialog, and 600px desktop/360px mobile previews. Exported JSON/HTML are identical before and after switching. Restored English desktop editing and retained no temporary files. `git diff --check` passes.
- Reused the existing service on port 5173 to verify the image fix in Chrome: displayed errors switch between English and Chinese, pending requests use the current Chinese fallback, external errors retain their original text, and successful retries clear errors and commit valid URLs. Removed the temporary verification page and tab.

## 0.5.2 — 2026-10-29

### Fixes and improvements

- Fix canvas recreation and flicker when switching between editing and preview. Keep the editing canvas mounted and swap two iframe buffers after standby loading and height measurement, preserving separate editing and preview scroll positions. Exclude the hidden canvas from focus, keyboard and drag interactions while previewing.
- Debounce document, configuration, variable and device-width changes for 400ms with a maximum wait of 2 seconds and idle scheduling support. Process Preview and Retry clicks immediately while continuing to debounce subsequent changes in preview mode. Reuse ready or loading buffers with identical HTML and width to avoid remounts.
- Use `sandbox="allow-same-origin"` on preview iframes to block scripts and event handlers while retaining height measurement. Preserve exported HTML; this restriction is not complete HTML sanitization.
- Handle generation, load and measurement errors, including a 15-second load/measurement timeout, with error messages and Retry. Retain existing previews on failure and force a new load on retry. Prevent callbacks from stale, replaced or failed buffers from overwriting current content, and clean up timers, observers, listeners and animation frames on unmount.
- Update both template-engine guides. Bump the npm package from `0.5.1` to `0.5.2` as a patch, preserving the public API, email export and persisted document format. Preview no longer executes scripts in email HTML; custom engines and `renderEmail` should be pure and allow repeated background calls.

### Validation

- `npm run check` passes type checking, Oxlint, the build and all 144 Node tests, covering debounce, maximum wait, buffer reuse, stale callbacks, timeouts, exceptions, retry and cleanup.
- Reuse the existing Chrome page to verify blocked scripts and event handlers, unchanged iframe nodes after subject-only edits, one load for five consecutive changes in preview mode, and a 15-second timeout that retains the old preview and recovers through Retry.
- Verify desktop 600px and mobile 360px previews and five consecutive editing/preview round trips. Canvas, rich-text and iframe nodes remain mounted, with no visible blank or unmeasured frame in sampled states. Restore the test document and remove temporary probes. `git diff --check` passes.

## 0.5.1 — 2026-10-29

### Fixes and improvements

- Accept documents according to their actual structure without requiring `version === 4`. Widen `EmailDocument.version` to `number`, preserving the supplied value through initialization, replacement, snapshots, reset and export; new documents still use `4`.
- Share structural checks across initialization, document replacement, validation and HTML export for the document object, `blocks` array and block `id/type/controls`. Invalid structure throws a `TypeError` with the field path. Preserve body normalization and plugin control defaults without automatically migrating nodes that only contain legacy `fields`.
- Update both API references and custom block guides. Require automatic updates to both changelogs before commits and choose major, minor, patch or no version bump according to the changes; keep the npm package version independent of the document format identifier.
- Bump the npm package from `0.5.0` to `0.5.1` as a patch correcting document loading restrictions, without changing the persisted document structure.

### Validation

- Type checking, Oxlint, the build and all 127 Node tests pass, covering different document versions, invalid structures, plugin validation, template preview, snapshot isolation, subscriptions and reset.
- `git diff --check` passes. No UI or styles changed, so browser validation was not run.

## 0.5.0 — 2026-10-29

### Template preview and custom engines

- Add a synchronous `TemplateEngine` adapter through `useEmailEditorConfig({ templateEngine })`, sharing external rendering across canvas, editor preview and resolved export. `renderTemplatePreview()`, document rendering and single-block helpers accept the same `templateEngine` option.
- Export `defaultTemplateEngine` and explicitly invoked `validateTemplate()` without automatically blocking saving. Engine updates preserve documents and instances, instances remain isolated, and engines receive detached data copies.
- Support basic variables, root context and `if/range/with` in the default engine; preserve the entire render input when syntax is unsupported or control structures are incomplete. Delegate functions, pipelines and local variables to external engines without escaping their output again.
- Apply the same listed-variable dot normalization to canvas, preview and sending HTML, preserving whitespace and trim markers; JSON retains template source.
- Fix Unicode field paths and condition truthiness for Date, Map, Set and plain objects. Normalize non-`Error` render and validation exceptions while preserving the original `cause`, with error display, Retry and recovery after replacing an engine.
- Add dedicated English and Chinese template-engine documentation and integration examples; keep only documentation links in the READMEs.

### Editor defaults

- Add and initially select `Default` in BODY Font family, storing `body.fontFamily` as `""` by default. Omitted, empty and whitespace-only values use the internal Arial, Helvetica, sans-serif font stack in the canvas, preview and exported email. Preserve explicit fonts and rich-text formatting; the document version remains `4`.
- When custom blocks omit `icon`, use the first Unicode code point of the trimmed `title` as the default icon and escape HTML special characters. Explicit icons retain precedence.

### Toolchain and documentation

- Migrate project package management from pnpm to npm 11.13.0, replacing `pnpm-lock.yaml` with `package-lock.json` while preserving all direct dependency versions.
- Use `npm install` and `npm run dev` for local development and `npm ci` for locked installs. Switch validation, automatic fixes, packaging and pre-publish checks to npm, and remove pnpm-specific configuration.
- Update installation and command instructions in both READMEs, API development and local linking documentation, release guides and project collaboration rules.
- Limit READMEs to basic integration examples and documentation navigation; maintain feature details, defaults and behavior descriptions in `docs/`.

### Validation

- `npm ci` succeeds; `npm run check` passes type checking, Oxlint, build and all 123 Node tests, covering engine selection, context, escaping, data isolation, variable normalization, error recovery and body default-font fallback and switching.
- `npm run dev` starts successfully; the homepage and `main.tsx` entry module both return HTTP 200.
- Verify canvas and preview variable output, non-`Error` exception display, Retry and recovery after replacing engines in Chrome; `git diff --check` passes.
- Verify initial BODY `Default` selection, explicit font switching and restoring the default in Chrome, with matching default fonts in the canvas, HTML-block iframe and desktop/mobile email previews.

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
