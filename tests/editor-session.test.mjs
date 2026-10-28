import "./helpers/source-modules.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import { createElement, useLayoutEffect } from "react";
import { act, create } from "react-test-renderer";

const { useEmailEditor } = await import("../src/shell/useEmailEditor.ts");
const { useEditorSession } = await import("../src/shell/useEditorSession.ts");

function fixture(t, options = {}) {
  let session;
  let editor;
  function Harness() {
    const instance = useEmailEditor(options);
    const current = useEditorSession(instance);
    useLayoutEffect(() => { editor = instance; session = current; });
    return null;
  }
  let renderer;
  act(() => { renderer = create(createElement(Harness)); });
  t.after(() => act(() => renderer.unmount()));
  return { session: () => session, editor: () => editor };
}

test("区块操作和连续编辑共享唯一文档，批量字段仅回调一次", (t) => {
  const changes = [];
  const view = fixture(t, { onChange: (document) => changes.push(document) });
  act(() => { assert.equal(view.session().insertBlock("text"), true); });
  const id = view.session().selectedId;
  assert.ok(id);
  act(() => {
    view.session().updateControls(id, { html: "<p>Edited</p>", metadata: { tags: ["A"] } });
    view.session().setSubject("Current");
    assert.equal(view.editor().getDocument().subject, "Current");
  });
  assert.equal(changes.length, 3);
  assert.equal(view.editor().getDocument().blocks[0].controls.html, "<p>Edited</p>");
  assert.match(view.editor().getHtml(), /Edited/);
  changes[1].blocks[0].controls.metadata.tags.push("External");
  assert.deepEqual(view.editor().getDocument().blocks[0].controls.metadata.tags, ["A"]);
  act(() => view.session().duplicateBlock(id));
  assert.equal(view.editor().getDocument().blocks.length, 2);
  const duplicate = view.editor().getDocument().blocks[1];
  act(() => view.session().moveBlock(duplicate.id, -1));
  assert.equal(view.editor().getDocument().blocks[0].id, duplicate.id);
  act(() => view.session().removeBlock(id));
  assert.equal(view.session().selectedId, null);
  assert.equal(view.editor().getDocument().blocks.length, 1);
});

test("替换同 ID 文档与重置都会清空选择，旧状态不跨文档保留", (t) => {
  const view = fixture(t);
  act(() => view.session().insertBlock("text"));
  const initialKey = view.session().resetKey;
  const replacement = view.editor().getDocument();
  replacement.blocks[0].controls.html = "<p>Replacement</p>";
  act(() => view.editor().setDocument(replacement));
  assert.equal(view.session().selectedId, null);
  assert.notEqual(view.session().resetKey, initialKey);
  assert.equal(view.session().document.blocks[0].controls.html, "<p>Replacement</p>");
  act(() => view.session().selectBlock(replacement.blocks[0].id));
  const replacementKey = view.session().resetKey;
  act(() => view.editor().reset());
  assert.equal(view.session().selectedId, null);
  assert.notEqual(view.session().resetKey, replacementKey);
  assert.equal(view.editor().getDocument().blocks.length, 0);
});

test("主体编辑一次触发两类隔离回调，插入未知区块不会改变文档", (t) => {
  const changes = [];
  const bodies = [];
  const view = fixture(t, {
    onChange: (document) => { changes.push(document); document.body.contentWidth = 999; },
    onBodyChange: (body) => { bodies.push(body); body.contentWidth = 888; },
  });
  act(() => view.session().updateBody({ contentWidth: 700 }));
  assert.equal(changes.length, 1);
  assert.equal(bodies.length, 1);
  assert.equal(view.editor().getDocument().body.contentWidth, 700);
  act(() => { assert.equal(view.session().insertBlock("unknown"), false); });
  assert.equal(view.editor().getDocument().blocks.length, 0);
  assert.equal(changes.length, 1);
});
