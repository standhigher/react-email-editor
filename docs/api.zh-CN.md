# API 参考

[English](./api.md) | [返回 README](../README.zh-CN.md)

所有下列 API 从 `@standhigher/react-email-editor` 导入；样式独立从 `@standhigher/react-email-editor/styles.css` 引入一次。发布包的 `dist/index.d.ts` 包含对外字段的英文 JSDoc，可在 IDE 中悬停查看字段作用与参数含义。[基础示例](./basic-examples.zh-CN.md)提供可直接组合的接入代码，[复杂示例](./advanced-examples.zh-CN.md)展示业务集成。

## 编辑器组件与 Hooks

```tsx
import { EmailEditor, useEmailEditor } from "@standhigher/react-email-editor";
import "@standhigher/react-email-editor/styles.css";

export function EmailPage() {
  const editor = useEmailEditor();
  return <EmailEditor editor={editor} height={720} />;
}
```

### EmailEditor

| 参数 | 类型 | 含义与默认值 |
| --- | --- | --- |
| `editor` | `EmailEditorInstance` | 必填，来自 `useEmailEditor()`。 |
| `height` | `number \| string` | 默认 `"100%"`；数字单位 px，百分比要求父容器有明确高度。 |

组件只负责 UI；实例独立于 UI 挂载。不支持组件 ref、旧配置工厂或旧文档 Props。

### useEmailEditor(options?) → EmailEditorInstance

所有参数可选，默认空文档与全部内置区块。遵循 React Hook 调用规则。

| 参数 | 类型 | 含义 |
| --- | --- | --- |
| `initialDocument` | `EmailDocument` | 仅初始化读取；后续用 `setDocument()` 切换。 |
| `body` | `Partial<EmailBodySettings>` | 初始化覆盖主体设置；后续变化合并到当前文档，省略字段保持原值。 |
| `config` | `EmailEditorConfig` | `useEmailEditorConfig()` 的结果；更新不重置文档。 |
| `variables` | `Variable[]` | 插入与预览变量，默认 `[]`；后续更新影响预览和导出。 |
| `onChange` | `(document) => void` | 编辑、替换、重置及有效外部主体更新后返回独立快照；初始化不调用。 |
| `onBodyChange` | `(body) => void` | 仅编辑器内部修改主体设置时返回独立主体快照。 |

实例引用稳定，多实例互相隔离。配置、变量、主体及回调在 React 提交阶段同步，被中断的 render 不改变已提交实例。子组件 layout effect 可读取更新后的实例；订阅通知和外部主体更新的 `onChange` 在 layout 阶段执行。仅使用该 Hook 的组件不会因文档输入重新渲染。

### 实例方法

| 方法 | 参数 | 返回与行为 |
| --- | --- | --- |
| `getData()` | 无 | `EmailEditorData`：`document`、格式化 `json`、保留模板的 `html`、解析预览数据的 `renderedHtml`；任一渲染失败会抛错。 |
| `getDocument()` | 无 | 独立的 `EmailDocument` 快照，可持久化或修改后传给 `setDocument()`。 |
| `getJson()` | 无 | 格式化文档 JSON 字符串。 |
| `getHtml()` | 无 | 保留模板的完整邮件 HTML。 |
| `getRenderedHtml()` | 无 | 用当前变量与区块 `defaultData` 生成预览 HTML。 |
| `setDocument(document)` | v4 `EmailDocument` | 返回 `void`；复制并替换文档，清空选择、焦点和旧控件状态，触发 `onChange`。 |
| `reset()` | 无 | 返回 `void`；恢复初始化完成时的文档（含初始 `body` 覆盖），清空交互状态并触发 `onChange`。 |
| `validate()` | 无 | `ValidationIssue[]`；检查控件与缺失插件，不渲染 HTML，不代替渲染错误处理。 |

导出数据与回调参数不会暴露可变内部状态。导出模板缺失插件、控件无效或渲染失败时抛错，应由应用捕获。

### useEmailEditorState(editor) → EmailEditorState

必填参数 `editor` 为 `useEmailEditor()` 创建的实例。返回缓存的 `{ document }` 深层只读快照，仅文档变化时通知。只在需要响应式展示的组件中使用；编辑通过实例方法提交。

## 统一配置与插件

### useEmailEditorConfig(options?) → EmailEditorConfig

