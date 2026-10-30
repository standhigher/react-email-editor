# Project Collaboration Rules

These project-level rules apply to the entire repository. Every agent must read this file before modifying project code. The rules must be independently usable without local Skills, personal configuration, or a particular editor. This file is the single complete specification; avoid maintaining duplicate rule sets that can drift. For tools that do not automatically read `AGENTS.md`, users must configure this file as project instructions or explicitly request that it be read. The document itself cannot force all tools to load it.

The root `package.json`, `tsconfig.json`, `tsup.config.ts`, and this file jointly define development conventions. Actual scripts, configuration, and source code are executable facts. If these rules differ from the implementation, verify the discrepancy and update the rules rather than silently assuming consistency. Higher-priority system/tool instructions and the user's current explicit requests take precedence. Subdirectory rules apply only within their scope and must not relax repository-wide boundaries such as Git commit authorization.

**Always respond to the user in Chinese.** Communication, plans, task breakdowns, change descriptions, and new project specifications default to Chinese; preserve code identifiers, commands, paths, and proper nouns in their original form. This `AGENTS.md` is written and maintained in English as explicitly requested by the user. Existing product UI text must retain the language of its module; do not translate it incidentally.

## Project Overview

This project is the `@standhigher/react-email-editor` React component library, using TypeScript, React 18, `@dnd-kit`, and TipTap. Published artifacts are an ESM package. `playground/` only mounts the editor locally through `npm run dev`; it is excluded from the `tsup` build and the package `files` list.

Core behavior:

- Email documents are JSON data. `EmailDocument` is the single source of truth for editor state. `useEmailEditor()` owns reference-stable, isolated instances; `useEmailEditorState(editor)` subscribes to read-only document snapshots as needed. `<EmailEditor>` accepts only `editor` and `height`. Instances exist independently of UI mounting. Replace documents with `setDocument()`; reset restores the document captured after initialization. Both clear interaction state belonging to the old document.
- Create configuration with `useEmailEditorConfig()`. Pure configuration builders are internal only; do not expose legacy configuration factories, component refs, or old Props, or provide a compatibility layer. Configuration/variable updates must not reset documents. New instance capabilities must cover configuration updates, multiple instances, snapshot isolation, and subscriptions.
- The editor consists of the block library, canvas/preview, inspector, and shell.
- Declare blocks with `defineBlock()` and register them through `useEmailEditorConfig({ plugins })`. Create controls with `EmailControls`. Block declarations, runtime contexts, and persisted nodes consistently use `controls`; control declarations are the sole source of types and defaults. `renderEmail(ctx)` returns an HTML string or `EmailMarkup`. Builtin blocks use the same registration pipeline. Do not retain legacy control names or data compatibility for `field/fields`, `Field*`, or `setField/setFields`, nor compatibility for the old `blocks` Prop, `defaultFields`, `inlineEdit`, or `render`. Internal `BlockDefinition` represents normalized runtime definitions only and is not publicly exported.
- `renderEmail(ctx)` uses `mode: canvas` or `mode: email`. Canvas mode displays editing aids; email mode generates deliverable HTML.
- HTML blocks may contain Go template syntax such as `{{.customer_name}}` and `{{range .products}}`. Export preserves templates; resolve their values only for preview or an explicit request. Each `variables` entry has `name`, optional `description`, and `value`. `name` is the original text, such as `{{  store_name }}`, and appears unchanged in editing UI. `value` is the preview replacement text. Do not render secondary text when `description` is empty or omitted. HTML export adds a dot only to listed variable expressions while preserving spaces, for example converting `{{  store_name }}` to `{{  .store_name }}`. Go template expressions outside the list remain unchanged.
- Public APIs such as `getData()`, `getDocument()`, `getJson()`, and `getHtml()` return independent data snapshots. Mutating a returned snapshot must not inadvertently change internal editor state.
- Do not bundle React, React DOM, TipTap, dnd-kit, CodeMirror, or Lezer into the package. React and React DOM remain peer dependencies; the others remain dependencies. All are external in the build and are resolved by the consumer's package manager.

