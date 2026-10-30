import "./helpers/source-modules.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import { createElement, useLayoutEffect } from "react";
import { act, create } from "react-test-renderer";
const { english } = await import("../src/i18n/locales/en.ts");
const { default: chinese } = await import("../src/i18n/locales/zh-CN.ts");
const { default: spanish } = await import("../src/i18n/locales/es.ts");
const { default: portuguese } = await import("../src/i18n/locales/pt-PT.ts");
const { default: french } = await import("../src/i18n/locales/fr.ts");
const { createTranslation } = await import("../src/i18n/create-translation.ts");
const { LOCALE_LOADERS } = await import("../src/i18n/constants.ts");
const { DEFAULT_TRANSLATION, getLoadedTranslation, loadTranslation, normalizeLocale } = await import("../src/i18n/runtime.ts");
const { useEditorLocale } = await import("../src/i18n/useEditorLocale.ts");
const { EditorLocaleContext } = await import("../src/i18n/context.ts");
const { localizeDefinition } = await import("../src/i18n/metadata.ts");
const { BodyControls } = await import("../src/inspector/BodyControls.tsx");
const { InspectorControls } = await import("../src/inspector/InspectorControls.tsx");
const { ImageControl } = await import("../src/inspector/components/ImageControl.tsx");
const { EditorConfigContext } = await import("../src/plugins/editor-context.ts");
const { DEFAULT_BLOCKS } = await import("../src/blocks/registry.ts");
const { DEFAULT_EMAIL_BODY } = await import("../src/document/constants.ts");
const { createBlockNode } = await import("../src/document/create-block.ts");
const { defineBlock } = await import("../src/plugins/define-block.ts");
const { EmailControls } = await import("../src/plugins/controls.ts");
const { dragAnnouncements } = await import("../src/editor-dnd/announcements.ts");

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function flattenMessages(messages, prefix = "") {
  return Object.fromEntries(Object.entries(messages).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string" ? [[path, value]] : Object.entries(flattenMessages(value, path));
  }));
}

function imageFixture(t, pickImage) {
  const commits = [];
  const config = { pickImage };
  const props = { control: { ...EmailControls.image({ label: "Image URL" }), name: "image" }, value: "", onChange: (value) => commits.push(value) };
  const tree = (translation) => createElement(EditorLocaleContext.Provider, { value: translation },
    createElement(EditorConfigContext.Provider, { value: config }, createElement(ImageControl, props)));
  let view;
  act(() => { view = create(tree(DEFAULT_TRANSLATION)); });
  t.after(() => act(() => view.unmount()));
  return {
    commits,
    choose: () => view.root.findByType("button").props.onClick(),
    switchTo: (translation) => act(() => view.update(tree(translation))),
    error: () => view.root.findAllByProps({ role: "alert" }).map((node) => node.children.join("")),
    button: () => view.root.findByType("button").children.join(""),
  };
}

test("五种语言归一化明确，未支持的 locale 回退英文，语言包键和插值完整", () => {
  for (const input of [undefined, "", "en", "en-US", "en-GB", "ja-JP", "zh-TW", "es-MX", "pt-BR", "pt", "fr-CA", "constructor", "__proto__"]) assert.equal(normalizeLocale(input), "en");
  for (const input of ["zh", "zh-CN", "ZH_cn", " zh-Hans "]) assert.equal(normalizeLocale(input), "zh-CN");
  for (const [input, expected] of [[" ES ", "es"], ["PT_pt", "pt-PT"], [" Fr ", "fr"]]) assert.equal(normalizeLocale(input), expected);
  const en = flattenMessages(english);
  for (const messages of [chinese, spanish, portuguese, french]) {
    const localized = flattenMessages(messages);
    assert.deepEqual(Object.keys(localized).sort(), Object.keys(en).sort());
    for (const [key, value] of Object.entries(localized)) {
      assert.ok(value.trim(), key);
      assert.deepEqual([...value.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]).sort(), [...en[key].matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]).sort(), key);
      assert.equal(DEFAULT_TRANSLATION.t(key), en[key], key);
    }
  }
  assert.equal(DEFAULT_TRANSLATION.t("common.edit"), "Edit");
  assert.equal(DEFAULT_TRANSLATION.locale, "en");
  for (const locale of Object.keys(LOCALE_LOADERS)) assert.equal(getLoadedTranslation(locale), undefined);
});

