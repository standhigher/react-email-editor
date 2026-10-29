import "./helpers/source-modules.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { act, create } from "react-test-renderer";

const { Stage } = await import("../src/stage/Stage.tsx");
const { buildEmailEditorConfig } = await import("../src/plugins/config.ts");
const { createEmailDocument } = await import("../src/document/create-document.ts");

function fixture(t, templateEngine, { variables = [], template, defaultData } = {}) {
  const config = buildEmailEditorConfig({ templateEngine });
  const block = config.createBlock("html");
  block.controls.html = template ?? '{{if eq .status "ready"}}YES{{else}}NO{{end}}';
  block.defaultData = defaultData ?? { status: "ready" };
  const document = createEmailDocument([block]);
  let session = { document, config, definitions: config.definitions, variables, selectedId: null };
  const tree = (viewMode) => createElement(Stage, { session, viewMode, device: "desktop" });
  let renderer;
  act(() => { renderer = create(tree("edit")); });
  t.after(() => act(() => renderer.unmount()));
  return {
    renderer,
    document,
    update(viewMode, engine = session.config.templateEngine) {
      const next = buildEmailEditorConfig({ templateEngine: engine });
      session = { ...session, config: next, definitions: next.definitions };
      act(() => renderer.update(tree(viewMode)));
    },
  };
}

test("画布和预览 iframe 共用配置引擎，切换引擎刷新展示并保留模板", (t) => {
  const calls = [];
  const makeEngine = (name) => ({ render(template, data) {
    calls.push({ template, data });
    return `<p>${name}:YES &amp; done</p>`;
  } });
  const view = fixture(t, makeEngine("First"));
  let frame = view.renderer.root.findByType("iframe");
  assert.equal(frame.props.title, "HTML block preview");
  assert.match(frame.props.srcDoc, /First:YES &amp; done/);
  assert.deepEqual(calls[0].data, { status: "ready" });
  assert.ok(calls[0].template.includes('{{if eq .status "ready"}}'));
  view.update("preview");
  frame = view.renderer.root.findByType("iframe");
  assert.equal(frame.props.title, "Email preview");
  assert.match(frame.props.srcDoc, /First:YES &amp; done/);
  const second = makeEngine("Second");
  view.update("preview", second);
  assert.match(view.renderer.root.findByType("iframe").props.srcDoc, /Second:YES &amp; done/);
  view.update("edit");
  assert.match(view.renderer.root.findByType("iframe").props.srcDoc, /Second:YES &amp; done/);
  assert.equal(view.document.blocks[0].controls.html, '{{if eq .status "ready"}}YES{{else}}NO{{end}}');
});

test("画布与预览交给外部引擎的变量 token 和发送 HTML 一致", (t) => {
  const template = "{{  store_name }}|{{- 客户名 -}}";
  const variables = [{ name: "{{  store_name }}", value: "Shop" }, { name: "{{- 客户名 -}}", value: "张三" }];
  const sources = [];
  const view = fixture(t, { render(source, values) {
    sources.push(source);
    assert.ok(source.includes("{{  .store_name }}|{{- .客户名 -}}"));
    assert.deepEqual(values, { store_name: "Shop", 客户名: "张三" });
    return "<p>Shop|张三</p>";
  } }, { variables, template, defaultData: {} });
  assert.match(view.renderer.root.findByType("iframe").props.srcDoc, /Shop\|张三/);
  view.update("preview");
  assert.match(view.renderer.root.findByType("iframe").props.srcDoc, /Shop\|张三/);
  assert.equal(sources.length, 2);
  assert.equal(view.document.blocks[0].controls.html, template);
});

test("非 Error 异常显示有效错误消息，Retry 和更换引擎可以恢复", (t) => {
  t.mock.method(console, "error", () => {});
  for (const thrown of ["Adapter failed", { reason: "Failure" }, null, "", false]) {
    let failing = true;
    const engine = { render() { if (failing) throw thrown; return "<p>Recovered</p>"; } };
    const view = fixture(t, engine);
    assert.ok(view.renderer.root.findByProps({ role: "alert" }).findByType("p").children.join("").length > 0);
    failing = false;
    const retry = view.renderer.root.findAllByType("button").find((button) => button.children.includes("Retry"));
    act(() => retry.props.onClick());
    assert.match(view.renderer.root.findByType("iframe").props.srcDoc, /Recovered/);
    failing = true;
    view.update("preview");
    assert.ok(view.renderer.root.findByProps({ role: "alert" }).findByType("p").children.join("").length > 0);
    view.update("preview", { render: () => "<p>New engine</p>" });
    assert.match(view.renderer.root.findByType("iframe").props.srcDoc, /New engine/);
  }
});

test("外部引擎失败显示现有错误与重试，替换引擎后画布和预览可恢复", (t) => {
  // React 错误边界会记录预期的渲染异常。
  t.mock.method(console, "error", () => {});
  const failed = { render() { throw new Error("Template engine unavailable"); } };
  const recovered = { render: () => "<p>Recovered</p>" };
  const view = fixture(t, failed);
  assert.ok(view.renderer.root.findByProps({ role: "alert" }));
  assert.equal(view.renderer.root.findAllByType("iframe").length, 0);
  assert.ok(view.renderer.root.findAllByType("button").some((button) => button.children.includes("Retry")));
  view.update("edit", recovered);
  assert.match(view.renderer.root.findByType("iframe").props.srcDoc, /Recovered/);
  view.update("preview", failed);
  assert.ok(view.renderer.root.findByProps({ role: "alert" }));
  view.update("preview", recovered);
  assert.match(view.renderer.root.findByType("iframe").props.srcDoc, /Recovered/);
});
