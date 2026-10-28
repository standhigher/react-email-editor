import { createEmailEditorConfig, defineBlock, EmailControls } from "../src/index";

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

const config = createEmailEditorConfig({ plugins: [plugin] });
// @ts-expect-error 配置公开列表只读，不支持移除已注册插件。
config.definitions.splice(0, 1);
// @ts-expect-error 区块库只读，不支持直接追加。
config.library.push(plugin);
// @ts-expect-error 旧 blocks 接入方式已移除。
const oldProps: import("../src/index").EmailEditorProps = { blocks: [plugin] };
void oldProps;
