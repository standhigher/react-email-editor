import "./helpers/source-modules.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import { createElement, useLayoutEffect } from "react";
import { act, create } from "react-test-renderer";

const { usePreviewBuffer } = await import("../src/stage/preview/usePreviewBuffer.ts");
const { Stage } = await import("../src/stage/Stage.tsx");
const { Canvas } = await import("../src/stage/canvas/Canvas.tsx");
const { PreviewFrame } = await import("../src/stage/preview/PreviewFrame.tsx");
const { buildEmailEditorConfig } = await import("../src/plugins/config.ts");
const { createEmailDocument } = await import("../src/document/create-document.ts");

function sourceFixture(toHtml = () => "<p>Preview</p>") {
  return { document: createEmailDocument([]), config: { toHtml }, variables: [], device: "desktop" };
}

function bufferFixture(t, initial = sourceFixture()) {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"] });
  let source = initial;
  let requested = false;
  let latest;
  function Probe() {
    const state = usePreviewBuffer(source, requested);
    useLayoutEffect(() => { latest = state; }, [state]);
    return null;
  }
  let renderer;
  act(() => { renderer = create(createElement(Probe)); });
  t.after(() => act(() => renderer.unmount()));
  return {
    get state() { return latest; },
    get source() { return source; },
    update(next = source, preview = requested) {
      source = next;
      requested = preview;
      act(() => renderer.update(createElement(Probe)));
    },
    tick(ms) { act(() => t.mock.timers.tick(ms)); },
    ready(snapshot) { act(() => latest.markReady(snapshot.id)); },
    failed(snapshot, message = "Load failed") { act(() => latest.markFailed(snapshot.id, message)); },
    unmount() { act(() => renderer.unmount()); },
  };
}

test("后台防抖只生成最新文档，未变化时切换不重复生成", (t) => {
  const calls = [];
  const source = sourceFixture((document) => { calls.push(document); return `<p>${document.subject}</p>`; });
  const view = bufferFixture(t, source);
  view.tick(300);
  const next = { ...source, document: { ...source.document, subject: "Latest" } };
  view.update(next);
  view.tick(399);
  assert.equal(calls.length, 0);
  view.tick(1);
  assert.deepEqual(calls, [next.document]);
  const snapshot = view.state.frames[0];
  assert.equal(view.state.ready, false);
  view.ready(snapshot);
  assert.equal(view.state.ready, true);
  for (const preview of [true, false, true]) { view.update(next, preview); view.tick(0); }
  assert.equal(calls.length, 1);
  assert.equal(view.state.frames[0].id, snapshot.id);
});

test("持续输入最多等待两秒，立即预览跳过防抖", (t) => {
  let calls = 0;
  const view = bufferFixture(t, sourceFixture(() => { calls++; return "<p>Ready</p>"; }));
  for (let i = 0; i < 6; i++) {
    view.tick(300);
    view.update({ ...view.source, document: { ...view.source.document, subject: String(i) } });
  }
  assert.equal(calls, 0);
  view.tick(200);
  assert.equal(calls, 1);
  view.update({ ...view.source, variables: [{ name: "{{name}}", value: "New" }] }, true);
  view.tick(0);
  assert.equal(calls, 2);
});

test("双缓冲保留前台内容，丢弃过期和已替换 iframe 的就绪回调", (t) => {
  const view = bufferFixture(t, sourceFixture((document) => `<p>${document.subject}</p>`));
  view.tick(400);
  const first = view.state.frames[0];
  view.ready(first);
  view.update({ ...view.source, document: { ...view.source.document, subject: "Second" } });
  view.tick(400);
  const second = view.state.frames[1];
  assert.equal(view.state.front, 0);
  assert.equal(view.state.frames[0].id, first.id);
  view.update({ ...view.source, device: "mobile" });
  view.ready(second);
  assert.equal(view.state.front, 0);
  assert.equal(view.state.ready, false);
  view.tick(400);
  const third = view.state.frames[1];
  assert.equal(third.width, "360px");
  view.ready(second);
  assert.equal(view.state.front, 0);
  view.ready(third);
  assert.equal(view.state.front, 1);
  assert.equal(view.state.ready, true);
  assert.equal(view.state.frames[0].id, first.id);
});

