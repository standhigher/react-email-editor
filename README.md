# @standhigher/react-email-editor

JSON-driven React email template editor. Zero UI framework, CSS-variable themed
(`ree-` prefix). Shell plus three panels: blocks / canvas or preview / inspector.

- Drag & drop: `@dnd-kit`
- Inline rich text: TipTap
- Output: JSON (single source of truth) + HTML (deliverable), read through the
  `EmailEditor` ref
- Render contract: dual-mode `render(ctx)` — `canvas` (static demo) vs `email`
  (Go template directives like `{{range}}` / `{{.customer_name}}`)

## Status

Document is the single source of truth. The shell owns subject, personalization,
and reset. The center column switches between canvas editing and Go-template
preview; desktop and mobile icons only change the canvas width.

## 外部读取数据

编辑器不提供 Save Action。集成方通过 `ref` 主动读取当前数据，自行决定如何保存：

```tsx
import { useRef } from "react";
import { EmailEditor, type EmailEditorHandle } from "@standhigher/react-email-editor";
import "@standhigher/react-email-editor/styles.css";

export function EmailPage() {
  const editorRef = useRef<EmailEditorHandle>(null);

  const readData = () => {
    const data = editorRef.current?.getData();
    // data.document / data.json / data.html，可交给集成方的保存逻辑。
  };

  return (
    <>
      <EmailEditor ref={editorRef} height={720} />
      <button type="button" onClick={readData}>获取数据</button>
    </>
  );
}
```

也可分别调用 `getDocument()`、`getJson()`、`getHtml()`。返回的文档是独立快照，
修改快照不会改变编辑器状态。`onChange` 仍可用于订阅内容变化。

`initialDocument` 仅用于首次初始化；Reset 恢复该初始快照。切换另一份文档时，
请通过 React `key` 创建新的编辑会话。Edit / Preview 切换只改变显示状态，
保留富文本编辑器实例和撤销历史。Heading / Text 默认包含 `16px` padding。

## Development

```bash
pnpm install
pnpm typecheck
```

Consumed by the Shopify admin app via a local `file:` dependency.
