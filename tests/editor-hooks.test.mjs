import assert from "node:assert/strict";
import test from "node:test";
import { createElement, StrictMode, Suspense, startTransition, useLayoutEffect, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { act, create } from "react-test-renderer";
import * as api from "../dist/index.js";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const { useEmailEditor, useEmailEditorConfig, useEmailEditorState, createEmailDocument, defineBlock, EmailControls } = api;

function fixture(t, initialOptions = {}) {
  let current;
  let state;
  let ownerRenders = 0;
  let subscriberRenders = 0;
  function Subscriber({ editor }) {
    const value = useEmailEditorState(editor);
    useLayoutEffect(() => { state = value; subscriberRenders++; });
    return createElement("span", null, value.document.subject);
  }
  function Harness({ options }) {
    const config = useEmailEditorConfig(options.configOptions);
    const editor = useEmailEditor({ ...options, config });
    useLayoutEffect(() => { current = { editor, config }; ownerRenders++; });
    return createElement(Subscriber, { editor });
  }
  let renderer;
  act(() => { renderer = create(createElement(StrictMode, null, createElement(Harness, { options: initialOptions }))); });
  t.after(() => act(() => renderer.unmount()));
  return {
    current: () => current,
    state: () => state,
    counts: () => ({ ownerRenders, subscriberRenders }),
    update: (options) => act(() => renderer.update(createElement(StrictMode, null, createElement(Harness, { options })))),
    unmount: () => act(() => renderer.unmount()),
  };
}

const coupon = defineBlock({
  type: "hooks.coupon", title: "Coupon",
  controls: { html: EmailControls.html({ label: "HTML", defaultValue: "<p>{{ name }}</p>" }) },
  renderEmail: ({ controls, email }) => email.raw(controls.html),
});

test("仅公开新 Hooks，实例无需界面即可创建、校验和导出", (t) => {
  assert.equal("createEmailEditorConfig" in api, false);
  const subject = "First";
  const callbacks = [];
  const view = fixture(t, { initialDocument: { ...createEmailDocument(), subject }, onChange: (document) => callbacks.push(document) });
  const { editor } = view.current();
  assert.deepEqual(editor.validate(), []);
  const data = editor.getData();
  assert.equal(data.document.subject, subject);
  assert.deepEqual(JSON.parse(data.json), data.document);
  assert.equal(data.html, editor.getHtml());
  assert.equal(data.renderedHtml, editor.getRenderedHtml());
  assert.equal(callbacks.length, 0);
  const next = { ...createEmailDocument(), subject: "Next" };
  act(() => { editor.setDocument(next); assert.equal(editor.getDocument().subject, "Next"); });
  assert.equal(callbacks.length, 1);
  assert.equal(view.state().document.subject, "Next");
  act(() => editor.reset());
  assert.equal(editor.getDocument().subject, subject);
  assert.equal(callbacks.length, 2);
  assert.equal(view.current().editor, editor);
});

test("按需订阅只更新订阅者，快照缓存、嵌套只读及隔离生效", (t) => {
  const changes = [];
  const view = fixture(t, { onChange: (document) => { changes.push(document); document.body.contentWidth = 999; } });
  const { editor } = view.current();
  const previous = view.state();
  const counts = view.counts();
  const next = { ...editor.getDocument(), subject: "Changed" };
  act(() => editor.setDocument(next));
  next.body.contentWidth = 999;
  assert.equal(view.counts().ownerRenders, counts.ownerRenders);
  assert.equal(view.counts().subscriberRenders, counts.subscriberRenders + 1);
  assert.notEqual(view.state(), previous);
  assert.equal(editor.getDocument().body.contentWidth, 600);
  assert.equal(previous.document.subject, "");
  assert.throws(() => { view.state().document.body.contentWidth = 999; }, TypeError);
  assert.throws(() => view.state().document.blocks.push({}), TypeError);
  const exported = editor.getData();
  exported.document.body.contentWidth = 888;
  assert.equal(editor.getDocument().body.contentWidth, 600);
  assert.equal(changes.length, 1);
  const currentState = view.state();
  view.update({ variables: [{ name: "{{ name }}", value: "Alice" }] });
  assert.equal(view.state(), currentState);
});

test("配置与变量更新保留文档和实例，并使用最新插件与预览值", (t) => {
  const firstOptions = { plugins: [coupon], builtins: ["text"] };
  const view = fixture(t, { configOptions: firstOptions, variables: [{ name: "{{ name }}", value: "Alice" }] });
  const { editor, config } = view.current();
  const getHtml = editor.getHtml;
  view.update({ configOptions: firstOptions, variables: [{ name: "{{ name }}", value: "Alice" }] });
  assert.equal(view.current().config, config);
  const document = createEmailDocument([config.createBlock(coupon.type)]);
  act(() => editor.setDocument(document));
  assert.match(editor.getHtml(), /\{\{ \.name \}\}/);
  assert.match(editor.getRenderedHtml(), /Alice/);
  const override = defineBlock({ type: "hooks.coupon", title: "Updated", renderEmail: () => "<p>Updated {{ name }}</p>" });
  view.update({ configOptions: { plugins: [override], builtins: false }, variables: [{ name: "{{ name }}", value: "Bob" }] });
  assert.equal(view.current().editor, editor);
  assert.deepEqual(editor.getDocument(), document);
  assert.equal(view.current().config.library.length, 1);
  assert.match(editor.getRenderedHtml(), /Updated Bob/);
  assert.match(getHtml(), /Updated \{\{ \.name \}\}/);
  view.update({ configOptions: { builtins: false } });
  assert.deepEqual(editor.getDocument(), document);
  assert.equal(editor.validate()[0].blockType, coupon.type);
  assert.throws(() => editor.getHtml(), /Missing block plugin/);
});

test("模板引擎更新保留文档、订阅快照与实例，多实例使用各自引擎", (t) => {
  const changes = [];
  const makeEngine = (label) => ({
    render(template, data) {
      assert.equal(template, "<p>{{ name }}</p>");
      const name = data.name;
      data.nested.value = "Changed by engine";
      return `<p>${label}:${name}</p>`;
    },
    validate() { assert.fail("保存和导出不应自动校验模板"); },
  });
  const firstEngine = makeEngine("First");
  const configOptions = { plugins: [coupon], templateEngine: firstEngine };
  const first = fixture(t, { configOptions, onChange: (document) => changes.push(document) });
  const { editor, config } = first.current();
  const block = config.createBlock(coupon.type);
  block.defaultData = { name: "Block", nested: { value: "Original" } };
  const document = createEmailDocument([block]);
  act(() => editor.setDocument(document));
  const state = first.state();
  const secondEngine = makeEngine("Second");
  const second = fixture(t, { configOptions: { plugins: [coupon], templateEngine: secondEngine }, initialDocument: document });
  assert.match(editor.getRenderedHtml(), /First:Block/);
  assert.match(second.current().editor.getRenderedHtml(), /Second:Block/);
  const output = editor.getData();
  assert.match(output.renderedHtml, /First:Block/);
  assert.ok(output.html.includes("{{ name }}"));
  assert.ok(output.json.includes("{{ name }}"));
  assert.deepEqual(output.document, document);
  first.update({ configOptions, onChange: (next) => changes.push(next) });
  assert.equal(first.current().config, config);
  first.update({ configOptions: { ...configOptions, templateEngine: secondEngine }, onChange: (next) => changes.push(next) });
  assert.equal(first.current().editor, editor);
  assert.equal(first.current().config.templateEngine, secondEngine);
  assert.match(editor.getRenderedHtml(), /Second:Block/);
  assert.equal(first.state(), state);
  assert.deepEqual(editor.getDocument(), document);
  assert.equal(changes.length, 1);
  output.document.blocks[0].defaultData.nested.value = "External";
  assert.equal(editor.getDocument().blocks[0].defaultData.nested.value, "Original");
  first.update({ configOptions: { plugins: [coupon] } });
  assert.equal(first.current().config.templateEngine, api.defaultTemplateEngine);
  assert.match(editor.getRenderedHtml(), /<p>Block<\/p>/);
  assert.match(second.current().editor.getRenderedHtml(), /Second:Block/);
});

test("初始文档只读一次，外部 body 按输入值变化合并，回调及重置基准独立", (t) => {
  const original = { ...createEmailDocument(), subject: "Original" };
  const onChangeCalls = [];
  const onBodyCalls = [];
  const callback = (document) => onChangeCalls.push(document);
  const view = fixture(t, { initialDocument: original, body: { contentWidth: 640 }, onChange: callback });
  const { editor } = view.current();
  original.subject = "External mutation";
  assert.equal(editor.getDocument().subject, "Original");
  assert.equal(editor.getDocument().body.contentWidth, 640);
  const nextCallback = (document) => { onChangeCalls.push(document); document.body.contentWidth = 999; };
  const options = { initialDocument: { ...createEmailDocument(), subject: "Ignored" }, body: { contentPadding: "12px" }, onChange: nextCallback, onBodyChange: (body) => onBodyCalls.push(body) };
  view.update(options);
  assert.equal(editor.getDocument().subject, "Original");
  assert.equal(editor.getDocument().body.contentWidth, 640);
  assert.equal(editor.getDocument().body.contentPadding, "12px");
  assert.equal(onChangeCalls.length, 1);
  assert.equal(onBodyCalls.length, 0);
  view.update({ ...options, body: { contentPadding: "12px" } });
  assert.equal(onChangeCalls.length, 1);
  act(() => editor.reset());
  assert.equal(editor.getDocument().subject, "Original");
  assert.equal(editor.getDocument().body.contentPadding, "0px");
  assert.equal(editor.getDocument().body.contentWidth, 640);
  view.update({ ...options, body: { contentPadding: "12px" } });
  assert.equal(editor.getDocument().body.contentPadding, "0px");
  assert.equal(onChangeCalls.length, 2);
});

test("共享配置的实例状态与生命周期隔离，卸载界面订阅后仍可导出", (t) => {
  const configOptions = { plugins: [coupon] };
  const first = fixture(t, { configOptions });
  const shared = first.current().config;
  let second;
  function Harness() {
    const editor = useEmailEditor({ config: shared });
    useLayoutEffect(() => { second = editor; }, [editor]);
    return null;
  }
  let renderer;
  act(() => { renderer = create(createElement(Harness)); });
  t.after(() => act(() => renderer.unmount()));
  const editor = first.current().editor;
  act(() => editor.setDocument(createEmailDocument([shared.createBlock(coupon.type)])));
  assert.equal(second.getDocument().blocks.length, 0);
  first.unmount();
  assert.match(editor.getHtml(), /\{\{ name \}\}/);
  act(() => second.setDocument({ ...second.getDocument(), subject: "Second" }));
  assert.equal(editor.getDocument().subject, undefined);
});

test("SSR 可通过 Hooks 初始化并独立导出，拒绝旧版本且不改变现有文档", (t) => {
  function ServerExport() {
    const editor = useEmailEditor();
    return createElement("pre", null, editor.getJson());
  }
  assert.match(renderToStaticMarkup(createElement(ServerExport)), /&quot;version&quot;: 4/);
  const view = fixture(t);
  const { editor } = view.current();
  assert.throws(() => editor.setDocument({ ...createEmailDocument(), version: 3 }), /Unsupported email document version/);
  assert.equal(editor.getDocument().version, 4);
});

test("子组件 layout effect 使用已提交的新配置、变量、主体与回调，通知不在 insertion effect 内执行", (t) => {
  const errors = [];
  t.mock.method(console, "error", (...args) => errors.push(args.join(" ")));
  const events = [];
  const observations = [];
  let instance;
  let subscribed;
  const first = defineBlock({ type: "layout.card", title: "Card", renderEmail: () => "<p>Before {{ name }}</p>" });
  const second = defineBlock({ type: "layout.card", title: "Card", renderEmail: () => "<p>After {{ name }}</p>" });
  function Subscriber({ editor, revision }) {
    const state = useEmailEditorState(editor);
    useLayoutEffect(() => { subscribed = state; });
    useLayoutEffect(() => {
      observations.push({ html: editor.getRenderedHtml(), width: editor.getDocument().body.contentWidth });
      if (revision === 2) editor.setDocument({ ...editor.getDocument(), subject: "Child update" });
    }, [editor, revision]);
    return null;
  }
  function Harness({ options, revision }) {
    const config = useEmailEditorConfig(options);
    const [changeCount, setChangeCount] = useState(0);
    const editor = useEmailEditor({
      config,
      initialDocument: createEmailDocument([config.createBlock(first.type)]),
      variables: [{ name: "{{ name }}", value: String(revision) }],
      body: { contentWidth: revision === 1 ? 600 : 700 },
      onChange: (document) => {
        events.push({ revision, document });
        setChangeCount((count) => count + 1);
      },
    });
    useLayoutEffect(() => { instance = editor; });
    return createElement("div", { "data-changes": changeCount }, createElement(Subscriber, { editor, revision }));
  }
  let renderer;
  act(() => { renderer = create(createElement(StrictMode, null, createElement(Harness, { options: { plugins: [first] }, revision: 1 }))); });
  t.after(() => act(() => renderer.unmount()));
  const editor = instance;
  act(() => renderer.update(createElement(StrictMode, null, createElement(Harness, { options: { plugins: [second] }, revision: 2 }))));
  assert.equal(instance, editor);
  assert.match(observations.at(-1).html, /After 2/);
  assert.equal(observations.at(-1).width, 700);
  assert.deepEqual(events.map((event) => event.revision), [2, 2]);
  assert.equal(events[0].document.subject, undefined);
  assert.equal(events[1].document.subject, "Child update");
  assert.equal(subscribed.document.subject, "Child update");
  assert.equal(subscribed.document.body.contentWidth, 700);
  assert.deepEqual(errors, []);
});

test("被 Suspense 中断的并发 render 不泄漏配置、变量、主体或回调", async (t) => {
  const previousActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  t.after(() => {
    if (previousActEnvironment === undefined) delete globalThis.IS_REACT_ACT_ENVIRONMENT;
    else globalThis.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
  });
  const waiting = new Promise(() => {});
  const callbacks = [];
  let editor;
  const before = defineBlock({ type: "concurrent.card", title: "Card", renderEmail: () => "<p>Before {{ name }}</p>" });
  const after = defineBlock({ type: "concurrent.card", title: "Card", renderEmail: () => "<p>After {{ name }}</p>" });
  function Harness({ suspended, revision }) {
    const config = useEmailEditorConfig({ plugins: [revision === 1 ? before : after] });
    const instance = useEmailEditor({
      config, initialDocument: createEmailDocument([config.createBlock(before.type)]),
      variables: [{ name: "{{ name }}", value: String(revision) }],
      body: { contentWidth: revision === 1 ? 600 : 700 },
      onChange: () => callbacks.push(revision),
    });
    useLayoutEffect(() => { editor = instance; });
    if (suspended) throw waiting;
    return null;
  }
  const tree = (suspended, revision) => createElement(Suspense, { fallback: null }, createElement(Harness, { suspended, revision }));
  let renderer;
  await act(async () => { renderer = create(tree(false, 1), { unstable_isConcurrent: true }); });
  t.after(() => act(() => renderer.unmount()));
  const initialEditor = editor;
  await act(async () => { startTransition(() => renderer.update(tree(true, 2))); });
  assert.match(editor.getRenderedHtml(), /Before 1/);
  assert.equal(editor.getDocument().body.contentWidth, 600);
  act(() => editor.setDocument({ ...editor.getDocument(), subject: "Still current" }));
  assert.deepEqual(callbacks, [1]);
  await act(async () => { renderer.update(tree(false, 2)); });
  assert.equal(editor, initialEditor);
  assert.match(editor.getRenderedHtml(), /After 2/);
  assert.equal(editor.getDocument().body.contentWidth, 700);
  assert.equal(editor.getDocument().subject, "Still current");
  assert.deepEqual(callbacks, [1, 2]);
});
