# 复杂场景示例

[English](./advanced-examples.md) | [API 参考](./api.zh-CN.md) | [基础场景](./basic-examples.zh-CN.md)

每段标注文件名的代码保存为独立文件；引入一次包样式。业务请求通过 Props 注入，示例不会假设你的后端路径。

## 1. 校验后异步保存

校验可提前展示控件错误，导出仍需捕获插件渲染异常。调用方实现 `saveDocument(data)`，返回保存完成的 Promise；失败会显示可重试状态。

```tsx
// ValidatedEditor.tsx
import { useState } from "react";
import {
  EmailEditor, useEmailEditor, type EmailEditorData,
} from "@standhigher/react-email-editor";

interface ValidatedEditorProps {
  saveDocument: (data: EmailEditorData) => Promise<void>;
}

export function ValidatedEditor({ saveDocument }: ValidatedEditorProps) {
  const editor = useEmailEditor();
  const [status, setStatus] = useState("尚未保存");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const issues = editor.validate();
      if (issues.length) {
        setStatus(issues.map((issue) => `${issue.controlPath}: ${issue.message}`).join("；"));
        return;
      }
      const data = editor.getData();
      await saveDocument(data);
      setStatus("本次快照已保存；保存期间的后续编辑需再次保存");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "保存失败，请重试");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <EmailEditor editor={editor} height={720} />
      <button type="button" disabled={saving} onClick={save}>{saving ? "保存中…" : "保存 / 重试"}</button>
      <output aria-live="polite">{status}</output>
    </>
  );
}
```

`getData()` 同时生成模板与预览 HTML；只需要草稿 JSON 时使用 `getDocument()`，不会因无效控件或模板渲染阻止草稿持久化。保存期间编辑器仍可编辑，保存结果对应点击时的独立快照。

## 2. 多实例共享配置，局部订阅文档

```tsx
// DocumentSummary.tsx
import { useEmailEditorState, type EmailEditorInstance } from "@standhigher/react-email-editor";

interface DocumentSummaryProps {
  editor: EmailEditorInstance;
}

export function DocumentSummary({ editor }: DocumentSummaryProps) {
  const { document } = useEmailEditorState(editor);
  return <output>{document.blocks.length} 个区块</output>;
}
```

```tsx
// ComparisonEditors.tsx
import { EmailEditor, useEmailEditor, useEmailEditorConfig } from "@standhigher/react-email-editor";
import { DocumentSummary } from "./DocumentSummary";

const builtins = ["heading", "text", "button", "image"];

export function ComparisonEditors() {
  const config = useEmailEditorConfig({ builtins });
  const left = useEmailEditor({ config, body: { contentWidth: 640 } });
  const right = useEmailEditor({ config, body: { contentWidth: 480 } });
  return (
    <>
      <DocumentSummary editor={left} /><EmailEditor editor={left} height={600} />
      <DocumentSummary editor={right} /><EmailEditor editor={right} height={600} />
    </>
  );
}
```

两个实例的文档、选择、重置互相独立。仅摘要组件订阅文档变化。共享配置定义区块能力，不共享可变文档。

## 3. 业务区块、多区域富文本与列表

以下商品推荐区块同时包含两个富文本编辑区和一个商品列表。控件声明是类型和默认值的唯一来源；Canvas 负责编辑布局，`renderEmail` 负责邮件 HTML。

```ts
// recommendation-controls.ts
import { EmailControls, type ControlValues } from "@standhigher/react-email-editor";

export const recommendationControls = {
  intro: EmailControls.richText({ label: "介绍", defaultValue: "<p>本周推荐</p>" }),
  footer: EmailControls.richText({ label: "结语", defaultValue: "<p>谢谢订阅</p>" }),
  products: EmailControls.list({
    label: "商品", min: 1, max: 8,
    controls: {
      name: EmailControls.text({ label: "名称", validate: (value) => value.trim() ? undefined : "请填写名称" }),
      image: EmailControls.image({ label: "图片" }),
      url: EmailControls.url({ label: "链接" }),
    },
    defaultValue: [{ name: "示例商品", image: "", url: "https://example.com/product" }],
  }),
};
export type RecommendationValues = ControlValues<typeof recommendationControls>;
```

```tsx
// RecommendationCanvas.tsx
import { EditableRichText, type PluginEditorProps } from "@standhigher/react-email-editor";
import type { RecommendationValues } from "./recommendation-controls";

export function RecommendationCanvas({ controls }: PluginEditorProps<RecommendationValues>) {
  return (
    <div>
      <EditableRichText control="intro" />
      <ul>{controls.products.map((product, index) => <li key={index}>{product.name}</li>)}</ul>
      <EditableRichText control="footer" />
    </div>
  );
}
```

```tsx
// RecommendationInspector.tsx
import { ControlEditor } from "@standhigher/react-email-editor";

export function RecommendationInspector() {
  return <ControlEditor control="products" />;
}
```

