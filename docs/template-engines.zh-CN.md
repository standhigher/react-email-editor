# 模板预览与自定义引擎

[English](https://github.com/standhigher/react-email-editor/blob/main/docs/template-engines.md) | 简体中文

通过 `useEmailEditorConfig({ templateEngine })` 注入同一个同步适配器，画布生成的 `renderedHtml`、编辑器预览、`getRenderedHtml()` 和 `getData().renderedHtml` 都使用该引擎。富文本编辑区域继续显示可编辑的模板原文。

```ts
interface TemplateEngine {
  render: (template: string, data: TemplateData) => string;
  validate?: (template: string) => TemplateValidationIssue[];
}

interface TemplateValidationIssue {
  message: string;
  offset?: number; // 从 0 开始的原始模板字符位置
}

interface TemplateEngineOptions {
  templateEngine?: TemplateEngine;
}
```

业务侧将自己的引擎包装为 `TemplateEngine`，包不额外安装完整 Go 引擎。`renderTemplatePreview(template, data?, { templateEngine })` 和 `validateTemplate(template, { templateEngine })` 使用相同的选择规则；省略引擎时使用公开的 `defaultTemplateEngine`。配置引用稳定时会复用；更换引擎对象会刷新展示与导出，不重置文档，也不触发文档变更回调。

- 引擎收到每个区块 `renderEmail` 生成的完整 HTML；预览与发送先按 `variables` 清单精确匹配 token 并补点，保留空白与 trim 标记，其他表达式原样传递，不先运行默认解析器。单独调用 `renderTemplatePreview()` 时则直接传入调用者的模板。区块分别执行，不能跨区块声明和引用局部变量。
- `TemplateData` 是键值对象；预览数据需可被 `structuredClone()` 复制。传给引擎的是独立副本，修改该副本不影响文档或调用方数据。
- 外部引擎负责函数、管道、作用域和 HTML 转义，包不再转义其返回值。应选择与后端一致的 `text/template` 或 `html/template` 语义及转义策略；仅注入适配器不保证不同引擎之间语义一致。
- 接口同步返回字符串，不支持 Promise。已有 `Error` 原样抛出，其他异常归一化为带原始 `cause` 和非空消息的 `Error`；渲染与校验遵循同一规则。界面使用现有错误提示及 Retry，不静默回退到默认引擎。显式 API 调用抛出异常。
- 默认引擎省略 `data` 时保留原文；显式配置外部引擎时，即使没有预览数据也调用它，并传入 `{}`。
- `validateTemplate()` 仅在显式调用时执行，返回诊断数组；`[]` 表示校验器未发现问题，`undefined` 表示所选引擎没有提供校验能力。默认引擎不提供 Go 语法校验；渲染、`editor.validate()` 和保存均不会自动执行模板校验。
- `getHtml()`、`getJson()` 和默认 `documentToHtml()` 保留模板；原有变量列表补点规则不变。引擎只在请求解析模板时运行。

默认引擎支持 `.field`、嵌套字段、当前上下文 `.`、根变量 `$` / `$.field`，以及历史支持的无点字段名；支持 `true/false/nil`、十进制数、JSON 兼容的双引号字符串，基础 `if/else if/else`、`range/else`、`with/else` 和 `{{- -}}` 空白裁剪。数组按顺序遍历，对象按键排序；`range/with` 切换当前上下文，`if` 保持上下文。缺失字段输出空字符串，普通插值做 HTML 转义。

字段名支持 Unicode 字母、数字和下划线，首字符为字母或下划线。条件中的 `null/undefined/false/0/空字符串`、空数组、无自有可枚举键的普通对象及空 `Map/Set` 为假；非空集合和其他对象（如 `Date`）为真。此处 `Map/Set` 仅约定条件真值，不扩展字段访问或遍历语义。

默认引擎不支持函数调用（含 `eq/ne/and/or/not/len/index/printf/html`）、管道、括号表达式、局部变量、模板定义/调用、注释和其他完整 Go 语法。输入包含不支持的语法或不完整的控制结构时，**保留该次渲染的完整输入，不执行部分替换**；编辑器中意味着保留对应区块的 HTML 模板。需要完整 Go 兼容性时接入外部引擎。

## 接入示例

业务侧把实际模板库封装为 `TemplateEngine`，再把同一个适配器用于编辑器和独立预览。下面示例的 `templateEngine` 由调用方提供：

```tsx
import {
  EmailEditor, useEmailEditor, useEmailEditorConfig,
  renderTemplatePreview, validateTemplate,
  type TemplateEngine, type TemplateData,
} from "@standhigher/react-email-editor";

interface EmailPageProps {
  templateEngine: TemplateEngine;
}

export function EmailPage({ templateEngine }: EmailPageProps) {
  const config = useEmailEditorConfig({ templateEngine });
  const editor = useEmailEditor({ config });
  return <EmailEditor editor={editor} height={720} />;
}

export function previewHtml(
  template: string,
  data: TemplateData,
  templateEngine: TemplateEngine,
) {
  return renderTemplatePreview(template, data, { templateEngine });
}

export function inspectTemplate(template: string, templateEngine: TemplateEngine) {
  return validateTemplate(template, { templateEngine });
}
```

`validateTemplate()` 返回 `undefined` 表示该引擎不提供校验，`[]` 表示校验器未发现问题。校验按需调用，不自动阻止保存。渲染以区块为单位；引擎负责转义，不支持异步返回。默认引擎不计算函数或管道，遇到未支持语法会保留完整输入。