## Before Starting Work

1. Read this file and the source, tests, and README directly relevant to the task.
2. Run `git status --short` to identify existing changes. Existing changes belong to ongoing work; do not overwrite, revert, or format unrelated files.
3. Locate the existing implementation and callers before adding abstractions. Do not introduce directory layers, state libraries, CSS frameworks, or build systems based on personal preference.
4. For public API, document structure, rendered output, or default-value changes, first inspect `src/index.ts`, `src/types/`, `src/document/`, `src/render/`, and relevant tests.
5. For UI work, first check for an existing consumer development service or browser page. Reuse the consumer service when available; otherwise use this repository's `npm run dev` (`playground/`). Do not start an additional preview service.

## Directories and Responsibilities

```text
src/
  EmailEditor.tsx       Public component entry
  index.ts              Explicit re-exports of stable public APIs only
  types/                Public data models, Props, render contexts, and configuration types
  components/           Shared base controls and presentation components across modules
  shell/                Editor instances, document subscriptions, UI sessions, subject bar, personalization entry
  stage/                Canvas, preview, rich-text editing, and toolbars
  block-library/        Draggable block library
  editor-dnd/           Drag-and-drop context and data
  inspector/            Body/block fields, style controls, and inspector components
  i18n/                 Internal language resources, lazy loading, and per-instance UI translations
  blocks/               Builtin block definitions, field configuration, icons, and registry
  plugins/              Plugin declarations, field factories, unified configuration, email tools, React editing extensions
  document/             Document/block creation, defaults, registry, and mutations
  render/               Canvas/email rendering, template preview, and document HTML output
  utils/                Cross-module utilities without business boundaries
  constants/            Fixed configuration shared across modules
  styles/               Editor CSS split by feature
  styles.css            Main CSS entry, importing styles/ files in order
scripts/
  copy-style.mjs        Copy and expand CSS into dist/styles.css after a successful build
playground/
  index.html            Local preview page, not published
  main.tsx              React mounting entry
  App.tsx               Hook integration and EmailEditor filling available space
  EditorActions.tsx     Examples of instance export, creation, reset, and document subscriptions
  sample.ts             Example document and variables, excluded from package exports
  styles.css            Viewport-filling preview page styles, excluded from editor CSS
  css.d.ts              Type-checking support for the package CSS entry
  vite.config.ts        Development server only; package entry points to src/
  tsconfig.json         Separate playground type checking
tests/
  *.test.mjs            Native Node tests for build artifacts and public behavior
```

Determine ownership before adding files. Components or utilities serving only one business module stay in that module. Cross-module utilities without business semantics belong in `src/utils/`; stable shared configuration belongs in `src/constants/`; public types belong in `src/types/`. Do not create catch-all `utils`, duplicate barrel files, or directories solely for visual organization.

## Code Structure

- Use `.tsx` for React components and `.ts` for ordinary logic and types. Follow existing naming conventions: PascalCase for components, `useXxx` for hooks, and preferably kebab-case for multiword utility/configuration filenames, such as `create-document.ts` and `block-html.ts`. Do not rename unrelated existing files merely for naming consistency.
- Each component file may contain only one React component; forwardRef/memo wrappers of that same component do not count as additional components. Extract helpers, constants, complex child components, and independent hooks into files with clear responsibilities. Non-business child components belong in the current module's `components/`; shared utilities belong in the nearest appropriate `utils.ts` or a responsibility-based `utils/` directory. Before extending a new or modified file beyond approximately 350 lines, or giving it three or more distinct responsibilities, split it by responsibility. Generated files and test fixtures are exempt. Do not refactor existing large files outside the task scope.
- `src/index.ts` is the public package entry and explicitly exports only stable APIs, public types, and necessary registration items. Internal files import concrete modules directly; avoid multiple layers of internal barrel re-exports.
- Entry components handle composition and forwarding only. Argument parsing, state sessions, rendering, and field conversion belong in their respective modules.
- Fixed block lists, field metadata, defaults, option mappings, and constants must not be scattered through component JSX. Place them in the nearest appropriate `constants.ts`, configuration file, or block definition.
- Do not add layers for speculative abstraction. Abstract only to remove actual duplication, reduce complexity, or match existing module boundaries.

