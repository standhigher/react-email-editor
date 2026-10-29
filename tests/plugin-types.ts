import { useEmailEditorConfig, useEmailEditor, useEmailEditorState, defineBlock, EmailControls, blockToHtml, renderBlockContent } from "../src/index";
import { renderTemplatePreview, validateTemplate, defaultTemplateEngine } from "../src/index";
import type { TemplateEngine, TemplateValidationIssue } from "../src/index";

const templateEngine: TemplateEngine = {
  render: (_template, data) => String(data.name ?? ""),
  validate: () => [],
};
const templateIssues: TemplateValidationIssue[] | undefined = validateTemplate("{{.name}}", { templateEngine });
renderTemplatePreview("{{.name}}", { name: "Ada" }, { templateEngine });
// @ts-expect-error 模板接口保持同步，不接受异步引擎。
const asyncTemplateEngine: TemplateEngine = { render: async () => "" };
void templateIssues; void asyncTemplateEngine;

// @ts-expect-error 旧配置工厂已移除，不提供别名。
type RemovedConfigFactory = typeof import("../src/index").createEmailEditorConfig;
// @ts-expect-error 旧 ref 类型已移除。
type RemovedHandle = import("../src/index").EmailEditorHandle;
// @ts-expect-error 配置参数只使用当前 Hook 类型。
type RemovedConfigOptions = import("../src/index").EmailEditorConfigOptions;
void (undefined as unknown as RemovedConfigFactory | RemovedHandle | RemovedConfigOptions);

const plugin = defineBlock({
  type: "test.typed",
  title: "Typed",
  controls: {
    title: EmailControls.text({ label: "Title" }),
    count: EmailControls.number({ label: "Count" }),
    enabled: EmailControls.boolean({ label: "Enabled" }),
    rows: EmailControls.list({ label: "Rows", controls: { name: EmailControls.text({ label: "Name" }) } }),
  },
  Canvas: ({ controls, setControl, setControls }) => {
    controls.title.toUpperCase();
    controls.count.toFixed(2);
    controls.rows[0]?.name.toLowerCase();
    setControl("enabled", false);
    setControls({ title: "Updated", count: 3, enabled: false, rows: [{ name: "Item" }] });
    // @ts-expect-error 批量更新同样检查字段值类型。
    setControls({ count: "wrong" });
    // @ts-expect-error 批量更新不能包含未声明的字段。
    setControls({ missing: true });
    // @ts-expect-error 字段值类型由字段声明推导，不能写入字符串。
    setControl("count", "wrong");
    // @ts-expect-error 不存在的字段不能更新。
    setControl("missing", 1);
    return null;
  },
  renderEmail: ({ controls, email }) => {
    // @ts-expect-error 字符串字段不能当作数字使用。
    controls.title.toFixed(2);
    return email.html`${controls.count.toFixed(2)} ${controls.rows.map((item) => item.name)}`;
  },
});

function useTypeContract() {
  const config = useEmailEditorConfig({ plugins: [plugin], templateEngine });
  const normalizedEngine: TemplateEngine = config.templateEngine;
  void normalizedEngine;
  const editor = useEmailEditor({ config });
  config.toHtml(editor.getDocument(), { resolveHtmlTemplates: true, templateEngine: defaultTemplateEngine });
  const state = useEmailEditorState(editor);
  const props: import("../src/index").EmailEditorProps = { editor, height: 720 };
  editor.setDocument(editor.getDocument());
  // 文档版本是数字标识，不再限定为字面量 4。
  editor.setDocument({ ...editor.getDocument(), version: 5 });
  // @ts-expect-error 版本标识仍要求数字。
  editor.setDocument({ ...editor.getDocument(), version: "5" });
  editor.reset();
  editor.validate();
  // @ts-expect-error 配置公开列表只读，不支持移除已注册插件。
  config.definitions.splice(0, 1);
  // @ts-expect-error 区块库只读，不支持直接追加。
  config.library.push(plugin);
  // @ts-expect-error 订阅文档及其嵌套数据为只读。
  // oxlint-disable-next-line react/immutability -- 负向类型契约刻意验证 Hook 快照不能写入。
  state.document.body.contentWidth = 700;
  // @ts-expect-error 订阅区块列表为只读。
  state.document.blocks.push(config.createBlock(plugin.type));
  // @ts-expect-error 组件只接收实例，不接受旧状态 Props。
  const oldProps: import("../src/index").EmailEditorProps = { editor, initialDocument: editor.getDocument() };
  // @ts-expect-error 必须明确传入编辑器实例。
  const missingEditor: import("../src/index").EmailEditorProps = { height: 720 };
  // @ts-expect-error 组件不接受 ref。
  const refProps: import("../src/index").EmailEditorProps = { editor, ref: { current: editor } };
  // @ts-expect-error 配置只能传给 useEmailEditor，不能传给组件。
  const configProps: import("../src/index").EmailEditorProps = { editor, config };
  // @ts-expect-error 组件不再接收旧 blocks Prop。
  const blocksProps: import("../src/index").EmailEditorProps = { editor, blocks: [plugin] };
  const block = config.createBlock(plugin.type);
  blockToHtml(block, config.definitions, "email", { resolveHtmlTemplate: true, templateEngine });
  renderBlockContent(block, config.definitions, "canvas", { resolveHtmlTemplate: true, templateEngine });
  // @ts-expect-error 渲染参数只接受配置对象，拒绝旧 boolean 参数。
  blockToHtml(block, config.definitions, "email", true);
  // @ts-expect-error 内容渲染同样拒绝旧 boolean 参数。
  renderBlockContent(block, config.definitions, "email", false);
  void props; void oldProps; void missingEditor; void refProps; void configProps; void blocksProps;
}
void useTypeContract;
