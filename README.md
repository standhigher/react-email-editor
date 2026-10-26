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

HTML 区块可以通过节点上的 `defaultData` 提供模板渲染数据。编辑区和预览区都会
直接展示渲染后的 HTML；保存的 `fields.html` 以及 `getHtml()` 返回的邮件模板保持原样。
全局变量通过 `variables` 传入，变量上的 `value` 参与预览渲染；区块级 `defaultData`
优先覆盖同名全局变量。

```tsx
import { BLOCK_TYPES, createEmailDocument } from "@standhigher/react-email-editor";

const initialDocument = createEmailDocument([{
    id: "products",
    type: BLOCK_TYPES.html,
    defaultData: {
      has_products: true,
      products: [{ name: "示例商品", price: "¥99" }],
    },
    fields: {
      html: "{{if .has_products}}{{range .products}}<p>{{.name}} {{.price}}</p>{{end}}{{else}}<p>暂无商品</p>{{end}}",
    },
  }]);
```

```tsx
<EmailEditor
  variables={[{ name: "customer_name", label: "客户名称", value: "张三" }]}
/>
```

`getHtml()` 返回包含 Go template 变量的原始邮件模板；
`getRenderedHtml()` 和 Preview 会展开每个区块渲染结果中的 Go template，
数据来自全局 `variables` 与该区块的 `defaultData`。自定义区块在 `email`
模式输出的模板同样适用。

`initialDocument` 仅用于首次初始化；Reset 恢复该初始快照。切换另一份文档时，
请通过 React `key` 创建新的编辑会话。Edit / Preview 切换只改变显示状态，
保留富文本编辑器实例和撤销历史。Heading / Text 默认包含 `16px` padding。

## 样式配置

开发阶段直接使用新的文档结构，不迁移旧版区块字段。建议通过
`createEmailDocument()` 和 `createBlockNode()` 创建文档与区块。内置区块类型使用
`BLOCK_TYPES`，文档版本是 `DOCUMENT_VERSION`。全局和区块样式里的封闭取值使用
`TEXT_ALIGNS`、`HORIZONTAL_ALIGNS`、`FONT_WEIGHTS`、`BORDER_STYLES`、
`LINK_DECORATIONS` 和 `FONT_FAMILIES`。`EmailBlockNode.type` 仍是字符串，自定义区块不受这些常量限制。

- `global.contentWidth` 是邮件内容外框宽度，默认 `600px`。邮件内容表同时写像素 `width` 和 `max-width`，Outlook 能认出宽度，窄屏仍可收缩。桌面画布与 Preview 跟随配置，移动视口为 `360px`。
- `global.contentPadding` 默认四边 `24px`，`outerPadding` 默认 `0px`，`blockGap` 默认 `16px`，均可在 GLOBAL 面板修改或清零。
- Global 同时管理内外背景、内容边框/圆角，以及字体、字号、行高、段落/列表间距、列表缩进、链接颜色和装饰。段落间距只加在相邻顶层段落之间，列表项里的段落不加这段间距。
- 所有区块通过 `style.dimension` 配置 padding 和四边外侧留白，通过 `style.decorations` 配置容器背景、边框和圆角。外侧留白在邮件中使用表格单元格 padding 实现，避免 margin 折叠。
- 自定义区块经 `getBlockDefinition()` 合并容器字段，检查器读取这份结果。合并顺序固定为 Padding、Outer spacing、Background、边框宽度、边框样式、边框颜色、圆角。调用方声明了相同 `id` 时，用调用方的标签、控件和默认值占住该槽位；其余字段按原顺序排在这些容器字段后面。`exactStyleFields: true` 时只保留传入的 `styleFields`。这个开关只决定检查器展示哪些字段，邮件包裹层仍会应用区块 `style` 上已有的间距和装饰。区块定义上的原始 `styleFields` 保持调用方写入的内容。
- `createDimensionFields()`、`createDecorationFields()`、`createTypographyFields()` 每次返回独立副本，例如 `createDimensionFields().padding`。要改 `id`、标签或默认值时，按字段名传入覆盖项。`resolveBlockStyleFields()` 返回同一套合并规则下的副本。
- Heading、Text 和 HTML 使用 `style.typography` 覆盖全局排版；点击 Inherit Global 清除覆盖。Text 默认继承全局字号与行高。
- Button、Image、Divider 使用 `style.element` 配置元素自身尺寸、对齐、边框等；按钮还支持独立字体、文字色、背景和内边距。
- HTML 区块保留手写 HTML 的显式 inline style。段落、列表和链接的默认排版内联在标签上，并让位于作者已有的 style。完整文档 head 中的 style 会合并进邮件 head。