test("最小翻译函数支持英文回退和原样插值，不递归解析模板或读取继承属性", () => {
  const { t } = createTranslation("fr", { common: { edit: "Modifier", save: "", unit: "{{ label }} / {{label}}" } });
  assert.equal(t("common.edit"), "Modifier");
  assert.equal(t("common.save"), "Save");
  assert.equal(t("editor.emailSubject"), "Email subject");
  assert.equal(t("missing.key"), "missing.key");
  assert.equal(t("constructor.name"), "constructor.name");
  assert.equal(t("common.unit"), "{{ label }} / {{label}}");
  assert.equal(t("common.unit", { label: 0 }), "0 / 0");
  assert.equal(t("common.unit", { label: "" }), " / ");
  assert.equal(t("common.unit", { label: "<$&>{{name}}" }), "<$&>{{name}} / <$&>{{name}}");
  assert.equal(t("common.unit", Object.create({ label: "inherited" })), "{{ label }} / {{label}}");
  assert.equal(DEFAULT_TRANSLATION.t("inspector.moveItemUp", { label: "Row", index: 0 }), "Move Row item 0 up");
});

test("异步语言失败可重试，并发去重、快速切换、卸载与实例隔离", async (t) => {
  let resolve;
  let requests = 0;
  t.mock.method(LOCALE_LOADERS, "zh-CN", () => {
    requests++;
    if (requests === 1) return Promise.reject(new Error("Network unavailable"));
    return new Promise((done) => { resolve = done; });
  });
  let first;
  let second;
  function Probe({ locale, receive }) {
    const state = useEditorLocale(locale);
    useLayoutEffect(() => { receive(state); });
    return createElement("span", null, state.translation.t("common.edit"));
  }
  const tree = (locale, includeSecond = false) => createElement("div", null,
    createElement(Probe, { locale, receive: (state) => { first = state; } }),
    includeSecond ? createElement(Probe, { locale: "zh-CN", receive: (state) => { second = state; } }) : null);
  let renderer;
  await act(async () => { renderer = create(tree("zh-CN")); });
  t.after(() => act(() => renderer.unmount()));
  assert.equal(first.failed, true);
  assert.equal(first.translation.locale, "en");
  await act(async () => { first.retry(); renderer.update(tree("zh-CN", true)); });
  assert.equal(first.failed, false);
  assert.equal(first.loading, true);
  let unmountedUpdates = 0;
  let transient;
  act(() => { transient = create(createElement(Probe, { locale: "zh-CN", receive: () => { unmountedUpdates++; } })); });
  act(() => transient.unmount());
  const updatesBeforeResolution = unmountedUpdates;
  assert.equal(requests, 2);
  assert.equal(loadTranslation("zh-CN"), loadTranslation("zh-CN"));
  await act(async () => { renderer.update(tree("en", true)); });
  await act(async () => { resolve(chinese); });
  assert.equal(first.translation.t("common.edit"), "Edit");
  assert.equal(second.translation.t("common.edit"), "编辑");
  assert.equal(unmountedUpdates, updatesBeforeResolution);
  assert.equal(first.failed, false);
  await act(async () => { renderer.update(tree("zh-CN")); });
  assert.equal(first.translation.t("common.edit"), "编辑");
  assert.equal(requests, 2);
  assert.equal(await loadTranslation("en"), DEFAULT_TRANSLATION);
});

