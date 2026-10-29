# 自定义区块 API

[English](./custom-blocks.md) | 简体中文 · [返回 README](../README.zh-CN.md)

本指南按“示例 → API 参数 → 返回值 → 行为规则”介绍三个核心入口：

| 入口 | 职责 |
| --- | --- |
| `EmailControls` | 声明控件、值类型、默认值、校验和编辑组件。 |
| `defineBlock()` | 组合控件、样式、编辑界面和邮件输出，形成一个区块插件。 |
| `useEmailEditorConfig()` | 注册插件，提供区块创建、文档校验和 HTML 导出。 |

内置区块使用相同机制。配置不持有具体文档或选中状态，可以被多个编辑器复用。`EmailDocument` 是文档状态的事实源，React 编辑会话负责选择、拖拽和更新。

## 完整接入示例

```tsx
import { useState } from "react";
import {
  EmailEditor,
  EmailControls,
  createEmailDocument,
  useEmailEditorConfig,
  useEmailEditor,
  defineBlock,
} from "@standhigher/react-email-editor";
import "@standhigher/react-email-editor/styles.css";

const coupon = defineBlock({
  type: "my-app.coupon",
  title: "优惠券",
  controls: {
    code: EmailControls.text({ label: "优惠码", defaultValue: "SAVE20" }),
    message: EmailControls.richText({
      label: "说明",
      defaultValue: "<p>感谢你的支持。</p>",
    }),
  },
  renderEmail: ({ controls, email }) => email.html`
    ${email.richText(controls.message)}
    <p>优惠码：${controls.code}</p>
  `,
});

export function EmailPage() {
  const config = useEmailEditorConfig({ plugins: [coupon] });
  const [initialDocument] = useState(() => createEmailDocument([config.createBlock(coupon.type)]));
  const editor = useEmailEditor({ config, initialDocument });
  return <EmailEditor editor={editor} />;
}
```

`controls` 在声明阶段保存控件定义，在节点、Canvas/Inspector Props 和渲染上下文中保存对应的值：

```ts
// defineBlock 的声明
controls: { code: EmailControls.text({ label: "优惠码", defaultValue: "SAVE20" }) }

// config.createBlock() 返回的节点数据
{ id: "…", type: "my-app.coupon", controls: { code: "SAVE20" }, style: { /* … */ } }

// renderEmail 或 Canvas / Inspector 中读取当前值
controls.code // string
```

## 1. useEmailEditorConfig(options?)

### 示例

```tsx
function useCouponConfig() {
  return useEmailEditorConfig({
    plugins: [coupon],
    builtins: ["heading", "text", "image", "button"],
    pickImage: async ({ value, label, signal }) => {
      // 调用应用自己的素材库；使用 value 初始化，label 作标题，signal 取消请求。
      // 返回图片 URL；取消选择时返回 null。
      return null;
    },
  });
}
```

配置 Hook 必须在 React 组件或自定义 Hook 顶层调用。保持 `plugins`、`builtins` 和 `pickImage` 引用稳定会保留配置引用；更新配置不会重置已有实例文档。移除仍被文档使用的插件后，校验报告缺失插件，原始数据保留。配置的 `toHtml(document)` 和 `validate(document)` 面向任意文档；实例的 `getHtml()` 和 `validate()` 面向当前文档。

### 参数：UseEmailEditorConfigOptions

所有参数均可选。

| 参数 | 类型 | 默认值与作用 |
| --- | --- | --- |
| `plugins` | `BlockPlugin[]` | 默认 `[]`。注册自定义区块；同一类型重复注册报错。 |
| `builtins` | `false \| string[]` | 省略时显示全部内置区块；数组筛选并排序；`false` 隐藏全部内置区块。 |
| `pickImage` | `(context: ImagePickerContext) => Promise<string \| null>` | 图片资源选择适配器；未提供时仍可手动输入图片 URL。 |

