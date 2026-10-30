import "./helpers/source-modules.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { act, create } from "react-test-renderer";

const { usePersonalizationMenu } = await import("../src/components/usePersonalizationMenu.ts");

function fixture(t, keyboard = false) {
  const listeners = new Map();
  const changes = [];
  const focuses = [];
  const trigger = { focus: () => focuses.push("trigger") };
  const buttons = [0, 1].map((index) => ({ focus: () => focuses.push(index) }));
  const editor = {};
  const keyboardScopeRef = { current: { contains: (target) => target === editor } };
  let bounds = { left: 970, right: 1000, top: 300, bottom: 326 };
  let inputBounds = { top: 294, bottom: 332 };
  let shows = 0;
  let hides = 0;
  let disconnects = 0;
  const ownerWindow = { innerWidth: 1008, innerHeight: 600 };
  const ownerDocument = { defaultView: ownerWindow };
  for (const target of [ownerWindow, ownerDocument]) {
    target.addEventListener = (name, handler) => listeners.set(name, handler);
    target.removeEventListener = (name, handler) => {
      if (listeners.get(name) === handler) listeners.delete(name);
    };
  }
  const root = {
    ownerDocument,
    getBoundingClientRect: () => bounds,
    closest: () => ({ getBoundingClientRect: () => inputBounds }),
    contains: (target) => target === trigger,
    querySelector: () => trigger,
  };
  const menu = {
    offsetWidth: 240, scrollHeight: 100,
    getBoundingClientRect: () => ({ width: 240 }),
    contains: (target) => buttons.includes(target),
    querySelector: () => buttons[0],
    querySelectorAll: () => buttons,
    setAttribute: (name, value) => { menu[name] = value; },
    showPopover: () => { shows++; },
    hidePopover: () => { hides++; },
  };
  const previousObserver = globalThis.ResizeObserver;
  globalThis.ResizeObserver = class {
    observe() {}
    disconnect() { disconnects++; }
  };
  const refs = [{ current: root }, { current: menu }, { current: keyboard }];
  const setOpen = (next) => changes.push(next);
  function Probe({ open }) {
    const position = usePersonalizationMenu(open, ...refs, setOpen, keyboardScopeRef);
    return createElement("output", { position });
  }
  let renderer;
  act(() => { renderer = create(createElement(Probe, { open: true })); });
  t.after(() => {
    act(() => renderer.unmount());
    if (previousObserver === undefined) delete globalThis.ResizeObserver;
    else globalThis.ResizeObserver = previousObserver;
  });
  return {
    changes, focuses, buttons, trigger, editor, listeners, menu, ownerWindow,
    position: () => renderer.root.findByType("output").props.position,
    setBounds: (next, input) => { bounds = next; inputBounds = input; },
    close: () => act(() => renderer.update(createElement(Probe, { open: false }))),
    lifecycle: () => ({ shows, hides, disconnects }),
    key: (key, target, shiftKey = false) => {
      let prevented = false;
      let stopped = false;
      act(() => listeners.get("keydown")({ key, target, shiftKey,
        preventDefault: () => { prevented = true; }, stopPropagation: () => { stopped = true; },
      }));
      return { prevented, stopped };
    },
  };
}

test("变量菜单进入 top layer，右侧不足时左移，底部不足时上翻，关闭时清理监听器", (t) => {
  const view = fixture(t);
  assert.equal(view.menu.popover, "manual");
  assert.deepEqual(view.position(), { left: 760, top: 332, maxHeight: 240 });
  view.ownerWindow.innerHeight = 370;
  act(() => view.listeners.get("resize")());
  assert.deepEqual(view.position(), { left: 760, top: 192, maxHeight: 240 });
  view.setBounds({ left: 40, right: 70, top: 120, bottom: 146 }, { top: 114, bottom: 152 });
  act(() => view.listeners.get("scroll")());
  assert.equal(view.position().left, 40);
  view.close();
  assert.equal(view.listeners.size, 0);
  assert.deepEqual(view.lifecycle(), { shows: 1, hides: 1, disconnects: 1 });
});

test("键盘打开聚焦首项，Tab 保留菜单内遍历，边界退出回到触发器附近", (t) => {
  const view = fixture(t, true);
  assert.deepEqual(view.focuses, [0]);
  view.key("Tab", view.buttons[0]);
  assert.deepEqual(view.changes, []);
  view.key("Tab", view.buttons[1]);
  assert.deepEqual(view.changes, [false]);
  assert.equal(view.focuses.at(-1), "trigger");
  assert.equal(view.key("Tab", view.buttons[0], true).prevented, true);
});

test("Escape 只关闭当前菜单，外部点击关闭，菜单内部点击不提前关闭", (t) => {
  const view = fixture(t);
  view.key("Escape", {});
  assert.deepEqual(view.changes, []);
  act(() => view.listeners.get("pointerdown")({ target: view.buttons[0] }));
  assert.deepEqual(view.changes, []);
  assert.deepEqual(view.key("Escape", view.trigger), { prevented: true, stopped: true });
  act(() => view.listeners.get("pointerdown")({ target: {} }));
  assert.deepEqual(view.changes, [false, false]);
});

test("鼠标打开变量菜单后，关联编辑区的 Escape 关闭菜单，其它编辑区互不影响", (t) => {
  const view = fixture(t);
  assert.deepEqual(view.focuses, []);
  assert.deepEqual(view.key("Escape", {}), { prevented: false, stopped: false });
  assert.deepEqual(view.changes, []);
  assert.deepEqual(view.key("a", view.editor), { prevented: false, stopped: false });
  assert.deepEqual(view.key("Escape", view.editor), { prevented: true, stopped: true });
  assert.deepEqual(view.changes, [false]);
  assert.deepEqual(view.focuses, ["trigger"]);
});