| 参数 | 类型 | 默认与说明 |
| --- | --- | --- |
| `plugins` | `BlockPlugin[]` | `[]`，由 `defineBlock()` 创建。 |
| `builtins` | `false \| string[]` | 省略显示全部；`false` 隐藏全部内置区块；数组筛选并排序。隐藏不影响已有节点渲染。自定义类型追加到后面。 |
| `pickImage` | `(context: ImagePickerContext) => Promise<string \| null>` | 图片资源选择器；返回 URL，`null` 取消，抛错显示重试；`context` 提供 `value/label/signal`。 |

插件建议模块级声明；依赖状态时用 `useMemo`。保持参数引用稳定可复用配置；内联数组不会重建编辑器或清空文档。配置返回值：

| 成员 | 参数与含义 |
| --- | --- |
| `definitions` | 全部注册插件的只读列表，包含隐藏的内置区块。 |
| `library` | 按展示顺序排列的可插入区块只读列表。 |
| `pickImage` | 注册的资源选择器。 |
| `createBlock(type)` | 已注册的类型字符串 → 独立默认 `EmailBlockNode`；未知类型抛错。 |
| `toHtml(document, options?)` | v4 文档与 `DocumentHtmlOptions` → 完整 HTML；自动使用当前注册表。 |
| `validate(document)` | 文档 → `ValidationIssue[]`，不渲染 HTML。 |

重复自定义类型、重复或未知的 `builtins` 条目会抛错。覆盖内置区块必须声明 `override: true`。

### defineBlock(input) → BlockPlugin<Schema, Type>

```ts
import { defineBlock, EmailControls } from "@standhigher/react-email-editor";

export const coupon = defineBlock({
  type: "shop.coupon",
  title: "优惠券",
  controls: { code: EmailControls.text({ label: "优惠码", defaultValue: "SAVE20" }) },
  renderEmail: ({ controls, email }) => email.html`<p>${controls.code}</p>`,
});
```

| `input` 参数 | 说明 |
| --- | --- |
| `type` / `title` | 必填非空字符串，分别为唯一类型与区块库标题。 |
| `renderEmail(ctx)` | 必填，返回内部 HTML 字符串或 `EmailMarkup`；`ctx` 包含 `block/controls/style/body/mode/email`。 |
| `controls` | 名称到 `EmailControls` 声明的映射，默认 `{}`；自动推导值类型与默认值。 |
| `icon` / `description` | 可选图标（ReactNode 或 HTML 字符串）及说明。省略图标时，使用 `title` 去除首尾空白后的第一个字符，保留大小写并按纯文本显示。 |
| `override` | 替换内置同名类型时必需设为 `true`。 |
| `containerStyles` | 默认提供间距与外观；`false` 全禁用；`{ spacing?: boolean, appearance?: boolean }` 可分别禁用。 |
| `styleControls` | 额外样式能力；同 `id` 覆盖默认容器能力。 |
| `inspectorSections` | 检查器分组及内容、样式控件的排列。 |
| `defaultStyle` | 新节点的默认样式，优先于样式控件 `defaultValue`。 |
| `defaultData` | 新节点的模板预览数据。 |
| `Canvas` / `Inspector` | 可选 React 编辑组件，接收 `PluginEditorProps<ControlValues<Schema>>`。 |

`Schema` 为控件声明类型，`Type` 保留 `type` 字面量。声明会复制并冻结。多个 `inline` 富文本区域必须提供 `Canvas`。完整规则及继承的运行时成员见[自定义区块指南](./custom-blocks.zh-CN.md)。

### EmailControls

所有工厂接收一个参数对象并返回 `ControlDefinition<T>`。通用参数如下；不同控件只使用相关参数。

| 参数 | 作用 |
| --- | --- |
| `label` | 必填控件名称。 |
| `defaultValue` | 默认值；只补持久化的 `undefined`，不覆盖 `""`、`0`、`false`。 |
| `placeholder` / `rows` | 空输入提示 / 多行编辑区行数。 |
| `options` | `ControlOption[]`，下拉合法选项 `{ label, value }`。 |
| `min` / `max` / `step` / `unit` | 数字界限、步长、单位文案；列表的 min/max 限制条数。 |
| `profile` / `inline` | 富文本功能集 / 是否由默认画布直接编辑。 |
| `component` | 自定义 React 控件，接收 `ControlComponentProps<T>`。 |
| `validate(value)` | 已归一化值 → 错误字符串或 `undefined` 表示通过。 |