`builtins` 只影响区块库可见性，隐藏的内置区块仍可创建、加载和渲染。数组只接受内置类型，不允许重复。自定义类型按 `plugins` 顺序追加；覆盖内置类型的插件仍遵循该内置类型的显示位置和筛选规则。覆盖须在插件声明上设置 `override: true`。

内置类型为 `heading`、`text`、`button`、`image`、`divider`、`spacer`、`html`，可通过 `BLOCK_TYPES` 引用。

### 返回值：EmailEditorConfig

| 字段 / 方法 | 类型 | 含义和作用 |
| --- | --- | --- |
| `definitions` | `readonly BlockPlugin[]` | 全部注册定义，包含隐藏的内置区块，供加载、创建、校验和渲染使用。 |
| `library` | `readonly BlockPlugin[]` | 区块库显示列表，已经过内置筛选、排序和插件合并。 |
| `pickImage` | 同配置参数，可选 | 已注册的图片选择适配器。 |
| `createBlock(type)` | `(type: string) => EmailBlockNode` | 创建独立节点及 ID，深拷贝默认值、样式和模板样例；未知类型抛错。 |
| `toHtml(document, options?)` | `(...) => string` | 同步生成完整邮件 HTML；校验或渲染失败时抛错。 |
| `validate(document)` | `(...) => ValidationIssue[]` | 汇总控件校验问题与缺失插件；不调用渲染器、不修改输入文档。 |

`createBlock()` 只返回节点，不会把节点插入已挂载编辑器。配置本身及普通声明元数据采用复制、冻结快照；函数、React 元素和非普通对象保留身份，函数闭包中的状态不会被隔离。调整配置时重新创建插件和配置。

### toHtml 的 options：DocumentHtmlOptions

| 参数 | 类型 | 作用 |
| --- | --- | --- |
| `resolveHtmlTemplates` | `boolean` | 默认不解析模板；`true` 使用预览数据解析受支持的 Go template 表达式。 |
| `variables` | `Variable[]` | 变量原文、可选描述和预览值；导出时仅给列表中精确匹配的变量原文补点。 |
| `templateData` | `Record<string, unknown>` | 本次模板预览使用的数据。 |

模板预览优先级为节点 `defaultData` > `templateData` > `variables`，按顶层键合并。普通导出保留模板表达式，例如 `{{ store_name }}` 在变量列表中时写为 `{{ .store_name }}`，保留原空格；列表外的表达式不改写。

### validate 的返回项：ValidationIssue

| 字段 | 类型 | 作用 |
| --- | --- | --- |
| `blockId` | `string` | 问题区块 ID。 |
| `blockType` | `string` | 问题区块类型。 |
| `controlPath` | `string` | 控件路径，例如 `terms[0].text`；插件缺失时为空字符串。 |
| `message` | `string` | 校验失败原因。 |

文档基本结构不合法时直接抛出 `TypeError`，不根据 `version` 值拒绝文档。`validate()` 不检查渲染器能否成功运行，导出仍可能因渲染错误失败。

## 2. defineBlock(options)

### 示例：控件、容器样式和检查器分组

```ts
const banner = defineBlock({
  type: "my-app.banner",
  title: "横幅",
  description: "带链接的提示区块",
  controls: {
    title: EmailControls.text({ label: "标题", defaultValue: "限时活动" }),
    href: EmailControls.url({ label: "链接" }),
  },
  containerStyles: { spacing: true, appearance: true },
  defaultStyle: { dimension: { padding: "16px" } },
  inspectorSections: [
    { title: "内容", controlNames: ["title", "href"] },
    { title: "间距", styleIds: ["dimension.padding", "dimension.margin"] },
  ],
  renderEmail: ({ controls, email }) => email.button({
    href: controls.href,
    label: controls.title,
  }),
});
```

### 参数：BlockPluginOptions