test("中文只改变内置展示元数据，插件覆盖、内容默认值及渲染函数保持原样", async () => {
  const { t } = await loadTranslation("zh-CN");
  for (const [key, value] of Object.entries(flattenMessages(chinese))) assert.equal(t(key), value, key);
  for (const builtin of DEFAULT_BLOCKS) {
    const localized = localizeDefinition(builtin, t);
    assert.equal(localized.renderEmail, builtin.renderEmail);
    assert.equal(localized.readControls, builtin.readControls);
    assert.deepEqual(localized.schema, builtin.schema);
    assert.deepEqual(localized.defaultStyle, builtin.defaultStyle);
    assert.deepEqual(localized.controls?.map((control) => control.defaultValue), builtin.controls?.map((control) => control.defaultValue));
    assert.deepEqual(localized.inspectorSections?.map((section) => section.id), builtin.inspectorSections?.map((section) => section.id));
    const marked = localizeDefinition(builtin, (key) => `i18n:${key}`);
    for (const label of [marked.title, marked.description,
      ...marked.controls.map((control) => control.label),
      ...marked.styleControls.flatMap((control) => [control.label, ...(control.options?.map((option) => option.label) ?? [])]),
      ...marked.inspectorSections.map((section) => section.title),
    ]) assert.match(label, /^i18n:/, `${builtin.type}: ${label}`);
    for (const [index, control] of marked.controls.entries()) {
      if (control.placeholder && builtin.type === "html") assert.equal(control.placeholder, "i18n:blocks.html.placeholder");
      else assert.equal(control.placeholder, builtin.controls[index].placeholder);
    }
  }
  const custom = defineBlock({ type: "shop.card", title: "Custom", controls: { href: EmailControls.url({ label: "Custom link" }) }, renderEmail: () => "<p>Custom content</p>" });
  assert.equal(localizeDefinition(custom, t), custom);
  const copiedBuiltin = { ...DEFAULT_BLOCKS[0], title: "My heading", override: true };
  assert.equal(localizeDefinition(copiedBuiltin, t), copiedBuiltin);
  const override = defineBlock({ type: "text", override: true, title: "Overridden text", renderEmail: () => "<p>Custom text</p>" });
  assert.equal(localizeDefinition(override, t), override);
  const button = DEFAULT_BLOCKS.find((block) => block.type === "button");
  assert.match(localizeDefinition(button, t).controls[0].defaultValue, /Buy now/);
});

test("新增语言按需加载，缓存互相隔离且参数替换正确", async () => {
  for (const [locale, messages] of [["es", spanish], ["pt-PT", portuguese], ["fr", french]]) {
    const translation = await loadTranslation(locale);
    assert.equal(translation.locale, locale);
    assert.equal(await loadTranslation(locale), translation);
    assert.equal(getLoadedTranslation(locale), translation);
    for (const [key, value] of Object.entries(flattenMessages(messages))) assert.equal(translation.t(key), value, `${locale}: ${key}`);
    assert.equal(translation.t("common.resetLabel", { label: "$&" }), messages.common.resetLabel.replace("{{label}}", () => "$&"));
    assert.ok(!translation.t("dnd.over", { id: "text-1", over: "text-2" }).includes("{{"));
  }
  assert.equal(DEFAULT_TRANSLATION.t("common.edit"), "Edit");
  assert.equal((await loadTranslation("zh-CN")).t("common.edit"), "编辑");
});

