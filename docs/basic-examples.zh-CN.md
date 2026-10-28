# 基础场景示例

[English](./basic-examples.md) | [API 参考](./api.zh-CN.md) | [复杂场景](./advanced-examples.zh-CN.md)

在应用全局样式入口引入一次 `@standhigher/react-email-editor/styles.css`。以下每段组件示例可以独立放入一个 `.tsx` 文件；Next.js App Router 中添加 `"use client"`。

## 1. 空编辑器与保存 JSON

```tsx
import { useState } from "react";
import { EmailEditor, useEmailEditor } from "@standhigher/react-email-editor";

export function EmailComposer() {
  const editor = useEmailEditor();
  const [savedJson, setSavedJson] = useState("");

  return (
    <>
      <EmailEditor editor={editor} height={720} />
      <button type="button" onClick={() => setSavedJson(editor.getJson())}>保存 JSON</button>
      <output>{savedJson ? "已保存到当前页面状态" : "尚未保存"}</output>
    </>
  );
}
```

该示例保存到 React 状态，刷新后不会保留；数据库或文件持久化由应用实现。`getDocument()` 返回 JSON 对象快照，`getJson()` 返回格式化字符串，`getHtml()` 返回可交给发送系统的模板 HTML。

## 2. 初始内容、切换文档与重置

```tsx
import {
  BLOCK_TYPES, createBlockNode, createEmailDocument,
  EmailEditor, useEmailEditor, type EmailDocument,
} from "@standhigher/react-email-editor";

const heading = createBlockNode(BLOCK_TYPES.heading);
if (heading) heading.controls.html = "<h1>欢迎订阅</h1>";
const initialDocument = createEmailDocument(heading ? [heading] : []);

interface RestorableEditorProps {
  savedDocument: EmailDocument;
}

export function RestorableEditor({ savedDocument }: RestorableEditorProps) {
  const editor = useEmailEditor({ initialDocument });
  return (
    <>
      <EmailEditor editor={editor} height={640} />
      <button type="button" onClick={() => editor.setDocument(savedDocument)}>载入已保存文档</button>
      <button type="button" onClick={() => editor.reset()}>恢复初始内容</button>
    </>
  );
}
```

`savedDocument` 应由应用读取并校验为当前 v4 文档；TypeScript 类型不替代运行时 JSON 校验。`initialDocument` 只读取一次；后续切换用 `setDocument()`。`reset()` 恢复首次初始化内容，不是最近载入的文档。

## 3. 主体样式、变量与预览导出

```tsx
import { useState } from "react";
import {
  BLOCK_TYPES, createBlockNode, createEmailDocument, EmailEditor, useEmailEditor,
} from "@standhigher/react-email-editor";

const text = createBlockNode(BLOCK_TYPES.text);
if (text) text.controls.html = "<p>你好，{{ customer_name }}，欢迎来到 {{ store_name }}</p>";
const initialDocument = createEmailDocument(text ? [text] : []);

export function PersonalizedEditor() {
  const [html, setHtml] = useState("");
  const editor = useEmailEditor({
    initialDocument,
    body: { contentWidth: 640, contentPadding: "24px", backgroundColor: "#f7f7f7" },
    variables: [
      { name: "{{ store_name }}", description: "店铺名称", value: "示例店铺" },
      { name: "{{ customer_name }}", value: "李小明" },
    ],
  });
  return (
    <>
      <EmailEditor editor={editor} height={720} />
      <button type="button" onClick={() => setHtml(editor.getHtml())}>读取模板 HTML</button>
      <button type="button" onClick={() => setHtml(editor.getRenderedHtml())}>读取预览 HTML</button>
      <pre>{html}</pre>
    </>
  );
}
```

模板导出保留变量，并把列出的 `{{ store_name }}` 补成 `{{ .store_name }}`；预览导出替换为示例店铺等文本。编辑器自带桌面与移动端预览。这里用 `<pre>` 展示导出源码；应用可自行下载或上传。生产导出错误处理见[校验后保存](./advanced-examples.zh-CN.md#1-校验后异步保存)。

## 4. 不挂载编辑器直接导出

```ts
import {
  BLOCK_TYPES, createBlockNode, createEmailDocument, documentToHtml,
} from "@standhigher/react-email-editor";

const block = createBlockNode(BLOCK_TYPES.html);
if (!block) throw new Error("HTML 区块未注册");
block.controls.html = "<p>你好，{{.customer.name}}</p>";
const document = createEmailDocument([block]);

export const templateHtml = documentToHtml(document);
export const previewHtml = documentToHtml(document, undefined, {
  resolveHtmlTemplates: true,
  templateData: { customer: { name: "李小明" } },
});
```

每份导出只有一套 doctype、html、head 和 body。自定义区块需共享注册表，见[复杂场景](./advanced-examples.zh-CN.md#3-业务区块多区域富文本与列表)。