| 字段 | 必填 | 含义和作用 |
| --- | --- | --- |
| `type` | 是 | 唯一且稳定的类型标识；建议业务命名空间，例如 `my-app.banner`。持久化后不能随意变更。 |
| `title` | 是 | 区块库和检查器名称。`type` / `title` 不允许为空白。 |
| `icon` | 否 | HTML 字符串或 ReactNode 图标；省略时使用 `title` 去除首尾空白后的第一个字符，保留大小写并按纯文本显示，例如 `Coupon` → `C`、`优惠券` → `优`。 |
| `description` | 否 | 区块说明。 |
| `override` | 否 | 默认 `false`；允许在注册时替换同类型的内置区块。 |
| `controls` | 否 | `ControlSchema` 对象；按声明顺序定义内容控件，自动推导值类型，默认空对象。 |
| `containerStyles` | 否 | 默认开启间距及外观控件；`false` 全关，或 `{ spacing?: boolean; appearance?: boolean }` 单独控制。 |
| `styleControls` | 否 | `StyleControlConfig[]`，补充或覆盖同 `id` 的样式控件。 |
| `inspectorSections` | 否 | `BlockInspectorSection[]`，按顺序组织内容和样式控件；省略时自动分组。 |
| `defaultStyle` | 否 | `EmailBlockStyle`，只为已启用的样式提供默认值，优先于样式控件的 `defaultValue`。 |
| `defaultData` | 否 | 模板预览样例，创建节点时深拷贝到节点。与控件默认值用途不同。 |
| `Canvas` | 否 | 自定义 React 画布；省略时使用默认 HTML 画布或单富文本编辑区域。 |
| `Inspector` | 否 | 自定义 React 内容检查器；替换默认内容控件界面，样式面板继续保留。 |
| `renderEmail` | 是 | 同步函数，返回 HTML 字符串或 `EmailMarkup`；输出区块内部内容。 |

默认容器控件包含 padding、margin、背景色及边框颜色、宽度、样式、圆角，不包含固定高度或文字排版。`containerStyles: false` 只关闭自动添加，仍可通过 `styleControls` 显式添加所需能力。

`inspectorSections` 显式设置后，只展示其中列出的默认内容和样式控件；未列出的控件不自动追加，但仍属于区块 schema。

### 返回值：BlockPlugin

通常直接把返回值放入 `plugins`，不手工构造运行时定义。

| 返回字段 | 作用 |
| --- | --- |
| `type/title/icon/description/override` | 区块标识、展示及注册元数据。 |
| `schema` | 冻结的控件声明对象，保留按名称查询和类型推导。 |
| `controls` | 归一化后的控件定义数组，每项带 `name`；这里是定义，节点的 `controls` 是值。 |
| `readControls(source)` | 读取并归一化控件值，补齐缺失值，保留未知业务属性。 |
| `styleControls/inspectorSections` | 合并后的样式能力和检查器分组。 |
| `defaultStyle/defaultData` | 默认样式与模板样例。 |
| `inlineControl` | 默认画布直接编辑的富文本控件名；有自定义 Canvas 时不使用。 |
| `canvas/inspector` | 适配后的 React 组件；与声明参数的大写 `Canvas/Inspector` 对应。 |
| `renderEmail(context)` | 包装后的渲染函数，邮件模式执行控件校验并将结果转换为字符串。 |

### renderEmail 的上下文：PluginRenderContext

| 字段 | 含义和作用 |
| --- | --- |
| `block` | 完整节点快照，包含 ID、类型、`controls`、样式及模板样例。 |
| `controls` | 已归一化的控件值，类型由声明推导。 |
| `style` | 区块已启用的样式。 |
| `body` | 邮件主体布局、外观及默认文字配置。 |
| `mode` | `"canvas"` 或 `"email"`；预览使用邮件渲染后解析模板，不是第三种 mode。 |
| `email` | 邮件 HTML 工具，见下文。 |

渲染函数应同步、无副作用。业务请求在应用或编辑组件中完成；导出不请求网络。只输出内部 HTML，外层表格、容器间距和完整文档由公共渲染器生成。自定义 Canvas 的 DOM 不会进入邮件，预览和导出始终使用 `renderEmail()`。

