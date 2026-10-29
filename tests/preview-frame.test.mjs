import "./helpers/source-modules.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { act, create } from "react-test-renderer";

const { PreviewFrame } = await import("../src/stage/preview/PreviewFrame.tsx");
const { PREVIEW_LOAD_TIMEOUT_MS } = await import("../src/stage/preview/constants.ts");

function frameFixture(t) {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"] });
  const callbacks = new Map();
  const listeners = new Map();
  let nextId = 0;
  let resize;
  let disconnected = 0;
  let height = 88;
  let loadListener;
  const ownerWindow = {
    requestAnimationFrame(callback) { callbacks.set(++nextId, callback); return nextId; },
    cancelAnimationFrame(id) { callbacks.delete(id); },
  };
  class ResizeObserver {
    constructor(callback) { resize = callback; }
    observe() {}
    disconnect() { disconnected++; }
  }
  const frameDocument = {
    defaultView: { ResizeObserver },
    body: { getBoundingClientRect: () => ({ height }) },
    addEventListener(event, listener) { assert.equal(event, "load"); loadListener = listener; },
    removeEventListener(event, listener) { assert.equal(event, "load"); assert.equal(listener, loadListener); loadListener = null; },
  };
  const frameNode = {
    style: {}, contentDocument: frameDocument, ownerDocument: { defaultView: ownerWindow },
    addEventListener(event, listener) { listeners.set(event, listener); },
    removeEventListener(event, listener) { assert.equal(listeners.get(event), listener); listeners.delete(event); },
  };
  const snapshot = { id: 1, html: "<script>parent.run()</script><p onclick='parent.run()'>Ready</p>", width: "600px", status: "loading" };
  const ready = [];
  const failed = [];
  const onReady = (id) => ready.push(id);
  const onFailed = (id, message) => failed.push({ id, message });
  const tree = (item = snapshot) => createElement(PreviewFrame, { snapshot: item, onReady, onFailed });
  let renderer;
  act(() => { renderer = create(tree(), { createNodeMock: () => frameNode }); });
  t.after(() => act(() => renderer.unmount()));
  return {
    renderer, snapshot, frameNode, ready, failed, callbacks, listeners,
    get disconnected() { return disconnected; },
    get loadListener() { return loadListener; },
    set height(value) { height = value; },
    load() { act(() => listeners.get("load")()); },
    resize() { act(() => resize()); },
    flush() { const pending = [...callbacks.values()]; callbacks.clear(); act(() => pending.forEach((callback) => callback())); },
    tick(ms) { act(() => t.mock.timers.tick(ms)); },
    update(item) { act(() => renderer.update(tree(item))); },
    unmount() { act(() => renderer.unmount()); },
  };
}

test("预览沙箱禁止脚本，备用 iframe 先测量再就绪，宿主时钟与观察器均清理", (t) => {
  const view = frameFixture(t);
  const iframe = view.renderer.root.findByType("iframe");
  assert.equal(iframe.props.sandbox, "allow-same-origin");
  assert.match(iframe.props.srcDoc, /<script>/);
  view.load();
  assert.equal(view.frameNode.style.height, "88px");
  assert.deepEqual(view.ready, []);
  view.flush();
  assert.deepEqual(view.ready, [1]);
  view.height = 144;
  view.resize();
  view.flush();
  assert.equal(view.frameNode.style.height, "144px");
  assert.deepEqual(view.ready, [1]);
  view.tick(PREVIEW_LOAD_TIMEOUT_MS * 2);
  assert.deepEqual(view.failed, []);
  view.resize();
  assert.equal(view.callbacks.size, 1);
  view.unmount();
  assert.equal(view.callbacks.size, 0);
  assert.equal(view.listeners.size, 0);
  assert.equal(view.loadListener, null);
  assert.equal(view.disconnected, 1);
});

test("未加载或宿主 rAF 未完成会超时，晚到 load/ready 不复活失败帧", (t) => {
  const view = frameFixture(t);
  view.load();
  const lateReady = [...view.callbacks.values()][0];
  view.tick(PREVIEW_LOAD_TIMEOUT_MS);
  assert.match(view.failed[0].message, /timed out/);
  assert.equal(view.disconnected, 1);
  view.load();
  act(() => lateReady());
  assert.deepEqual(view.ready, []);
  assert.equal(view.failed.length, 1);
});

test("复用加载身份不会重启超时，卸载清理 watchdog", (t) => {
  const view = frameFixture(t);
  view.tick(PREVIEW_LOAD_TIMEOUT_MS - 1);
  view.update({ ...view.snapshot, source: {} });
  view.tick(1);
  assert.equal(view.failed.length, 1);
  view.update({ ...view.snapshot, id: 2 });
  view.unmount();
  view.tick(PREVIEW_LOAD_TIMEOUT_MS * 2);
  assert.equal(view.failed.length, 1);
});

test("加载错误与不可访问文档立即回传失败，Retry 的新加载可完成", (t) => {
  const view = frameFixture(t);
  act(() => view.listeners.get("error")());
  assert.match(view.failed[0].message, /could not be loaded/);
  view.update({ ...view.snapshot, id: 2 });
  const originalDocument = view.frameNode.contentDocument;
  view.frameNode.contentDocument = null;
  view.load();
  assert.match(view.failed[1].message, /could not be measured/);
  view.update({ ...view.snapshot, id: 3 });
  view.frameNode.contentDocument = originalDocument;
  view.load();
  view.flush();
  assert.deepEqual(view.ready, [3]);
});

test("测量异常或无效高度回传失败并清理，空文档仍可就绪", (t) => {
  const view = frameFixture(t);
  view.height = NaN;
  view.load();
  assert.match(view.failed[0].message, /invalid height/);
  assert.equal(view.disconnected, 1);
  view.update({ ...view.snapshot, id: 2 });
  view.frameNode.contentDocument.body.getBoundingClientRect = () => { throw new Error("Measurement failed"); };
  view.load();
  assert.match(view.failed[1].message, /Measurement failed/);
  view.update({ ...view.snapshot, id: 3 });
  view.frameNode.contentDocument.body.getBoundingClientRect = () => ({ height: 0 });
  view.load();
  view.flush();
  assert.equal(view.frameNode.style.height, "1px");
  assert.deepEqual(view.ready, [3]);
});
