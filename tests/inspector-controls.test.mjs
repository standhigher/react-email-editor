import { renderConfig } from "./helpers/render-config.mjs";
import "./helpers/source-modules.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import { createElement, useLayoutEffect, useState } from "react";
import { act, create } from "react-test-renderer";
import ShallowRenderer from "react-test-renderer/shallow.js";
import { EmailControls, resolveEmailBody } from "../dist/index.js";

const { ListControl } = await import("../src/inspector/components/ListControl.tsx");
const { ControlRenderer } = await import("../src/inspector/ControlRenderer.tsx");
const { RichTextControl } = await import("../src/inspector/components/RichTextControl.tsx");
const { BodyControls } = await import("../src/inspector/BodyControls.tsx");
const { EditorConfigContext } = await import("../src/plugins/editor-context.ts");

function listFixture(t) {
  let resolveImage;
  let signal;
  let values;
  let commits = 0;
  const config = renderConfig({ pickImage: (context) => {
    signal = context.signal;
    return new Promise((resolve) => { resolveImage = resolve; });
  } });
  const control = {
    ...EmailControls.list({ label: "Products", controls: {
      name: EmailControls.text({ label: "Name" }), image: EmailControls.image({ label: "Image" }),
    } }), name: "products",
  };
  function Harness() {
    const [items, setItems] = useState([{ name: "A", image: "" }, { name: "B", image: "" }]);
    useLayoutEffect(() => { values = items; }, [items]);
    return createElement(EditorConfigContext.Provider, { value: config }, createElement(ListControl, {
      control, value: items, body: resolveEmailBody(), variables: [],
      onChange: (next) => { commits++; setItems(structuredClone(next)); },
    }));
  }
  let renderer;
  act(() => { renderer = create(createElement(Harness)); });
  t.after(() => act(() => renderer.unmount()));
  const button = (label) => renderer.root.findAllByType("button").find((node) => node.props["aria-label"] === label || node.children.join("") === label);
  const changeName = (index, name) => act(() => renderer.root.findAllByType(ControlRenderer).filter((node) => node.props.control.name === "name")[index].findByType("input").props.onChange({ target: { value: name } }));
  const chooseImage = () => act(() => { button("Choose image").props.onClick(); });
  const finishImage = async () => act(async () => { resolveImage("https://example.com/chosen.png"); await Promise.resolve(); });
  return { renderer, button, changeName, chooseImage, finishImage, values: () => values, commits: () => commits, signal: () => signal };
}

test("图片选择等待期间的其它编辑与排序在异步返回后保留", async (t) => {
  const fixture = listFixture(t);
  fixture.chooseImage();
  fixture.changeName(1, "B edited");
  act(() => fixture.button("Move Products item 1 down").props.onClick());
  await fixture.finishImage();
  assert.deepEqual(fixture.values(), [{ name: "B edited", image: "" }, { name: "A", image: "https://example.com/chosen.png" }]);
  assert.equal(fixture.commits(), 3);
});

test("删除行后添加新行，不复用旧行标识或接收已取消的图片结果", async (t) => {
  const fixture = listFixture(t);
  fixture.chooseImage();
  const stale = fixture.renderer.root.findAllByType(ControlRenderer).find((node) => node.props.control.name === "image").props.onChange;
  act(() => fixture.button("Remove Products item 1").props.onClick());
  act(() => fixture.button("Add item").props.onClick());
  const commits = fixture.commits();
  assert.equal(fixture.signal().aborted, true);
  act(() => stale("https://example.com/stale.png"));
  await fixture.finishImage();
  assert.deepEqual(fixture.values(), [{ name: "B", image: "" }, { name: "", image: "" }]);
  assert.equal(fixture.commits(), commits);
});