## TypeScript Rules

- `tsconfig.json` enables `strict`, `isolatedModules`, and `moduleResolution: bundler`. New code must pass strict type checking; do not disable configuration to bypass errors.
- Use `interface` by default for object shapes, including Props, State, document models, API results, configuration, and contexts. Use `type` for unions, function types, intersections/mapped types, and utility types such as `Pick`/`Omit`.
- Reuse existing types such as `EmailDocument`, `EmailBlockNode`, `EmailBlockStyle`, `BlockDefinition`, `ControlConfig`, and `StyleControlConfig`. Do not redeclare the same object structure across files.
- Public type changes require checking `src/index.ts` exports, README examples, and tests. Do not break existing fields without justification when compatibility can be preserved.
- Do not hide type problems with `any`. For unknown external data, start with `unknown`, then use type guards, default normalization, or explicit narrowing.
- Preserve the existing ESM import style and `.ts/.tsx` source import conventions. Do not add a CommonJS entry for personal tooling.

## Documents and Data Models

- Route document creation and normalization through functions such as `createEmailDocument`, `resolveEmailBody`, and `ensureEmailDocument` in `src/document/create-document.ts`. Do not duplicate defaults or assemble incomplete documents inside components.
- Prefer configuration-owned `config.createBlock()` for block creation, reusing `createBlockNode()` underneath. Derive default fields, styles, and `defaultData` from plugin declarations and deep-copy where necessary to avoid shared mutable objects.
- `EmailDocument.version` is a numeric persisted-format identifier. New documents use `DOCUMENT_VERSION = 4`; loading and export preserve supplied values and must not reject a document based on its version number. `ensureEmailDocument()` checks required document/block structure and normalizes body settings without migrating legacy block fields. Data structure changes require checking defaults and export compatibility and adding tests. Do not add a migration framework without a requirement. For existing-document compatibility work, establish the support scope before implementing normalization or migration.
- Keep mutation boundaries clear. Do not directly modify objects outside the current operation. Public snapshots and reset logic must retain independent references.
- Separate body and block styles. `EmailDocument.body` / `EmailBodySettings` store body layout, appearance, text color, font family, font weight, link color, and underline defaults. Other base typography uses internal `DEFAULT_TYPOGRAPHY`; explicit rich-text formatting takes precedence. The body has one `backgroundColor`, is always centered, and does not support body border radius. Builtin block containers use `dimension` and `decorations`; element-specific styles for buttons, images, and dividers use `element`. Text formatting lives only in `controls.html`; do not read legacy `label` or block text styles. Custom blocks may explicitly declare `typography` fields. Newly created default styles and canvas/email rendering read only the block's enabled `styleControls`. The current document format is `4`; do not migrate legacy documents.
- Reuse normalization and validation in `src/utils/css-values.ts` for CSS values. Do not duplicate length, color, border, or spacing parsers across modules.

## Rendering and Email HTML