| 工厂 | 值与默认值 | 补充参数 |
| --- | --- | --- |
| `text/textarea/html/url/image/color/select` | `string`，默认 `""` | URL 和图片按协议校验，select 按 options 校验。 |
| `richText` | HTML `string`，默认 `"<p></p>"` | `profile: "text" \| "heading" \| "button"`，`inline`。 |
| `number` | `number`，默认 `0` | 非法值为 NaN 并校验失败。 |
| `boolean` | `boolean`，默认 `false` | 只接受真正的 boolean，其余归一化为 false。 |
| `list` | 推导的行对象数组，默认 `[]` | 必填 `controls: ControlSchema`；递归解析和校验。 |
| `custom<T>` | 由调用方决定 | 必填 `defaultValue`、纯函数 `read(value: unknown): T` 和 `component`；值应可 JSON 持久化。 |

### 插件 React 编辑组件

`PluginEditorProps` 提供 `block/controls/style/body/variables` 快照、`selected`、`renderedHtml`、`select()`、`setControl(name, value)`、`setControls(patch)` 和 `setStyle(id, value)`。批量更新浅合并顶层控件，触发一次文档通知；嵌套对象需提交完整新值。`renderedHtml` 在 Canvas 为解析后的内部 HTML，在 Inspector 为空。

| 组件 | 参数 |
| --- | --- |
| `ControlEditor` | 必填 `control: string`，复用已声明控件及其校验和资源适配。未知控件抛错。 |
| `EditableRichText` | 必填 `control: string` 指向 richText；可选 `profile` 和 `placeholder` 覆盖声明。 |

以上两个组件仅在插件 Canvas / Inspector 上下文中使用。

### 样式控件工厂

`createDimensionControls(overrides?)`、`createDecorationControls(overrides?)`、`createTypographyControls(overrides?)` 返回按能力名索引的独立 `StyleControlConfig` 对象。参数是 `Partial<Record<能力名, Partial<StyleControlConfig>>>`，用于覆盖名称、默认值、单位、范围等；将选中的能力放入插件 `styleControls`。

| 工厂 / 名称类型 | 可选能力名 |
| --- | --- |
| `createDimensionControls` / `DimensionControlName` | `padding/margin/height`。 |
| `createDecorationControls` / `DecorationControlName` | `backgroundColor/borderWidth/borderStyle/borderColor/borderRadius`。 |
| `createTypographyControls` / `TypographyControlName` | `fontFamily/fontSize/fontWeight/lineHeight/color/textAlign/paragraphSpacing/listSpacing/listIndent/linkColor/linkDecoration`。 |

## 文档模型与创建

| API | 参数 | 返回与边界 |
| --- | --- | --- |
| `createEmailDocument(blocks = [])` | 有序 `EmailBlockNode[]` | v4 文档与完整默认主体。传入数组直接作为 blocks，不负责深拷贝。 |
| `resolveEmailBody(body?)` | `Partial<EmailBodySettings> \| null` | 完整并归一化的主体设置；非法值回退、宽度限制在 320–900px。 |
| `createBlockNode(type, definitions?)` | 类型与可选注册表，默认内置定义 | 独立默认节点；未知类型返回 `null`。业务插件优先用 `config.createBlock()`。 |
| `getBlockDefinition(type, definitions?)` | 类型与可选注册表，默认内置定义 | 匹配的运行时定义或 `undefined`。不要修改配置中的冻结定义。 |
| `generateId(prefix = "block")` | ID 前缀字符串 | 带随机后缀的字符串；应用仍需保持文档内 ID 唯一。 |

`EmailDocument` 含 `version/body/blocks/subject?`；`EmailBlockNode` 含 `id/type/controls/style?/defaultData?`。只支持 `DOCUMENT_VERSION = 4`，不迁移旧文档。JSON 不包含插件组件与渲染逻辑，重新加载时仍需注册相同类型。

主体设置由画布、预览和邮件 HTML 共用：

| `EmailBodySettings` 参数 | 默认值与含义 |
| --- | --- |
| `textColor` | `#000000`，文字颜色。 |
| `backgroundColor` | `#ffffff`，居中内容容器背景；外侧白色。 |
| `contentWidth` | `600`，内容最大宽度 px。 |
| `fontFamily` | `Arial, Helvetica, sans-serif`。 |
| `fontWeight` | `normal`；也可 `bold`。 |
| `linkColor` / `linkDecoration` | `#005bd3` / `underline`。 |
| `contentPadding` | `0px`，边框内部 CSS padding。 |
| `blockGap` | `4px`，相邻区块间距。 |
| `borderWidth` / `borderStyle` / `borderColor` | `0px` / `solid` / `transparent`。 |