test("自定义控件修改 value、body 和 variables 不污染文档或宿主变量", () => {
  const body = resolveEmailBody();
  const variables = [{ name: "{{ name }}", value: "Original" }];
  const value = { tags: ["Original"] };
  const before = structuredClone({ body, variables, value });
  const control = { ...EmailControls.custom({
    label: "Tags", defaultValue: value, read: (source) => source,
    component: (props) => {
      props.value.tags.push("Changed"); props.body.contentWidth = 999;
      props.variables[0].value = "Changed";
      return null;
    },
  }), name: "tags" };
  let renderer;
  act(() => { renderer = create(createElement(ControlRenderer, { control, body, variables, value, onChange: () => {} })); });
  act(() => renderer.unmount());
  assert.deepEqual({ body, variables, value }, before);
});

test("可选下拉框显示空选项，选中后可以恢复空值，并保持标签关联", () => {
  let renderer;
  let value = "";
  const control = { ...EmailControls.select({ label: "Variant", options: [{ label: "Small", value: "small" }] }), name: "variant" };
  const render = () => createElement(ControlRenderer, { control, value, body: resolveEmailBody(), variables: [], onChange: (next) => { value = next; } });
  act(() => { renderer = create(render()); });
  const select = () => renderer.root.findByType("select");
  assert.equal(select().props.value, "");
  assert.equal(renderer.root.findAllByType("option")[0].props.value, "");
  assert.equal(renderer.root.findByType("label").props.htmlFor, select().props.id);
  act(() => select().props.onChange({ target: { value: "small" } }));
  act(() => renderer.update(render()));
  assert.equal(select().props.value, "small");
  act(() => select().props.onChange({ target: { value: "" } }));
  act(() => renderer.update(render()));
  assert.equal(select().props.value, "");
  act(() => renderer.unmount());
});

test("BODY 字体默认显示 Default，选择字体后可以恢复默认并保留显式 Arial", () => {
  let renderer;
  let body = resolveEmailBody();
  const render = () => createElement(BodyControls, {
    body, onChange: (patch) => { body = resolveEmailBody({ ...body, ...patch }); },
  });
  act(() => { renderer = create(render()); });
  const select = () => renderer.root.findAllByType("select").find((node) => node.props["aria-label"] === "Font family");
  assert.equal(select().props.value, "");
  assert.equal(select().findAllByType("option")[0].children.join(""), "Default");
  for (const value of ["Georgia, serif", "", "Arial, Helvetica, sans-serif", ""]) {
    act(() => select().props.onChange({ target: { value } }));
    act(() => renderer.update(render()));
    assert.equal(body.fontFamily, value);
    assert.equal(select().props.value, value);
  }
  act(() => renderer.unmount());
});

test("检查器富文本应用主体排版及链接变量，主体变化后同步更新", () => {
  const control = { ...EmailControls.richText({ label: "Message" }), name: "html" };
  let body = resolveEmailBody({ fontFamily: "Georgia, serif", textColor: "#123456", fontWeight: "bold", linkColor: "#654321", linkDecoration: "none" });
  const render = () => createElement(RichTextControl, { control, body, value: "<p>Message</p>", variables: [], onChange: () => {} });
  // 此处只挂载排版边界，TipTap 的 DOM 和工具栏交互由浏览器验证。
  const renderer = new ShallowRenderer();
  renderer.render(render());
  const contentStyle = () => renderer.getRenderOutput().props.children[1].props.style;
  assert.equal(contentStyle().fontFamily, body.fontFamily);
  assert.equal(contentStyle().fontSize, "16px");
  assert.equal(contentStyle().color, "#123456");
  assert.equal(contentStyle().fontWeight, "bold");
  assert.equal(contentStyle()["--ree-link-color"], "#654321");
  assert.equal(contentStyle()["--ree-link-decoration"], "none");
  body = resolveEmailBody({ fontFamily: "Arial, sans-serif", textColor: "#abcdef", linkColor: "#fedcba" });
  renderer.render(render());
  assert.equal(contentStyle().fontFamily, body.fontFamily);
  assert.equal(contentStyle().color, "#abcdef");
  assert.equal(contentStyle()["--ree-link-color"], "#fedcba");
  renderer.unmount();
});
