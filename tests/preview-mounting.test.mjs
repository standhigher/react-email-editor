import "./helpers/source-modules.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { act, create } from "react-test-renderer";

const { Stage } = await import("../src/stage/Stage.tsx");
const { PreviewFrame } = await import("../src/stage/preview/PreviewFrame.tsx");
const { buildEmailEditorConfig } = await import("../src/plugins/config.ts");
const { createEmailDocument } = await import("../src/document/create-document.ts");

function stageFixture(t) {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"] });
  const config = buildEmailEditorConfig();
  const block = config.createBlock("image");
  let session = { document: createEmailDocument([block]), config, variables: [], definitions: config.definitions, selectedId: block.id };
  let mode = "edit";
  const tree = () => createElement(Stage, { session, viewMode: mode, device: "desktop" });
  let renderer;
  act(() => { renderer = create(tree()); });
  t.after(() => act(() => renderer.unmount()));
  return {
    renderer,
    frames: () => renderer.root.findAllByType(PreviewFrame),
    tick(ms) { act(() => t.mock.timers.tick(ms)); },
    switchTo(next) { mode = next; act(() => renderer.update(tree())); },
    changeAlt(alt) {
      session = { ...session, document: { ...session.document, blocks: [{ ...block, controls: { ...block.controls, alt } }] } };
      act(() => renderer.update(tree()));
    },
  };
}

test("后台存在旧快照时快速进入预览，只挂载当前文档的加载帧", (t) => {
  const view = stageFixture(t);
  view.tick(400);
  assert.equal(view.frames().length, 0);
  view.changeAlt("Latest input");
  view.switchTo("preview");
  assert.equal(view.frames().length, 0, "flush 前不能挂载旧快照");
  view.tick(0);
  assert.equal(view.frames().length, 1);
  assert.match(view.frames()[0].props.snapshot.html, /alt="Latest input"/);
});

test("预览失败后切换模式不重挂失败帧，Retry 创建新加载身份并恢复", (t) => {
  const view = stageFixture(t);
  view.switchTo("preview");
  view.tick(0);
  const failed = view.frames()[0].props;
  act(() => failed.onFailed(failed.snapshot.id, "Timeout"));
  assert.equal(view.frames().length, 0);
  assert.match(view.renderer.root.findByProps({ role: "alert" }).findByType("p").children.join(""), /Timeout/);
  view.switchTo("edit");
  view.switchTo("preview");
  view.tick(0);
  assert.equal(view.frames().length, 0, "重进预览不能重挂失败快照");
  const retry = view.renderer.root.findByProps({ role: "alert" }).findByType("button");
  act(() => retry.props.onClick());
  view.tick(0);
  const next = view.frames()[0].props;
  assert.notEqual(next.snapshot.id, failed.snapshot.id);
  assert.equal(next.snapshot.status, "loading");
  act(() => failed.onReady(failed.snapshot.id));
  assert.equal(view.renderer.root.findAllByProps({ role: "alert" }).length, 1);
  act(() => next.onReady(next.snapshot.id));
  assert.equal(view.renderer.root.findAllByProps({ role: "alert" }).length, 0);
  assert.equal(view.renderer.root.findByProps({ className: "ree-stage-content" }).props["aria-busy"], false);
});