主体固定居中，无主体圆角或额外外层 padding。显式富文本格式优先于主体默认值；基础字号 16px、行高 1.5 由内部默认排版提供。HTML 区块不重写内部链接和列表。区块容器样式存于 `dimension/decorations`，元素样式存于 `element`，自定义区块可启用 `typography`；只读取已启用的样式。

## HTML 渲染与模板

### documentToHtml(document, definitions?, options?) → string

`document` 必填 v4 文档；`definitions` 默认 `DEFAULT_BLOCKS`，含自定义区块时使用 `config.definitions` 或直接调用 `config.toHtml()`。返回只有一套 doctype/html/head/body 的完整邮件 HTML，采用表格与内联样式。

| `DocumentHtmlOptions` 参数 | 默认与含义 |
| --- | --- |
| `resolveHtmlTemplates` | `false` 保留模板；`true` 解析预览值。 |
| `variables` | `[]`，变量原文与预览文本。 |
| `templateData` | 可选 `TemplateData`，全局对象或列表数据。 |

数据按顶层浅合并，优先级：节点 `defaultData` > `templateData` > `variables`。默认导出仅给与 `variables[].name` 精确匹配且缺点的 token 补点，并保留空格，例如 `{{ store_name }}` → `{{ .store_name }}`；列表外的 Go template 保持原样。变量 `description` 为空时不显示副文案，`value` 只用于预览。

### 单区块与底层工具

| API | 参数与默认值 | 输出 |
| --- | --- | --- |
| `renderBlock(node, definitions = DEFAULT_BLOCKS, mode = "email", body = DEFAULT_EMAIL_BODY)` | 节点、注册表、`RenderMode`、完整主体 | 插件内部 HTML；不做变量补点或模板解析。 |
| `renderBlockContent(node, definitions = DEFAULT_BLOCKS, mode = "email", options = {})` | 最后参数为 `BlockRenderOptions` | 内部 HTML，加变量补点或模板解析。 |
| `blockToHtml(node, definitions = DEFAULT_BLOCKS, mode = "email", options = {})` | 同上 | 带区块间距、容器样式的邮件表格片段；不是完整文档。 |
| `buildRenderContext(node, mode, body = DEFAULT_EMAIL_BODY, definition = 内置查找结果)` | mode 必填；自定义区块需显式传入 definition | 独立归一化 `BlockRenderContext`，不渲染。 |
| `variablesToTemplateData(variables)` | 必填 `Variable[]` | 以 name 路径为键、value 为值的 `TemplateData`；支持嵌套路径，忽略无 value 的项。 |
| `mergeTemplateData(variables, defaultData?)` | 变量数组与可选对象 | 顶层合并，defaultData 覆盖变量；两者均无数据时返回 undefined。 |
| `renderTemplatePreview(html, defaultData?)` | HTML 字符串与可选预览对象 | 支持部分字段路径、range、if、with 等 Go template 语法；省略数据时保留原文。 |

`BlockRenderOptions` 含 `resolveHtmlTemplate?: boolean`（注意单数）、`templateData?: TemplateData`、`variables?: Variable[]`、`body?: EmailBodySettings`。`body` 默认 `DEFAULT_EMAIL_BODY`；模板默认不解析。单区块预览取 `templateData ?? node.defaultData`，不会自动合并 variables；需要时显式调用 `mergeTemplateData()`。第四个参数必须为对象，传 boolean 或 null 会抛出 TypeError。

`mode` 表示消费场景：`canvas` 供画布，`email` 执行邮件控件校验；它不决定是否解析模板。模板预览不是完整 Go 引擎，也不是 HTML 消毒器或安全沙箱。

### renderEmail 中的 email 工具

| 方法 | 参数与输出 |
| --- | --- |
| ``email.html`…${value}…` `` | 标签模板；普通值转义，EmailMarkup 与数组可组合，模板 token 保留。 |
| `email.raw(html)` | 原始 HTML → EmailMarkup，不消毒。 |
| `email.richText(html)` | 富文本 HTML → EmailMarkup，补主体默认格式。 |
| `email.table(rows)` | `EmailMarkup[][]` → 邮件表格片段。 |
| `email.image({ src, alt?, width? })` | src 必填，alt 默认空字符串，width 默认 100%；校验图片协议。 |
| `email.button({ href, label })` | 必填地址和纯文本文案；空或非法地址不生成链接。 |
| `email.url(value, image = false)` | 返回允许的 URL 或空字符串；image 为 true 使用图片协议规则。 |