test("界面切换保留检查器分组展开状态，主体字段、单位与无障碍文案完整翻译", async (t) => {
  const zh = await loadTranslation("zh-CN");
  const body = (translation) => createElement(EditorLocaleContext.Provider, { value: translation }, createElement(BodyControls, { body: DEFAULT_EMAIL_BODY, onChange() {} }));
  let view;
  act(() => { view = create(body(DEFAULT_TRANSLATION)); });
  t.after(() => act(() => view.unmount()));
  const toggles = () => view.root.findAllByProps({ className: "ree-inspector-section-toggle" });
  act(() => toggles()[1].props.onClick());
  assert.equal(toggles()[1].props["aria-expanded"], false);
  act(() => view.update(body(zh)));
  assert.equal(toggles()[1].props["aria-expanded"], false);
  assert.ok(view.root.findByProps({ label: "链接下划线" }));
  const output = JSON.stringify(view.toJSON());
  assert.match(output, /常规/);
  assert.match(output, /字体/);
  assert.match(output, /加粗/);
  const builtin = DEFAULT_BLOCKS.find((block) => block.type === "button");
  const block = createBlockNode("button");
  const inspector = (translation) => createElement(EditorLocaleContext.Provider, { value: translation }, createElement(InspectorControls, {
    block, body: DEFAULT_EMAIL_BODY, definition: localizeDefinition(builtin, translation.t), variables: [], onCommitControl() {}, onCommitControls() {}, onCommitStyle() {},
  }));
  act(() => view.update(inspector(DEFAULT_TRANSLATION)));
  const section = toggles().find((node) => node.findAllByType("span").some((span) => span.children.includes("Spacing")));
  act(() => section.props.onClick());
  act(() => view.update(inspector(zh)));
  assert.equal(toggles().find((node) => node.findAllByType("span").some((span) => span.children.includes("间距"))).props["aria-expanded"], false);
  assert.match(JSON.stringify(view.toJSON()), /按钮填充/);
  assert.match(JSON.stringify(view.toJSON()), /宽度单位/);
  assert.match(dragAnnouncements(zh.t).onDragEnd({ active: { id: "text-1" }, over: { id: "text-2" } }), /已放置/);
});

test("已显示的图片内置错误随语言切换更新，非法 URL 不写入文档", async (t) => {
  const zh = await loadTranslation("zh-CN");
  for (const [pickImage, key] of [
    [async () => "javascript:alert(1)", "inspector.imageUrlHint"],
    [() => Promise.reject("Unavailable"), "inspector.imageError"],
  ]) {
    const image = imageFixture(t, pickImage);
    await act(async () => { await image.choose(); });
    assert.deepEqual(image.error(), [DEFAULT_TRANSLATION.t(key)]);
    image.switchTo(zh);
    assert.deepEqual(image.error(), [zh.t(key)]);
    assert.equal(image.button(), zh.t("common.retry"));
    image.switchTo(DEFAULT_TRANSLATION);
    assert.deepEqual(image.error(), [DEFAULT_TRANSLATION.t(key)]);
    assert.deepEqual(image.commits, []);
  }
});

test("图片选择期间切换语言，异步失败使用完成时的当前语言", async (t) => {
  const zh = await loadTranslation("zh-CN");
  for (const invalidUrl of [true, false]) {
    let resolve;
    let reject;
    const image = imageFixture(t, () => new Promise((done, fail) => { resolve = done; reject = fail; }));
    let choosing;
    act(() => { choosing = image.choose(); });
    image.switchTo(zh);
    assert.equal(image.button(), zh.t("inspector.choosing"));
    await act(async () => {
      if (invalidUrl) resolve("javascript:alert(1)");
      else reject("Unavailable");
      await choosing;
    });
    assert.deepEqual(image.error(), [zh.t(invalidUrl ? "inspector.imageUrlHint" : "inspector.imageError")]);
    assert.deepEqual(image.commits, []);
  }
});

test("图片选择器外部错误保留原文，成功重试清理错误并只提交有效 URL", async (t) => {
  const zh = await loadTranslation("zh-CN");
  let attempts = 0;
  const image = imageFixture(t, async () => {
    if (attempts++ === 0) throw new Error("Asset service unavailable");
    return "https://example.com/chosen";
  });
  await act(async () => { await image.choose(); });
  image.switchTo(zh);
  assert.deepEqual(image.error(), ["Asset service unavailable"]);
  await act(async () => { await image.choose(); });
  assert.deepEqual(image.error(), []);
  assert.equal(image.button(), zh.t("inspector.chooseImage"));
  assert.deepEqual(image.commits, ["https://example.com/chosen"]);
});
