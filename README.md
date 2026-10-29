# @standhigher/react-email-editor

English | [简体中文](https://github.com/standhigher/react-email-editor/blob/main/README.zh-CN.md)

Drag content onto a canvas, style your email, preview it, then save editable JSON or export email HTML.

## Modules and features

![Project modules and features](https://cdn.jsdelivr.net/npm/@standhigher/react-email-editor@0.4.1/docs/assets/architecture.png)

[Open full-size architecture diagram](https://cdn.jsdelivr.net/npm/@standhigher/react-email-editor@0.4.1/docs/assets/architecture.png) · [Editable SVG](https://cdn.jsdelivr.net/npm/@standhigher/react-email-editor@0.4.1/docs/assets/architecture.svg)

## Install and integrate

Requires React 18 and React DOM 18. Ships ESM and TypeScript declarations.

```bash
npm install @standhigher/react-email-editor
```

```tsx
import { EmailEditor, useEmailEditor } from "@standhigher/react-email-editor";
import "@standhigher/react-email-editor/styles.css";

export function EmailPage() {
  const editor = useEmailEditor();
  return <EmailEditor editor={editor} height={720} />;
}
```

With Next.js App Router, add `"use client"` to the integration component and import CSS from an allowed global stylesheet entry. Your app implements persistence, resource uploads and email delivery.

Custom blocks that omit `icon` use the first character of their trimmed `title` as the icon: `Coupon` displays `C` and `优惠券` displays `优`. An explicit `icon` takes precedence.

## Run locally

Use Node.js 24 LTS (`.nvmrc`; at least 22.18 for the complete test suite):

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173); reuse an existing server when available. See [development and local linking](https://github.com/standhigher/react-email-editor/blob/main/docs/api.md#development-and-local-linking) for build and validation commands.

## Documentation

- [API reference](https://github.com/standhigher/react-email-editor/blob/main/docs/api.md): every public export, parameter, default and type.
- [Basic examples](https://github.com/standhigher/react-email-editor/blob/main/docs/basic-examples.md): initial content, saving/loading, body styles, variables and preview.
- [Template preview and custom engines](https://github.com/standhigher/react-email-editor/blob/main/docs/template-engines.md).
- [Advanced examples](https://github.com/standhigher/react-email-editor/blob/main/docs/advanced-examples.md): validated saving, multiple instances, custom blocks, multiple editing regions, resource adapters and standalone export.
- [Custom block guide](https://github.com/standhigher/react-email-editor/blob/main/docs/custom-blocks.md): detailed controls, plugins and rendering helpers.
- [Release guide](https://github.com/standhigher/react-email-editor/blob/main/docs/release.md): package checks and manual npm publishing.
- [Changelog](https://github.com/standhigher/react-email-editor/blob/main/docs/changelog.md).
