# @standhigher/react-email-editor

[English](./README.md) | 简体中文

React 邮件编辑器，支持区块拖拽、富文本编辑和桌面/移动预览。内容以 JSON 保存，通过组件 ref 导出邮件 HTML。

## 安装与接入

需要 React 18 和 React DOM 18。组件库提供 ESM 入口和 TypeScript 类型声明。

```bash
pnpm add @standhigher/react-email-editor
```

在应用中引入一次样式。以下示例展示空编辑器，并读取当前数据：

```tsx
import { useRef } from "react";
import {
  EmailEditor,
  type EmailEditorHandle,
} from "@standhigher/react-email-editor";
import "@standhigher/react-email-editor/styles.css";

export function EmailPage() {
  const editorRef = useRef<EmailEditorHandle>(null);

  function readData() {
    const data = editorRef.current?.getData();
    if (!data) return;
    // 将 data.document、data.json、data.html 或 data.renderedHtml
    // 交给应用自己的保存或导出逻辑。
    console.log(data);
  }

  return (
    <>
      <EmailEditor ref={editorRef} height={720} />
      <button type="button" onClick={readData}>读取数据</button>
    </>
  );
}
```

保存逻辑由接入方实现。Next.js App Router 中，接入编辑器的组件需使用 `"use client"`。使用 `height="100%"` 时，父容器需要有明确高度。

## 本地启动

使用 pnpm 和当前受支持的 Node.js LTS；建议使用 Node.js 22.18 或更新版本，以兼容仓库工具链和 TypeScript 测试。

```bash
pnpm install --frozen-lockfile
pnpm dev
```