- Keep functions in `src/render/` as pure as possible: identical documents, definitions, body configuration, and template data produce identical results. Do not read browser globals or depend on editor React state.
- Keep the responsibilities of `blockToHtml`, `renderBlock`, `documentToHtml`, and template preview distinct. Rendering-pipeline changes must check canvas, email, and preview paths together.
- Email HTML uses table layouts and inline styles for email-client compatibility. Do not export drag borders, selection state, toolbars, empty-canvas hints, or other `ree-*` editing aids.
- Document export must generate exactly one complete `<!DOCTYPE html>`, `<html>`, `<head>`, and `<body>`. Merge full-document HTML block input through the existing logic; do not create nested `html`/`head`/`body` elements.
- Rendering options for `blockToHtml()` and `renderBlockContent()` accept only a `BlockRenderOptions` object. Do not add boolean argument compatibility.
- Default export preserves Go template source. Resolve templates only with `resolveHtmlTemplates` or a preview-specific path. Resolution applies to HTML produced by every block's `renderEmail`, not only HTML blocks. Block `defaultData` takes precedence over same-name global variables; retain existing merge semantics.
- Use existing escaping helpers in `src/utils/html.ts` for ordinary text and attribute interpolation. Normalize CSS values before output. URL protocol safety is separate from HTML escaping; validate allowed protocols for new URL inputs. Explicit HTML blocks and rich text follow existing HTML-content paths and must not be escaped wholesale into plain text. Do not treat the template previewer as a complete Go engine or security sandbox. Attribute escaping is not HTML sanitization; do not claim existing logic safely executes arbitrary untrusted HTML.
- New blocks must cover definitions, fields, default fields/styles, registration, canvas display, email output, template data, and tests. Canvas-only support without email export is insufficient.

## React and UI

- Internal language resources belong in `src/i18n/locales/<locale>/`, split into responsibility-based JSON files such as `common.json`, `toolbar.json`, and `inspector.json`. Use short semantic keys such as `common.save` and `preview.timeout`, reuse common terms, and avoid full English sentences or repeated block/control structures as keys. Derive key types from English resources; all languages must preserve the same structure and interpolation parameters. Language entries aggregate JSON; non-default languages remain dynamically loaded as whole language packs. Map builtin display metadata to keys through stable IDs; integrators own custom block text. Use only a minimal internal runtime for lookup, English fallback, and simple interpolation, without third-party i18n dependencies. Support `en` (default), `zh-CN`, `es`, `pt-PT`, and `fr`; other locales fall back to English.
- Reuse `TextInput`, `SelectControl`, `CheckboxControl`, `ColorControl`, `RangeControl`, and `Button` from `src/components/`. Do not duplicate controls with identical appearance and behavior in business modules. Express size differences through explicit shared variant/compact parameters. Continue using existing dedicated toolbar-menu and icon-button wrappers. Base styles belong in `src/styles/form-controls.css` and `src/styles/buttons.css`. Focus uses a black border without outer spacing; business styles handle layout only.
- This component library has no UI framework. Do not introduce Tailwind, CSS-in-JS, or another component library to replace the existing CSS system. Put static editor layout, spacing, states, and responsive rules in `src/styles/`. Runtime values may use CSS variables or inline styles following existing patterns.
- Project-owned editor CSS classes use the `ree-` prefix; CSS variables use `--ree-`. Preserve dependency-generated class names such as TipTap/CodeMirror's `.ProseMirror` and `.cm-*`, but scope overrides within `.ree-*` containers to avoid affecting consumer pages. Put new styles in the appropriate feature file and maintain import order in `src/styles.css`. Do not write large static style objects inside components.
- Canvas display and email rendering are separate consumers. Editing aids stay in editor CSS; email rendering requires explicit inline CSS or renderer output.
- When a prototype, design, or acceptance URL is provided, sample DOM, computed styles, and interaction states from both reference and actual pages by module before and after changes. Cover relevant static styles, hover, clicks, dialogs, responsiveness, and iframes. Code inspection alone cannot establish visual completion. Prefer the current Chrome/browser window and existing service. Start a new service only after confirming the current service is unavailable, its port is unsuitable, or the user explicitly requests it; explain the reason first.
- Prefer existing CSS media queries and container rules for responsiveness. Do not add a viewport-width hook for simple breakpoints. Reuse the same content component when desktop/mobile differ only in outer width.
- Complete all interaction states. Follow current module behavior for dragging, selection, editing, preview switching, reset, empty, error, and loading states. New asynchronous interactions must handle loading, error/retry, and empty states.
- Manage TipTap, dnd-kit, and other dependency lifecycles through existing hook/component patterns. Do not create editor instances during rendering or register global listeners without cleanup.
- Basic accessibility requirements: correct button `type`, native interactive semantics where possible, recognizable labels for icon buttons, associated input labels, and keyboard behavior that is not broken by mouse-only logic.

