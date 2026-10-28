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
if (text) text.controls.html = "<p>你好，{{ store_name }}</p>";
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
| `config` | `EmailEditorConfig` | 通过 `createEmailEditorConfig({ plugins })` 注册区块、资源适配器和区块库顺序。 |
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

当前文档格式仍处于开发阶段，仅接受 `version: 4`，不自动迁移旧文档。使用 `createEmailDocument()` 和 `createBlockNode()` 创建数据。升级差异见 [CHANGELOG](./CHANGELOG.md)。

## 自定义区块

使用 `defineBlock()` 声明控件及 `renderEmail()`，通过 `createEmailEditorConfig()` 注册：

```tsx
const coupon = defineBlock({
  type: "my-app.coupon",
  title: "优惠券",
  controls: {
    code: EmailControls.text({ label: "优惠码", defaultValue: "SAVE20" }),
  },
  renderEmail: ({ controls, email }) => email.html`<p>${controls.code}</p>`,
});
const config = createEmailEditorConfig({ plugins: [coupon] });

<EmailEditor config={config} />;
const block = config.createBlock("my-app.coupon");
const html = config.toHtml(createEmailDocument([block]));
```

从包入口导入 `defineBlock`、`EmailControls`、`createEmailEditorConfig`。控件值自动推导，默认生成检查器和画布，支持富文本、列表、图片资源适配器、自定义控件组件及 React `Inspector` / `Canvas`。`EditableRichText` 支持多区域编辑，`ControlEditor` 可在自定义检查器复用声明的控件。

`config.validate(document)` 返回带区块 ID 和控件路径的 `ValidationIssue[]`，用于导出前预检；数字范围、选项、URL/图片协议、列表数量和业务校验也用于检查器及邮件导出。自定义 Canvas/Inspector 可用 `setControls(patch)` 一次更新多个关联控件值并触发一次 `onChange`。声明元数据采用隔离冻结快照，控件值解析结果在每次上下文中复用，`onChange` / `onBodyChange` 返回独立数据快照。

编辑器与独立导出共用配置；`builtins` 可筛选和排序内置区块，覆盖内置区块必须显式声明 `override: true`。声明、运行时和持久化节点统一使用 `controls`；邮件文档为 v4，不兼容旧数据，不保留旧 `blocks`、`defaultFields`、`inlineEdit` 或 `render()` 接入方式。完整接入、类型、渲染工具和异常规则见[自定义区块 API 文档](./docs/custom-blocks.zh-CN.md)（[English](./docs/custom-blocks.md)），可运行示例见 `playground/plugins/`。

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
