import assert from "node:assert/strict";
import test from "node:test";
import { createElement, useLayoutEffect } from "react";
import { act, create } from "react-test-renderer";
import { defineBlock, EmailControls, EmailEditor, useEmailEditor, useEmailEditorConfig, useEmailEditorState } from "../dist/index.js";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function fixture(t, { config, locale } = {}) {
  const changes = [];
  let editor;
  let state;
  function Harness({ locale }) {
    const instance = useEmailEditor({ config, onChange: (document) => changes.push(document) });
    const snapshot = useEmailEditorState(instance);
    useLayoutEffect(() => { editor = instance; state = snapshot; });
    return createElement(EmailEditor, { editor: instance, locale });
  }
  let view;
  t.after(() => act(() => view?.unmount()));
  const update = async (locale) => {
    await act(async () => {
      const tree = createElement(Harness, { locale });
      if (view) view.update(tree);
      else view = create(tree);
    });
  };
  return {
    mount: () => update(locale),
    update,
    editor: () => editor,
    state: () => state,
    changes,
    lang: () => view.root.findByProps({ className: "ree-root" }).props.lang,
    body: () => view.root.findByProps({ className: "ree-body" }),
    root: () => view.root,
  };
}

test("组件直接指定语言无需配置 Hook，动态切换保持实例、文档快照和导出，多个界面独立", async (t) => {
  const first = fixture(t, { locale: "zh-CN" });
  const second = fixture(t);
  await first.mount();
  await second.mount();
  assert.equal(first.lang(), "zh-CN");
  assert.equal(second.lang(), "en");
  const editor = first.editor();
  act(() => editor.setDocument({ ...editor.getDocument(), subject: "用户编辑的主题" }));
  const state = first.state();
  const original = editor.getData();
  const body = first.body();
  for (const locale of ["es", "pt-PT", "fr", "en", "zh-CN"]) {
    await first.update(locale);
    assert.equal(first.lang(), locale);
    assert.equal(second.lang(), "en");
    assert.equal(first.editor(), editor);
    assert.equal(first.state(), state);
    assert.equal(first.body(), body);
    assert.deepEqual(editor.getData(), original);
    assert.equal(first.changes.length, 1);
  }
  await first.update(undefined);
  assert.equal(first.lang(), "en");
});

test("发布产物中的自定义区块跟随五种语言切换公共控件，文档与导出不变且不触发 onChange", async (t) => {
  const plugin = defineBlock({
    type: "shop.card", title: "Custom card",
    controls: { href: EmailControls.url({ label: "Custom link", defaultValue: "https://example.com" }) },
    defaultStyle: { decorations: { borderWidth: "1px" } },
    renderEmail: ({ controls, email }) => email.html`<p>${controls.href}</p>`,
  });
  let config;
  function ConfigHarness() {
    const value = useEmailEditorConfig({ plugins: [plugin] });
    useLayoutEffect(() => { config = value; });
    return null;
  }
  let configView;
  act(() => { configView = create(createElement(ConfigHarness)); });
  t.after(() => act(() => configView.unmount()));
  const view = fixture(t, { config });
  await view.mount();
  act(() => view.root().findByProps({ className: "ree-lib-item", "aria-label": "Custom card" }).props.onClick());
  const original = view.editor().getData();
  const state = view.state();
  const body = view.body();
  for (const locale of ["en", "zh-CN", "es", "pt-PT", "fr", "en"]) {
    const { default: inspector } = await import(`../src/i18n/locales/${locale}/inspector.json`, { with: { type: "json" } });
    const { default: common } = await import(`../src/i18n/locales/${locale}/common.json`, { with: { type: "json" } });
    await view.update(locale);
    const labels = view.root().findAllByType("label").map((node) => node.children.join(""));
    for (const key of ["blockPadding", "margin", "blockBorderWidth", "blockBorderStyle", "blockRadius"]) {
      assert.ok(labels.includes(inspector[key]), `${locale}: ${key}`);
    }
    for (const key of ["blockBackground", "blockBorder"]) {
      assert.ok(view.root().findByProps({ className: "ree-color-chip", "aria-label": inspector[key] }));
    }
    const select = view.root().findByProps({ className: "ree-input", "aria-label": inspector.blockBorderStyle });
    assert.deepEqual(select.findAllByType("option").map((option) => [option.props.value, option.children.join("")]),
      ["none", "solid", "dashed", "dotted"].map((value) => [value, common[value]]));
    assert.ok(labels.includes("Custom link"));
    assert.equal(view.state(), state);
    assert.equal(view.body(), body);
    assert.deepEqual(view.editor().getData(), original);
    assert.equal(view.changes.length, 1);
  }
});

test("组件语言优先于配置，移除后恢复配置，空值和不支持的语言回退英文", async (t) => {
  let config;
  function ConfigHarness() {
    const value = useEmailEditorConfig({ locale: "fr" });
    useLayoutEffect(() => { config = value; });
    return null;
  }
  let configView;
  act(() => { configView = create(createElement(ConfigHarness)); });
  t.after(() => act(() => configView.unmount()));
  const view = fixture(t, { config });
  await view.mount();
  assert.equal(view.lang(), "fr");
  for (const [input, expected] of [[" ZH_cn ", "zh-CN"], ["en", "en"], ["", "en"], ["pt-BR", "en"], [undefined, "fr"]]) {
    await view.update(input);
    assert.equal(view.lang(), expected);
    assert.equal(config.locale, "fr");
    assert.deepEqual(view.changes, []);
  }
});