打开 [http://localhost:5173](http://localhost:5173)。playground 直接加载 `src/` 并支持热更新，无需提前构建，也不进入发布包。已有开发服务时直接复用。

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 启动本地 playground，端口为 5173。 |
| `pnpm build` | 在 `dist/` 生成 ESM、类型声明和 CSS。 |
| `pnpm build:watch` | 监听 `src/` 改动并重新构建 `dist/`，不启动预览服务。 |
| `pnpm typecheck` | 检查组件库和 playground 的类型。 |
| `pnpm lint` | 使用 Oxlint 检查源码、playground、脚本、配置和测试，warning 和无效禁用指令也视为失败。 |
| `pnpm lint:fix` | 应用 Oxlint 支持的安全自动修复。 |

Oxlint 使用 `.oxlintrc.json`，启用 TypeScript、Unicorn、Oxc 和 React 内置 Rust 插件的 correctness 规则，并显式检查 `any` 和 Hook 调用顺序。React 检查包括 Hook 依赖、ref 和 effect，不代表完整覆盖官方 React Compiler 插件的所有规则。JavaScript 启用 `no-undef`，TypeScript 未定义标识符和组件 Props 由 `pnpm typecheck` 检查。构建产物和本地 pnpm store 不参与检查。

在另一个本地项目联调时，将其依赖指向组件库根目录，按实际位置调整相对路径：

```json
{
  "dependencies": {
    "@standhigher/react-email-editor": "link:../react-email-editor"
  }
}
```

先在本仓库执行 `pnpm build`，持续开发时保持 `pnpm build:watch` 运行。消费方执行 `pnpm install`，并使用自己的开发服务。包入口与 CSS 均从 `dist/` 读取。

两个项目应使用同一个 React 实例。Vite 消费方可按需设置 `resolve.dedupe: ["react", "react-dom"]`。Next.js 消费方可设置 `transpilePackages: ["@standhigher/react-email-editor"]`；使用 Turbopack 且链接目录在项目外时，`turbopack.root` 需覆盖两个项目。

## 组件参数

所有 Props 均为可选项，相关类型从 `@standhigher/react-email-editor` 导出。

| 参数 | 类型 | 默认值 / 行为 |
| --- | --- | --- |
| `initialDocument` | `EmailDocument` | 默认空文档，仅在首次挂载时读取。 |
| `global` | `Partial<EmailGlobalSettings>` | 默认无外部覆盖。传入字段覆盖初始文档的全局设置；后续更新会合并到当前文档。 |
| `blocks` | `BlockDefinition[]` | `[]`。新增自定义区块；同名 `type` 覆盖内置定义，其余内置区块保留。 |
| `variables` | `Variable[]` | `[]`。用于插入和预览替换的变量列表。 |
| `height` | `number \| string` | `"100%"`。数字按 px 处理，字符串使用 CSS 高度值。 |
| `onChange` | `(document: EmailDocument) => void` | 文档变化时触发，包括编辑、重置，以及实际改变文档值的外部全局设置更新。 |
| `onGlobalChange` | `(global: EmailGlobalSettings) => void` | 在编辑器中修改全局设置时触发；外部 `global` 更新和重置不触发此回调。 |

Reset 恢复首次初始化的文档快照，并重新应用当前 `global` 覆盖项。切换文档时使用新的 React `key` 重新挂载，例如 `<EmailEditor key={documentId} initialDocument={document} />`；仅修改 `initialDocument` 不会替换已打开的文档。省略之前传入的某个 `global` 字段，不会将其恢复为默认值。

## 配置说明

### 文档配置

通过 `createEmailDocument()` 和 `createBlockNode()` 补齐默认值：

```tsx
import {
  BLOCK_TYPES,
  EmailEditor,
  createBlockNode,
  createEmailDocument,
  type Variable,
} from "@standhigher/react-email-editor";

const text = createBlockNode(BLOCK_TYPES.text);
if (text) text.fields.html = "<p>你好，{{  store_name }}</p>";

export const initialDocument = createEmailDocument(text ? [text] : []);
initialDocument.subject = "欢迎订阅";

const variables: Variable[] = [
  { name: "{{  store_name }}", description: "店铺名称", value: "示例店铺" },
];

export function TemplateEmailPage() {
  return (
    <EmailEditor
      initialDocument={initialDocument}
      variables={variables}
      height={720}
    />
  );
}
```

如示例所示，同时传入 `initialDocument` 和 `variables`，使变量拥有预览值，并能在导出时补点。`createBlockNode()` 遇到未知类型时返回 `null`。内置区块有 `heading`、`text`、`button`、`image`、`divider`、`spacer` 和 `html`，可通过 `BLOCK_TYPES` 引用。

| 文档字段 | 类型 | 说明 |
| --- | --- | --- |
| `version` | `typeof DOCUMENT_VERSION` | 当前版本为 `1`，由 `createEmailDocument()` 填充。 |
| `subject` | `string`，可选 | 邮件主题，编辑器输入上限为 128 个字符。 |
| `global` | `EmailGlobalSettings` | 邮件全局样式，创建函数会补齐默认值。 |
| `blocks` | `EmailBlockNode[]` | 按展示顺序排列的区块。每项包含唯一 `id`、`type`、`fields`，以及可选的 `style` 和预览数据 `defaultData`。 |

文档结构仍处于开发阶段，不会自动迁移旧版区块字段。完整模型见[文档类型定义](./src/types/document.ts)。

### 全局样式

通过 `global` 传入部分设置，例如 `<EmailEditor global={{ contentWidth: 640, outerPadding: "24px" }} />`。`DEFAULT_EMAIL_GLOBAL` 导出完整默认值；`resolveEmailGlobal()` 用于补齐和归一化配置。

这些设置控制邮件内容。编辑器的选中边框、工具栏等辅助界面不会进入导出的 HTML。

| 参数 | 类型 / 可选值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `contentWidth` | `number` | `600` | 内容宽度，单位 px；取整并限制在 320–900。 |
| `contentAlign` | `"left" \| "center" \| "right"` | `"center"` | 内容整体的水平位置。 |
| `backgroundColor` | `string` | `"#ffffff"` | 邮件外层背景色。 |
| `contentBackgroundColor` | `string` | `"#ffffff"` | 内容背景色。 |
| `contentPadding` | `string` | `"0px"` | 内容内边距。 |
| `outerPadding` | `string` | `"0px"` | 内容外侧留白。 |
| `blockGap` | `string` | `"4px"` | 区块间距。 |
| `textColor` | `string` | `"#000000"` | 默认文字颜色。 |
| `textAlign` | `"left" \| "center" \| "right" \| "justify"` | `"left"` | 默认文字对齐。 |
| `fontFamily` | `string` | `"Arial, Helvetica, sans-serif"` | 默认字体列表。 |
| `fontWeight` | `"normal" \| "bold"` | `"normal"` | 默认字重。 |
| `defaultFontSize` | `string` | `"16px"` | 默认字号。 |
| `defaultLineHeight` | `string` | `"1.5"` | 默认行高。 |
| `paragraphSpacing` | `string` | `"6px"` | 相邻顶层段落的间距。 |
| `listSpacing` | `string` | `"4px"` | 列表整体（`ul` / `ol`）的上下外边距。 |
| `listIndent` | `string` | `"22px"` | 列表缩进。 |
| `linkColor` | `string` | `"#005bd3"` | 默认链接颜色。 |
| `linkDecoration` | `"underline" \| "none"` | `"underline"` | 默认链接装饰。 |
| `borderWidth` | `string` | `"0px"` | 内容边框宽度。 |
| `borderStyle` | `"none" \| "solid" \| "dashed" \| "dotted"` | `"solid"` | 内容边框样式。 |
| `borderColor` | `string` | `"#000000"` | 内容边框颜色。 |
| `borderRadius` | `string` | `"0px"` | 单个圆角值，或按左上、右上、右下、左下排列的四个值。 |

间距和尺寸使用 `"16px"` 等 CSS 长度字符串；内边距支持 `"12px 24px"` 等简写，行高也支持无单位数值。桌面画布和预览跟随 `contentWidth`，移动预览的视口宽度为 360px。

全局间距和长度配置支持非负的 `px`、`em`、`rem`、`%` 值；除行高外，无单位长度会补为 px。不支持的值（如负长度、`calc()`、`var()`、`vh`、`vw`）会回退为对应全局参数的默认值。

### 变量与模板数据

```tsx
import type { Variable } from "@standhigher/react-email-editor";

export const variables: Variable[] = [
  { name: "{{  store_name }}", description: "店铺名称", value: "示例店铺" },
];
```

通过 `EmailEditor` 的 `variables` 参数传入此数组。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `name` | `string` | 必填。下拉展示并原样插入的变量，保留空格，例如 `{{  store_name }}`。 |
| `description` | `string`，可选 | 下拉选项副文案；空字符串或不传时不显示。 |
| `value` | `string`，可选 | 预览时使用的替换文本。 |

变量可以带前导点。导出模板 HTML 时，仅对与 `variables[].name` 原文精确匹配（包括空格）的 token 补齐缺失的点，并保留空格，例如 `{{  store_name }}` 变为 `{{  .store_name }}`。其他 Go template 表达式保持原样，默认不会替换为预览值。

区块节点的 `defaultData: Record<string, unknown>` 可提供结构化预览数据，例如供 `{{range .products}}` 使用的数组。同名数据以区块 `defaultData` 为准，覆盖全局变量。预览解析适用于所有区块渲染出的 HTML，也包括自定义区块。HTML 区块的模板表达式直接写在 `fields.html` 中；预览渲染器支持部分 Go template 语法。

### 区块配置

区块节点的样式按用途分组：

| 样式分组 | 用途 |
| --- | --- |
| `style.dimension` | 容器内边距 `padding`、外侧留白 `margin`，以及可选的 px 高度 `height`；高度包含内边距，作为最小高度。 |
| `style.decorations` | 容器背景、边框和圆角。 |
| `style.typography` | 区块文字样式，覆盖全局排版设置。 |
| `style.element` | 按钮、图片和分割线等元素自身的样式，例如尺寸和对齐。 |

Heading 和 Text 共用富文本工具栏管理字体、字号、粗细、文字颜色、对齐、行高和段间距，BLOCK 检查器不再重复显示这些配置。未选中文字时，格式操作作用于当前整个区块；选中部分文字时，只修改对应文字或段落。格式操作后恢复原光标或选区。Emoji、变量和链接保留光标插入或选区操作；光标位于链接内时编辑该链接。字号沿用 12–48px 预设，已有文档中的其他字号保持原样。BLOCK 检查器保留列表间距、列表缩进、链接外观和容器样式。GLOBAL 默认排版及已有 `style.typography` 的渲染支持保持不变。

Heading 和 Text 默认包含 `16px` 内边距。HTML 区块保留作者显式编写的内联样式。各字段见 [EmailBlockStyle](./src/types/document.ts)。

通过 `blocks` 传入稳定的 `BlockDefinition[]` 添加自定义区块。必填项为 `type`、`title` 和 `render(ctx)`；可选的 `fields`、`styleFields` 配置检查器，`defaultFields`、`defaultStyle`、`defaultData` 设置新建节点的初始值。`render(ctx)` 返回 HTML 字符串，接收 `mode: "canvas" | "email"`。

```tsx
import { EmailEditor, type BlockDefinition } from "@standhigher/react-email-editor";

const customBlocks: BlockDefinition[] = [{
  type: "notice",
  title: "Notice",
  defaultStyle: { dimension: { padding: "16px" } },
  render: () => '<p style="margin:0;color:#555555;">感谢订阅。</p>',
}];

export function CustomEmailPage() {
  return <EmailEditor blocks={customBlocks} height={720} />;
}
```

默认会为自定义区块补充通用容器间距和装饰控件。设置 `exactStyleFields: true` 后，只展示传入的样式字段；节点上已有样式仍会参与渲染。完整定义见 [BlockDefinition、FieldConfig 和 StyleFieldConfig](./src/types/block.ts)。

## 读取与导出数据

通过 `useRef<EmailEditorHandle>(null)` 调用以下方法：

| 方法 | 返回类型 | 说明 |
| --- | --- | --- |
| `getData()` | `EmailEditorData` | 返回 `{ document, json, html, renderedHtml }`。 |
| `getDocument()` | `EmailDocument` | 返回独立文档快照，可保存或用于下次编辑。 |
| `getJson()` | `string` | 返回格式化的文档 JSON。 |
| `getHtml()` | `string` | 返回完整邮件 HTML，保留模板表达式，仅为 `variables` 中的 token 补齐缺失的点。 |
| `getRenderedHtml()` | `string` | 使用全局变量和区块预览数据解析模板，返回完整邮件 HTML。 |

修改返回的文档快照不会改变编辑器内部状态。可使用 `onChange` 订阅文档变化。

不挂载编辑器时，可调用 `documentToHtml(document, definitions?, options?)`。`definitions` 默认为 `DEFAULT_BLOCKS`，文档使用自定义区块时需包含对应定义。`options` 支持 `resolveHtmlTemplates`（默认 `false`）、`variables` 和 `templateData`。未开启解析时，仅对传入 `variables` 中的 token 补点。开启解析时，数据优先级为区块 `defaultData` 高于 `templateData`，高于 `variables`。