```tsx
import { createDecorationFields, createDimensionFields } from "@standhigher/react-email-editor";

const styleFields = [
  createDimensionFields().padding,
  createDecorationFields().backgroundColor,
  createDecorationFields().borderRadius,
  createDimensionFields({
    padding: { id: "element.padding", label: "Card padding", defaultValue: "16px" },
  }).padding,
];
```

编辑器工作区的留白、空画布拖入提示、选中边框和工具栏是编辑辅助界面，不进入邮件输出。
配置在画布、Preview 与 `documentToHtml()` 中共用渲染规则。

## Development

```bash
pnpm install
pnpm typecheck
pnpm build
node --test tests/styles.test.mjs
```

## 构建与本地 link 联调

构建产物位于 `dist/`，包含 ESM、TypeScript declaration、source map 和
`styles.css`：

```bash
pnpm build
```

开发组件库时可以持续监听并重新生成 `dist/`：

```bash
pnpm build:watch
```

在另一个本地项目中使用构建后的包，可以直接配置 pnpm 的目录链接：

```json
{
  "dependencies": {
    "@standhigher/react-email-editor": "link:../react-email-editor"
  }
}
```

然后执行：

```bash
# 组件库目录
pnpm install
pnpm build:watch

# 消费方项目目录（另一个终端）
pnpm install
pnpm dev
```

也可以使用 pnpm 的全局链接：

```bash
# 组件库目录
pnpm build
pnpm link --global

# 消费方项目目录
pnpm link --global @standhigher/react-email-editor
```

`package.json` 的 `exports` 已指向 `dist`，因此无论使用目录链接还是全局链接，
都需要先执行一次 `pnpm build`；持续开发时使用 `pnpm build:watch`。

链接目标是包含 `package.json` 的组件库根目录，不是 `dist/` 目录本身。
JS、类型声明和 CSS 都通过包入口从 `dist/` 读取。监听命令会处理 `src/` 下的
TypeScript、TSX 和 CSS 改动；它不会启动预览服务，页面仍由消费方的开发服务提供。
已有服务正在运行时直接复用；消费方是否自动刷新取决于其对链接目录的监听配置。

消费方需要安装 React 18 和 React DOM 18。构建产物不会内置 React、React DOM、
TipTap、dnd-kit、CodeMirror 或 Lezer，这些依赖仍由包管理器解析。链接开发时应确保消费方和组件库使用
同一个 React 实例，避免重复 React 导致的 `Invalid hook call`；Vite 可配置
`resolve.dedupe: ["react", "react-dom"]`。
Next.js 项目可保留 `transpilePackages: ["@standhigher/react-email-editor"]`；
使用 Turbopack 且链接目录在项目外时，`turbopack.root` 应覆盖两者的共同父目录。

目前同级 Shopify admin 项目使用 `link:../react-email-editor`。
从原来的源码入口切换到此版本后，也需要先构建，并在开发时保持 `pnpm build:watch` 运行。

## 打包与发布

包目前提供 ESM 入口，不提供 CommonJS `require()` 入口。
发布内容为 `dist/`、README 和许可证，不包含 `src/`。

```bash
# 生成可供其他项目安装验证的压缩包
pnpm pack

# 在消费方安装上一步生成的压缩包（不是持续联调）
pnpm add /absolute/path/to/standhigher-react-email-editor-0.1.0.tgz
```

`prepack` 会在 `pnpm pack` / `pnpm publish` 前自动运行构建，避免发布缺失或过期的
`dist`。发布使用 `pnpm publish`；需要发布到 npm 公共 registry 时使用
`pnpm publish --access public`。以上发布命令仅用于说明，开发和本地联调无需发布。
