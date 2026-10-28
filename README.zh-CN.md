# @standhigher/react-email-editor

[English](./README.md) | 简体中文

React 邮件模板编辑器，支持拖拽区块、画布富文本编辑、桌面/移动预览、JSON 保存和 HTML 导出。

## 安装

需要 React 18 和 React DOM 18。提供 ESM 和 TypeScript 类型。

```bash
pnpm add @standhigher/react-email-editor
```

## 基本接入

在应用入口引入一次样式，通过 `ref` 读取文档和 HTML；保存逻辑由应用实现。

```tsx
import { useRef } from "react";
import {
  BLOCK_TYPES,
  EmailEditor,
  createBlockNode,
  createEmailDocument,
  type EmailEditorHandle,
  type Variable,
} from "@standhigher/react-email-editor";
import "@standhigher/react-email-editor/styles.css";

const text = createBlockNode(BLOCK_TYPES.text);
if (text) text.fields.html = "<p>你好，{{ store_name }}</p>";
const initialDocument = createEmailDocument(text ? [text] : []);
const variables: Variable[] = [
  { name: "{{ store_name }}", description: "店铺名称", value: "示例店铺" },
];

export function EmailPage() {
  const editorRef = useRef<EmailEditorHandle>(null);

  function save() {
    const data = editorRef.current?.getData();
    if (!data) return;
    // 将 data.document 保存到应用，data.html 用于邮件模板导出。
    console.log(data);
  }

  return (
    <>
      <EmailEditor
        ref={editorRef}
        initialDocument={initialDocument}
        variables={variables}
        height={720}
      />
      <button type="button" onClick={save}>保存</button>
    </>
  );
}
```

省略 `initialDocument` 即为空编辑器。Next.js App Router 中，接入组件需声明 `"use client"`，CSS 在应用允许的全局样式入口引入。使用 `height="100%"` 时，父容器需要有明确高度。

## 常用参数

所有 Props 均可选。

| 参数 | 类型 | 行为 |
| --- | --- | --- |
| `initialDocument` | `EmailDocument` | 仅首次挂载读取；切换文档时通过新的 React `key` 重新挂载。 |
| `height` | `number \| string` | 默认 `"100%"`；数字为 px。 |
| `body` | `Partial<EmailBodySettings>` | 覆盖邮件主体的布局、外观和默认排版，后续更新合并到当前文档；省略字段不会恢复默认值。 |
| `variables` | `Variable[]` | 插入和预览变量；默认 `[]`，为空时隐藏 Personalization 入口。 |
| `blocks` | `BlockDefinition[]` | 添加自定义区块，同名 `type` 覆盖内置定义。 |
| `onChange` | `(document: EmailDocument) => void` | 文档变化时触发，包括实际改变文档值的外部 `body` 更新。 |
| `onBodyChange` | `(body: EmailBodySettings) => void` | 编辑器内修改邮件主体配置时触发，外部 `body` 更新不触发。 |

邮件主体示例：`body={{ contentWidth: 640, contentPadding: "24px" }}`。默认值通过 `DEFAULT_EMAIL_BODY` 导出；可使用 `resolveEmailBody()` 归一化部分配置。

**BODY** 面板的配置存于 `EmailDocument.body`，同步用于画布、预览和最终邮件 HTML：

- **General**：文字颜色、链接颜色、字体、字重和链接下划线开关。
- **Content**：Background、内容宽度、Padding（`contentPadding`）和区块间距。默认折叠的 **Advanced: Border** 包含边框颜色、宽度和样式。Background 是唯一的邮件主体内容容器背景色，外侧区域为白色，主体固定居中。Padding 作用于内容边框内部，是唯一的主体内边距配置；已移除 `outerPadding`。

文字和链接默认继承 BODY 配置，富文本工具栏中单独设置的格式优先。仅修改链接 URL 或打开方式会保留显式链接样式；重置链接样式后恢复继承 BODY。基础字号（16px）、行高（1.5）以及段落、列表间距使用内部默认值。HTML 区块保留源码格式，外层继承主体排版，不改写内部链接和列表。BODY 不提供对齐和圆角配置。

内置区块：`heading`、`text`、`button`、`image`、`divider`、`spacer`、`html`，均可通过 `BLOCK_TYPES` 引用。

## 保存与导出

| Ref 方法 | 返回值 |
| --- | --- |
| `getData()` | `{ document, json, html, renderedHtml }` |
| `getDocument()` | 独立的 `EmailDocument` 快照，可存储后传回 `initialDocument`。 |
| `getJson()` | 格式化的文档 JSON 字符串。 |
| `getHtml()` | 保留模板表达式的完整邮件 HTML。 |
| `getRenderedHtml()` | 使用预览数据解析模板后的完整邮件 HTML。 |

不挂载编辑器时，也可直接渲染文档：

```ts
import { documentToHtml } from "@standhigher/react-email-editor";

const html = documentToHtml(initialDocument, undefined, { variables });
const previewHtml = documentToHtml(initialDocument, undefined, {
  variables,
  resolveHtmlTemplates: true,
});
```

变量的 `name` 原样插入，`description` 和预览值 `value` 可选。导出时仅对与 `variables[].name` 原文精确匹配的 token 补点并保留空格，如 `{{ store_name }}` → `{{ .store_name }}`；其他 Go template 表达式保持原样。预览支持部分 Go template 语法，数据优先级为区块 `defaultData` > `templateData`（`documentToHtml` 选项）> `variables`。

当前文档格式仍处于开发阶段，仅接受 `version: 3`，不自动迁移旧文档。使用 `createEmailDocument()` 和 `createBlockNode()` 创建数据。升级差异见 [CHANGELOG](./CHANGELOG.md)。

## 自定义区块

通过 `blocks` 传入 `BlockDefinition[]`，必填项为 `type`、`title` 和 `render(ctx)`，返回 HTML 字符串。`fields` / `styleFields` 配置检查器，`defaultFields` / `defaultStyle` / `defaultData` 设置初始值。`render` 接收 `mode: "canvas" | "email"` 和当前邮件主体配置 `body: EmailBodySettings`。

内置文字格式存于 `fields.html`，容器样式存于 `style.dimension` / `style.decorations`，按钮、图片和分割线自身样式存于 `style.element`。渲染仅使用区块启用的样式字段。完整定义见 [BlockDefinition](https://github.com/standhigher/react-email-editor/blob/main/src/types/block.ts) 和 [EmailDocument](https://github.com/standhigher/react-email-editor/blob/main/src/types/document.ts)。独立调用 `documentToHtml` 时，第二个参数需传入包含自定义区块的完整定义列表。

## 本地开发

建议 Node.js 22.18+，使用 pnpm：

```bash
pnpm install --frozen-lockfile
pnpm dev
```

打开 [http://localhost:5173](http://localhost:5173)。playground 直接加载 `src/`，已有服务时复用。验证命令：

```bash
pnpm typecheck
pnpm lint
pnpm build
node --test tests/*.test.mjs tests/*.test.ts
```

本地消费方可使用 `link:../react-email-editor`；先运行 `pnpm build`，再运行 `pnpm build:watch` 持续生成 `dist/`。两个项目需共用一个 React 实例；Vite 可按需设置 `resolve.dedupe: ["react", "react-dom"]`，Next.js 可设置 `transpilePackages: ["@standhigher/react-email-editor"]`，Turbopack 的 `root` 需覆盖链接目录。