test("后台生成失败保留前台缓冲，Retry 和变量/配置更新可恢复", (t) => {
  let failing = false;
  const view = bufferFixture(t, sourceFixture(() => { if (failing) throw "Failed"; return "<p>OK</p>"; }));
  view.tick(400);
  const first = view.state.frames[0];
  view.ready(first);
  failing = true;
  view.update({ ...view.source, variables: [{ name: "{{name}}", value: "Next" }] }, true);
  view.tick(0);
  assert.equal(view.state.failure.message, "Failed");
  assert.equal(view.state.frames[view.state.front].id, first.id);
  failing = false;
  act(() => view.state.retry());
  view.tick(0);
  assert.match(view.state.frames[1].html, /OK/);
  view.ready(view.state.frames[1]);
  assert.equal(view.state.failure, null);
  view.update({ ...view.source, config: { toHtml: () => "<p>New engine</p>" } });
  view.tick(400);
  assert.match(view.state.frames[0].html, /New engine/);
});

test("取消过期空闲任务，卸载后不执行后台生成", (t) => {
  const callbacks = new Map();
  let id = 0;
  let calls = 0;
  const originalIdle = Object.getOwnPropertyDescriptor(globalThis, "requestIdleCallback");
  const originalCancel = Object.getOwnPropertyDescriptor(globalThis, "cancelIdleCallback");
  globalThis.requestIdleCallback = (callback) => { callbacks.set(++id, callback); return id; };
  globalThis.cancelIdleCallback = (key) => callbacks.delete(key);
  t.after(() => {
    if (originalIdle) Object.defineProperty(globalThis, "requestIdleCallback", originalIdle);
    else delete globalThis.requestIdleCallback;
    if (originalCancel) Object.defineProperty(globalThis, "cancelIdleCallback", originalCancel);
    else delete globalThis.cancelIdleCallback;
  });
  const view = bufferFixture(t, sourceFixture(() => { calls++; return "<p>OK</p>"; }));
  view.tick(400);
  const obsolete = callbacks.get(1);
  view.update({ ...view.source, device: "mobile" });
  assert.equal(callbacks.size, 0);
  act(() => obsolete());
  assert.equal(calls, 0);
  view.tick(400);
  assert.equal(callbacks.size, 1);
  view.unmount();
  assert.equal(callbacks.size, 0);
  view.tick(5000);
  assert.equal(calls, 0);
});

test("Stage 等最新 iframe 测量完成才显示预览，切换保留画布和预览实例", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"] });
  const config = buildEmailEditorConfig();
  const block = config.createBlock("html");
  block.controls.html = "<p>Retained canvas</p>";
  const session = { document: createEmailDocument([block]), config, variables: [], definitions: config.definitions, selectedId: block.id };
  const tree = (viewMode) => createElement(Stage, { session, viewMode, device: "desktop" });
  let renderer;
  act(() => { renderer = create(tree("edit")); });
  t.after(() => act(() => renderer.unmount()));
  const canvas = renderer.root.findByType(Canvas);
  const htmlFrame = renderer.root.findByProps({ title: "HTML block preview" });
  act(() => renderer.update(tree("preview")));
  assert.equal(canvas.props.active, false);
  assert.equal(canvas.props.selectedId, null);
  assert.equal(renderer.root.findByProps({ className: "ree-stage-content" }).props["aria-busy"], true);
  assert.equal(canvas.parent.props["aria-hidden"], false);
  act(() => t.mock.timers.tick(0));
  const preview = renderer.root.findByType(PreviewFrame);
  assert.equal(canvas.parent.props["aria-hidden"], false);
  act(() => preview.props.onReady(preview.props.snapshot.id));
  assert.equal(canvas.parent.props["aria-hidden"], true);
  act(() => renderer.update(tree("edit")));
  assert.equal(renderer.root.findByType(Canvas), canvas);
  assert.equal(renderer.root.findByProps({ title: "HTML block preview" }), htmlFrame);
  assert.equal(canvas.props.selectedId, block.id);
  act(() => renderer.update(tree("preview")));
  assert.equal(renderer.root.findByType(PreviewFrame), preview);
  assert.equal(canvas.parent.props["aria-hidden"], true);
  assert.equal(renderer.root.findByProps({ className: "ree-stage-content" }).props["aria-busy"], false);
});

test("首次失败后换配置，保留错误画面直到新缓冲就绪", (t) => {
  const view = bufferFixture(t, sourceFixture(() => { throw new Error("Unavailable"); }));
  view.tick(400);
  assert.equal(view.state.displayFailure.message, "Unavailable");
  view.update({ ...view.source, config: { toHtml: () => "<p>Recovered</p>" } }, true);
  assert.equal(view.state.failure, null);
  assert.equal(view.state.displayFailure.message, "Unavailable");
  view.tick(0);
  assert.equal(view.state.displayFailure.message, "Unavailable");
  view.ready(view.state.frames[0]);
  assert.equal(view.state.displayFailure, null);
  assert.equal(view.state.ready, true);
});