链接允许 http/https/mailto/tel、锚点或模板；图片允许 http/https/cid 或模板。自行拼接属性时需先校验协议再转义；返回普通字符串的插件自行负责转义。

## 基础 UI 组件

可用于业务 Inspector；只负责 UI，不会自动绑定文档。值变更回调接收值，`TextInput` 则沿用原生 React event。

| 组件 | 参数与默认值 |
| --- | --- |
| `TextInput` | 原生 React input 属性与 ref；type 默认 text，仅支持 text/url/email/search/tel/password/number。 |
| `SelectControl` | 必填 value、options、onChange(value)；可选 id、label（无障碍）、emptyLabel、compact=false、disabled。 |
| `CheckboxControl` | 必填 label、checked、onChange(checked)；可选 disabled、className、variant=checkbox（或 switch）。 |
| `ColorControl` | 必填 value、onChange(value)；fallback=#000000、label=Color、resetTo=fallback。 |
| `RangeControl` | 必填 value、onChange(value)；可选 id、label；min=0、max=100、step=1。 |
| `Button` | 原生 React button 属性，type=button；variant=default（或 primary/solid/icon）；可选 tooltip。 |
| `RichText` | 底层富文本组件：必填 initialHtml、variables、selected、toolbarId、toolbarCollapsed、onCommit(html)、onSelect()；可选 profile=text、placeholder、inherited。toolbarId 需唯一。插件通常使用 EditableRichText 自动绑定。 |

Props 及 `RichText.inherited` 的字段说明包含在发布包的 `.d.ts` 注释中，可通过 IDE 悬停或跳转到定义查看。原生属性按 React 类型定义，不新增同名导出类型。

## 常量与公共类型

| 导出 | 用途 |
| --- | --- |
| `BLOCK_TYPES` / `BuiltinBlockType` | heading、text、button、image、divider、spacer、html。 |
| `DEFAULT_BLOCKS` | 所有内置 BlockPlugin 定义；自定义注册表使用 config.definitions。 |
| `DEFAULT_EMAIL_BODY` / `DOCUMENT_VERSION` | 默认主体设置 / 文档版本 4。不要直接修改默认对象。 |
| `FONT_FAMILIES` | 只读字体选项 `{ label, value }[]`。 |
| `STYLE_GROUPS` / `StyleGroup` | general/dimension/typography/decorations 的标识及展示名称。 |
| `BORDER_STYLES` / `BorderStyle` | none/solid/dashed/dotted。 |
| `FONT_WEIGHTS` / `FontWeight` | normal/bold。 |
| `HORIZONTAL_ALIGNS` / `HorizontalAlign` | left/center/right。 |
| `TEXT_ALIGNS` / `TextAlign` | left/center/right/justify。 |
| `LINK_DECORATIONS` / `LinkDecoration` | underline/none。 |

编辑器、文档、控件、插件、样式、渲染与模板类型的字段含义，均通过发布包 `.d.ts` 中的 JSDoc 提供。`BlockDefinition` 是内部类型，不从包入口导出；使用 `BlockPlugin` 接收公共插件定义。

## 开发与本地联调

```bash
npm run typecheck
npm run lint
npm run build
node --test tests/*.test.mjs tests/*.test.ts
```

`npm run check` 按上述顺序执行全部检查；只运行 Node 测试时，构建后执行 `npm test`。本仓库默认使用 Node 24 LTS 和 npm 11.13.0。打包检查与发布流程见[发布指南](./release.zh-CN.md)。

先构建再运行依赖 dist 的测试；TypeScript 内部测试需要 Node 22.18+。包提供 ESM、类型与展开后的 CSS。React/React DOM 为 peer dependencies；TipTap、dnd-kit、CodeMirror、Lezer 等为 dependencies，构建时 external，不内联到发布包。

消费方可运行 `npm install ../react-email-editor`；先 `npm run build`，再 `npm run build:watch` 保持 dist 更新。两项目需共用一个 React 实例：Vite 可设置 `resolve.dedupe: ["react", "react-dom"]`；Next.js 可设置 `transpilePackages: ["@standhigher/react-email-editor"]`，Turbopack 的 root 需覆盖链接目录。