## Adding or Changing Blocks

Block definitions normally belong in `src/blocks/<type>.ts`. Shared field configuration belongs in `style-controls.ts` or another file with the corresponding responsibility. Follow this sequence:

1. Declare the plugin with `defineBlock()`, including `type`, `title`, field objects/defaults, style capabilities, necessary `defaultData`, and `renderEmail`. Use optional Canvas/Inspector/field components for complex editing.
2. Register builtin blocks in `src/blocks/registry.ts`. Register external blocks through `useEmailEditorConfig({ plugins })` and use the same configuration for the editor and standalone export. Builtin overrides require explicit `override: true`.
3. Verify that `createBlockNode()` produces a complete, independent node.
4. Verify inspector field/style reads and writes, canvas editing/selection, and correct email HTML in preview and `documentToHtml()`.
5. Add meaningful tests for defaults, style inheritance, empty values, template variables, and final HTML.

Do not inline static block configuration into unrelated components. Block render functions must not handle editor selection, dragging, or React state management.

## CSS and Build Artifacts

- `src/styles.css` is the main CSS entry. `tsup.config.ts` calls `scripts/copy-style.mjs` through `onSuccess`, producing expanded `dist/styles.css` after a successful build.
- Do not manually edit `dist/`; it is generated and ignored by `.gitignore`. Run `npm run build` before validating generated CSS.
- Do not commit `node_modules/`, `dist/`, `*.tsbuildinfo`, `.DS_Store`, debug screenshots, or temporary files.
- The ESM format, dts output, external dependencies, `"use client"` banner, and CSS-copy behavior in `tsup.config.ts` are publishing contracts. Verify consumer and README compatibility before changing them.

## Testing and Validation

Use npm by default and run commands from the project root. The repository uses `package-lock.json`; do not mix in pnpm/yarn lockfiles. Prefer `npm ci` when dependencies are missing. Update dependency manifests and lockfiles only when the task changes dependencies; synchronize package-version metadata when bumping the package version. `packageManager` pins npm 11.13.0, `.nvmrc` recommends Node 24 LTS, and full validation requires at least Node 22.18. No consumer `engines` requirement is declared; do not turn development/test Node requirements into consumer installation restrictions. Do not assume team members have Node/npm at a personal filesystem path. Check `node --version` and `npm --version` on first use.

```bash
npm run typecheck
npm run lint
npm run build
node --test tests/*.test.mjs tests/*.test.ts
```

`npm run check` runs the full sequence above. `npm test` runs only Node tests and requires existing build artifacts. `prepack` builds publishing artifacts; `prepublishOnly` runs full validation. npm publishing is manual and local; see `docs/release.zh-CN.md`.

Validation requirements:

- Oxlint uses the repository's dev dependency and `.oxlintrc.json`, enabling correctness rules from the built-in Rust TypeScript, Unicorn, Oxc, and React plugins, with explicit `typescript/no-explicit-any` and `react/rules-of-hooks` checks. React checks include Hook dependencies, refs, and effects; they do not fully cover every rule in the official React Compiler plugin. JavaScript enables `no-undef`; TypeScript undefined identifiers and component Props are checked by `npm run typecheck`. `npm run lint` covers source, playground, scripts, configuration, and tests. Any warning or unused disable directive is a failure. `npm run lint:fix` applies safe fixes only and does not replace manual review. Build artifacts and the local pnpm store are excluded. Do not depend on global tools or temporary downloads. For intentional suppressions, use `oxlint-disable-next-line` with a reason.
- For documentation-only changes, verify that paths, commands, and rules match source code, and run `git diff --check`. Do not add implementation tests or start browsers solely for documentation changes.
- For TypeScript, public API, document model, or rendering changes, run at least `npm run typecheck`, `npm run lint`, `npm run build`, and relevant Node tests. If environment issues prevent a check, report the actual reason and continue other available checks.
- `npm run typecheck` checks `src/`, `playground/`, and the plugin type contract in `tests/plugin-types.ts`. For UI/CSS/field-interaction changes, run at least `npm run typecheck`, `npm run lint`, and `npm run build`. Reuse a consumer service when available; otherwise open the playground through `npm run dev`. Verify relevant DOM, computed styles, hover, expansion, dialogs, pagination, responsiveness, or iframe scenarios in the browser.
- `tests/*.test.mjs` depend on built `dist/index.js` and `dist/styles.css`; build first. Do not test only a substitute source entry. `tests/*.test.ts` cover internal modules not exported by the package entry and run directly with Node type stripping, requiring Node 22.18 or newer.
- If only some checks ran, the final report must list the actual commands and results. Never claim an unexecuted check passed.
- If browser or cross-origin iframe restrictions prevent interaction, explicitly record limitations and uncovered interactions. Do not claim click-level verification.
- Tests should validate public behavior and actual regression risks. Do not write tests that merely mirror implementation details for small reversible changes. Do not repeat or broaden passing checks without a reason.
- Before finishing, remove temporary test files, type declarations, screenshots, and intermediate artifacts created only for debugging this task and no longer needed. Retain formal regression tests, deliverables, and build artifacts still needed for integration. Do not delete pre-existing project files.