## 3. EmailControls

### 示例：文本、选项和列表

```ts
const productControls = {
  name: EmailControls.text({ label: "名称", defaultValue: "马克杯" }),
  price: EmailControls.number({ label: "价格", min: 0, step: 0.01 }),
  visible: EmailControls.boolean({ label: "显示", defaultValue: true }),
  variant: EmailControls.select({
    label: "规格",
    defaultValue: "small",
    options: [{ label: "小号", value: "small" }, { label: "大号", value: "large" }],
  }),
  terms: EmailControls.list({
    label: "使用条件",
    controls: {
      text: EmailControls.text({ label: "条件", defaultValue: "每位客户限用一次" }),
    },
  }),
};
```

`EmailControls` 是控件工厂集合，方法使用小写驼峰，调用结果是控件声明。它同时提供编辑界面、值类型、默认值和校验规则。

### 方法

每个方法接收一个选项对象，返回 `ControlDefinition<T>`。

| 方法 | 值类型 | 未声明 defaultValue 时 | 默认编辑方式 |
| --- | --- | --- | --- |
| `text(options)` | `string` | `""` | 单行输入，可插入变量。 |
| `textarea(options)` | `string` | `""` | 多行输入，可插入变量。 |
| `richText(options)` | `string` | `"<p></p>"` | 富文本 HTML，继承主体排版。 |
| `html(options)` | `string` | `""` | HTML 源码编辑器。 |
| `url(options)` | `string` | `""` | URL 输入、协议校验、变量插入。 |
| `image(options)` | `string` | `""` | 图片 URL、预览及可选资源选择器。 |
| `number(options)` | `number` | `0` | 数字输入。 |
| `color(options)` | `string` | `""` | 颜色选择。 |
| `select(options)` | `string` | `""` | 下拉选项，包含可清空的空选项；空选项文案使用 placeholder，默认 None。 |
| `boolean(options)` | `boolean` | `false` | 复选框。 |
| `list(options)` | 子控件值对象数组 | `[]` | 新增、删除、上移、下移，可嵌套。额外必填 `controls`。 |
| `custom(options)` | `read()` 返回类型 | 必须显式提供 | 自定义 React 控件。额外必填 `defaultValue/read/component`。 |

### 参数：ControlOptions

| 参数 | 类型 | 用途 |
| --- | --- | --- |
| `label` | `string`，必填 | 控件标签。 |
| `defaultValue` | `T` | 新节点及缺失值的默认值；可变数据独立深拷贝。 |
| `placeholder` | `string` | 支持输入提示的控件使用。 |
| `options` | `{ label: string; value: string }[]` | select 选项。 |
| `rows` | `number` | textarea / HTML 编辑器行数；textarea 默认 4 行。 |
| `min/max` | `number` | number 数值范围或 list 条目数限制。 |
| `step` | `number` | number 输入步长；不作为独立校验约束。 |
| `unit` | `string` | 输入标签的单位提示；不写进控件值，不自动拼接 CSS 单位。 |
| `profile` | `"text" \| "heading" \| "button"` | 富文本编辑能力。 |
| `inline` | `boolean` | richText 在默认画布直接编辑；复合布局使用 Canvas。 |
| `component` | `ComponentType<ControlComponentProps<T>>` | 替换该控件的默认 React 编辑组件。 |
| `validate` | `(value: T) => string \| undefined` | 接收归一化值，返回非空错误文本或 `undefined`。 |

`list` 额外接收 `controls: ControlSchema`，声明每行的子控件。`custom` 额外接收纯函数 `read: (value: unknown) => T`，解析未知持久化值；值必须可 JSON 持久化，不存 React 节点、函数或编辑器实例。

### 默认值、读取和校验