```ts
// recommendation.ts
import { defineBlock } from "@standhigher/react-email-editor";
import { recommendationControls } from "./recommendation-controls";
import { RecommendationCanvas } from "./RecommendationCanvas";
import { RecommendationInspector } from "./RecommendationInspector";

export const recommendation = defineBlock({
  type: "shop.recommendation",
  title: "商品推荐",
  controls: recommendationControls,
  Canvas: RecommendationCanvas,
  Inspector: RecommendationInspector,
  defaultStyle: { dimension: { padding: "16px" } },
  renderEmail: ({ controls, email }) => email.html`
    ${email.richText(controls.intro)}
    ${controls.products.map((product) => email.html`
      <p><strong>${product.name}</strong></p>
      ${product.image ? email.image({ src: product.image, alt: product.name }) : email.raw("")}
      ${email.button({ href: product.url, label: "查看商品" })}
    `)}
    ${email.richText(controls.footer)}
  `,
});
```

```tsx
// RecommendationEditor.tsx
import { useMemo, useState } from "react";
import {
  createEmailDocument, EmailEditor, useEmailEditor, useEmailEditorConfig,
} from "@standhigher/react-email-editor";
import { recommendation } from "./recommendation";

const plugins = [recommendation];

export function RecommendationEditor() {
  const config = useEmailEditorConfig({ plugins });
  const initialDocument = useMemo(
    () => createEmailDocument([config.createBlock(recommendation.type)]),
    [config],
  );
  const editor = useEmailEditor({ config, initialDocument });
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");

  function exportHtml() {
    try {
      // 同一配置也可供不挂载 UI 的导出流程使用。
      setHtml(config.toHtml(editor.getDocument()));
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "导出失败");
    }
  }
  return (
    <>
      <EmailEditor editor={editor} height={720} />
      <button type="button" onClick={exportHtml}>导出</button>
      {error ? <p role="alert">{error}</p> : null}
      <pre>{html}</pre>
    </>
  );
}
```

`config.toHtml()` 和编辑器共用同一注册表，保存 JSON 后再加载也必须注册该插件。列表编辑由 `ControlEditor` 提供增加、删除及子控件编辑；Canvas 的列表只展示商品名称。业务选择器一次填充多个关联字段可使用 `PluginEditorProps.setControls(patch)`，嵌套列表提交完整数组。

## 4. 接入已有图片资源选择器

```tsx
// ResourceEditor.tsx
import { useCallback } from "react";
import {
  EmailEditor, useEmailEditor, useEmailEditorConfig, type ImagePickerContext,
} from "@standhigher/react-email-editor";

interface ResourceEditorProps {
  openLibrary: (request: { currentUrl: string; signal: AbortSignal }) => Promise<string | null>;
}

export function ResourceEditor({ openLibrary }: ResourceEditorProps) {
  const pickImage = useCallback(
    ({ value, signal }: ImagePickerContext) => openLibrary({ currentUrl: value, signal }),
    [openLibrary],
  );
  const config = useEmailEditorConfig({ pickImage });
  const editor = useEmailEditor({ config });
  return <EmailEditor editor={editor} height={720} />;
}
```

调用方的资源库应处理弹窗、搜索、空结果、上传与取消；传入 signal 给网络请求。返回允许协议的地址，返回 null 表示取消，抛错由编辑器显示重试。编辑器对图片请求提供 loading/error/retry，忽略过期结果，卸载时取消请求。

## 5. 批量模板数据与单区块预览

```ts
// template-preview.ts
import {
  BLOCK_TYPES, blockToHtml, createBlockNode, createEmailDocument, documentToHtml,
  mergeTemplateData, type Variable,
} from "@standhigher/react-email-editor";

const block = createBlockNode(BLOCK_TYPES.html);
if (!block) throw new Error("HTML 区块未注册");
block.controls.html = `<p>你好，{{.customer}}</p>
  {{range .products}}<p>{{.name}}</p>{{end}}`;
const variables: Variable[] = [{ name: "{{.customer}}", value: "李小明" }];
const templateData = { products: [{ name: "茶叶" }, { name: "咖啡" }] };
const document = createEmailDocument([block]);

export const template = documentToHtml(document, undefined, { variables });
export const preview = documentToHtml(document, undefined, {
  variables, templateData, resolveHtmlTemplates: true,
});
export const fragment = blockToHtml(block, undefined, "email", {
  resolveHtmlTemplate: true,
  templateData: mergeTemplateData(variables, { ...templateData, ...block.defaultData }),
});
```

完整文档自动按顶层浅合并 `variables → templateData → block.defaultData`，后者优先。预览和发送会先按变量清单补点，存储中的模板原文保持不变；单区块不会自动合并变量，示例显式合并，并使用单数 `resolveHtmlTemplate`。真实发送端的模板引擎由应用决定；默认预览仅支持基础语法，完整 Go 语义通过 `templateEngine` 注入。

## 自定义模板引擎与独立预览

完整说明与接入示例见 [模板预览与自定义引擎](https://github.com/standhigher/react-email-editor/blob/main/docs/template-engines.zh-CN.md)。