## READMEs and Public Contracts

- `README.md` and `README.zh-CN.md` contain only basic integration examples and documentation navigation. Do not add feature details, defaults, behavior descriptions, or other extra explanations.
- Maintain details of public Hooks/instance methods/Props, document fields, defaults, rendering/templates, build/link integration, published contents, and consumer configuration in the corresponding `docs/` documents. Update READMEs only when basic integration examples or navigation change. Examples must reflect current APIs; remove stale fields or commands that conflict with implementation.

## Git and Change Boundaries

- Modify only files required for the task. Do not incidentally reorder unrelated code, format the entire repository, or overwrite existing changes.
- Do not commit without authorization. After finishing code, tests, and a change summary, present them for user review. Run `git add` / `git commit` only after the user explicitly confirms with wording such as “提交” or “可以提交”.
- Before every commit, automatically create or update `docs/changelog.zh-CN.md` and `docs/changelog.md` based on actual changes. Keep Chinese and English content consistent, covering major behavior changes, compatibility effects, and actual validation results. Present the changelog and version decision together for user review. Choose the npm package version according to impact: consider major for incompatible public contracts, minor for backward-compatible capabilities, and patch for backward-compatible fixes. Documentation, tests, or internal changes without external behavior effects may retain the version; do not bump mechanically for every commit. When bumping, synchronize `package.json` and `package-lock.json`. Without a bump, add changes under `Unreleased` and assign them to a version when released later. Do not rewrite published version history. The npm package version and `EmailDocument.version` are independent and must not be bumped together automatically. This rule does not authorize committing, tagging, or publishing.
- Commit messages follow Conventional Commits: `<type>: 中文摘要`, without `(scope)`, for example `fix: 修复邮件区块样式继承`. Use Chinese for the summary and body; preserve necessary code identifiers, commands, paths, and proper nouns. The body must explain impact, modified scope, major behavior changes, and validation results. If splitting commits, document each commit's own scope separately.
- Stage and commit only user-authorized files or change hunks. Do not use `git add .` / `git add -A` to include changes from other sessions. Inspect the staging area before committing. Do not reset or include pre-existing unrelated staged changes without authorization.
- Before committing, rerun `git status --short` and necessary validation commands to ensure no temporary files, build artifacts, or unrelated changes enter the commit.

## Final Self-Check

- Did you read and follow this file rather than rely on personal Skills or editor settings?
- Are existing module boundaries, public exports, data models, and rendering contracts preserved?
- Do new object shapes use `interface`, with `type` reserved for appropriate unions and utility types?
- Have canvas, email, preview, and consumer API effects been considered?
- Have necessary README, test, and main CSS-entry updates been made?
- Did you actually run checks relevant to the changes and report their results?
- Were task-specific temporary files cleaned up and pre-existing user changes preserved?