- 默认值只补 `undefined`，保留空字符串、`0`、`false`。字符串类将 `null` 归一化为 `""`；数字类将非法输入转换为 `NaN` 并校验失败；布尔类只接受真正的 boolean，其余归一化为 `false`；非数组列表归一化为 `[]`。
- 每次构建上下文时读取一次，渲染、组件和校验复用结果；`read()` 应为纯函数。列表行未声明的业务 ID、元数据会保留。
- number 必须有限且满足 `min/max`；非空 select 必须属于 `options`；URL/图片校验协议；list 的 `min/max` 限制条目数，递归校验子控件。
- 空 URL 和空 select 默认可选，必填使用业务 `validate()`。检查器显示错误，草稿可保留无效值，邮件导出拒绝输出；预览走邮件渲染，也会校验。

### 返回值：ControlDefinition

| 字段 | 作用 |
| --- | --- |
| `kind` | 控件类型，例如 `text`、`richText`、`list`。 |
| `defaultValue` | 已解析的默认值。 |
| `read(value)` | 从未知值归一化为控件值类型。 |
| `validateValue(value)` | 对已归一化值执行内置及业务约束，不重复调用 read。 |
| `renderControl(props)` | 通过 component 生成的自定义控件渲染入口，可选。 |
| `itemControls` | list 的子控件 schema，可选。 |
| 其他元数据 | 保留 label、placeholder、options、profile 等声明配置。 |

### 示例：自定义值类型

```tsx
import { TextInput, type ControlComponentProps } from "@standhigher/react-email-editor";

function TagInput({ value, onChange, label }: ControlComponentProps<string[]>) {
  return <label>{label}<TextInput value={value.join(", ")} onChange={(event) => onChange(event.target.value.split(",").map((tag) => tag.trim()))} /></label>;
}

const tags = EmailControls.custom<string[]>({
  label: "标签",
  defaultValue: [],
  read: (value) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [],
  component: TagInput,
});
```

## 4. 自定义 React 编辑组件

### 单个控件：component

```tsx
import { TextInput, type ControlComponentProps } from "@standhigher/react-email-editor";

function CouponInput({ value, onChange, label }: ControlComponentProps<string>) {
  return <label>{label}<TextInput value={value} onChange={(event) => onChange(event.target.value.toUpperCase())} /></label>;
}

const code = EmailControls.text({ label: "优惠码", component: CouponInput });
```

| Props | 作用 |
| --- | --- |
| `value` | 当前控件值。 |
| `onChange(value)` | 提交该控件新值。 |
| `label` | 控件名称。 |
| `body` | 主体配置。 |
| `variables` | 可用模板变量。 |

组件接收独立的 value、body 和 variables 快照，可以使用 Hook；异步业务自行处理 loading、error/retry、empty 和卸载取消。图片使用统一 `pickImage` 适配器时已有相应状态处理：返回 null 取消、抛错显示重试、卸载时取消 signal 并忽略过期结果。列表异步更新按稳定行标识合并到最新数据，保留等待期间的其它编辑及排序，已删除的行不再接收结果。

### Canvas / Inspector

```tsx
import {
  ControlEditor, EditableRichText,
  type ControlValues, type PluginEditorProps,
} from "@standhigher/react-email-editor";

const cardControls = {
  title: EmailControls.text({ label: "标题", defaultValue: "新品" }),
  description: EmailControls.richText({ label: "说明" }),
  footer: EmailControls.richText({ label: "页脚" }),
};
type CardValues = ControlValues<typeof cardControls>;

function CardCanvas({ controls }: PluginEditorProps<CardValues>) {
  return <div>
    <strong>{controls.title}</strong>
    <EditableRichText control="description" />
    <EditableRichText control="footer" />
  </div>;
}

function CardInspector() {
  return <>
    <ControlEditor control="title" />
    <ControlEditor control="description" />
    <ControlEditor control="footer" />
  </>;
}

const card = defineBlock({
  type: "my-app.card", title: "卡片", controls: cardControls,
  Canvas: CardCanvas, Inspector: CardInspector,
  renderEmail: ({ controls, email }) => email.html`
    <h2>${controls.title}</h2>
    ${email.richText(controls.description)}
    ${email.richText(controls.footer)}
  `,
});
```

