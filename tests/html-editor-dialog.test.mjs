import "./helpers/source-modules.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { act, create } from "react-test-renderer";

const { HtmlEditorDialog } = await import("../src/inspector/components/HtmlEditorDialog.tsx");
const { HtmlControl } = await import("../src/inspector/components/HtmlControl.tsx");
const { HtmlCodeEditor } = await import("../src/inspector/HtmlCodeEditor.tsx");

function fixture(t) {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let renderer;
  const moves = [];
  const inserted = [];
  const editorHost = {};
  const editorRef = { current: { moveTo: (host) => moves.push(host), insertText: (text) => inserted.push(text) } };
  act(() => { renderer = create(createElement(HtmlEditorDialog, {
    label: "HTML", variables: [], editorRef, onClose: () => {},
  }), { createNodeMock: (element) => element.props.className === "ree-html-editor" ? editorHost : null }); });
  t.after(() => act(() => renderer.unmount()));
  return {
    renderer,
    moves, inserted, editorHost,
    visible: () => renderer.root.findAllByProps({ className: "ree-html-save-toast" }).length > 0,
    tick: (ms) => act(() => t.mock.timers.tick(ms)),
    key: (patch) => {
      let prevented = false;
      let stopped = false;
      act(() => renderer.root.findByType("dialog").props.onKeyDownCapture({
        key: "s", code: "KeyS", ctrlKey: false, metaKey: false,
        altKey: false, shiftKey: false, repeat: false, nativeEvent: { isComposing: false },
        preventDefault: () => { prevented = true; }, stopPropagation: () => { stopped = true; },
        ...patch,
      }));
      return { prevented, stopped };
    },
  };
}

test("HTML 弹窗拦截 Ctrl+S 和 Command+S，提示实时保存但不重复写入文档", (t) => {
  const view = fixture(t);
  assert.equal(view.visible(), false);
  for (const modifiers of [{ ctrlKey: true }, { metaKey: true }, { ctrlKey: true, key: "S" }]) {
    assert.deepEqual(view.key(modifiers), { prevented: true, stopped: true });
    assert.equal(view.visible(), true);
    assert.equal(view.renderer.root.findByProps({ role: "status" }).props["aria-atomic"], "true");
    view.tick(2400);
    assert.equal(view.visible(), false);
  }
  assert.deepEqual(view.inserted, []);
  assert.deepEqual(view.moves, [view.editorHost]);
});

test("HTML 弹窗使用原编辑会话，卸载时归还编辑器", (t) => {
  const view = fixture(t);
  assert.deepEqual(view.moves, [view.editorHost]);
  assert.equal(view.renderer.root.findAllByType(HtmlCodeEditor).length, 0);
  act(() => view.renderer.unmount());
  assert.deepEqual(view.moves, [view.editorHost, null]);
});

test("HTML 控件展开和收起始终保留同一个编辑器组件", () => {
  let renderer;
  act(() => { renderer = create(createElement(HtmlControl, {
    control: { name: "html", kind: "html", label: "HTML" }, value: "<p>Hello</p>", variables: [], onChange: () => {},
  })); });
  try {
    const editor = renderer.root.findByType(HtmlCodeEditor);
    act(() => renderer.root.findByProps({ "aria-haspopup": "dialog" }).props.onClick({ currentTarget: { focus() {} } }));
    assert.equal(renderer.root.findAllByType(HtmlCodeEditor).length, 1);
    assert.equal(renderer.root.findByType(HtmlCodeEditor), editor);
    act(() => renderer.root.findByType(HtmlEditorDialog).props.onClose());
    assert.equal(renderer.root.findByType(HtmlCodeEditor), editor);
    assert.equal(renderer.root.findAllByType(HtmlEditorDialog).length, 0);
  } finally {
    act(() => renderer.unmount());
  }
});

test("普通输入、其它组合键和输入法不触发保存提示，物理 S 键兼容其他布局", (t) => {
  const view = fixture(t);
  for (const event of [
    {}, { ctrlKey: true, shiftKey: true }, { metaKey: true, altKey: true },
    { key: "p", code: "KeyP", ctrlKey: true },
    { ctrlKey: true, nativeEvent: { isComposing: true } },
  ]) {
    assert.deepEqual(view.key(event), { prevented: false, stopped: false });
    assert.equal(view.visible(), false);
  }
  assert.deepEqual(view.key({ key: "ы", code: "KeyS", ctrlKey: true }), { prevented: true, stopped: true });
  assert.equal(view.visible(), true);
});

test("连续保存重新计时，按住快捷键不反复延长，卸载清理计时器", (t) => {
  const view = fixture(t);
  view.key({ ctrlKey: true });
  view.tick(2000);
  view.key({ metaKey: true });
  view.tick(2000);
  assert.equal(view.visible(), true);
  assert.deepEqual(view.key({ metaKey: true, repeat: true }), { prevented: true, stopped: true });
  view.tick(400);
  assert.equal(view.visible(), false);
  view.key({ ctrlKey: true });
  act(() => view.renderer.unmount());
  assert.doesNotThrow(() => view.tick(2400));
});