test("预览内更新仍防抖，重复点击 Preview 可以 flush，maxWait 仍生效", (t) => {
  const calls = [];
  const view = bufferFixture(t, sourceFixture((document) => { calls.push(document.subject); return document.subject; }));
  view.update(view.source, true);
  view.tick(0);
  assert.equal(calls.length, 1);
  for (let i = 0; i < 5; i++) {
    view.update({ ...view.source, document: { ...view.source.document, subject: String(i) } });
    view.tick(50);
  }
  assert.equal(calls.length, 1);
  view.tick(350);
  assert.deepEqual(calls, [undefined, "4"]);
  view.update({ ...view.source, document: { ...view.source.document, subject: "Flush" } });
  act(() => view.state.flush());
  view.tick(0);
  assert.equal(calls.at(-1), "Flush");
  for (let i = 0; i < 6; i++) {
    view.update({ ...view.source, document: { ...view.source.document, subject: `Next ${i}` } });
    view.tick(300);
  }
  assert.equal(calls.length, 3);
  view.tick(200);
  assert.equal(calls.length, 4);
});

test("相同 HTML 与宽度复用已就绪或加载中缓冲，旧回调按加载身份完成当前版本", (t) => {
  const view = bufferFixture(t);
  view.tick(400);
  const loading = view.state.frames[0];
  view.update({ ...view.source, document: { ...view.source.document, subject: "HTML unchanged" } });
  view.tick(400);
  assert.equal(view.state.frames[0].id, loading.id);
  assert.equal(view.state.frames[0].source, view.source);
  view.ready(loading);
  assert.equal(view.state.ready, true);
  view.update({ ...view.source, variables: [] });
  view.tick(400);
  assert.equal(view.state.ready, true);
  assert.equal(view.state.frames[0].id, loading.id);
  assert.equal(view.state.frames[1], null);
  view.update({ ...view.source, device: "mobile" });
  view.tick(400);
  const mobile = view.state.frames[1];
  assert.notEqual(mobile.id, loading.id);
  view.ready(mobile);
  view.update({ ...view.source, device: "desktop" });
  view.tick(400);
  assert.equal(view.state.front, 0);
  assert.equal(view.state.ready, true);
  assert.equal(view.state.frames[0].id, loading.id);
});

test("加载失败保留前台，Retry 强制重载，过期失败和超时后就绪均不污染状态", (t) => {
  const view = bufferFixture(t);
  view.tick(400);
  const first = view.state.frames[0];
  view.ready(first);
  view.update({ ...view.source, device: "mobile" }, true);
  view.tick(0);
  const failed = view.state.frames[1];
  view.failed(failed, "Timed out");
  assert.equal(view.state.failure.message, "Timed out");
  assert.equal(view.state.frames[view.state.front].id, first.id);
  view.ready(failed);
  assert.equal(view.state.ready, false);
  assert.equal(view.state.failure.message, "Timed out");
  act(() => view.state.retry());
  view.tick(0);
  const retry = view.state.frames[1];
  assert.notEqual(retry.id, failed.id);
  view.failed(failed, "Late error");
  view.ready(retry);
  assert.equal(view.state.ready, true);
  assert.equal(view.state.failure, null);
  view.failed(failed);
  assert.equal(view.state.failure, null);
  view.update({ ...view.source, device: "desktop" });
  view.tick(400);
  assert.equal(view.state.ready, true);
});

test("复用加载中缓冲的失败归属最新 source，失败缓冲不再复用", (t) => {
  const view = bufferFixture(t);
  view.tick(400);
  const initial = view.state.frames[0];
  view.update({ ...view.source, variables: [] });
  view.tick(400);
  view.failed(initial);
  assert.equal(view.state.failure.source, view.source);
  view.update({ ...view.source, variables: [] });
  view.tick(400);
  assert.notEqual(view.state.frames[0].id, initial.id);
  const current = view.state.frames[0];
  view.ready(initial);
  assert.equal(view.state.ready, false);
  view.ready(current);
  assert.equal(view.state.ready, true);
});

test("同 source 重试的生成失败不能被旧加载回调清除", (t) => {
  let failing = false;
  const view = bufferFixture(t, sourceFixture(() => { if (failing) throw new Error("Generation failed"); return "<p>OK</p>"; }));
  view.tick(400);
  const loading = view.state.frames[0];
  failing = true;
  act(() => view.state.retry());
  view.tick(0);
  assert.equal(view.state.failure.message, "Generation failed");
  view.ready(loading);
  assert.equal(view.state.ready, false);
  assert.equal(view.state.failure.message, "Generation failed");
});