`Canvas` / `Inspector` 接收 `PluginEditorProps<ControlValues<Schema>>`：

| Props | 含义和作用 |
| --- | --- |
| `block/controls/style/body` | 节点、归一化控件值、区块样式及主体配置的快照；通过更新方法提交变化。 |
| `variables` | 模板变量。 |
| `selected` | 当前区块是否选中；Inspector 中为 true。 |
| `renderedHtml` | Canvas 中为已解析模板的内部 HTML；Inspector 中为空字符串。 |
| `select()` | 请求选中区块；Inspector 中无需再次选择。 |
| `setControl(name, value)` | 类型安全地修改单个控件值。 |
| `setControls(patch)` | 浅合并多个控件值，一次文档更新、一次 onChange；嵌套对象提交完整新值。 |
| `setStyle(id, value)` | 按样式路径修改，例如 `setStyle("dimension.padding", "12px")`。 |

`ControlEditor` 只接收 `control: string`，复用已经声明的控件、校验和资源适配器。`EditableRichText` 接收必填 `control`、可选 `profile/placeholder`，自动接入控件更新、选区、工具栏、变量及主体排版，只能绑定 richText 控件。两者只在区块 Canvas / Inspector 内使用。

单个 `richText({ inline: true })` 会让默认画布整体使用该编辑区域，并从默认检查器中移除该控件；它不会把富文本插入 renderEmail 布局中的某个位置。多个 inline 区域必须声明 Canvas，否则定义时报错。声明 Canvas 后编辑区域完全由该组件组合。

## 5. 样式控件与检查器分组

### 示例

```ts
import { createDimensionControls } from "@standhigher/react-email-editor";

const spacing = createDimensionControls({ padding: { defaultValue: "12px" } });
// 下面的配置可传给 defineBlock：
const layoutBlock = defineBlock({
  type: "my-app.layout",
  title: "布局",
  controls: { title: EmailControls.text({ label: "标题" }) },
  containerStyles: false,
  styleControls: [spacing.padding, spacing.margin],
  inspectorSections: [{
    title: "内容和间距",
    controlNames: ["title"],
    styleIds: ["dimension.padding", "dimension.margin"],
  }],
  renderEmail: ({ controls, email }) => email.html`<p>${controls.title}</p>`,
});
```

`createDimensionControls()`、`createDecorationControls()`、`createTypographyControls()` 返回按能力名称索引的样式配置对象。可传入按名称索引的覆盖配置，再挑选需要的项放入 styleControls。

| StyleControlConfig 字段 | 作用 |
| --- | --- |
| `id` | 样式存取路径，例如 `dimension.padding`、`typography.fontSize`、`element.width`。 |
| `group` | `general/dimension/typography/decorations`，决定默认检查器分组。 |
| `label` | 控件名称。 |
| `control` | `text/color/alignment/select/number/range/spacing/corners`。 |
| `options` | 下拉选项。 |
| `unit/units` | 单位后缀或可选单位列表；单位应符合邮件 CSS 的限制。 |
| `min/max/step` | 数字、滑块等控件参数。 |
| `defaultValue` | 字符串默认样式值，低于 defaultStyle 优先级。 |
| `placeholder` | 输入提示。 |

`id/group/label/control` 必填，其余可选。

| BlockInspectorSection 字段 | 作用 |
| --- | --- |
| `title` | 必填分组标题。 |
| `controlNames` | 内容控件名称，按顺序显示。 |
| `styleIds` | 样式控件 ID，按顺序显示。 |
| `advancedStyleIds` | 放进折叠区的样式控件 ID。 |

主体配置存于 body；容器样式存于 style.dimension/decorations；按钮、图片等元素样式存于 style.element；显式富文本格式保存在 controls 中的 HTML 字符串。只读取区块启用的样式。自定义元素的样式需要在 renderEmail 中实际应用。

## 6. 邮件渲染工具：email

```ts
renderEmail: ({ controls, email }) => email.html`
  <p>${controls.title}</p>
  ${email.richText(controls.description)}
  ${email.button({ href: controls.url, label: "查看详情" })}
`
```

| 方法 | 作用 |
| --- | --- |
| `email.html` 标签模板 | 转义普通插值，支持嵌入 EmailMarkup 片段及片段数组；Go template token 保留。 |
| `email.raw(html)` | 显式插入原始 HTML，不消毒。 |
| `email.richText(html)` | 保留富文本显式格式，补充主体默认段落、列表和链接样式。 |
| `email.table(rows)` | 由 EmailMarkup 二维数组生成邮件表格。 |
| `email.image({ src, alt?, width? })` | 图片输出，校验协议、归一化宽度，默认 100%。 |
| `email.button({ href, label })` | 邮件表格按钮，校验协议，空或无效地址不生成链接。 |
| `email.url(value, image?)` | 返回允许的 URL，无效时返回空字符串；image 默认为 false。 |

链接允许 http/https/mailto/tel、锚点或模板；图片允许 http/https/cid 或模板。自行拼接属性时先用 email.url() 校验协议，再进行属性转义。返回普通字符串时转义由插件负责；原始 HTML、富文本和模板预览均不是任意不可信内容的安全沙箱。

## 7. 文档、错误与公开类型

节点使用 `EmailBlockNode`，包含必填 id、type、controls，以及可选 style、defaultData。文档使用 `EmailDocument`，包含 version、body、blocks 和可选 subject。保存 JSON 后重新加载时，仍需注册同 type 的插件，JSON 不保存组件或渲染函数。

新建文档的格式标识为 **4**。`version` 类型为 `number`，只做标识；接入依据实际数据结构，并保留传入的版本号。全链路使用 controls，不提供旧 API 别名、旧数据兼容或自动迁移；仅修改旧 JSON 的版本号不能让缺失 controls 的节点通过结构检查。请用 createEmailDocument() 和 config.createBlock() 创建新数据。

缺少插件时画布显示占位并保留原始节点，邮件导出报错。Canvas、Inspector 及画布渲染异常按区块隔离并提供重试；邮件渲染错误包含区块 type、id 和原因。getData()/getDocument() 和 onChange/onBodyChange 参数均为独立快照。

| 公开类型 | 用途 |
| --- | --- |
| `ControlKind/ControlDefinition<T>/ControlOptions<T>` | 控件类型、工厂返回值与参数。 |
| `ControlSchema/ControlValues<Schema>` | 控件 schema 与推导后的值对象。 |
| `ControlComponentProps<T>` | 单控件 React 编辑组件。 |
| `BlockPlugin/BlockPluginOptions` | 区块定义及声明参数。 |
| `PluginEditorProps/PluginRenderContext` | 编辑组件 Props / 邮件渲染上下文。 |
| `EmailEditorConfig/UseEmailEditorConfigOptions` | 注册配置及参数。 |
| `ImagePickerContext/ValidationIssue` | 图片资源适配器 / 校验结果。 |
| `ControlOption/StyleControlConfig/BlockInspectorSection` | 选项 / 样式控件 / 检查器分组。 |
| `ControlEditorProps/EditableRichTextProps` | 控件复用和富文本编辑组件 Props。 |
| `EmailMarkup/EmailTools` | 邮件片段及工具集。 |

编辑器 Hooks、实例方法、body 和 variables 的完整接入见 [API 参考](./api.zh-CN.md)，业务集成见[复杂场景](./advanced-examples.zh-CN.md)。可运行示例见 [优惠券](../playground/plugins/coupon.ts)、[商品卡片](../playground/plugins/product.ts)及[统一配置](../playground/plugins/config.ts)。
